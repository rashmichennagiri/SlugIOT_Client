"""
This file defines actions, i.e. functions the URLs are mapped into
The @action(path) decorator exposed the function at URL:

    http://127.0.0.1:8000/{app_name}/{path}

If app_name == '_default' then simply

    http://127.0.0.1:8000/{path}

If path == 'index' it can be omitted:

    http://127.0.0.1:8000/

The path follows the bottlepy syntax.

@action.uses('generic.html')  indicates that the action uses the generic.html template
@action.uses(session)         indicates that the action uses the session
@action.uses(db)              indicates that the action uses the db
@action.uses(T)               indicates that the action uses the i18n & pluralization
@action.uses(auth.user)       indicates that the action requires a logged in user
@action.uses(auth)            indicates that the action requires the auth object

session, db, T, auth, and tempates are examples of Fixtures.
Warning: Fixtures MUST be declared with @action.uses({fixtures}) else your app will result in undefined behavior
"""

import time

from py4web import action, request, abort, redirect, URL
from py4web.utils.form import Form, FormStyleBulma

from yatl.helpers import A
from .common import db, session, T, cache, auth, logger, authenticated, unauthenticated, flash
from py4web.utils.url_signer import URLSigner
from .models import get_user_email

from py4web.utils.publisher import Publisher, ALLOW_ALL_POLICY

publisher = Publisher(db, policy=ALLOW_ALL_POLICY)

url_signer = URLSigner(session)


@action('index')
@action.uses(db, auth, 'device_id.html')
def index():
    # print("in index():", get_user_email())                
    return dict(
        load_logs_url=URL('load_logs', signer=url_signer),
        clear_logs_url=URL('clear_logs', signer=url_signer),

        load_outputs_url=URL('load_outputs', signer=url_signer),
        clear_outputs_url=URL('clear_outputs', signer=url_signer),

        sync_events_url=URL('sync_events', signer=url_signer)
    )


@action('load_logs')
@action.uses(url_signer.verify(), db)
def load_logs():
    rows = db(db.client_logs).select().as_list()
    return dict(rows=rows)


@action('clear_logs')
@action.uses(url_signer.verify(), db)
def clear_logs():
    my_query_logs = (db.client_logs.id != None)
    my_set_logs = db(my_query_logs)
    rows = my_set_logs.select()
    print("printed from slugIOT client - will clear from logs table: ", rows)
    my_set_logs.delete()
    print("cleared table client_logs" )
    return "ok"


@action('load_outputs')
@action.uses(url_signer.verify(), db)
def load_outputs():
    rows = db(db.client_outputs).select().as_list()
    print("printed from slugIOT client - loaded output table: ", rows)
    return dict(rows=rows)


@action('clear_outputs')
@action.uses(url_signer.verify(), db)
def clear_outputs():
    my_query_outputs = (db.procedure_state.id != None) #TODO change to client_outputs
    my_set_outputs = db(my_query_outputs)
    rows = my_set_outputs.select()
    print("printed from slugIOT client - will clear from output table: ", rows)
    my_set_outputs.delete()
    print("cleared table procedure_state" )
    return "ok"


@action('sync_events', method="POST")
@action.uses(url_signer.verify(), db)
def sync_events():
    id = db.synchronization_events.insert(
        # device_id=request.json.get('device_id'),
        table_name=request.json.get('table_name')
    )
    return dict(id=id)


# @action('load_table/<table_name>')
# @action.uses(url_signer.verify(), db)
# def load_procedures(table_name):
#     rows = db(db.table_name).select().as_list()
#     return dict(rows=rows)


@action('load_procedures')
@action.uses(url_signer.verify(), db)
def load_procedures():
    rows = db(db.procedures_map).select().as_list()
    return dict(rows=rows)


@action('add_proc', method="POST")
@action.uses(url_signer.verify(), db)
def add_procedure():
    id = db.procedures_map.insert(
        device_id=request.json.get('device_id'),
        procedure_name=request.json.get('procedure_name'),
    )
    return dict(id=id)

# @action('delete_procedure')
# @action.uses(url_signer.verify(), db)
# def delete_procedure():
#     id = request.params.get('id')
#     assert id is not None
#     db(db.procedures_map.id == id).delete()
#     return "ok"





# @action('edit_procedure', method="POST")
# @action.uses(url_signer.verify(), db)
# def edit_procedure():
#     id = request.json.get("id")
#     field = request.json.get("field")
#     value = request.json.get("value")
#     db(db.procedures_map.id == id).update(**{field: value})
#     time.sleep(1) # debugging
#     return "ok"
