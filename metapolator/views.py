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
import cStringIO as StringIO

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
        M_glyphjson = get_edges_json(instancelog, glyphid)

        metapost.execute_single(master, glyph)
        instancelog = project.get_instancelog(master.version, 'a')
        glyphjson = get_edges_json(instancelog, glyphid, master)

        return {'M': M_glyphjson, 'R': glyphjson, 'master_id': master.id}


class Workspace(app.page):

    path = '/workspace/'

    @raise404_notauthorized
    def GET(self):
        web.ctx.pointparam_extended_form = PointParamExtendedForm()
        web.ctx.settings_form = LocalParamForm()
        return render.workspace()


def get_metapolation_label(c):
    """ Return metapolation label pair like AB, CD, EF """
    c = c.upper()
    try:
        index = map(chr, models.LABELS[::2]).index(c)
        return map(chr, models.LABELS[::2])[index] + map(chr, models.LABELS[1::2])[index]
    except ValueError:
        pass

    index = map(chr, models.LABELS[1::2]).index(c)
    return map(chr, models.LABELS[::2])[index] + map(chr, models.LABELS[1::2])[index]


class Project(app.page):

    path = '/editor/project/'

    @raise404_notauthorized
    def GET(self):
        prepare_environment_directory()

        x = web.input(project=0)

        project = models.Project.get(id=x.project)
        if not project:
            raise web.notfound()

        if x.get('glyph'):
            if not models.Glyph.exists(name=x.get('glyph'), project_id=project.id):
                raise web.notfound()
            project.currentglyph = x.glyph
            web.ctx.orm.commit()

        masters = project.get_ordered_masters()

        masters_list = []

        metapost = Metapost(project)

        for i, master in enumerate(masters):

            prepare_master_environment(master)

            glyphs = master.get_glyphs()
            glyphs = glyphs.filter(models.Glyph.name == project.currentglyph)

            if not metapost.execute_single(master, glyphs.first()):
                return web.badrequest()

            master_instancelog = project.get_instancelog(master.version, 'a')
            glyphsdata = get_edges_json(master_instancelog, master=master)

            metalabel = get_metapolation_label(chr(models.LABELS[i]))

            masters_list.append({'glyphs': glyphsdata,
                                 'label': chr(models.LABELS[i]),
                                 'metapolation': metalabel,
                                 'master_id': master.id})

        glyphs = masters[0].get_glyphs()

        glyphs = glyphs.filter(models.Glyph.name == project.currentglyph)

        if not metapost.execute_interpolated_single(glyphs.first()):
            return web.badrequest()

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


class EditorLocals(app.page, GlyphPageMixin):

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

        master = models.Master.get(id=x.master_id)

        localparams = models.LocalParam.all()
        result = []
        for i, k in enumerate(localparams):
            dict_ = {'val': k.id, 'idx': i + 1}
            if x.master_id:
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

        form = LocalParamForm()
        if form.validates():
            idlocal = form.d.idlocal
            values = form.d

            del values['idlocal']
            del values['save']

            if not int(idlocal):
                localparam = models.LocalParam.create(**values)
                web.ctx.orm.commit()
                master.idlocala = localparam.id
            else:
                models.LocalParam.update(id=idlocal, values=values)
                localparam = models.LocalParam.get(id=idlocal)
                web.ctx.orm.commit()
                master.idlocala = localparam.id

        project = master.project
        result = self.get_glyphs_jsondata(project.currentglyph, master)
        return simplejson.dumps(result)


class GlyphOrigin(app.page):

    path = '/a/glyph/origins/'

    @raise404_notauthorized
    def GET(self):
        x = web.input(project=0, master_id=0)
        glyph = models.Glyph.get(project_id=x.project,
                                 master_id=x.master_id)

        if not glyph:
            raise web.notfound()
        return glyph.original_glyph_contours


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
        postdata = web.input(glyphoutline_id='')

        if not models.GlyphOutline.exists(id=postdata.glyphoutline_id):
            return web.notfound()
        glyphoutline = models.GlyphOutline.get(id=postdata.glyphoutline_id)

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

            glyphoutline.glyph.width = int(values['width'])
            glyphoutline.glyph.width_new = int(values['width_new'])

            del values['zpoint']
            del values['x']
            del values['y']
            del values['width']
            del values['width_new']
            for key in values:
                if values[key] == '':
                    values[key] = None
            models.GlyphParam.update(glyphoutline_id=postdata.glyphoutline_id,
                                     values=values)
        result = self.get_glyphs_jsondata(glyphoutline.glyph.name, master)
        return simplejson.dumps(result)


class Projects(app.page):

    path = '/projects/'

    @raise404_notauthorized
    def GET(self):
        projects = models.Project.all()
        return render.projects(projects)


