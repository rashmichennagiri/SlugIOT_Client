"""
This file defines the database models
"""

import datetime
from .common import db, Field, auth
from pydal.validators import *
import uuid


def get_user_email():
    return auth.current_user.get('email') if auth.current_user else None


def get_time():
    return datetime.datetime.utcnow()


# To keep track of all the devices:
# db.define_table('device',
#                 # Field('device_id', 'string', writable=False, required=True, default=uuid.uuid4()),
#                 Field('device_name', 'string', required=True),
#                 Field('device_mac_address', 'string', required=True),
#                 Field('device_nickname', 'string'),
#                 Field('description', 'text'),
#                 Field('device_added_date', 'datetime', writable=False, default=get_time()),
#                 Field('user_email', 'string', writable=False, required=True, default=get_user_email)
#                 )

# db.device.id.readable = False
# db.device.device_added_date.readable = False
# db.device.user_email.readable = False



######### SERVER -> CLIENT

# The information below is synched server to client.  It does not change very often,
# and it is crucial to have some of this information at startup (such as the device_id),
# even if there is no internet connection to the device.


# Synched server -> client (except for some special rows).
db.define_table('client_settings',
                Field('procedure_id'),  # Can be Null for device-wide settings.
                Field('setting_name'),
                Field('setting_value'),  # Encoded in json-plus.
                Field('last_updated', 'datetime', default=get_time()))
                   

db.define_table('client_procedures',
                Field('procedure_id', 'bigint', required=True),  # key
                Field('procedure_name', 'string'),
                Field('procedure_code', 'text', required=True),
                Field('last_updated', 'datetime', default=get_time(), required=True)
               )


######### CLIENT -> SERVER
# These tables are synched "up" from the clients to the server.

db.define_table('client_logs',
                Field('time_stamp', 'datetime', default=get_time()),
                Field('procedure_id'),
                Field('log_level', 'string'),
                Field('log_message', 'text')
                )


db.define_table('client_outputs',
                   Field('time_stamp', 'datetime', default=get_time()),
                   Field('procedure_id'),
                   Field('field_name'),
                   Field('description'),  
                   Field('output_value', 'text'),  # Json, short please
                   Field('comments'),
                   Field('tag')
                   )


# State of the procedure when last run.
# Note: when we synch this, we always have to keep at least one entry.
db.define_table('procedure_state',
                   Field('procedure_id'),
                   Field('class_name'), # Name of the class that run in the procedure?
                   Field('procedure_state', 'text'),
                   Field('time_stamp', 'datetime', default=get_time()),
                   )


db.define_table('synchronization_events',
                   Field('table_name'),
                   Field('time_stamp', 'datetime', default=get_time()),
                   )



# always commit your models to avoid problems later
db.commit()
