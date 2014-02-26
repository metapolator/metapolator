import simplejson
import web

from metapolator import models
from metapolator.log2json import get_glyphs_jsondata
from metapolator.views import raise404_notauthorized


class SaveAxis:

    @raise404_notauthorized
    def POST(self):
        postdata = web.input(project_id=0, label='', value=0, glyphname='')

        project = models.Project.get(id=postdata.project_id)
        if not project:
            raise web.notfound()

        models.Metapolation.update(label=postdata.label,
                                   project_id=postdata.project_id,
                                   values={'value': float(postdata.value)})
        web.ctx.orm.commit()

        masters = project.get_ordered_masters()
        result = get_glyphs_jsondata(postdata.glyphname, masters[0])
        return simplejson.dumps(result)
