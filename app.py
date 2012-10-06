from flask import Flask
from flask_peewee.db import Database
import urlparse
import os
from flask_peewee.rest import RestAPI

urlparse.uses_netloc.append('postgres')

if 'DATABASE_URL' in os.environ:
    url = urlparse.urlparse(os.environ['DATABASE_URL'])

    DATABASE = {
        'engine': 'peewee.PostgresqlDatabase',
        'name': url.path[1:],
        'password': url.password,
        'host': url.hostname,
        'port': url.port,
    }
else:
    DATABASE = {
        'name': 'xssreport.db',
        'engine': 'peewee.SqliteDatabase',
    }

SECRET_KEY = 'ogIiTdbqCslr7g5zwvmA7smpwh4ZTYUAL7g2ossNhV5u8VR\
FLd7e7L3xflb4Ll6dAEONUoe54mdrbdjQqlbdNeBm3ap37i98JP4K'

app = Flask(__name__)
app.config['DATABASE'] = DATABASE
db = Database(app)
api = RestAPI(app)
api.setup()