def get_master_data(master, glyph, axislabel):
    project = master.project

    masters = project.get_ordered_masters()
    prepare_master_environment(masters[0])
    prepare_master_environment(master)

    metapost = Metapost(project)

    glyphs = masters[0].get_glyphs()
    glyphs = glyphs.filter(models.Glyph.name == glyph)
    if not metapost.execute_single(masters[0], glyphs.first()):
        return

    instancelog = project.get_instancelog(masters[0].version)
    metaglyphs = get_edges_json(instancelog)

    glyphs = master.get_glyphs()
    glyphs = glyphs.filter(models.Glyph.name == glyph)
    if not metapost.execute_single(master, glyphs.first()):
        return
    master_instancelog = project.get_instancelog(master.version, 'a')

    glyphsdata = get_edges_json(master_instancelog, master=master)

    metalabel = get_metapolation_label(axislabel)

    return {'glyphs': glyphsdata,
            'metaglyphs': metaglyphs,
            'master_name': master.name,
            'master_version': '{0:03d}'.format(master.version),
            'master_id': master.id,
            'metapolation': metalabel,
            'label': axislabel,
            'versions': get_versions(project.id)}


class EditorCanvasReload(app.page):

    path = '/editor/reload/'

    @raise404_notauthorized
    def POST(self):
        postdata = web.input(master_id=0, glyphname='', axislabel='')

        master = models.Master.get(id=postdata.master_id)
        if not master:
            return web.notfound()

        master.update_masters_ordering(postdata.axislabel)

        data = get_master_data(master, postdata.glyphname, postdata.axislabel)
        if not data:
            return web.badrequest()
        return simplejson.dumps(data)


class EditorCopyMaster(app.page):

    path = '/editor/copy-master/'

    @raise404_notauthorized
    def POST(self):
        postdata = web.input(master_id=0, glyphname='', axislabel='')

        master = models.Master.get(id=postdata.master_id)
        if not master:
            return web.notfound()

        newmaster_obj = master.project.create_master()
        newmaster_obj.name = master.name
        newmaster_obj.user_id = master.user_id
        newmaster_obj.idlocala = master.idlocala
        web.ctx.orm.commit()

        for glyph in master.get_glyphs():

            newglyph_obj = models.Glyph.create(master_id=newmaster_obj.id,
                                               name=glyph.name,
                                               width=glyph.width,
                                               width_new=glyph.width_new,
                                               project_id=glyph.project_id)

            web.ctx.orm.commit()

            query = web.ctx.orm.query(models.GlyphOutline, models.GlyphParam)
            query = query.filter(models.GlyphOutline.glyph_id == glyph.id)
            query = query.filter(models.GlyphParam.glyphoutline_id == models.GlyphOutline.id)

            outlines = list(query)

            for outline, param in outlines:

                newglyphoutline_obj = models.GlyphOutline.create(
                    glyph_id=newglyph_obj.id,
                    master_id=newmaster_obj.id,
                    glyphname=newglyph_obj.name,
                    pointnr=outline.pointnr,
                    x=outline.x,
                    y=outline.y)
                web.ctx.orm.commit()

                param.copy(newglyphoutline_obj)
                web.ctx.orm.commit()

        newmaster_obj.update_masters_ordering(postdata.axislabel)
        data = {'master_name': newmaster_obj.name,
                'master_version': '{0:03d}'.format(newmaster_obj.version),
                'master_id': newmaster_obj.id}

        return simplejson.dumps(data)


class EditorCreateInstance(app.page):

    path = '/editor/create-instance/'

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
        models.GlyphParam.create(glyphoutline_id=glyphoutline.id,
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

    def round(self, coord):
        return int(round(float(coord)))

    @raise404_notauthorized
    def POST(self):
        postdata = web.input(project_id=0)

        project = models.Project.get(id=postdata.project_id)
        if not project:
            raise web.notfound()

        masters = project.get_ordered_masters()

        master = project.create_master()
        web.ctx.orm.commit()

        prepare_master_environment(master)

        metapost = Metapost(project)
        metapost.execute_interpolated_bulk()

        primary_master = masters[0]

        master.name = primary_master.name
        logpath = project.get_instancelog(version=primary_master.version)
        for glyph in primary_master.get_glyphs():
            json = get_edges_json(logpath, glyph.name)
            if not json:
                raise web.badrequest(simplejson.dumps({'error': 'could not find any contours for instance in %s for %s' % (logpath, glyph.name)}))

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
        return simplejson.dumps({'versions': get_versions(project.id)})


class EditorUploadZIP(app.page):

    path = '/upload/'

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
        return simplejson.dumps({'project_id': project.id,
                                 'glyphname': project.currentglyph,
                                 'master_id': master.id,
                                 'label': x.label,
                                 'metapolation': label})


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

        master.task_completed = True
        web.ctx.orm.commit()
        return simplejson.dumps({'done': True})


class Specimen(app.page):

    path = '/specimen/(\d+)/'

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

    import subprocess
    subprocess.Popen(["mpost", "-progname=mpost", "-ini", "mf2pt1", "\\dump"],
                     cwd=working_dir())


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
