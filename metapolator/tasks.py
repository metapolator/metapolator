from metapolator.config import celery, load_sqla, load_user, session
from metapolator.tools import put_font_all_glyphs
from metapolator.models import Master


@celery.task(name='metapolator.tasks.fill_master_with_glyphs')
def fill_master_with_glyphs(master_id, user_id):
    session.user = user_id

    load_sqla()
    load_user()

    master = Master.get(id=master_id)
    if not master:
        return
    put_font_all_glyphs(master)
