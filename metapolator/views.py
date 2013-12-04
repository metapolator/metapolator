# Metapolator
# Beta 0.1
# (c) 2013 by Simon Egli, Walter Egli, Wei Huang
#
# http: //github.com/metapolator
#
# GPL v3 (http: //www.gnu.org/copyleft/gpl.html).

""" Basic metafont point interface using webpy  """
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

import xmltomf
from config import app, is_loggedin, session, working_dir, \
    working_url, PROJECT_ROOT
from forms import GlobalParamForm, RegisterForm, LocalParamForm, \
    ParamForm, PointParamExtendedForm
from tools import putFontAllglyphs, \
    makefont, get_json, project_exists, writeGlyphlist, ufo2mf, \
    writeGlobalParam, makefont_single


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
    'project_exists': project_exists,
    'webctx': web.ctx,
    'websession': session
}
render = web.template.render('templates', base='base', globals=t_globals)
###  classes


class GlyphPageMixin(object):

    _lftmaster = None
    _rgtmaster = None

    _lftversion = None
    _rgtversion = None

    _project = None

    def get_lft_master(self):
        if not self._lftmaster:
            raise Exception('Class was not initialized')
        return self._lftmaster

    def get_rgt_master(self):
        if not self._rgtmaster:
            raise Exception('Class was not initialized')
        return self._rgtmaster

    def get_lft_version(self):
        if not self._lftversion:
            raise Exception('Class was not initialized')
        return self._lftversion

    def get_rgt_version(self):
        if not self._rgtversion:
            raise Exception('Class was not initialized')
        return self._rgtversion

    def get_project(self):
        if not self._project:
            raise Exception('Class was not initialized')
        return self._project

    def initialize(self, projectname, lft_version, rgt_version):
        try:
            self._lftversion = int(lft_version)
            self._rgtversion = int(rgt_version)
        except TypeError:
            raise web.notfound()

        self._lftmaster = models.Project.get_master(projectname=projectname,
                                                    version=self.get_lft_version())
        if not self._lftmaster:
            raise web.notfound()

        self._rgtmaster = models.Project.get_master(projectname=projectname,
                                                    version=self.get_rgt_version())
        if not self._rgtmaster:
            raise web.notfound()

        self._project = models.Project.get(projectname=projectname)

    def execute_metapost_for_glyph(self, glyph_id):
        writeGlobalParam(self.get_lft_master(), self.get_rgt_master())
        glyphA = models.Glyph.get(master_id=self.get_lft_master().id,
                                  fontsource='A', name=glyph_id)
        glyphB = models.Glyph.get(master_id=self.get_rgt_master().id,
                                  fontsource='B', name=glyph_id)

        xmltomf.xmltomf1(self.get_lft_master(), glyphA, glyphB)
        writeGlyphlist(self.get_lft_master(), glyph_id)
        makefont_single(self.get_lft_master())

    def execute_glyph_metapost(self, glyph):
        writeGlobalParam(glyph.master)
        xmltomf.xmltomf1(glyph.master, glyph)
        writeGlyphlist(glyph.master, glyph.name)
        makefont_single(glyph.master, cell=glyph.fontsource)

    def update_cells(self, glyphid, fontsource):
        self.execute_metapost_for_glyph(glyphid)

        project = self.get_project()

        instancelog = project.get_instancelog(self.get_lft_version())
        M_glyphjson = get_edges_json(instancelog, glyphid)

        if fontsource == 'A':
            glyph = models.Glyph.get(master_id=self.get_lft_master().id,
                                     fontsource='A', name=glyphid)
            instancelog = project.get_instancelog(self.get_lft_version(), 'a')
        else:
            glyph = models.Glyph.get(master_id=self.get_rgt_master().id,
                                     fontsource='B', name=glyphid)
            instancelog = project.get_instancelog(self.get_rgt_version(), 'b')

        self.execute_glyph_metapost(glyph)
        zpoints = get_edges_json_from_db(glyph.master, glyphid,
                                         ab_source=fontsource)

        glyphjson = get_edges_json(instancelog, glyphid)
        return {'M': M_glyphjson, 'R': glyphjson, 'zpoints': zpoints}


def mime_type(filename):
    return mimetypes.guess_type(filename)[0] or 'application/octet-stream'


class SwitchMFParser(app.page):

    path = '^/mfparser-switch/(counterpoints|controlpoints)/$'

    def POST(self, mfparser):
        session.mfparser = mfparser
        raise seeother('/fonts/')


