import os
import os.path as op
import web
import urls


PROJECT_ROOT = op.abspath(op.join(op.dirname(__file__), '..'))


### Url mappings

web.config.debug = False
app = web.application(urls.urls, globals())

session = web.session.Session(app, web.session.DiskStore('sessions'),
                              {'count': 0})


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
