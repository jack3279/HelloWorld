# HelloWorld

第一个程序 — a tiny Flask "Hello, World!" web app.

## Getting started

```bash
python3 -m venv .venv
.venv/bin/pip install -r requirements.txt
.venv/bin/python app.py
```

Then open http://localhost:5000/ or call the JSON endpoint:

```bash
curl http://localhost:5000/
curl http://localhost:5000/api/greeting
```

## Tests

```bash
.venv/bin/python -m pytest
```
