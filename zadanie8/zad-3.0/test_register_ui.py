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

APP_URL: str       = os.environ.get("APP_URL", "http://localhost:8000")
SELENIUM_URL: str  = os.environ.get("SELENIUM_URL", "http://localhost:4444")
REGISTER_PAGE: str = APP_URL + "/register"

USERNAME = "[data-testid='username']"
EMAIL    = "[data-testid='email']"
PASSWORD = "[data-testid='password']"
SUBMIT   = "[data-testid='submit']"
ERRORS   = "[data-testid='errors']"
WELCOME  = "[data-testid='welcome']"

INVALID_EMAILS: list[str] = ["abc", "abc@", "abc@domena"]

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
                EC.presence_of_element_located((By.CSS_SELECTOR, USERNAME))
            )
            return
        except Exception:
            if time.time() > deadline:
                print("App register page unreachable at " + REGISTER_PAGE)
                sys.exit(2)
            time.sleep(1.0)


def fill(driver: webdriver.Remote, selector: str, value: str) -> None:
    field = driver.find_element(By.CSS_SELECTOR, selector)
    field.clear()
    if value:
        field.send_keys(value)


def submit(driver: webdriver.Remote) -> None:
    driver.find_element(By.CSS_SELECTOR, SUBMIT).click()


def wait_for_errors(driver: webdriver.Remote) -> str:
    WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.CSS_SELECTOR, ERRORS))
    )
    return driver.find_element(By.CSS_SELECTOR, ERRORS).text


def welcome_present(driver: webdriver.Remote) -> bool:
    return len(driver.find_elements(By.CSS_SELECTOR, WELCOME)) > 0


def test_required_fields_empty(driver: webdriver.Remote) -> None:
    open_register(driver)
    submit(driver)

    text = wait_for_errors(driver)

    check("empty form: username error shown", "username:" in text)
    check("empty form: email error shown", "email:" in text)
    check("empty form: password error shown", "password:" in text)
    check("empty form: no welcome screen", not welcome_present(driver))


def test_invalid_email_format(driver: webdriver.Remote) -> None:
    for bad_email in INVALID_EMAILS:
        open_register(driver)

        fill(driver, USERNAME, "test")
        fill(driver, EMAIL, bad_email)
        fill(driver, PASSWORD, "secret")

        submit(driver)
        text = wait_for_errors(driver)

        check(
            "invalid email '" + bad_email + "': format error shown",
            "invalid email format" in text
        )
        check(
            "invalid email '" + bad_email + "': no welcome screen",
            not welcome_present(driver)
        )


def test_valid_registration(driver: webdriver.Remote) -> None:
    open_register(driver)

    fill(driver, USERNAME, "test")
    fill(driver, EMAIL, "test@example.com")
    fill(driver, PASSWORD, "secret")

    submit(driver)
    WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.CSS_SELECTOR, WELCOME))
    )
    welcome_text = driver.find_element(By.CSS_SELECTOR, WELCOME).text

    check("valid data: welcome screen shown", welcome_present(driver))
    check("valid data: welcome greets username", "test" in welcome_text)
    check(
        "valid data: no error list shown",
        len(driver.find_elements(By.CSS_SELECTOR, ERRORS)) == 0
    )


def main() -> None:
    driver = build_driver()
    try:
        print("Page under test: " + REGISTER_PAGE + "\n")
        test_required_fields_empty(driver)
        test_invalid_email_format(driver)
        test_valid_registration(driver)
    finally:
        driver.quit()

    passed: int = sum(results)
    total: int = len(results)
    print(f"\n{passed}/{total} assertions passed")
    sys.exit(0 if passed == total else 1)


if __name__ == "__main__":
    main()
