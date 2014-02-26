import simplejson
import web

from metapolator import models
from metapolator.metapost import Metapost
from metapolator.tools import get_edges_json, get_metapolation_label, \
    get_versions, prepare_master_environment
from metapolator.views import raise404_notauthorized


def get_master_data(master, glyph, axislabel):
    project = master.project

    masters = project.get_ordered_masters()
    prepare_master_environment(masters[0])
    prepare_master_environment(master)

    metapost = Metapost(project)

    glyphs = masters[0].get_glyphs()
    glyphs = glyphs.filter(models.Glyph.name == glyph)
    if not metapost.execute_single(masters[0], glyphs.first()):
        return

    instancelog = project.get_instancelog(masters[0].version)
    metaglyphs = get_edges_json(instancelog)

    glyphs = master.get_glyphs()
    glyphs = glyphs.filter(models.Glyph.name == glyph)
    if not metapost.execute_single(master, glyphs.first()):
        return
    master_instancelog = project.get_instancelog(master.version, 'a')

    glyphsdata = get_edges_json(master_instancelog, master=master)

    metalabel = get_metapolation_label(axislabel)

    return {'glyphs': glyphsdata,
            'metaglyphs': metaglyphs,
            'master_name': master.name,
            'master_version': '{0:03d}'.format(master.version),
            'master_id': master.id,
            'metapolation': metalabel,
            'label': axislabel,
            'versions': get_versions(project.id)}


class GetMaster:

    @raise404_notauthorized
    def POST(self):
        postdata = web.input(master_id=0, glyphname='', axislabel='')

        master = models.Master.get(id=postdata.master_id)
        if not master:
            return web.notfound()

        master.update_masters_ordering(postdata.axislabel)

        data = get_master_data(master, postdata.glyphname, postdata.axislabel)
        if not data:
            return web.badrequest()
        return simplejson.dumps(data)
