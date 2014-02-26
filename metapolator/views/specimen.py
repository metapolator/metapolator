import web

from metapolator import models
from metapolator.views import raise404_notauthorized, render


class Specimen:

    @raise404_notauthorized
    def GET(self, id):
        """ View single post """
        project = models.Project.get(id=id)
        if not project:
            raise web.notfound()

        web.ctx.project = project
        instances = models.Instance.filter(project_id=project.id,
                                           archived=False)
        return render.specimen(project, instances.order_by(models.Instance.id.desc()))

    @raise404_notauthorized
    def POST(self, id):
        x = web.input(id='')
        project = models.Project.get(id=id)
        if not project:
            raise web.notfound()
        models.Instance.update(id=x.id, values={'archived': True})
        raise web.seeother("/specimen/%s/" % project.id)
