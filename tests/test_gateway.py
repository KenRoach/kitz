import json
import threading
import time
import unittest
from http.client import HTTPConnection

from kitz_gateway.server import GatewayConfig, create_server


class GatewayIntegrationTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.server = create_server(GatewayConfig(host="127.0.0.1", port=8788))
        cls.thread = threading.Thread(target=cls.server.serve_forever, daemon=True)
        cls.thread.start()
        time.sleep(0.1)

    @classmethod
    def tearDownClass(cls):
        cls.server.shutdown()
        cls.server.server_close()
        cls.thread.join(timeout=2)

    def request(self, method, path, body=None):
        conn = HTTPConnection("127.0.0.1", 8788)
        headers = {"Content-Type": "application/json"}
        conn.request(method, path, body=body, headers=headers)
        response = conn.getresponse()
        payload = json.loads(response.read().decode("utf-8"))
        conn.close()
        return response.status, payload

    def test_health(self):
        status, payload = self.request("GET", "/v0.1/health")
        self.assertEqual(status, 200)
        self.assertEqual(payload["version"], "0.1")

    def test_list_tools(self):
        status, payload = self.request("GET", "/v0.1/tools")
        self.assertEqual(status, 200)
        names = {tool["name"] for tool in payload["tools"]}
        self.assertSetEqual(names, {"echo", "utc_now", "sum"})

    def test_sum_invoke(self):
        body = json.dumps({"args": {"numbers": [1, 2, 3]}})
        status, payload = self.request("POST", "/v0.1/tools/sum/invoke", body=body)
        self.assertEqual(status, 200)
        self.assertEqual(payload["result"]["sum"], 6)

    def test_unknown_tool(self):
        status, payload = self.request("POST", "/v0.1/tools/nope/invoke", body="{}")
        self.assertEqual(status, 404)
        self.assertIn("unknown tool", payload["error"])


if __name__ == "__main__":
    unittest.main()
