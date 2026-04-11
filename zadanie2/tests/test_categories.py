#!/usr/bin/env python3

import sys
from typing import Dict
from curl_wrapper import curl_request, CurlResponse
from simple_unit_test import SimpleUnitTest

BASE_URL: str = sys.argv[1] if len(sys.argv) > 1 else "http://localhost:8000"
API_PATH: str = f"{BASE_URL}/api/categories"


sut: SimpleUnitTest = SimpleUnitTest()

response: Dict = sut.test(
    f"[CREATE 1] POST {API_PATH}",
    curl_request(
        "POST",
        API_PATH,
        json_data={
            "name": "Electronics",
            "description": "Electronic devices and gadgets"
        }
    ),
    201
)

category_id: int = int(response["id"])

sut.test(
    f"[CREATE 2] POST {API_PATH}",
    curl_request(
        "POST",
        API_PATH,
        json_data={
            "name": "Books",
            "description": "Physical and digital books"
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
            "description": "missing name"
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
    f"[READ by id] GET {API_PATH}/{category_id}",
    curl_request(
        "GET",
        f"{API_PATH}/{category_id}"
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
    f"[UPDATE] PUT {API_PATH}/{category_id}",
    curl_request(
        "PUT",
        f"{API_PATH}/{category_id}",
        json_data={
            "name": "Consumer Electronics",
            "description": "Updated description"
        }
    ),
    200
)

sut.test(
    f"[UPDATE partial] PUT {API_PATH}/{category_id}",
    curl_request(
        "PUT",
        f"{API_PATH}/{category_id}",
        json_data={
            "description": "Only description updated"
        }
    ),
    200
)

# DELETE
sut.test(
    f"[DELETE] DELETE {API_PATH}/{category_id}",
    curl_request(
        "DELETE",
        f"{API_PATH}/{category_id}"
    ),
    204
)

sut.test(
    f"[READ deleted] GET {API_PATH}/{category_id}",
    curl_request(
        "GET",
        f"{API_PATH}/{category_id}"
    ),
    404
)

sut.summary()