import os

""" Import app from views as we need to get correct url mappings
    from views classes. """
from metapolator.base.config import app


if __name__ == '__main__':
    app.run()


application = None
if os.environ.get('PRODUCTION', False):
    application = app.wsgifunc()
