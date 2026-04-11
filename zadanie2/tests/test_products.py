#!/usr/bin/env python3

import sys
from dataclasses import dataclass
from typing import Dict
import json

BASE_URL: str = sys.argv[1] if len(sys.argv) > 1 else "http://localhost:8000"
API_PATH: str = f"{BASE_URL}/api/products"

import subprocess
import json
from dataclasses import dataclass

@dataclass
class CurlResponse:
    status_code: int
    text: str

    def json(self):
        return json.loads(self.text)


def curl_request(method: str, url: str, json_data=None):
    cmd = ["curl", "-s", "-w", "%{http_code}", "-X", method]

    if json_data is not None:
        cmd += ["-H", "Content-Type: application/json", "-d", json.dumps(json_data)]

    cmd.append(url)

    out = subprocess.check_output(cmd).decode()
    body, status = out[:-3], int(out[-3:])
    return CurlResponse(status, body)




pass_count: int = 0
fail_count: int = 0

def check_ok(test_name: str, expected_code: int, actual_code: int) -> bool:
    global pass_count, fail_count
    if actual_code == expected_code:
        print(f"[PASS] {test_name} (HTTP {actual_code})")
        pass_count += 1
        return True

    print(f"[FAIL] {test_name} (expected {expected_code}, got {actual_code})")
    fail_count += 1
    return False


def simple_unit_test(name: str, response: CurlResponse, expected_code: int) -> Dict:
    jsoned_response: Dict = {}

    try:
        jsoned_response = response.json()
    except Exception:
        pass # ignore
    
    if not check_ok(name, expected_code, response.status_code):
        print("*" * 25)
        print(jsoned_response)
        print("*" * 25)
        print('\n')
    return jsoned_response
    
response: Dict = simple_unit_test(
    f"[CREATE 1] POST {API_PATH}", 
    curl_request(
        "POST", 
        API_PATH, 
        json_data = {
            "name": "Laptop", 
            "description": "Laptop description", 
            "price": 4999.99
        }
    ),
    201
)

product_id: int = int(response["id"])

simple_unit_test(
    f"[CREATE 2] POST {API_PATH}",
    curl_request(
        "POST",
        API_PATH, 
        json_data={
            "name": "Mouse",
            "description": "Mouse description",
            "price": 2.50
        }
    ),
    201
)

simple_unit_test(
    f"[CREATE invalid] POST {API_PATH}",
    curl_request(
        "POST",
        API_PATH, 
        json_data={
            "description": "missing name and price"
        }
    ),
    400
)

simple_unit_test(
    f"[READ 1] GET {API_PATH}",
    curl_request(
        "GET",
        API_PATH
    ),
    200
)

simple_unit_test(
    f"[READ 2] GET {API_PATH}/{product_id}",
    curl_request(
        "GET",
        f"{API_PATH}/{product_id}"
    ),
    200
)

simple_unit_test(
    f"[READ invalid] GET {API_PATH}/99999",
    curl_request(
        "GET",
        f"{API_PATH}/99999"
    ),
    404
)

simple_unit_test(
    f"[UPDATE] PUT {API_PATH}/{product_id}",
    curl_request(
        "PUT",
        f"{API_PATH}/{product_id}", 
        json_data={
            "name": "More expensive Laptop",
            "price": 10999.99
        }
    ),
    200
)

simple_unit_test(
    f"[UPDATE partial] PUT {API_PATH}/{product_id}",
    curl_request(
        "PUT",
        f"{API_PATH}/{product_id}", 
        json_data={
            "description": "Laptop description updated"
        }
    ),
    200
)

simple_unit_test(
    f"[DELETE] DELETE {API_PATH}/{product_id}",
    curl_request(
        "DELETE",
        f"{API_PATH}/{product_id}"
    ),
    204
)

simple_unit_test(
    f"[READ invalid] GET {API_PATH}/{product_id}",
    curl_request(
        "GET",
        f"{API_PATH}/{product_id}"
    ),
    404
)

total = pass_count + fail_count
print(f"\nTests: {total} | Passed: {pass_count} | Failed: {fail_count}")