class userstatic(app.page):

    path = '/users/(.*)'

    def GET(self, path):
        # path = re.sub(r'[\.]{2,}+', '', path)
        try:
            file_name = web.ctx.path.split('/')[-1]
            web.header('Content-type', mime_type(file_name))
            abspath = op.join(PROJECT_ROOT, 'users', path)
            return open(abspath, 'rb').read()
        except IOError:
            raise web.notfound()


class Index(app.page):

    path = '/'

    def GET(self):
        raise seeother('/fonts/')


class Regenerate(app.page):

    path = '/regenerate/(\d+)'

    def GET(self, id):
        master = models.Master.get(id=id)
        if not master:
            return web.notfound()

        prepare_environment_directory()
        prepare_master_environment(master)

        for glyph in master.get_glyphs('a'):
            glyphB = models.Glyph.get(name=glyph.name, fontsource='B',
                                      master_id=master.id)
            xmltomf.xmltomf1(master, glyph, glyphB)
        writeGlyphlist(master)
        makefont(working_dir(), master)
        raise seeother('/fonts/')


class SettingsRestCreate(app.page, GlyphPageMixin):

    path = '/view/([-.\w\d]+)/(\d{3,}),(\d{3,})/(\d+)/settings/rest/create/'

    @raise404_notauthorized
    def POST(self, name, version, versionfontb, glyphid):
        self.initialize(name, version, versionfontb)

        x = web.input(create='')
        if x['create'] == 'a':
            obj = models.LocalParam.create()
            master = self.get_lft_master()
            models.Master.update(id=master.id, values=dict(idlocala=obj.id))

        if x['create'] == 'b':
            obj = models.LocalParam.create()
            master = self.get_rgt_master()
            models.Master.update(id=master.id, values=dict(idlocalb=obj.id))

        if x['create'] == 'g':
            obj = models.GlobalParam.create()
            master = self.get_lft_master()
            models.Master.update(id=master.id, values=dict(idglobal=obj.id))

        raise seeother(u'/view/{0}/{1:03d},{2:03d}/{3}/settings/'.format(name, self.get_lft_version(), self.get_rgt_version(), glyphid))


class SavePointParam(app.page, GlyphPageMixin):

    path = '/view/([-.\w\d]+)/(\d{3,}),(\d{3,})/(\d+)/save-param/'

    @raise404_notauthorized
    def POST(self, name, lft_version, rgt_version, glyphid):
        self.initialize(name, lft_version, rgt_version)

        form = PointParamExtendedForm()

        x = web.input(id='')
        if not models.GlyphOutline.exists(id=x['id']):
            return web.notfound()

        glyphoutline = models.GlyphOutline.get(id=x['id'])

        if form.validates():
            values = form.d
            del values['zpoint']
            del values['save']
            glyphoutline.x = float(values['x'])
            glyphoutline.y = float(values['y'])
            web.ctx.orm.commit()

            del values['x']
            del values['y']
            for key in values:
                if values[key] == '':
                    values[key] = None
            models.GlyphParam.update(glyphoutline_id=x['id'], values=values)

        result = self.update_cells(glyphid, glyphoutline.fontsource)
        return simplejson.dumps(result)


