import ujson
import web

from metapolator import models
from metapolator.log2json import get_glyph_info_from_log
from metapolator.metapost import Metapost
from metapolator.tools import get_metapolation_label, \
    prepare_master_environment, prepare_environment_directory
from metapolator.views import raise404_notauthorized


class Project:

    @raise404_notauthorized
    def GET(self):
        prepare_environment_directory()

        x = web.input(project=0)

        project = models.Project.get(id=x.project)
        if not project:
            raise web.notfound()

        if x.get('glyph'):
            if not models.Glyph.exists(name=x.get('glyph'),
                                       project_id=project.id):
                raise web.notfound()
            project.currentglyph = x.glyph
            web.ctx.orm.commit()

        masters = project.get_ordered_masters()

        masters_list = []

        metapost = Metapost(project)

        for i, master in enumerate(masters):

            prepare_master_environment(master)

            glyphs = master.get_glyphs()
            glyphs = glyphs.filter(models.Glyph.name == project.currentglyph)

            if not metapost.execute_single(master, glyphs.first()):
                return web.badrequest()

            master_instancelog = project.get_instancelog(master.version, 'a')
            glyphsdata = get_glyph_info_from_log(master_instancelog, master=master)

            metalabel = get_metapolation_label(chr(models.LABELS[i]))

            masters_list.append({'glyphs': glyphsdata,
                                 'label': chr(models.LABELS[i]),
                                 'metapolation': metalabel,
                                 'master_id': master.id})

        glyphs = masters[0].get_glyphs()

        glyphs = glyphs.filter(models.Glyph.name == project.currentglyph)

        if not metapost.execute_interpolated_single(glyphs.first()):
            return web.badrequest()

        instancelog = project.get_instancelog(masters[0].version)
        metaglyphs = get_glyph_info_from_log(instancelog)

        import operator
        masters = map(operator.attrgetter('id', 'version'),
                      models.Master.filter(project_id=project.id))

        return ujson.dumps({'masters': masters_list,
                                 'versions': project.get_versions(),
                                 'metaglyphs': metaglyphs,
                                 'mode': project.mfparser,
                                 'project_id': project.id})
