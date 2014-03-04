import datetime
import os.path as op
import re
import ujson
import shutil
import StringIO
import web
import zipfile

from metapolator import models
from metapolator import tasks
from metapolator.base.config import session
from metapolator.glif2db import put_font_all_glyphs
from metapolator.tools import prepare_environment_directory, \
    prepare_master_environment, get_metapolation_label
from metapolator.views import raise404_notauthorized


class UploadZIP:

    @raise404_notauthorized
    def POST(self):
        x = web.input(ufofile={}, project_id=0, label='', glyph='',
                      master_id=0)
        try:
            rawzipcontent = x.ufofile.file.read()
            if not rawzipcontent:
                raise web.badrequest()
            zipcontent = StringIO.StringIO(rawzipcontent)
        except (AttributeError, TypeError, ValueError):
            raise web.badrequest()

        try:
            project_id = int(x.project_id)
        except TypeError:
            project_id = 0

        if not project_id:
            projects = models.Project.all()
            count = projects.filter(models.Project.projectname.like('UntitledProject%')).count()
            project = models.Project.create(projectname='UntitledProject%s' % (count + 1),
                                            mfparser=session.get('mfparser'))
        else:
            project = models.Project.get(id=project_id)
            if not project:
                raise web.notfound()

        master_exists = False
        try:
            master = models.Master.get(id=x.master_id, project_id=project.id)
            master_exists = bool(master)
        except AttributeError:
            master = None

        prepare_environment_directory()

        try:
            fzip = zipfile.ZipFile(zipcontent)

            namelist = fzip.namelist()

            iscorrect_ufo = False
            ufo_dirs = []
            for f in namelist:
                if re.search(r'.ufo[\\/]$', f):
                    ufo_dirs.append(re.sub(r'[\\/]', '', f))
                if re.search(r'.ufo[\\/]glyphs[\\/].*?.glif$', f, re.IGNORECASE):
                    iscorrect_ufo = True

            if not iscorrect_ufo:
                raise web.badrequest()

            FontNameA = ufo_dirs[0]
            name, ext = op.splitext(op.basename(FontNameA))

            if not master:
                master = project.create_master()
                master.name = name
                web.ctx.orm.commit()

            label = get_metapolation_label(x.label)
            metapolation = models.Metapolation.get(label=label, project_id=project.id)
            if not metapolation:
                metapolation = models.Metapolation.create(label=label, project_id=project.id)

            fontpath = master.get_fonts_directory()
            shutil.rmtree(fontpath, ignore_errors=True)

            fzip.extractall(fontpath)

            ufopath = master.get_ufo_path()
            shutil.move(op.join(fontpath, FontNameA), ufopath)

            prepare_master_environment(master)

            if not master_exists:
                currentglyph = put_font_all_glyphs(master, project.currentglyph,
                                                   preload=True)
                project.currentglyph = currentglyph
            else:
                put_font_all_glyphs(master, project.currentglyph,
                                    preload=True, force_update=True)

            asyncresult = tasks.fill_master_with_glyphs.delay(master.id,
                                                              web.ctx.user.id,
                                                              force_update=master_exists)
            master.task_id = asyncresult.task_id
            master.task_created = datetime.datetime.now()
            web.ctx.orm.commit()
        except (zipfile.BadZipfile, OSError, IOError):
            raise

        master.update_masters_ordering(x.label)
        return ujson.dumps({'project_id': project.id,
                                 'glyphname': project.currentglyph,
                                 'master_id': master.id,
                                 'label': x.label,
                                 'metapolation': label})
