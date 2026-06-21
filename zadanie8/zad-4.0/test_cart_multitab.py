#!/usr/bin/env python3
"""Grade 4.0 - shopping cart across multiple tabs of the SAME browser (Selenium).

Task: "Test the shopping cart while opening the application simultaneously in
several separate tabs of the same browser, checking the consistency of order
states (the React application)."

One Selenium driver = one browser. We open the second tab via
driver.switch_to.new_window("tab") and move between tabs with
switch_to.window(handle), which satisfies the requirement of "several separate
tabs of the same browser".

Cart architecture in zadanie5: state is held EXCLUSIVELY in React memory
(useState in CartContext) - no localStorage, no BroadcastChannel, no
server-side persistence. Each tab loads its own React application instance, so
each has its OWN, independent in-memory cart.

We interpret "checking the consistency of order states" as confirming the
deterministic, independent per-tab behavior: a change in tab A does not leak
into tab B and vice versa. Assertions inspect the real cart DOM state (item
count, total, number of list rows). This is NOT a bug - it is a property of the
current architecture (no shared state between tabs).
"""

import os
import sys
import time

from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import WebDriverWait

APP_URL: str = os.environ.get("APP_URL", "http://localhost:8000")
SELENIUM_URL: str = os.environ.get("SELENIUM_URL", "http://localhost:4444")
PRODUCTS_PAGE: str = APP_URL + "/products"
CART_PAGE: str = APP_URL + "/cart"

# Products served by zadanie5/server/index.js: id 1..4.
PRODUCT_KEYBOARD = 1
PRODUCT_MOUSE = 2
PRODUCT_MONITOR = 3

results: list[bool] = []


def check(name: str, passed: bool) -> None:
    results.append(bool(passed))
    print(("PASS" if passed else "FAIL") + " - " + name)


def make_options() -> Options:
    options = Options()
    options.add_argument("--headless=new")
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")
    return options


def build_driver(timeout: float = 60.0) -> webdriver.Remote:
    deadline: float = time.time() + timeout
    while True:
        try:
            return webdriver.Remote(command_executor=SELENIUM_URL, options=make_options())
        except Exception:
            if time.time() > deadline:
                print("Selenium grid unreachable at " + SELENIUM_URL)
                sys.exit(2)
            time.sleep(1.0)


def wait_for_app(driver: webdriver.Remote, timeout: float = 30.0) -> None:
    """Wait until the React app boots (product list visible)."""
    deadline: float = time.time() + timeout
    while True:
        driver.get(PRODUCTS_PAGE)
        try:
            WebDriverWait(driver, 3).until(
                EC.presence_of_element_located(
                    (By.CSS_SELECTOR, f"[data-testid='add-{PRODUCT_KEYBOARD}']")
                )
            )
            return
        except Exception:
            if time.time() > deadline:
                print("App products page unreachable at " + PRODUCTS_PAGE)
                sys.exit(2)
            time.sleep(1.0)


def goto_products(driver: webdriver.Remote) -> None:
    # SPA navigation via the react-router <Link> in the nav bar. We must NOT use
    # driver.get here: a full page load reboots the React app and would reset the
    # in-memory cart, destroying the very state we are testing.
    driver.find_element(By.CSS_SELECTOR, "nav a[href='/products']").click()
    WebDriverWait(driver, 10).until(
        EC.presence_of_element_located(
            (By.CSS_SELECTOR, f"[data-testid='add-{PRODUCT_KEYBOARD}']")
        )
    )


def add_product(driver: webdriver.Remote, product_id: int) -> None:
    goto_products(driver)
    driver.find_element(By.CSS_SELECTOR, f"[data-testid='add-{product_id}']").click()


def goto_cart(driver: webdriver.Remote) -> None:
    # SPA navigation only (see goto_products) to preserve the in-memory cart.
    driver.find_element(By.CSS_SELECTOR, "nav a[href='/cart']").click()
    WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.CSS_SELECTOR, "[data-testid='cart-count']"))
    )


def cart_count(driver: webdriver.Remote) -> int:
    """Number of cart items read from the DOM (hidden data-testid counter)."""
    goto_cart(driver)
    text = driver.find_element(By.CSS_SELECTOR, "[data-testid='cart-count']").get_attribute(
        "textContent"
    )
    return int(text.strip())


