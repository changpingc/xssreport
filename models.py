from app import db, app
from peewee import *
from datetime import datetime
from flask_peewee.rest import RestAPI, RestResource
from flask import request
import json
import logging


class RawUpload(db.Model):
    data = TextField()
    is_xhr = BooleanField()
    remote_ip = CharField(max_length=64)
    headers = TextField()
    created = DateTimeField(default=datetime.now)

    def __unicode__(self):
        return self.data


class RawUploadResource(RestResource):
    def prepare_data(self, obj, data):
        d = data.get('data', '')
        try:
            j = json.loads(d)
        except Exception as e:
            logging.info("Cannot parse JSON '%s': %s" % (d, e))
            return None
        del data['is_xhr']
        del data['data']

        h = request.args.get('headers', None)
        if not h:
            del data['headers']
        data['cookie'] = j.get('cookie', None)
        data['url'] = j.get('url', None)
        return data


RawUpload.create_table(fail_silently=True)

api = RestAPI(app)
api.register(RawUpload, RawUploadResource)
api.setup()
