from metapolator import models
from metapolator.views import raise404_notauthorized, render


class Projects:

    @raise404_notauthorized
    def GET(self):
        projects = models.Project.all()
        return render.projects(projects)
