from flask import Flask
from flask_peewee.db import Database
import urlparse
import os

# remote:qGiqVrK0HoVa1GNxh8kX5sJUV9nyDL

if 'EXTERNAL_DB_URL' in os.environ:
    url = urlparse.urlparse(os.environ['EXTERNAL_DB_URL'])

    DATABASE = {
        'engine': 'peewee.PostgresqlDatabase',
        'user': url.username,
        'password': url.password,
        'host': url.hostname,
        'port': url.port,
        'name': url.path[1:],
    }
    print "Using Postgresql!"
else:
    DATABASE = {
        'name': 'xssreport.db',
        'engine': 'peewee.SqliteDatabase',
    }
    print "Using SQLite!"

SECRET_KEY = 'ogIiTdbqCslr7g5zwvmA7smpwh4ZTYUAL7g2ossNhV5u8VR\
FLd7e7L3xflb4Ll6dAEONUoe54mdrbdjQqlbdNeBm3ap37i98JP4K'

app = Flask(__name__)
app.config['DATABASE'] = DATABASE
db = Database(app)
