import os
import os.path as op
import web
from sqlalchemy.orm import scoped_session, sessionmaker

PROJECT_ROOT = op.abspath(op.join(op.dirname(__file__), '..'))
DATABASE_USER = 'root'
DATABASE_PWD = ''

try:
    from localconfig import DATABASE_USER, DATABASE_PWD
except ImportError:
    pass

from sqlalchemy import create_engine
engine = create_engine('mysql+mysqldb://{0}:{1}@localhost/blog'.format(DATABASE_USER, DATABASE_PWD), echo=True)

### Url mappings
web.config.debug = False


def load_user(handler):
    import models
    try:
        web.ctx.user = models.User.get(id=session.user)
    except AttributeError:
        web.ctx.user = None
    return handler()


def load_sqla(handler):

    web.ctx.orm = scoped_session(sessionmaker(bind=engine))
    try:
        return handler()
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
