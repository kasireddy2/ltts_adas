# Copyright (C) 2018 Intel Corporation
#
# SPDX-License-Identifier: MIT

from .base import *

DEBUG = False

INSTALLED_APPS += [
    'mod_wsgi.server',
]

NUCLIO['HOST'] = os.getenv('CVAT_NUCLIO_HOST', 'nuclio')

for key in RQ_QUEUES:
    RQ_QUEUES[key]['HOST'] = os.getenv('CVAT_REDIS_HOST', 'cvat_redis')

CACHEOPS_REDIS['host'] = os.getenv('CVAT_REDIS_HOST', 'cvat_redis')

# Django-sendfile:
# https://github.com/johnsensible/django-sendfile
SENDFILE_BACKEND = 'sendfile.backends.xsendfile'

# Database
# https://docs.djangoproject.com/en/2.0/ref/settings/#databases

# DATABASES = {
#     'default': {
#         'ENGINE': 'django.db.backends.postgresql',
#         'HOST': os.getenv('CVAT_POSTGRES_HOST', 'cvat_db'),
#         'NAME': os.getenv('CVAT_POSTGRES_DBNAME', 'cvat'),
#         'USER': os.getenv('CVAT_POSTGRES_USER', 'root'),
#         'PASSWORD': os.getenv('CVAT_POSTGRES_PASSWORD', ''),
#     }
# }
DATABASES = {
    'default': {
        # 'ENGINE': 'django.db.backends.sqlite3',
        # 'NAME': os.path.join(BASE_DIR, 'db.sqlite3'),
        'ENGINE': 'djongo',
        'ENFORCE_SCHEMA': True,
        'NAME': 'django_mongodb_docker',
        'HOST': 'mongodb',
        'PORT': 27017,
        'USER': 'root',
        'PASSWORD': 'mongoadmin',
        'AUTH_SOURCE': 'admin',
        'AUTH_MECHANISM': 'SCRAM-SHA-1',
    }
}
