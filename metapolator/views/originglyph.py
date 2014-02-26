import web

from metapolator import models
from metapolator.views import raise404_notauthorized


class GlyphOrigin:

    @raise404_notauthorized
    def GET(self):
        x = web.input(master_id=0, glyphname='')
        if not x.get('glyphname'):
            raise web.notfound()

        glyph = models.Glyph.get(name=x.glyphname,
                                 master_id=x.master_id)

        if not glyph:
            raise web.notfound()
        return glyph.original_glyph_contours
