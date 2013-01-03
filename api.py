from flask_peewee.rest import RestAPI, RestResource, Authentication
from flask_peewee.serializer import Serializer
from app import app, db
from models import Report, Script
from flask import request
from flaskext.jsonify import jsonify
from peewee import *


# class RestResourceWithCount(RestResource):
#     def get_request_metadata(self, paginated_query):
#         ret = RestResource.get_request_metadata(self, paginated_query)
#         print paginated_query.query.sql()
#         return ret


class PublicRestResource(RestResource):
    def authorize(self):
        return True


class ReportResource(PublicRestResource):
    paginate_by = 100


class ScriptResource(PublicRestResource):
    pass


class ReportURIResource(PublicRestResource):
    fields = ['latest', 'count', 'uri']

    def get_query(self):
        return Report.select(Report.uri, fn.Count(Report.id).alias(
                'count'), fn.Max(Report.created).alias('latest')).group_by(
                Report.uri).order_by(fn.Max(Report.created))

    def get_api_name(self):
        return "report/uri"


# @app.route('/api/report/uri/', methods=['GET', ])
# def listURI():
#     # return a list of URIs with report counts ordered by latest activity
#     q = Report.select(Report.uri, fn.Count(Report.id).alias(
#         'count'), fn.Max(Report.created).alias('latest')).group_by(
#         Report.uri).order_by(fn.Max(Report.created)).limit(50)
#     return [{'uri': x.uri, 'count': x.count, 'latest': x.latest} for x in q]


api = RestAPI(app)
api.register(Report, ReportResource)
api.register(Report, ReportURIResource, allowed_methods=['GET'])
api.register(Script, ScriptResource)
api.setup()
