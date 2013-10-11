import os

from metapolator.config import app


if __name__ == '__main__':
    app.run()


application = None
if os.environ.get('PRODUCTION', False):
    application = app.wsgifunc()
