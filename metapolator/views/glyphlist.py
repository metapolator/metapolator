import operator
import ujson
import web

from metapolator import models
from metapolator.views import raise404_notauthorized


class GlyphList:

    @raise404_notauthorized
    def GET(self):
        x = web.input(project=0)

        project = models.Project.get(id=x.project)
        if not project:
            raise web.notfound()

        glyphs = models.Glyph.filter(project_id=project.id)
        glyphs = glyphs.group_by(models.Glyph.name)
        glyphs = glyphs.order_by(models.Glyph.name.asc())

        glyphs_list = map(operator.attrgetter('name'), glyphs)
        return ujson.dumps({'glyphs': glyphs_list})
