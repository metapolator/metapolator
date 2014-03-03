import datetime
import ujson
import web

from metapolator import models
from metapolator.views import raise404_notauthorized


class MasterAsyncLoading:

    @raise404_notauthorized
    def POST(self):
        x = web.input(master_id='', project_id='', task_id='')
        project = models.Project.get(id=x.project_id)
        if not project:
            raise web.notfound()

        master = models.Master.get(id=x.master_id)
        if not master:
            return web.notfound()

        if x.task_id:
            from celery.result import AsyncResult
            from metapolator.config import celery
            res = AsyncResult(x.task_id, backend=celery.backend)

            if res.ready():
                master.task_completed = True
                web.ctx.orm.commit()
                return ujson.dumps({'done': True})
            else:
                master.task_updated = datetime.datetime.now()
                web.ctx.orm.commit()
                return ujson.dumps({'done': False, 'task_id': x.task_id})

        master.task_completed = True
        web.ctx.orm.commit()
        return ujson.dumps({'done': True})
