from app import db, app
from peewee import *
from datetime import datetime, timedelta
from flask_peewee.rest import RestAPI, RestResource
from flask import request
import json
import logging


class Upload(db.Model):
    data = TextField()
    is_xhr = BooleanField(db_index=True)
    remote_ip = CharField(max_length=64, db_index=True)
    headers = TextField()
    created = DateTimeField(default=datetime.now, db_index=True)
    url = TextField(db_index=True)
    cookie = TextField()
    useragent = TextField()

    def __unicode__(self):
        return self.data

    class Meta:
        ordering = (('created', 'asc'),)


class UploadResource(RestResource):
    def prepare_data(self, obj, data):
        del data['is_xhr']
        del data['data']

        h = request.args.get('headers', None)
        if not h:
            del data['headers']
        utc_8 = obj.created + timedelta(hours=8)
        data['created'] = utc_8.strftime("%Y-%m-%d (%a) %H:%M:%S")
        return data

Upload.create_table(fail_silently=True)

api = RestAPI(app)
api.register(Upload, UploadResource)
api.setup()
