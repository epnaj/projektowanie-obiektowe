import sys
from typing import Dict
from curl_wrapper import curl_request, CurlResponse

class SimpleUnitTest:
    def __init__(self) -> None:
        self.pass_count: int = 0
        self.fail_count: int = 0

    def check_ok(self, test_name: str, expected_code: int, actual_code: int) -> bool:
        if actual_code == expected_code:
            print(f"[PASS] {test_name} (HTTP {actual_code})")
            self.pass_count += 1
            return True

        print(f"[FAIL] {test_name} (expected {expected_code}, got {actual_code})")
        self.fail_count += 1
        return False


    def test(self, name: str, response: CurlResponse, expected_code: int) -> Dict:
        jsoned_response: Dict = {}

        try:
            jsoned_response = response.json()
        except Exception:
            pass

        if not self.check_ok(name, expected_code, response.status_code):
            print("*" * 25)
            print(jsoned_response)
            print("*" * 25)
            print('\n')
        return jsoned_response
    
    def summary(self) -> None:
        total: int = self.pass_count + self.fail_count
        print(f"\nTests: {total} | Passed: {self.pass_count} | Failed: {self.fail_count}\n")

