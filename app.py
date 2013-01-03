from flask import Flask
from flask_peewee.db import Database
import urlparse
import os
from werkzeug.routing import BaseConverter
from werkzeug.contrib.cache import SimpleCache

DATABASE = {
    'name': os.environ['DB_NAME'],
    'host': os.environ['DB_HOST'],
    'engine': 'peewee.MySQLDatabase',
    'user': os.environ['DB_USER'],
    'passwd': os.environ['DB_PASS'],
}


app = Flask(__name__)
# app.config['DEBUG'] = False
app.config['DATABASE'] = DATABASE
app.config['SECRET_KEY'] = os.environ['SECRET_KEY']
if os.environ.get('DEBUG', '') == 'DEBUG':
    app.config['DEBUG'] = True
else:
    app.config['DEBUG'] = False

db = Database(app)
cache = SimpleCache()


# source http://stackoverflow.com/questions/5870188/does-flask-support-regular-expressions-in-its-url-routing
class RegexConverter(BaseConverter):
    def __init__(self, url_map, *items):
        super(RegexConverter, self).__init__(url_map)
        self.regex = items[0]
app.url_map.converters['regex'] = RegexConverter
