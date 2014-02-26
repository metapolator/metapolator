import mimetypes
import os.path as op
import web

from metapolator.base.config import PROJECT_ROOT


def mime_type(filename):
    return mimetypes.guess_type(filename)[0] or 'application/octet-stream'


class userstatic:

    def GET(self, path):
        # path = re.sub(r'[\.]{2,}+', '', path)
        try:
            file_name = web.ctx.path.split('/')[-1]
            web.header('Content-Type', mime_type(file_name))
            abspath = op.join(PROJECT_ROOT, 'users', path)
            return open(abspath, 'rb').read()
        except IOError:
            raise web.notfound()
