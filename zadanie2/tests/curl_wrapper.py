
from dataclasses import dataclass
import json
import subprocess

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