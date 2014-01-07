# Metapolator
# Beta 0.1
# (c) 2013 by Simon Egli, Walter Egli, Wei Huang, Vitaly Volkov
#
# http: //github.com/metapolator
#
# GPL v3 (http: //www.gnu.org/copyleft/gpl.html).

""" Basic metafont point interface using webpy  """
import datetime
import mimetypes
import models
import os
import os.path as op
import re
import shutil
import web
import zipfile
import simplejson

from web import seeother
from passlib.hash import bcrypt

import metapolator.tasks as tasks

from metapolator.config import app, is_loggedin, session, working_dir, \
    working_url, PROJECT_ROOT
from metapolator.forms import RegisterForm, LocalParamForm, PointParamExtendedForm
from metapolator.tools import put_font_all_glyphs, get_edges_json
from metapolator.metapost import Metapost


def raise404_notauthorized(func):

    def f(*args, **kwargs):
        if not is_loggedin():
            raise seeother('/login')
        return func(*args, **kwargs)

    return f


### Templates
t_globals = {
    'datestr': web.datestr,
    'working_url': working_url,
    'is_loggedin': is_loggedin,
    'webctx': web.ctx,
    'websession': session
}
render = web.template.render('templates', base='base', globals=t_globals)
###  classes


class GlyphPageMixin(object):

    def get_glyphs_jsondata(self, glyphid, master):
        project = master.project
        masters = project.get_ordered_masters()

        glyph = models.Glyph.get(master_id=master.id, name=glyphid)

        metapost = Metapost(project)
        metapost.execute_interpolated_single(glyph)

        instancelog = project.get_instancelog(masters[0].version)
        print '1. ', instancelog
        M_glyphjson = get_edges_json(instancelog, glyphid)

        metapost.execute_single(master, glyph)
        instancelog = project.get_instancelog(master.version, 'a')
        print '2. ', instancelog
        glyphjson = get_edges_json(instancelog, glyphid, master)

        return {'M': M_glyphjson, 'R': glyphjson, 'master_id': master.id}


class Workspace(app.page):

    path = '/workspace/'

    @raise404_notauthorized
    def GET(self):
        web.ctx.pointparam_extended_form = PointParamExtendedForm()
        web.ctx.settings_form = LocalParamForm()
        return render.workspace()


class Project(app.page):

    path = '/editor/project/'

    @raise404_notauthorized
    def GET(self):
        prepare_environment_directory()

        x = web.input(project=0)

        project = models.Project.get(id=x.project)
        if not project:
            raise web.notfound()

        masters = project.get_ordered_masters()

        masters_list = []

        metapost = Metapost(project)

        for i, master in enumerate(masters):

            prepare_master_environment(master)

            glyphs = master.get_glyphs()
            if x.get('glyph'):
                glyphs = glyphs.filter(models.Glyph.name == x.glyph)
            metapost.execute_single(master, glyphs.first())

            master_instancelog = project.get_instancelog(master.version, 'a')
            glyphsdata = get_edges_json(master_instancelog, master=master)

            metalabel = get_metapolation_label(chr(LABELS[i]))

            masters_list.append({'glyphs': glyphsdata,
                                 'label': chr(LABELS[i]),
                                 'metapolation': metalabel,
                                 'master_id': master.id})

        # glyphs = masters[0].get_glyphs()
        # if x.get('glyph'):
        #     glyphs = glyphs.filter(models.Glyph.name == x.glyph)
        # metapost.execute_interpolated_single(glyphs.first())

        instancelog = project.get_instancelog(masters[0].version)
        metaglyphs = get_edges_json(instancelog)

        import operator
        masters = map(operator.attrgetter('id', 'version'),
                      models.Master.filter(project_id=project.id))

        return simplejson.dumps({'masters': masters_list,
                                 'versions': get_versions(project.id),
                                 'metaglyphs': metaglyphs,
                                 'mode': project.mfparser,
                                 'project_id': project.id})


class GlyphList(app.page):

    path = '/editor/glyphs/'

    @raise404_notauthorized
    def GET(self):
        x = web.input(project=0)

        project = models.Project.get(id=x.project)
        if not project:
            raise web.notfound()

        glyphs = models.Glyph.filter(project_id=project.id)
        glyphs = glyphs.group_by(models.Glyph.name)
        glyphs = glyphs.order_by(models.Glyph.name.asc())

        import operator
        glyphs_list = map(operator.attrgetter('name'), glyphs)
        return simplejson.dumps({'glyphs': glyphs_list})


def mime_type(filename):
    return mimetypes.guess_type(filename)[0] or 'application/octet-stream'


