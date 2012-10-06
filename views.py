from app import app
from flask import request
from models import RawUpload
from flask import Response


@app.route('/')
def hello():
    return 'Hello World!'


@app.route('/img/', methods=['GET', ])
def img():
    data = request.args.get('d', None)
    if data is None:
        return Response("missing data", mimetype='image/bmp')
    else:
        row = RawUpload.create(data=data, is_xhr=request.is_xhr,
            headers=unicode(request.headers),
            remote_ip=request.headers.get('X-Forwarded-For', request.remote_addr))
        return Response("ok", mimetype='image/bmp')


@app.route('/upload/', methods=['POST', ])
def upload():
    data = request.form.get('d', None)
    if data is None:
        return "missing data"
    else:
        row = RawUpload.create(data=data, is_xhr=request.is_xhr,
            headers=unicode(request.headers),
            remote_ip=request.headers.get('X-Forwarded-For', request.remote_addr))
        return "ok"