class Settings(app.page, GlyphPageMixin):

    path = '/view/([-.\w\d]+)/(\d{3,}),(\d{3,})/(\d+)/settings/'

    @staticmethod
    def get_local_params(idlocal, ab_source):
        """ Return dictionary with local parameters. Each dictionary contains
            `ab_source` key in addition. """
        local = models.LocalParam.get(id=idlocal)
        d = dict(ab_source=ab_source)
        if local:
            d.update(local.as_dict())
            d.update({'idlocal': idlocal})
        return d

    @raise404_notauthorized
    def GET(self, name, version, versionfontb, glyphid):
        self.initialize(name, version, versionfontb)

        localparameters = models.LocalParam.all()
        globalparams = models.GlobalParam.all()

        globalparamform = GlobalParamForm()

        globalparam = models.GlobalParam.get(id=self.get_lft_master().idglobal)
        globalparamform.idglobal.args = [(o.id, o.id) for o in globalparams]
        if globalparam:
            globalparamform.fill(globalparam)

        localparamform_a = LocalParamForm()

        local_params = Settings.get_local_params(self.get_lft_master().idlocala, 'a')
        localparamform_a.idlocal.args = [(o.id, o.id) for o in localparameters]
        localparamform_a.fill(local_params)

        localparamform_b = LocalParamForm()

        local_params = Settings.get_local_params(self.get_rgt_master().idlocalb, 'b')
        localparamform_b.idlocal.args = [(o.id, o.id) for o in localparameters]
        localparamform_b.fill(local_params)

        web.ctx.project = self.get_project()
        return render.settings(self.get_lft_master(), self.get_rgt_master(),
                               glyphid, localparameters, globalparams,
                               globalparamform, localparamform_a, localparamform_b)

    @raise404_notauthorized
    def POST(self, name, version, versionfontb, glyphid):
        self.initialize(name, version, versionfontb)

        x = web.input(idlocal_changed=False, idglobal_changed=False,
                      ab_source='a')

        form = LocalParamForm()
        if x.idlocal_changed:
            # if dropdown value in form has been changed so just refresh
            # data in selected form
            attrs = Settings.get_local_params(x.idlocal_changed, x.ab_source)
            return simplejson.dumps(attrs)
        elif x.idglobal_changed:
            params = models.GlobalParam.get(id=x.idglobal_changed)
            return simplejson.dumps(params.as_dict())

        if 'ab_source' in form.d and form.validates():
            idlocal = form.d.idlocal
            fontsource = form.d.ab_source

            if fontsource.upper() == 'B':
                models.Master.update(id=self.get_rgt_master().id,
                                     values={'idlocalb': idlocal})
            else:
                models.Master.update(id=self.get_lft_master().id,
                                     values={'idlocala': idlocal})
            values = form.d
            del values['ab_source']
            del values['save']
            del values['idlocal']

            models.LocalParam.update(id=idlocal, values=values)

        formg = GlobalParamForm()
        if formg.validates():
            idglobal = formg.d.idglobal
            models.Master.update(id=self.get_lft_master().id,
                                 values={'idglobal': idglobal})

            values = formg.d
            del values['idglobal']
            del values['save']

            models.GlobalParam.update(id=idglobal, values=values)

        self.execute_metapost_for_glyph(glyphid)

        glyphA = models.Glyph.get(master_id=self.get_lft_master().id,
                                  fontsource='A', name=glyphid)
        self.execute_glyph_metapost(glyphA)

        glyphB = models.Glyph.get(master_id=self.get_rgt_master().id,
                                  fontsource='B', name=glyphid)
        self.execute_glyph_metapost(glyphB)

        raise seeother('/view/{0}/{1:03d},{2:03d}/{3}/settings/'.format(name, self.get_lft_version(), self.get_rgt_version(), glyphid))


def get_edges_json(log_filename, glyphid=None):
    result = {'edges': []}
    try:
        fp = open(log_filename)
        content = fp.read()
        fp.close()
        return get_json(content, glyphid)
    except (IOError, OSError):
        pass
    return result


def get_edges_json_from_db(master, glyphid, ab_source='A'):
    glyph = models.Glyph.get(master_id=master.id, name=glyphid,
                             fontsource=ab_source)

    points = models.GlyphOutline.filter(glyph_id=glyph.id)
    if ab_source.upper() == 'A':
        localparam = models.LocalParam.get(id=master.idlocala)
    else:
        localparam = models.LocalParam.get(id=master.idlocalb)

    _points = []
    for point in points.order_by(models.GlyphOutline.pointnr.asc()):
        param = models.GlyphParam.get(glyphoutline_id=point.id)
        iszpoint = False
        if re.match('z(\d+)[lr]', param.pointname):
            iszpoint = True

        x = point.x
        if localparam:
            x += localparam.px
        _points.append({'x': x, 'y': point.y, 'pointnr': point.pointnr,
                        'iszpoint': iszpoint, 'data': param.as_dict()})

    return {'width': glyph.width, 'points': _points}


