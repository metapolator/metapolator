from metapolator.config import celery, load_sqla, load_user, session
from metapolator.metapost import Metapost
from metapolator.models import Master
from metapolator.tools import put_font_all_glyphs


@celery.task(name='metapolator.tasks.fill_master_with_glyphs')
def fill_master_with_glyphs(master_id, user_id):
    session.user = user_id

    load_sqla()
    load_user()

    master = Master.get(id=master_id)
    if not master:
        return
    put_font_all_glyphs(master)

    metapost = Metapost(master.project)
    metapost.execute_interpolated_bulk()
