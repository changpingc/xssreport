from flask_peewee.rest import RestAPI, RestResource, Authentication
from flask_peewee.serializer import Serializer
from app import app, db
from models import Report, Script
from flask import request, session
from flaskext.jsonify import jsonify
from peewee import *


class SessionAuthResource(RestResource):
    def authorize(self):
        return True
        # return session.get('magic', '') == 'a'


class ScriptResource(SessionAuthResource):
    pass


class ReportResource(SessionAuthResource):
    paginate_by = 100

    def get_query(self):
        if request.args.get('method', '') == "listURI":
            # monkey patch fields
            self._fields = {self.model: ['latest', 'count', 'uri']}
            return Report.select(Report.uri, fn.Count(Report.id).alias(
                'count'), fn.Max(Report.created).alias('latest')).group_by(
                Report.uri).order_by(fn.Max(Report.created).desc())
        else:
            self._fields = {self.model: self.model._meta.get_field_names()}
            return SessionAuthResource.get_query(self)


api = RestAPI(app)
api.register(Report, ReportResource)
api.register(Script, ScriptResource)
api.setup()
