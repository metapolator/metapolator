import ujson
import web

from metapolator import models
from metapolator.forms import LocalParamForm
from metapolator.log2json import get_glyphs_jsondata
from metapolator.views import raise404_notauthorized


class FontLocalPreset:

    @raise404_notauthorized
    def GET(self):
        x = web.input(local_id=0)
        localparams = models.LocalParam.get(id=x.local_id)
        if not localparams:
            return ujson.dumps({})
        return ujson.dumps(localparams.as_dict())

    @raise404_notauthorized
    def POST(self):
        x = web.input(master_id=0)

        master = models.Master.get(id=x.master_id)

        localparams = models.LocalParam.all()
        result = []
        for i, k in enumerate(localparams):
            dict_ = {'val': k.id, 'idx': i + 1}
            if x.master_id:
                if master and k.id == master.idlocala:
                    dict_.update({'selected': True})
            result.append(dict_)
        return ujson.dumps(result)

    @raise404_notauthorized
    def PUT(self):
        x = web.input()

        master = models.Master.get(id=x.get('master_id'))
        if not master:
            return web.notfound()

        form = LocalParamForm()
        if form.validates():
            idlocal = form.d.idlocal
            values = form.d

            del values['idlocal']
            del values['save']

            if not int(idlocal):
                localparam = models.LocalParam.create(**values)
                web.ctx.orm.commit()
                master.idlocala = localparam.id
            else:
                models.LocalParam.update(id=idlocal, values=values)
                localparam = models.LocalParam.get(id=idlocal)
                web.ctx.orm.commit()
                master.idlocala = localparam.id

        project = master.project
        result = get_glyphs_jsondata(project.currentglyph, master)
        return ujson.dumps(result)
