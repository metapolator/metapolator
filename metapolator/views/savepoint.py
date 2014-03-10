import ujson
import web

from metapolator import models
from metapolator.forms import PointParamExtendedForm
from metapolator.log2json import get_glyphs_jsondata
from metapolator.views import raise404_notauthorized


class SavePoint:

    @raise404_notauthorized
    def POST(self):
        postdata = web.input(glyphpoint_id='')

        if not models.GlyphPoint.exists(id=postdata.glyphpoint_id):
            return web.notfound()
        glyphpoint = models.GlyphPoint.get(id=postdata.glyphpoint_id)

        project = models.Project.get(id=glyphpoint.glyph.project_id)
        if not project:
            raise web.notfound()

        master = models.Master.get(id=glyphpoint.glyph.master_id)
        if not master:
            return web.notfound()

        form = PointParamExtendedForm()
        if form.validates():
            values = form.d
            glyphpoint.x = float(values['x'])
            glyphpoint.y = float(values['y'])

            glyphpoint.glyph.width = int(values['width'])
            glyphpoint.glyph.width_new = int(values['width_new'])

            del values['zpoint']
            del values['x']
            del values['y']
            del values['width']
            del values['width_new']
            for key in values:
                if values[key] == '':
                    values[key] = None
            models.GlyphPointParam.update(glyphpoint_id=postdata.glyphpoint_id,
                                     values=values)
        result = get_glyphs_jsondata(glyphpoint.glyph.name, master)
        return ujson.dumps(result)