class ViewVersion(app.page, GlyphPageMixin):

    path = '/view/([-.\w\d]+)/(\d{3,}),(\d{3,})/(\d+)/'

    @raise404_notauthorized
    def GET(self, name, version, versionfontb, glyphid):
        """ View single post """
        self.initialize(name, version, versionfontb)
        if not models.GlyphOutline.exists(master_id=self.get_lft_master().id,
                                          glyphname=glyphid):
            return web.notfound()

        if not models.GlyphOutline.exists(master_id=self.get_rgt_master().id,
                                          glyphname=glyphid):
            return web.notfound()

        localparametersA = models.LocalParam.get(id=self.get_lft_master().idlocala)
        localparametersB = models.LocalParam.get(id=self.get_rgt_master().idlocalb)
        globalparams = models.GlobalParam.get(id=self.get_lft_master().idglobal)

        pointform = ParamForm()

        masters = models.Master.filter(project_id=self.get_project().id)
        web.ctx.project = self.get_project()
        web.ctx.pointparam_extended_form = PointParamExtendedForm()

        return render.view(self.get_lft_master(), self.get_rgt_master(),
                           masters, glyphid, localparametersA,
                           localparametersB, globalparams, pointform)

    @raise404_notauthorized
    def POST(self, name, version, versionfontb, glyphid):
        self.initialize(name, version, versionfontb)
        if not models.GlyphOutline.exists(master_id=self.get_lft_master().id,
                                          glyphname=glyphid):
            return web.notfound()

        if not models.GlyphOutline.exists(master_id=self.get_rgt_master().id,
                                          glyphname=glyphid):
            return web.notfound()

        self.execute_metapost_for_glyph(glyphid)

        glyphA = models.Glyph.get(master_id=self.get_lft_master().id,
                                  fontsource='A', name=glyphid)
        self.execute_glyph_metapost(glyphA)

        glyphB = models.Glyph.get(master_id=self.get_rgt_master().id,
                                  fontsource='B', name=glyphid)
        self.execute_glyph_metapost(glyphB)

        project = self.get_project()

        instancelog = project.get_instancelog(self.get_lft_master().version, 'a')
        A_glyphjson = get_edges_json(instancelog, glyphid)

        instancelog = project.get_instancelog(self.get_rgt_master().version, 'b')
        B_glyphjson = get_edges_json(instancelog, glyphid)

        instancelog = project.get_instancelog(self.get_lft_master().version)
        M_glyphjson = get_edges_json(instancelog, glyphid)

        a_original_glyphjson = get_edges_json_from_db(self.get_lft_master(), glyphid, 'A')
        b_original_glyphjson = get_edges_json_from_db(self.get_rgt_master(), glyphid, 'B')

        return simplejson.dumps({'zpoints': {'A': a_original_glyphjson,
                                             'B': b_original_glyphjson},
                                 'glyphs': {'M': M_glyphjson,
                                            'A': A_glyphjson,
                                            'B': B_glyphjson}})


class SavePoint(app.page, GlyphPageMixin):

    path = '/view/([-.\w\d]+)/(\d{3,}),(\d{3,})/(\d+)/save-point/'

    @raise404_notauthorized
    def POST(self, name, version, versionfontb, glyphid):
        self.initialize(name, version, versionfontb)

        x = web.input(id='', x='', y='')
        if not models.GlyphOutline.exists(id=x.id):
            return web.notfound()

        glyphoutline = models.GlyphOutline.get(id=x.id)
        glyphoutline.x = x.x
        glyphoutline.y = x.y
        web.ctx.orm.commit()

        result = self.update_cells(glyphid, glyphoutline.fontsource)
        return simplejson.dumps(result)


class View(app.page):

    path = '/view/([-.\w\d]+)/(\d+)/'

    @raise404_notauthorized
    def GET(self, name, glyphid):
        """ View single post """
        master = models.Project.get_master(projectname=name)
        if not master:
            return web.notfound()

        if not models.GlyphOutline.exists(master_id=master.id,
                                          glyphname=glyphid):
            return web.notfound()

        return web.seeother('/view/{0}/{1:03d},{1:03d}/{2}/'.format(name, master.version,
                                                                    glyphid))


