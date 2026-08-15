from app import app


def test_index():
    client = app.test_client()
    resp = client.get("/")
    assert resp.status_code == 200
    assert "Hello, World!" in resp.get_data(as_text=True)


def test_greeting_api():
    client = app.test_client()
    resp = client.get("/api/greeting")
    assert resp.status_code == 200
    data = resp.get_json()
    assert data["message"] == "Hello, World!"
