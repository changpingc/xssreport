from app import app, db, api
from peewee import *
import logging
from flask import request
from datetime import datetime


class RawUpload(db.Model):
    data = TextField()
    is_xhr = BooleanField()
    remote_ip = CharField(max_length=64)
    headers = TextField()
    created = DateTimeField(default=datetime.now)

    def __unicode__(self):
        return self.data


RawUpload.create_table(fail_silently=True)
api.register(RawUpload)


@app.route('/')
def hello():
    return 'Hello World!'


@app.route('/upload/', methods=['POST', ])
def upload():
    data = request.form.get('d', None)
    if data is None:
        return "missing data"
    else:
        row = RawUpload.create(data=data, is_xhr=request.is_xhr,
            headers=unicode(request.headers), remote_ip=request.remote_addr)
        return "ok"
