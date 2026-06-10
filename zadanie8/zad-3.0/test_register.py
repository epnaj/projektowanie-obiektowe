#!/usr/bin/env python3

import os
import sys
import time
from collections.abc import Callable

import requests

BASE_URL: str     = os.environ.get("APP_URL", "http://localhost:8000")
REGISTER_URL: str = BASE_URL + "/api/register"
HEALTH_URL: str   = BASE_URL + "/api/products"

VALID_PAYLOAD: dict[str, str] = {
    "username": "test",
    "email": "test@example.com",
    "password": "secret",
}

REQUIRED_FIELD_CASES: list[tuple[str, dict[str, str], set[str]]] = [
    (
        "empty form rejects every required field", 
        {}, 
        {"username", "email", "password"}
    ),
    (
        "missing username flagged alone", 
        {"email": "test@example.com", "password": "secret"},
        {"username"}
    ),
    (
        "missing email flagged alone", 
        {"username": "test", "password": "secret"}, 
        {"email"}
    ),
    (
        "missing password flagged alone",
        {"username": "test", "email": "test@example.com"},
        {"password"}
    ),
    (
        "whitespace-only username flagged", 
        {"username": "   ", "email": "test@example.com", "password": "secret"}, 
        {"username"}
    ),
]

INVALID_EMAILS: list[str] = [
    "abc",
    "abc@",
    "abc@domena",
    "@example.com",
    "test@@example.com",
    "test example@x.com",
]

SUCCESS_CHECKS: list[tuple[str, Callable[[int, dict[str, object]], bool]]] = [
    (
        "valid payload returns 201", 
        lambda status, body: status == 201
    ),
    (
        "valid payload carries no errors", 
        lambda status, body: "errors" not in body
    ),
    (
        "valid payload echoes username",
        lambda status, body: body.get("username") == VALID_PAYLOAD["username"]
    ),
    (
        "valid payload echoes email", 
        lambda status, body: body.get("email") == VALID_PAYLOAD["email"]
    ),
    (
        "valid payload assigns int id", 
        lambda status, body: isinstance(body.get("id"), int)
    ),
    (
        "valid payload never echoes password", 
        lambda status, body: "password" not in body
    ),
]

results: list[bool] = []


def check(name: str, passed: bool) -> None:
    results.append(passed)
    print(("PASS" if passed else "FAIL") + " - " + name)


def register(payload: dict[str, str]) -> requests.Response:
    return requests.post(REGISTER_URL, json=payload, timeout=5)


def wait_for_server(timeout: float = 20.0) -> None:
    deadline: float = time.time() + timeout
    while time.time() < deadline:
        try:
            requests.get(HEALTH_URL, timeout=2)
            return
        except requests.RequestException:
            time.sleep(0.5)
    print("Server unreachable at " + BASE_URL)
    sys.exit(2)


def main() -> None:
    wait_for_server()
    print("Endpoint under test: " + REGISTER_URL + "\n")

    for name, payload, expected in REQUIRED_FIELD_CASES:
        response = register(payload)
        errors = response.json().get("errors", {})
        check(name, response.status_code == 400 and set(errors) == expected)

    for email in INVALID_EMAILS:
        response = register({"username": "test", "email": email, "password": "secret"})
        errors = response.json().get("errors", {})
        check("invalid email '" + email + "' reports format error", response.status_code == 400 and errors.get("email") == "invalid email format")

    response = register(VALID_PAYLOAD)
    body = response.json()
    for name, predicate in SUCCESS_CHECKS:
        check(name, predicate(response.status_code, body))

    passed: int = sum(results)
    total: int = len(results)
    print(f"\n{passed}/{total} assertions passed")
    sys.exit(0 if passed == total else 1)


if __name__ == "__main__":
    main()
