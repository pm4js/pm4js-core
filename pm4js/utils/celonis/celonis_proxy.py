import requests
from flask import Flask, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app)


@app.route('/getWrapper', methods=['GET'])
def get_wrapper():
    return requests.get(request.args["url"], headers={"Authorization": "Bearer " + request.args["access_token"]}).text


@app.route('/postWrapper', methods=['POST'])
def post_wrapper():
    call_contents = request.get_json()
    url = call_contents["url"]
    access_token = call_contents["access_token"]
    return requests.post(url, headers={"Authorization": "Bearer " + access_token},
                         json=call_contents).text


if __name__ == "__main__":
    app.run(threaded=True, port=5004)
