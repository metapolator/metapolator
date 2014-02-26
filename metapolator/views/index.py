from web import seeother


class Index:

    def GET(self):
        raise seeother('/projects/')