class SwitchMFParser(app.page):

    path = '^/mfparser-switch/(pen|controlpoints)/$'

    def POST(self, mfparser):
        session.mfparser = mfparser
        raise seeother('/projects/')


class EditorLocals(app.page):

    path = '/editor/locals/'

    @raise404_notauthorized
    def GET(self):
        x = web.input(local_id=0)
        localparams = models.LocalParam.get(id=x.local_id)
        if not localparams:
            return simplejson.dumps({})
        return simplejson.dumps(localparams.as_dict())

    @raise404_notauthorized
    def POST(self):
        x = web.input(master_id=0)

        localparams = models.LocalParam.all()
        result = []
        for i, k in enumerate(localparams):
            dict_ = {'val': k.id, 'idx': i + 1}
            if x.master_id:
                master = models.Master.get(id=x.master_id)
                if master and k.id == master.idlocala:
                    dict_.update({'selected': True})
            result.append(dict_)
        return simplejson.dumps(result)

    @raise404_notauthorized
    def PUT(self):
        x = web.input()

        master = models.Master.get(id=x.get('master_id'))
        if not master:
            return web.notfound()

        params = []

        form = LocalParamForm()
        if form.validates():
            idlocal = form.d.idlocal
            values = form.d

            del values['idlocal']
            del values['save']

            if not int(idlocal):
                localparam = models.LocalParam.create(**values)
                master.idlocala = localparam.id
                params = [{'val': localparam.id,
                          'idx': models.LocalParam.all().count(),
                          'selected': True}]
            else:
                models.LocalParam.update(id=idlocal, values=values)
                localparam = models.LocalParam.get(id=idlocal)
                master.idlocala = localparam.id

        project = master.project

        masters = project.get_ordered_masters()

        metapost = Metapost(project)
        metapost.execute_interpolated_bulk()

        instancelog = project.get_instancelog(masters[0].version)
        metaglyphs = get_edges_json(instancelog)

        prepare_master_environment(master)

        metapost.execute_bulk(master)
        master_instancelog = project.get_instancelog(master.version, 'a')

        glyphsdata = get_edges_json(master_instancelog, master=master)

        return simplejson.dumps({'glyphs': glyphsdata,
                                 'metaglyphs': metaglyphs,
                                 'master_id': master.id,
                                 'params': params,
                                 'label': x.axislabel})


class userstatic(app.page):

    path = '/users/(.*)'

    def GET(self, path):
        # path = re.sub(r'[\.]{2,}+', '', path)
        try:
            file_name = web.ctx.path.split('/')[-1]
            web.header('Content-Type', mime_type(file_name))
            abspath = op.join(PROJECT_ROOT, 'users', path)
            return open(abspath, 'rb').read()
        except IOError:
            raise web.notfound()


class Index(app.page):

    path = '/'

    def GET(self):
        raise seeother('/projects/')


class EditorMetapolationSave(app.page, GlyphPageMixin):

    path = '/editor/save-metap/'

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
        result = self.get_glyphs_jsondata(postdata.glyphname, masters[0])
        return simplejson.dumps(result)


class EditorSavePoint(app.page, GlyphPageMixin):

    path = '/editor/save-point/'

    @raise404_notauthorized
    def POST(self):
        postdata = web.input(id='')

        # @FIXME: must be changed to form with validation of available
        # arguments values.
        #
        # >>> form = EditorSavePointForm()
        # >>> if not form.validates():
        # >>>     raise web.notfound()
        if not models.GlyphOutline.exists(id=postdata.id):
            return web.notfound()
        glyphoutline = models.GlyphOutline.get(id=postdata.id)

        project = models.Project.get(id=glyphoutline.glyph.project_id)
        if not project:
            raise web.notfound()

        master = models.Master.get(id=glyphoutline.glyph.master_id)
        if not master:
            return web.notfound()

        form = PointParamExtendedForm()
        if form.validates():
            values = form.d
            glyphoutline.x = float(values['x'])
            glyphoutline.y = float(values['y'])

            del values['zpoint']
            del values['x']
            del values['y']
            for key in values:
                if values[key] == '':
                    values[key] = None
            models.GlyphParam.update(glyphoutline_id=postdata.id,
                                     values=values)
        result = self.get_glyphs_jsondata(glyphoutline.glyph.name, master)
        return simplejson.dumps(result)


class Projects(app.page):

    path = '/projects/'

    @raise404_notauthorized
    def GET(self):
        projects = models.Project.all()
        return render.projects(projects)


