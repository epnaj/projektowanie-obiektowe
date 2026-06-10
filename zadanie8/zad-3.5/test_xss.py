#!/usr/bin/env python3

import os
import sys
import time
from collections.abc import Callable

from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import WebDriverWait

APP_URL: str      = os.environ.get("APP_URL", "http://localhost:8000")
SELENIUM_URL: str = os.environ.get("SELENIUM_URL", "http://localhost:4444")
REGISTER_PAGE: str = APP_URL + "/register"

XSS_PAYLOADS: list[str] = [
    "<script>window.__xss=true</script>",
    "<img src=x onerror=\"window.__xss=true\">",
    "<svg onload=\"window.__xss=true\"></svg>",
    "\"><script>window.__xss=true</script>",
    "<iframe src=\"javascript:window.__xss=true\"></iframe>",
]

WELCOME = "[data-testid='welcome']"

PAYLOAD_CHECKS: list[tuple[str, Callable[[webdriver.Remote, str], bool]]] = [
    (
        "injected script never executed (window.__xss stays false)",
        lambda driver, payload: driver.execute_script("return window.__xss === false"),
    ),
    (
        "payload survives as inert text inside the welcome node",
        lambda driver, payload: payload in driver.execute_script(
            f"return document.querySelector(\"{WELCOME}\").textContent"
        ),
    ),
    (
        "no live element was parsed from the payload",
        lambda driver, payload: driver.execute_script(
            f"return document.querySelectorAll(\"{WELCOME} script, {WELCOME} img, "
            f"{WELCOME} svg, {WELCOME} iframe\").length === 0"
        ),
    ),
]

results: list[bool] = []


def check(name: str, passed: bool) -> None:
    results.append(passed)
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


def open_register(driver: webdriver.Remote, timeout: float = 30.0) -> None:
    deadline: float = time.time() + timeout
    while True:
        driver.get(REGISTER_PAGE)
        try:
            WebDriverWait(driver, 3).until(
                EC.presence_of_element_located((By.CSS_SELECTOR, "[data-testid='username']"))
            )
            return
        except Exception:
            if time.time() > deadline:
                print("App register page unreachable at " + REGISTER_PAGE)
                sys.exit(2)
            time.sleep(1.0)


def submit_registration(driver: webdriver.Remote, username: str) -> None:
    open_register(driver)
    driver.execute_script("window.__xss = false;")
    driver.find_element(By.CSS_SELECTOR, "[data-testid='username']").send_keys(username)
    driver.find_element(By.CSS_SELECTOR, "[data-testid='email']").send_keys("test@example.com")
    driver.find_element(By.CSS_SELECTOR, "[data-testid='password']").send_keys("secret")
    driver.find_element(By.CSS_SELECTOR, "[data-testid='submit']").click()
    WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.CSS_SELECTOR, WELCOME))
    )


def main() -> None:
    driver = build_driver()
    try:
        print("Page under test: " + REGISTER_PAGE + "\n")
        for payload in XSS_PAYLOADS:
            submit_registration(driver, payload)
            for name, predicate in PAYLOAD_CHECKS:
                check("[" + payload + "] " + name, predicate(driver, payload))
    finally:
        driver.quit()

    passed: int = sum(results)
    total: int = len(results)
    print(f"\n{passed}/{total} assertions passed")
    sys.exit(0 if passed == total else 1)


if __name__ == "__main__":
    main()
