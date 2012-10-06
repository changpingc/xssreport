from app import db, app
from peewee import *
from datetime import datetime
from flask_peewee.rest import RestAPI


class RawUpload(db.Model):
    data = TextField()
    is_xhr = BooleanField()
    remote_ip = CharField(max_length=64)
    headers = TextField()
    created = DateTimeField(default=datetime.now)

    def __unicode__(self):
        return self.data


RawUpload.create_table(fail_silently=True)

api = RestAPI(app)
api.register(RawUpload)
api.setup()
