import os
import os.path as op
import ujson
import shutil
import web

from metapolator import models
from metapolator.base.config import working_dir
from metapolator.metapost import Metapost
from metapolator.views import raise404_notauthorized


class CreateInstance:

    @raise404_notauthorized
    def POST(self):
        postdata = web.input(project_id=0)

        project = models.Project.get(id=postdata.project_id)
        if not project:
            raise web.notfound()

        instance = models.Instance.create(project_id=project.id)
        indexname = models.Instance.filter(project_id=project.id).count()

        metapost = Metapost(project, version=indexname)
        metapost.execute_interpolated_bulk()

        for extension in ['-webfont.eot', '-webfont.ttf', '.otf']:
            source = project.get_basename() + extension
            dest_dir = op.join(project.get_directory(), 'instances')
            if not op.exists(dest_dir):
                os.makedirs(dest_dir)
            dest = op.join(dest_dir, '%s%s' % (instance.id, extension))
            try:
                shutil.copy(op.join(working_dir(), 'static', source), dest)
            except:
                pass

        return ujson.dumps({})
