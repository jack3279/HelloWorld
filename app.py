"""HelloWorld — a minimal first web application.

第一个程序: a tiny Flask app that greets the world.
"""

from flask import Flask, jsonify

app = Flask(__name__)


@app.route("/")
def index():
    return "Hello, World! 你好，世界！"


@app.route("/api/greeting")
def greeting():
    return jsonify(message="Hello, World!", zh="你好，世界！")


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
