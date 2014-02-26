import web

from metapolator.base.config import session


class ChangeMFMode:

    def POST(self, mfparser):
        session.mfparser = mfparser
        raise web.seeother('/projects/')
