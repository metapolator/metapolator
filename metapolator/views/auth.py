import web

from passlib.hash import bcrypt

from metapolator import models
from metapolator.base.config import session, is_loggedin
from metapolator.forms import RegisterForm
from metapolator.views import render


class logout:

    def GET(self):
        if is_loggedin():
            session.kill()
        raise web.seeother('/login')


def authorize(user):
    session.authorized = True
    session.user = user.id
    web.ctx.user = user
    return web.seeother("/")


class login:
    """ Processes authorization of users with username and password """

    def GET(self):
        return render.login(is_loggedin())

    def POST(self):
        name, pwd = web.input().username, web.input().password
        user = models.User.get(username=name)
        if not user:
            return render.login(is_loggedin(), True)

        if bcrypt.verify(pwd, user.password):
            raise authorize(user)
        return render.login(is_loggedin(), True)


class register:
    """ Registration processes of users with username and password """

    def GET(self):
        form = RegisterForm()
        return render.register(form, is_loggedin())

    def POST(self):
        form = RegisterForm()
        if not form.validates():
            return render.register(form)

        user = models.User.create(form.d.username, form.d.password, form.d.email)
        seeother = authorize(user)

        raise seeother