class CreateMasterVersion(app.page, GlyphPageMixin):

    path = '/view/([-.\w\d]+)/(\d{3,}),(\d{3,})/create/'

    def create_glyphpoint(self, glyph, pointnr, pointname, startp, point):
        kwargs = dict(glyph_id=glyph.id, master_id=glyph.master_id,
                      glyphname=glyph.name, fontsource=glyph.fontsource,
                      pointnr=pointnr, x=int(float(point['x'])),
                      y=int(float(point['y'])))
        glyphoutline = models.GlyphOutline.create(**kwargs)

        kwargs = dict(glyphoutline_id=glyphoutline.id, glyph_id=glyph.id,
                      fontsource=glyph.fontsource, master_id=glyph.master_id,
                      pointname=pointname, startp=startp)
        models.GlyphParam.create(**kwargs)

    @raise404_notauthorized
    def GET(self, projectname, version, versionfontb):
        self.initialize(projectname, version, versionfontb)

        project = self.get_project()
        version = models.Master.max(models.Master.version,
                                    project_id=project.id)

        master = models.Master.create(project_id=project.id,
                                      version=(version + 1))
        prepare_master_environment(master)

        writeGlobalParam(self.get_lft_master())
        execute_metapost_for_all_glyphs(self.get_lft_master(),
                                        self.get_rgt_master())

        logpath = project.get_instancelog(version=self.get_lft_master().version)
        for glyph in self.get_lft_master().get_glyphs('a'):
            json = get_edges_json(logpath, glyph.name)
            if not json['edges']:
                continue

            newglypha = models.Glyph.create(master_id=master.id, fontsource='A',
                                            name=glyph.name, width=glyph.width,
                                            unicode=glyph.unicode)
            newglyphb = models.Glyph.create(master_id=master.id, fontsource='B',
                                            name=glyph.name, width=glyph.width,
                                            unicode=glyph.unicode)

            zpoints = glyph.get_zpoints()

            i = 0
            for contourpoints in json['edges'][0]['contours']:
                for point in contourpoints:
                    self.create_glyphpoint(newglypha, (i + 1),
                                           zpoints[i].pointname,
                                           zpoints[i].startp, point)
                    self.create_glyphpoint(newglyphb, (i + 1),
                                           zpoints[i].pointname,
                                           zpoints[i].startp, point)
                    i += 1

        self.get_lft_master().idlocala = None
        self.get_lft_master().idlocalb = None
        self.get_lft_master().idglobal = None

        self.get_rgt_master().idlocala = None
        self.get_rgt_master().idlocalb = None
        self.get_rgt_master().idglobal = None
        web.ctx.orm.commit()

        execute_metapost_for_all_glyphs(master)

        writeGlobalParam(self.get_lft_master())
        execute_metapost_for_all_glyphs(self.get_lft_master())

        writeGlobalParam(self.get_rgt_master())
        execute_metapost_for_all_glyphs(self.get_rgt_master())

        return web.seeother('/fonts/{0}/'.format(master.id))


def execute_metapost_for_all_glyphs(master, rgt_master=None):
    import time

    starttime = time.time()
    for glyph in master.get_glyphs('a'):
        glyphB = models.Glyph.get(master_id=(rgt_master and rgt_master or master).id, fontsource='B',
                                  name=glyph.name)
        xmltomf.xmltomf1(master, glyph, glyphB)
    writeGlyphlist(master)
    makefont(working_dir(), master)
    print '== makefont.sh complete === %s: %s' % (master.version,
                                                  time.time() - starttime)


class Specimen(app.page):

    path = '/specimen/([-.\w\d]+)/'

    @raise404_notauthorized
    def GET(self, projectname):
        """ View single post """
        project = models.Project.get(projectname=projectname)
        instances = models.Master.filter(project_id=project.id)
        instances = instances.order_by(models.Master.version.desc())

        for master in instances:
            writeGlobalParam(master)
            execute_metapost_for_all_glyphs(master)

        web.ctx.project = project
        return render.specimen(project, instances)


class Fonts(app.page):

    path = '/fonts/'

    @raise404_notauthorized
    def GET(self):
        projects = models.Master.all()
        return render.font1(projects)


class Font(app.page):

    path = '/fonts/(.+)'

    @raise404_notauthorized
    def GET(self, id):
        projects = models.Master.all()

        master = models.Master.get(id=id)
        web.ctx.project = master.project
        return render.font1(projects, master)


class GlobalParams(app.page):

    path = '/settings/globals/'

    @raise404_notauthorized
    def GET(self):
        gml = models.GlobalParam.all()
        return render.globals(gml)

    @raise404_notauthorized
    def POST(self):
        # create new one and redirect to edit page
        newid = models.GlobalParam.create()
        raise seeother('/settings/globals/%s' % newid)


