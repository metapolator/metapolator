import web

from metapolator.forms import PointParamExtendedForm, LocalParamForm
from metapolator.views import render, raise404_notauthorized


class Workspace:

    @raise404_notauthorized
    def GET(self):
        web.ctx.pointparam_extended_form = PointParamExtendedForm()
        web.ctx.settings_form = LocalParamForm()
        return render.workspace()