class EditorCanvasReload(app.page):

    path = '/editor/reload/'

    @raise404_notauthorized
    def POST(self):
        postdata = web.input(master_id=0, glyphname='', axislabel='')

        master = models.Master.get(id=postdata.master_id)
        if not master:
            return web.notfound()

        project = master.project

        index = LABELS.index(ord(postdata.axislabel))
        masters = project.masters.split(',')
        if index > len(masters) - 1:
            masters.append(master.id)
        else:
            masters[index] = master.id
        project.masters = ','.join(map(str, masters))
        web.ctx.orm.commit()

        masters = project.get_ordered_masters()
        prepare_master_environment(masters[0])
        prepare_master_environment(master)

        metapost = Metapost(project)

        glyphs = masters[0].get_glyphs()
        glyphs = glyphs.filter(models.Glyph.name == postdata.glyphname)
        metapost.execute_single(masters[0], glyphs.first())

        instancelog = project.get_instancelog(masters[0].version)
        metaglyphs = get_edges_json(instancelog)

        glyphs = master.get_glyphs()
        glyphs = glyphs.filter(models.Glyph.name == postdata.glyphname)
        metapost.execute_single(master, glyphs.first())
        master_instancelog = project.get_instancelog(master.version, 'a')

        glyphsdata = get_edges_json(master_instancelog, master=master)

        metalabel = get_metapolation_label(postdata.axislabel)

        return simplejson.dumps({'glyphs': glyphsdata,
                                 'metaglyphs': metaglyphs,
                                 'master_id': master.id,
                                 'metapolation': metalabel,
                                 'label': postdata.axislabel})


class EditorCreateInstance(app.page):

    path = '/editor/create-instance/'

    @raise404_notauthorized
    def POST(self):
        postdata = web.input(project_id=0)

        project = models.Project.get(id=postdata.project_id)
        if not project:
            raise web.notfound()

        metapost = Metapost(project)
        metapost.execute_interpolated_bulk()

        instance = models.Instance.create(project_id=project.id)

        for extension in ['-webfont.eot', '-webfont.ttf', '.otf']:
            source = project.get_basename() + extension
            dest_dir = op.join(working_dir(), 'instances')
            if not op.exists(dest_dir):
                os.makedirs(dest_dir)
            dest_file = op.join(dest_dir, '%s%s' % (instance.id, extension))
            try:
                shutil.copy(op.join(working_dir(), 'static', source), dest_file)
            except:
                pass

        return simplejson.dumps({})


def get_versions(project_id):
    masters = models.Master.filter(project_id=project_id)
    return map(lambda master: {'version': '{0:03d}'.format(master.version),
                               'name': master.name,
                               'master_id': master.id}, masters)


