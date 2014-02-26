import web

from metapolator.base.config import working_url, is_loggedin, session


def raise404_notauthorized(func):

    def f(*args, **kwargs):
        if not is_loggedin():
            raise web.seeother('/login')
        return func(*args, **kwargs)

    return f


t_globals = {
    'datestr': web.datestr,
    'working_url': working_url,
    'is_loggedin': is_loggedin,
    'webctx': web.ctx,
    'websession': session
}


render = web.template.render('templates', base='base', globals=t_globals)
