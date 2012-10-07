from app import app
from flask import request
from models import Upload
from flask import Response
import json


@app.route('/')
def hello():
    return 'Hello World!'


@app.route('/img/', methods=['GET', ])
def img():
    data = request.args.get('d', None)
    if data is None:
        return Response("missing data", mimetype='image/bmp')
    else:
        try:
            j = json.loads(data)
        except Exception as e:
            return Response("Cannot parse: %s" % e, mimetype='image/bmp')

        url = j.get('url', '')
        cookie = j.get('cookie', '')

        row = Upload.create(data=data, is_xhr=request.is_xhr,
            headers=unicode(request.headers),
            url=url, cookie=cookie, useragent=request.user_agent.string,
            remote_ip=request.headers.get('X-Forwarded-For', request.remote_addr))
        return Response("ok", mimetype='image/bmp')


# @app.route('/upload/', methods=['POST', ])
# def upload():
#     data = request.form.get('d', None)
#     if data is None:
#         return "missing data"
#     else:
#         row = Upload.create(data=data, is_xhr=request.is_xhr,
#             headers=unicode(request.headers),
#             remote_ip=request.headers.get('X-Forwarded-For', request.remote_addr))
#         return "ok"