class EditorCreateMaster(app.page):

    path = '/editor/create-master/'

    def create_glyphpoint(self, glyph, pointnr, pointparam, point):
        kwargs = dict(glyph_id=glyph.id, master_id=glyph.master_id,
                      glyphname=glyph.name,
                      pointnr=pointnr, x=int(float(point['x'])),
                      y=int(float(point['y'])))
        glyphoutline = models.GlyphOutline.create(**kwargs)

        kwargs = dict(glyphoutline_id=glyphoutline.id,
                      glyph_id=glyph.id,
                      master_id=glyph.master_id,
                      pointname=pointparam.pointname,
                      startp=pointparam.startp,
                      type=pointparam.type,
                      control_in=pointparam.control_in,
                      control_out=pointparam.control_out,
                      doubledash=pointparam.doubledash,
                      tripledash=pointparam.tripledash,
                      leftp=pointparam.leftp,
                      rightp=pointparam.rightp,
                      downp=pointparam.downp,
                      upp=pointparam.upp,
                      dir=pointparam.dir,
                      leftp2=pointparam.leftp2,
                      rightp2=pointparam.rightp2,
                      downp2=pointparam.downp2,
                      upp2=pointparam.upp2,
                      dir2=pointparam.dir2,
                      tensionand=pointparam.tensionand,
                      penshifted=pointparam.penshifted,
                      pointshifted=pointparam.pointshifted,
                      angle=pointparam.angle,
                      penwidth=pointparam.penwidth,
                      overx=pointparam.overx,
                      overbase=pointparam.overbase,
                      overcap=pointparam.overcap,
                      overasc=pointparam.overasc,
                      overdesc=pointparam.overdesc)
        models.GlyphParam.create(**kwargs)

    def round(self, coord):
        return int(round(float(coord)))

    @raise404_notauthorized
    def POST(self):
        postdata = web.input(project_id=0)

        project = models.Project.get(id=postdata.project_id)
        if not project:
            raise web.notfound()

        masters = project.get_ordered_masters()

        version = models.Master.max(models.Master.version,
                                    project_id=project.id)

        master = models.Master.create(project_id=project.id,
                                      version=(version + 1))
        prepare_master_environment(master)

        metapost = Metapost(project)
        metapost.execute_interpolated_bulk()

        primary_master = masters[0]

        master.name = primary_master.name
        logpath = project.get_instancelog(version=primary_master.version)
        for glyph in primary_master.get_glyphs():
            json = get_edges_json(logpath, glyph.name)
            if not json:
                raise web.badrequest(simplejson.dumps({'error': 'could not find any contours for instance in %s' % logpath}))

            zpoints = glyph.get_zpoints()

            points = []
            for i, contourpoints in enumerate(json[0]['contours']):
                if not contourpoints:
                    raise web.badrequest(simplejson.dumps({'error': 'could not find any points in contour for instance in %s' % logpath}))
                metapost_points = []
                for point in contourpoints:
                    if project.mfparser == 'controlpoints':
                        metapost_points.append({'x': self.round(point['controls'][0]['x']),
                                                'y': self.round(point['controls'][0]['y'])})

                    metapost_points.append({'x': self.round(point['x']),
                                            'y': self.round(point['y'])})

                    if project.mfparser == 'controlpoints':
                        metapost_points.append({'x': self.round(point['controls'][1]['x']),
                                                'y': self.round(point['controls'][1]['y'])})
                if project.mfparser == 'controlpoints' and metapost_points:
                    if i != 0:
                        points_ = metapost_points[1:] + metapost_points[:1]
                        points += points_
                    else:
                        points_ = metapost_points[2:] + metapost_points[:2]
                        points += points_[::-1]
                else:
                    points += metapost_points

            if len(zpoints) != len(points):
                raise web.badrequest(simplejson.dumps({'error': '%s zp != mp %s' % (len(zpoints), len(points))}))

            newglypha = models.Glyph.create(master_id=master.id,
                                            name=glyph.name,
                                            width=glyph.width,
                                            project_id=glyph.project_id)

            i = 0
            for point in points:
                self.create_glyphpoint(newglypha, (i + 1), zpoints[i], point)
                i += 1

        project.masters = ','.join([str(master.id)] * len(masters))
        web.ctx.orm.commit()
        return simplejson.dumps({})


LABELS = range(ord('A'), ord('Z') + 1)
METAP_PAIRS = zip(map(chr, LABELS[::2]), map(chr, LABELS[1::2]))


def get_metapolation_label(c):
    """ Return metapolation label pair like AB, CD, EF """
    c = c.upper()
    try:
        index = map(chr, LABELS[::2]).index(c)
        return map(chr, LABELS[::2])[index] + map(chr, LABELS[1::2])[index]
    except ValueError:
        pass

    index = map(chr, LABELS[1::2]).index(c)
    return map(chr, LABELS[::2])[index] + map(chr, LABELS[1::2])[index]


class EditorUploadZIP(app.page):

    path = '/upload/'

    @raise404_notauthorized
    def POST(self):
        x = web.input(ufofile={}, project_id=0, label='', glyph='')
        try:
            rawzipcontent = x.ufofile.file.read()
            if not rawzipcontent:
                raise web.badrequest()
            project_id = int(x.project_id)
        except (AttributeError, TypeError, ValueError):
            raise web.badrequest()

        if not project_id:
            projects = models.Project.all()
            count = projects.filter(models.Project.projectname.like('UntitledProject%')).count()
            project = models.Project.create(projectname='UntitledProject%s' % (count + 1),
                                            mfparser=session.get('mfparser'))
        else:
            project = models.Project.get(id=project_id)
            if not project:
                raise web.notfound()

        prepare_environment_directory()

        filename = op.join(project.get_directory(), x.ufofile.filename)
        try:
            with open(filename, 'w') as fp:
                fp.write(rawzipcontent)
        except (IOError, OSError):
            models.Project.delete(project)  # delete created project
            raise web.badrequest()

        try:
            fzip = zipfile.ZipFile(filename)

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

            version = models.Master.max(models.Master.version,
                                        project_id=project.id)

            if not version:
                version = 0

            version += 1
            name, ext = op.splitext(op.basename(FontNameA))
            master = models.Master.create(project_id=project.id,
                                          version=version,
                                          name=name)

            label = get_metapolation_label(x.label)
            metapolation = models.Metapolation.get(label=label, project_id=project.id)
            if not metapolation:
                metapolation = models.Metapolation.create(label=label, project_id=project.id)

            fontpath = master.get_fonts_directory()

            fzip.extractall(fontpath)

            ufopath = master.get_ufo_path()
            shutil.move(op.join(fontpath, FontNameA), ufopath)

            prepare_master_environment(master)

            put_font_all_glyphs(master, x.glyph, preload=True)
        except (zipfile.BadZipfile, OSError, IOError):
            raise

        index = LABELS.index(ord(x.label.upper()))
        masters = project.masters.split(',')

        if index > len(masters) - 1:
            masters.append(master.id)
        else:
            masters[index] = master.id
        project.masters = ','.join(map(str, masters))
        web.ctx.orm.commit()

        metapost = Metapost(project)

        if x.glyph:
            glyph = master.get_glyphs().filter(models.Glyph.name == x.glyph).first()
        else:
            glyph = master.get_glyphs().first()

        metapost.execute_single(master, glyph)

        masters = project.get_ordered_masters()

        master_instancelog = project.get_instancelog(master.version, 'a')
        glyphsdata = get_edges_json(master_instancelog, master=master)

        if x.glyph:
            glyph = masters[0].get_glyphs().filter(models.Glyph.name == x.glyph).first()
        else:
            glyph = masters[0].get_glyphs().first()

        metapost.execute_interpolated_single(glyph)

        instancelog = project.get_instancelog(master.version)
        metaglyphs = get_edges_json(instancelog)
        return simplejson.dumps({'project_id': project.id,
                                 'glyphname': glyph.name,
                                 'master_id': master.id,
                                 'label': x.label,
                                 'metapolation': label,
                                 'glyphs': glyphsdata,
                                 'metaglyphs': metaglyphs,
                                 'version': '{0:03d}'.format(version),
                                 'versions': get_versions(master.project_id)})


