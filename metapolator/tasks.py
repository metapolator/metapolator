import web

from metapolator.base.config import celery, load_sqla, load_user, session
from metapolator.models import Master
from metapolator.glif2db import put_font_all_glyphs


@celery.task(name='metapolator.tasks.fill_master_with_glyphs')
def fill_master_with_glyphs(master_id, user_id, force_update=False):
    session.user = user_id

    load_sqla()
    load_user()

    master = Master.get(id=master_id)
    if not master:
        return False
    put_font_all_glyphs(master, force_update=force_update)

    master.task_completed = True
    web.ctx.orm.commit()
    return True
