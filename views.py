from app import app, cache
from flask import request
from models import Report, Script
from flask import Response, abort
import json
import logging
import urllib

CACHE_TIMEOUT = 300


@app.route('/')
def hello():
    return 'Hello World!'


def log_report(uri, data):
    parts = data.strip().split("&")
    form = {}
    for part in parts:
        if len(part) == 0:
            continue
        key, val = map(urllib.unquote_plus, part.split("="))
        form[key] = form.get(key, '') + val

    r = Report()
    r.uri = uri
    r.additional = form.get('a', '')
    r.site_specific = form.get('site', '')
    r.screen = form.get('s', '')
    r.remote_ip = request.access_route[0]
    r.headers = "\r\n".join(["%s: %s" % x for x in request.headers.to_list()])
    r.url = form.get('u', '')
    r.cookie = form.get('c', '')
    r.useragent = form.get('ua', '')
    r.save()
    logging.error("Logged %s" % r)


@app.route('/r/<regex("[a-zA-Z0-9-]+"):uri>/', methods=['GET', 'POST'])
def log_standard_report(uri):
    data = request.query_string if request.method == 'GET' else request.data
    log_report(uri, data)
    return ""


def send_script(uri):
    compiled = cache.get(uri)
    if compiled is None:
        try:
            s = Script.get(Script.uri == uri)
            compiled = s.compiled
        except Script.DoesNotExist:
            abort(404)
        cache.set(uri, compiled, timeout=CACHE_TIMEOUT)
    return Response(compiled, status=200, content_type='application/javascript')


def serve_static(path):
    try:
        with open(path, 'rb') as f:
            data = f.read()
        return data
    except IOError:
        abort(404)


@app.route('/x/<regex("[a-zA-Z0-9-]+"):uri>/')
def send_script_with_slash(uri):
    return send_script(uri)


@app.route('/x/<regex("[a-zA-Z0-9-]+"):uri>')
def send_script_without_slash(uri):
    return send_script(uri)


@app.route('/manage/')
def serve_manage_page():
    return serve_static('static/manage.html')


@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Methods', 'POST, GET, PUT, DELETE, OPTIONS')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type')
    response.headers.add('Access-Control-Allow-Origin', '*')

    # no cache:
    # response.headers.add('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0')
    return response