def cart_rows(driver: webdriver.Remote) -> int:
    """Actual number of <li data-testid='cart-item'> rows in the cart DOM."""
    goto_cart(driver)
    return len(driver.find_elements(By.CSS_SELECTOR, "[data-testid='cart-item']"))


def cart_total(driver: webdriver.Remote) -> int:
    goto_cart(driver)
    els = driver.find_elements(By.CSS_SELECTOR, "[data-testid='cart-total']")
    if not els:
        return 0
    return int(els[0].get_attribute("textContent").strip())


def main() -> None:
    driver = build_driver()
    try:
        wait_for_app(driver)

        tab_a = driver.current_window_handle
        # Second tab of the SAME browser.
        driver.switch_to.new_window("tab")
        tab_b = driver.current_window_handle
        check("second tab is a separate window handle (tab_a != tab_b)", tab_a != tab_b)
        check(
            "both tabs belong to one browser (2 handles)",
            len(driver.window_handles) == 2,
        )

        # --- Tab A: add two products ---
        driver.switch_to.window(tab_a)
        add_product(driver, PRODUCT_KEYBOARD)  # 320
        add_product(driver, PRODUCT_MOUSE)     # 150
        a_count = cart_count(driver)
        a_rows = cart_rows(driver)
        a_total = cart_total(driver)
        check("tab A: cart count = 2 after adding 2 products", a_count == 2)
        check("tab A: cart list rows = 2", a_rows == 2)
        check("tab A: cart total = 470 (320 + 150)", a_total == 470)

        # --- Tab B: still empty (independent in-memory state) ---
        driver.switch_to.window(tab_b)
        wait_for_app(driver)  # tab B boots its own React application instance
        b_count_before = cart_count(driver)
        b_empty = len(
            driver.find_elements(By.CSS_SELECTOR, "[data-testid='cart-empty']")
        )
        # Key "consistency" assertion: tab A state does NOT leak into tab B,
        # because the cart lives only in each tab's React memory.
        check("tab B: cart empty despite adds in tab A (count = 0)", b_count_before == 0)
        check("tab B: 'cart-empty' message visible", b_empty == 1)

        # --- Tab B: add a different product ---
        add_product(driver, PRODUCT_MONITOR)   # 1290
        b_count = cart_count(driver)
        b_total = cart_total(driver)
        check("tab B: cart count = 1 after adding 1 product", b_count == 1)
        check("tab B: cart total = 1290 (monitor)", b_total == 1290)

        # --- Back to tab A: its state untouched by actions in B ---
        driver.switch_to.window(tab_a)
        a_count_after = cart_count(driver)
        a_total_after = cart_total(driver)
        check("tab A: count still = 2 (actions in B did not affect A)", a_count_after == 2)
        check("tab A: total still = 470 (isolation from tab B)", a_total_after == 470)

        # --- Remove operation in tab A does not touch tab B ---
        goto_cart(driver)
        driver.find_element(
            By.CSS_SELECTOR, f"[data-testid='remove-{PRODUCT_MOUSE}']"
        ).click()
        a_count_removed = cart_count(driver)
        a_total_removed = cart_total(driver)
        check("tab A: count = 1 after removing an item", a_count_removed == 1)
        check("tab A: total = 320 after removing the mouse", a_total_removed == 320)

        driver.switch_to.window(tab_b)
        b_count_after = cart_count(driver)
        b_total_after = cart_total(driver)
        check("tab B: count still = 1 (removal in A had no effect on B)", b_count_after == 1)
        check("tab B: total still = 1290 (isolation from tab A)", b_total_after == 1290)
    finally:
        driver.quit()

    passed: int = sum(results)
    total: int = len(results)
    print(f"\n{passed}/{total} assertions passed")
    print(
        "\nNOTE (architecture): the zadanie5 cart lives exclusively in React "
        "memory (useState in CartContext), with no localStorage/BroadcastChannel/"
        "server persistence. Cart independence between tabs is a PROPERTY of this "
        "architecture, not a bug - each tab is a separate application instance."
    )
    sys.exit(0 if passed == total else 1)


if __name__ == "__main__":
    main()