class GlobalParam(app.page):

    path = '/settings/globals/([1-9][0-9]{0,})'

    @raise404_notauthorized
    def GET(self, id):
        gm = models.GlobalParam.get(id=id)
        if not gm:
            return web.notfound()

        formg = GlobalParamForm()
        formg.fill(gm.as_dict())

        gml = models.GlobalParam.all()
        return render.globals(gml, formg)

    @raise404_notauthorized
    def POST(self, id):
        gm = models.GlobalParam.get(id=id)
        if not gm:
            return web.notfound()

        formg = GlobalParamForm()
        if formg.validates():
            values = formg.d
            del values['idglobal']
            del values['save']

            models.GlobalParam.update(id=id, values=values)
            return seeother('/settings/globals/')

        gml = models.GlobalParam.all()
        return render.globals(gml, formg)


class LocalParams(app.page):

    path = '/settings/locals/'

    @raise404_notauthorized
    def GET(self):
        localparams = models.LocalParam.all()
        return render.locals(localparams)

    @raise404_notauthorized
    def POST(self):
        localparam = models.LocalParam.create()
        raise seeother('/settings/locals/edit/%s' % localparam.idlocal)


class LocalParam(app.page):

    path = '/settings/locals/edit/(.*)'

    def getform(self, localparam=None):
        form = LocalParamForm()
        if localparam:
            form.fill(localparam.as_dict())
        return form

    @raise404_notauthorized
    def GET(self, id):
        localparam = models.LocalParam.get(id=id)
        if not localparam:
            return web.notfound()

        form = self.getform(localparam)

        glo = models.LocalParam.all()
        return render.editlocals(localparam, glo, form)

    @raise404_notauthorized
    def POST(self, id):
        localparam = models.LocalParam.get(id=id)
        if not localparam:
            return web.notfound()

        form = self.getform()

        if form.validates():
            values = form.d
            del values['ab_source']
            del values['save']
            del values['idlocal']

            models.LocalParam.update(id=id, values=values)
            raise seeother('/settings/locals/')

        glo = models.LocalParam.all()
        return render.editlocals(localparam, glo, form)


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
    writeGlobalParam(master)


class CreateProject(app.page):
    """ User can create project by uploading formed zip files with ufo
        folder inside. Project would be extracted to its working directory. """

    path = '/project/create/'

    @raise404_notauthorized
    def GET(self):
        return render.create_project()

    @raise404_notauthorized
    def POST(self):
        x = web.input(zipfile={})
        if 'name' not in x or not x.name.strip():
            return render.create_project(error='Please define name of new project')

        if 'zipfile' not in x:
            return render.create_project(error='Select archive with UFO to upload')

        try:
            rawzipcontent = x.zipfile.file.read()
            if not rawzipcontent:
                return render.create_project(error='Select archive with UFO to upload')
        except AttributeError:
            return render.create_project(error='Select archive with UFO to upload')

        projectname = x.name.strip()

        if models.Project.exists(projectname=projectname):
            return render.create_project(error='Project with this name already exists')

        project = models.Project.create(projectname=projectname)
        if 'zipfile' in x:
            filename = op.join(project.get_directory(), x.zipfile.filename)

            try:
                with open(filename, 'w') as fp:
                    fp.write(rawzipcontent)
            except (IOError, OSError):
                models.Project.delete(project)  # delete created project
                return render.create_project(error='Could not upload this file to disk')

            prepare_environment_directory()

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
                    return render.create_project(error='Archive does not contain any correct UFO folder')

                FontNameA = ufo_dirs[0]
                try:
                    FontNameB = ufo_dirs[1]
                except IndexError:
                    FontNameB = ''
                master = models.Master.create(project_id=project.id, version=1)

                fontpath = master.get_fonts_directory()

                fzip.extractall(fontpath)

                ufopath = master.get_ufo_path('a')
                shutil.move(op.join(fontpath, FontNameA), ufopath)
                if FontNameB:
                    ufopath = master.get_ufo_path('b')
                    shutil.move(op.join(fontpath, FontNameB), ufopath)
                else:
                    ufopath = master.get_ufo_path('b')
                    shutil.copytree(master.get_ufo_path('a'), ufopath)

                prepare_master_environment(master)

                putFontAllglyphs(master)
                writeGlobalParam(master)
                execute_metapost_for_all_glyphs(master)
            except (zipfile.BadZipfile, OSError, IOError):
                raise
                # if master:
                #     models.GlyphOutline.delete(master_id=master.id)
                #     models.GlyphParam.delete(master_id=master.id)
                #     models.Master.delete(master)

                #     fontpath = master.get_fonts_directory()
                #     shutil.rmtree(fontpath)
            return seeother('/fonts/')

        return render.create_project(error='Please fill all fields in form')
