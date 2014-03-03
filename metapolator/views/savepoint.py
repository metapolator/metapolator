import simplejson
import web

from metapolator import models
from metapolator.forms import PointParamExtendedForm
from metapolator.log2json import get_glyphs_jsondata
from metapolator.views import raise404_notauthorized


class SavePoint:

    @raise404_notauthorized
    def POST(self):
        postdata = web.input(glyphoutline_id='')

        if not models.GlyphOutline.exists(id=postdata.glyphoutline_id):
            return web.notfound()
        glyphoutline = models.GlyphOutline.get(id=postdata.glyphoutline_id)

        project = models.Project.get(id=glyphoutline.glyph.project_id)
        if not project:
            raise web.notfound()

        master = models.Master.get(id=glyphoutline.glyph.master_id)
        if not master:
            return web.notfound()

        form = PointParamExtendedForm()
        if form.validates():
            values = form.d
            glyphoutline.x = float(values['x'])
            glyphoutline.y = float(values['y'])

            glyphoutline.glyph.width = int(values['width'])
            glyphoutline.glyph.width_new = int(values['width_new'])

            del values['zpoint']
            del values['x']
            del values['y']
            del values['width']
            del values['width_new']
            for key in values:
                if values[key] == '':
                    values[key] = None
            models.GlyphParam.update(glyphoutline_id=postdata.glyphoutline_id,
                                     values=values)
        result = get_glyphs_jsondata(glyphoutline.glyph.name, master)
        return simplejson.dumps(result)