class MasterAsyncLoading(app.page):

    path = '/a/master/loading'

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
                return simplejson.dumps({'done': True})
            else:
                master.task_updated = datetime.datetime.now()
                web.ctx.orm.commit()
                return simplejson.dumps({'done': False, 'task_id': x.task_id})

        asyncresult = tasks.fill_master_with_glyphs.delay(x.master_id,
                                                          web.ctx.user.id)
        master.task_id = asyncresult.task_id
        master.task_created = datetime.datetime.now()
        web.ctx.orm.commit()
        return simplejson.dumps({'done': False,
                                 'task_id': asyncresult.task_id})


class Specimen(app.page):

    path = '/specimen/(\d+)/'

    @raise404_notauthorized
    def GET(self, id):
        """ View single post """
        project = models.Project.get(id=id)
        if not project:
            raise web.notfound()

        web.ctx.project = project
        instances = models.Instance.filter(project_id=project.id)
        return render.specimen(project, instances.order_by(models.Instance.id.desc()))


class logout(app.page):

    path = '/logout'

    def GET(self):
        if is_loggedin():
            session.kill()
        raise web.seeother('/login')


def authorize(user):
    session.authorized = True
    session.user = user.id
    web.ctx.user = user
    return web.seeother("/")


class Login(app.page):
    """ Processes authorization of users with username and password """

    path = '/login'

    def GET(self):
        return render.login(is_loggedin())

    def POST(self):
        name, pwd = web.input().username, web.input().password
        user = models.User.get(username=name)
        if not user:
            return render.login(is_loggedin(), True)

        if bcrypt.verify(pwd, user.password):
            raise authorize(user)
        return render.login(is_loggedin(), True)


def prepare_environment_directory(force=False):
    filelist = ['makefont.sh', 'mf2pt1.mp', 'mf2pt1.pl', 'mf2pt1.texi',
                'mtp.enc']

    static_directory = op.join(working_dir(), 'static')
    if not op.exists(static_directory):
        os.makedirs(static_directory)

    if op.exists(op.join(working_dir(), 'makefont.sh')) and not force:
        return

    for filename in filelist:
        try:
            shutil.copy2(op.join(working_dir(user='skel'), filename),
                         op.join(working_dir()))
        except (OSError, IOError):
            raise


class Register(app.page):
    """ Registration processes of users with username and password """

    path = '/register'

    def GET(self):
        form = RegisterForm()
        return render.register(form, is_loggedin())

    def POST(self):
        form = RegisterForm()
        if not form.validates():
            return render.register(form)

        user = models.User.create(form.d.username, form.d.password, form.d.email)
        seeother = authorize(user)

        prepare_environment_directory()
        raise seeother


def prepare_master_environment(master):
    for f in os.listdir(working_dir('commons', user='skel')):
        filename = working_dir(op.join('commons', f), user='skel')
        try:
            shutil.copy2(filename, master.get_fonts_directory())
        except (IOError, OSError):
            raise
