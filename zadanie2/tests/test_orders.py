#!/usr/bin/env python3

import sys
from curl_wrapper import curl_request, CurlResponse
from typing import Dict
from simple_unit_test import SimpleUnitTest


BASE_URL: str = sys.argv[1] if len(sys.argv) > 1 else "http://localhost:8000"
API_PATH: str = f"{BASE_URL}/api/orders"

sut: SimpleUnitTest = SimpleUnitTest()

# CREATE
response: Dict = sut.test(
    f"[CREATE 1] POST {API_PATH}",
    curl_request(
        "POST",
        API_PATH,
        json_data={
            "customerName": "Customer Name",
            "customerEmail": "customer@example.com"
        }
    ),
    201
)

order_id: int = int(response["id"])

sut.test(
    f"[CREATE 2] POST {API_PATH}",
    curl_request(
        "POST",
        API_PATH,
        json_data={
            "customerName": "Remotsuc Eman",
            "customerEmail": "remotsuc@example.com",
            "status": "processing"
        }
    ),
    201
)

sut.test(
    f"[CREATE invalid] POST {API_PATH}",
    curl_request(
        "POST",
        API_PATH,
        json_data={
            "customerName": "Missing email"
        }
    ),
    400
)

# READ
sut.test(
    f"[READ all] GET {API_PATH}",
    curl_request(
        "GET",
        API_PATH
    ),
    200
)

sut.test(
    f"[READ by id] GET {API_PATH}/{order_id}",
    curl_request(
        "GET",
        f"{API_PATH}/{order_id}"
    ),
    200
)

sut.test(
    f"[READ invalid] GET {API_PATH}/99999",
    curl_request(
        "GET",
        f"{API_PATH}/99999"
    ),
    404
)

# UPDATE
sut.test(
    f"[UPDATE] PUT {API_PATH}/{order_id}",
    curl_request(
        "PUT",
        f"{API_PATH}/{order_id}",
        json_data={
            "status": "shipped",
            "customerName": "Happy Customer"
        }
    ),
    200
)

sut.test(
    f"[UPDATE partial] PUT {API_PATH}/{order_id}",
    curl_request(
        "PUT",
        f"{API_PATH}/{order_id}",
        json_data={
            "status": "delivered"
        }
    ),
    200
)

# DELETE
sut.test(
    f"[DELETE] DELETE {API_PATH}/{order_id}",
    curl_request(
        "DELETE",
        f"{API_PATH}/{order_id}"
    ),
    204
)

sut.test(
    f"[READ deleted] GET {API_PATH}/{order_id}",
    curl_request(
        "GET",
        f"{API_PATH}/{order_id}"
    ),
    404
)

sut.summary()