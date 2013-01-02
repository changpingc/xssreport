from flask_peewee.rest import RestAPI, RestResource, Authentication
from app import app
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


@app.route('/api/report/uri/', methods=['GET', ])
@jsonify
def listURI():
    q = Report.select(Report.uri, fn.Count(Report.id).alias(
        'count')).group_by(Report.uri)
    return [{'uri': x.uri, 'count': x.count} for x in q]


api = RestAPI(app)
api.register(Report, ReportResource)
api.register(Script, ScriptResource)
api.setup()
