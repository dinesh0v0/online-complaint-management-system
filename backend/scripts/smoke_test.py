import json

from fastapi.testclient import TestClient

from app.main import app


def main() -> None:
    client = TestClient(app)
    print(json.dumps(client.get('/health').json()))
    print(json.dumps(client.get('/').json()))


if __name__ == '__main__':
    main()
