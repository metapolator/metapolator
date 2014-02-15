import os
import os.path as op
import web

from sqlalchemy.orm import scoped_session, sessionmaker
from celery import Celery

import metapolator.celeryconfig

celery = Celery('metapolator.tasks')
celery.config_from_object(metapolator.celeryconfig)

PROJECT_ROOT = op.abspath(op.join(op.dirname(__file__), '..'))

try:
    from metapolator.localconfig import DATABASE_USER, DATABASE_PWD, DATABASE_NAME
except ImportError:
    DATABASE_USER = os.environ.get('METAP_DATABASE_USER', 'root')
    DATABASE_PWD = os.environ.get('METAP_DATABASE_PWD', '')
    DATABASE_NAME = os.environ.get('METAP_DATABASE_NAME', 'metapolatordev')

DATABASE_ENGINE = 'mysql+mysqldb://{0}:{1}@localhost/{2}'.format(DATABASE_USER, DATABASE_PWD, DATABASE_NAME)

from sqlalchemy import create_engine
engine = create_engine(DATABASE_ENGINE, echo=False)

### Url mappings
web.config.debug = False


def load_user(handler=None):
    import models
    try:
        web.ctx.user = models.User.get(id=session.user)
    except AttributeError:
        web.ctx.user = None
    return handler and handler()


def load_sqla(handler=None):
    if not session.get('mfparser'):
        session.mfparser = 'controlpoints'
    web.ctx.orm = scoped_session(sessionmaker(bind=engine))
    try:
        return handler and handler()
    except web.HTTPError:
        web.ctx.orm.commit()
        raise

    except:
        web.ctx.orm.rollback()
        raise
    finally:
        web.ctx.orm.commit()
        # If the above alone doesn't work, uncomment
        # the following line:
        #web.ctx.orm.expunge_all()

app = web.auto_application()
app.add_processor(load_sqla)


session = web.session.Session(app, web.session.DiskStore('sessions'),
                              {'count': 0})
app.add_processor(load_user)


def absolute(path):
    PATH = os.path.dirname(os.path.abspath(__file__))
    return os.path.join(PATH, path)


def is_loggedin():
    try:
        return web.ctx.user
    except AttributeError:
        pass


def buildfname(filename):
    try:
        basename, extension = filename.split('.')
    except:
        extension = "garbage"
        basename = ""
    return [basename, extension]


def working_dir(path=None, user=None):
    if web.ctx.user or user:
        directory = op.join(PROJECT_ROOT, 'users', str(user or web.ctx.user.username))
        if not op.exists(directory):
            os.makedirs(directory)

        if not path:
            return directory

        result_path = op.join(directory, path)
        if not op.exists(result_path):
            os.makedirs(result_path)

        return result_path
    return path


def working_url(path=None):
    if is_loggedin():
        directory = op.join('/', 'users', str(web.ctx.user.username))
        if not path:
            return directory
        return op.join(directory, path)
    return path
