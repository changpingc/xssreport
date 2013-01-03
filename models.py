#coding=utf8
from app import db
from peewee import *
from datetime import datetime


class Report(db.Model):
    additional = TextField(default="")
    site_specific = TextField(default="")
    screen = TextField(default="")
    remote_ip = CharField(max_length=64, db_index=True)
    headers = TextField(default="")
    created = DateTimeField(default=datetime.utcnow, db_index=True)
    url = TextField(db_index=True)
    cookie = TextField(default="")
    useragent = TextField(default="")
    uri = TextField(db_index=True)

    def __unicode__(self):
        return "Report on %s from %s" % (self.url, self.remote_ip)

    class Meta:
        order_by = ('-created', )


class Script(db.Model):
    name = TextField(default="")
    uri = CharField(max_length=64, db_index=True, unique=True)
    short_url = CharField(max_length=1024, default="")
    source = TextField(default="")
    compiled = TextField(default="")
    created = DateTimeField(default=datetime.utcnow, db_index=True)
    last_edited = DateTimeField(default=datetime.utcnow, db_index=True)

    def save(self):
        self.last_edited = datetime.utcnow()
        super(Script, self).save()

    class Meta:
        order_by = ('-created', )

Report.create_table(fail_silently=True)
Script.create_table(fail_silently=True)
