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


def remove_ext(filename):
    try:
        return op.splitext(filename)[0]
    except IndexError:
        return filename


def mf_filename(filename):
    return remove_ext(filename) + '.mf'


def is_loggedin():
    try:
        return session.authorized
    except AttributeError:
        pass


### preset font loading
class cFont:
    fontpath = "fonts/1/"
    fontna = ""
    fontnb = ""
    fontname = ""
    idglobal = 1
    idmaster = 1
    idwork = '0'
    glyphName = ""
    glyphunic = "1"
    metapolation = 0.5
    unitwidth = 1
    fontsize = 10
    mean = 0.5
    cap = 0.8
    ascl = 0.2
    des = 0.2
    box = 1
    timestamp = 0
    idlocalA = 1
    idlocalB = 2
    loadoption = '0'
    mfoption = '0'


def buildfname(filename):
    try:
        basename, extension = filename.split('.')
    except:
        extension = "garbage"
        basename = ""
    return [basename, extension]


def working_dir(path=None, user=None):
    if is_loggedin():
        directory = op.join(PROJECT_ROOT, 'users', str(user or session.user))
        if not op.exists(directory):
            os.makedirs(directory)

        if not path:
            return directory

        result_path = op.join(directory, path)
        if not op.exists(op.dirname(result_path)):
            os.makedirs(op.dirname(result_path))

        return result_path
    return path


def working_url(path=None):
    if is_loggedin():
        directory = op.join('/', 'users', str(session.user))
        if not path:
            return directory
        return op.join(directory, path)
    return path
