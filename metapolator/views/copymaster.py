import ujson
import web

from metapolator import models
from metapolator.views import raise404_notauthorized


class CopyMaster:

    @raise404_notauthorized
    def POST(self):
        postdata = web.input(master_id=0, glyphname='', axislabel='')

        master = models.Master.get(id=postdata.master_id)
        if not master:
            return web.notfound()

        newmaster_obj = master.project.create_master()
        newmaster_obj.name = master.name
        newmaster_obj.user_id = master.user_id
        newmaster_obj.idlocala = master.idlocala
        web.ctx.orm.commit()

        for glyph in master.get_glyphs():

            newglyph_obj = models.Glyph.create(master_id=newmaster_obj.id,
                                               name=glyph.name,
                                               width=glyph.width,
                                               width_new=glyph.width_new,
                                               project_id=glyph.project_id)

            web.ctx.orm.commit()

            query = web.ctx.orm.query(models.GlyphPoint, models.GlyphPointParam)
            query = query.filter(models.GlyphPoint.glyph_id == glyph.id)
            query = query.filter(models.GlyphPointParam.glyphpoint_id == models.GlyphPoint.id)

            outlines = list(query)

            for outline, param in outlines:

                newglyphpoint_obj = models.GlyphPoint.create(
                    glyph_id=newglyph_obj.id,
                    master_id=newmaster_obj.id,
                    glyphname=newglyph_obj.name,
                    pointnr=outline.pointnr,
                    x=outline.x,
                    y=outline.y)
                web.ctx.orm.commit()

                param.copy(newglyphpoint_obj)
                web.ctx.orm.commit()

        newmaster_obj.update_masters_ordering(postdata.axislabel)
        data = {'master_name': newmaster_obj.name,
                'master_version': '{0:03d}'.format(newmaster_obj.version),
                'master_id': newmaster_obj.id}

        return ujson.dumps(data)
