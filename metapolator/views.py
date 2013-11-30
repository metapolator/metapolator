# Metapolator
# Beta 0.1
# (c) 2013 by Simon Egli, Walter Egli, Wei Huang
#
# http: //github.com/metapolator
#
# GPL v3 (http: //www.gnu.org/copyleft/gpl.html).

""" Basic metafont point interface using webpy  """
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
    working_url
from forms import GlobalParamForm, RegisterForm, LocalParamForm, \
    ParamForm
from tools import putFontAllglyphs, \
    makefont, get_json, project_exists, writeGlyphlist, ufo2mf, \
    writeGlobalParam


### Templates
t_globals = {
    'datestr': web.datestr,
    'working_url': working_url,
    'is_loggedin': is_loggedin,
    'project_exists': project_exists
}
render = web.template.render('templates', base='base', globals=t_globals)
###  classes


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

        # putFontAllglyphs(master)
        for glyph in master.get_glyphs('a'):
            xmltomf.xmltomf1(master, glyph)
        writeGlyphlist(master)
        makefont(working_dir(), master, 'A')

        for glyph in master.get_glyphs('b'):
            xmltomf.xmltomf1(master, glyph)
        writeGlyphlist(master)
        makefont(working_dir(), master, 'B')

        for glyph in master.get_glyphs('a'):
            glyphB = models.Glyph.get(name=glyph.name, fontsource='B',
                                      master_id=master.id)
            xmltomf.xmltomf1(master, glyph, glyphB)
        writeGlyphlist(master)
        makefont(working_dir(), master, 'M')
        raise seeother('/fonts/')


class SettingsRestCreate(app.page):

    path = '/view/([-.\w\d]+)/(\d{3,})/(\d+)/settings/rest/create/'

    def POST(self, name, version, glyphid):
        if not is_loggedin():
            raise seeother('/login')

        try:
            version = int(version)
        except TypeError:
            return web.notfound()

        master = models.Project.get_master(projectname=name, version=version)
        if not master:
            return web.notfound()

        x = web.input(create='')
        if x['create'] == 'a':
            obj = models.LocalParam.create()
            models.Master.update(id=master.id,
                                 values=dict(idlocala=obj.id))

        if x['create'] == 'b':
            obj = models.LocalParam.create()
            models.Master.update(id=master.id,
                                 values=dict(idlocalb=obj.id))

        if x['create'] == 'g':
            obj = models.GlobalParam.create()
            models.Master.update(id=master.id,
                                 values=dict(idglobal=obj.id))

        raise seeother('/view/{0}/{1:03d}/{2}/settings/'.format(name, version, glyphid))


class SavePointParam(app.page):

    path = '/view/([-.\w\d]+)/(\d{3,})/(\d+)/save-point/'

    def POST(self, name, version, glyphid):
        if not is_loggedin():
            raise seeother('/login')

        try:
            version = int(version)
        except TypeError:
            return web.notfound()

        master = models.Project.get_master(projectname=name, version=version)
        if not master:
            return web.notfound()

        x = web.input(name='', value='', id='')
        if not models.GlyphOutline.exists(id=x['id']):
            return web.notfound()

        glyphoutline = models.GlyphOutline.get(id=x['id'])
        value = x['value']
        if value == '':
            value = None
        else:
            value = float(value)
        models.GlyphParam.update(id=x['id'],
                                 values={'%s' % x['name']: value})
        writeGlyphlist(master, glyphid)

        glyphA = models.Glyph.get(master_id=master.id,
                                  fontsource='A', name=glyphid)
        xmltomf.xmltomf1(master, glyphA)
        makefont(working_dir(), master, 'A')

        glyphB = models.Glyph.get(master_id=master.id,
                                  fontsource='B', name=glyphid)
        xmltomf.xmltomf1(master, glyphB or glyphA)
        makefont(working_dir(), master, 'B')

        xmltomf.xmltomf1(master, glyphA, glyphB)
        makefont(working_dir(), master, 'M')

        instancelog = master.project.get_instancelog(master.version)
        M_glyphjson = get_edges_json(instancelog, glyphid)

        if glyphoutline.fontsource == 'A':
            instancelog = master.project.get_instancelog(master.version, 'a')
        else:
            instancelog = master.project.get_instancelog(master.version, 'b')

        glyphjson = get_edges_json(instancelog, glyphid)

        zpoints = get_edges_json_from_db(master, glyphid,
                                         ab_source=glyphoutline.fontsource)
        return simplejson.dumps({'M': M_glyphjson, 'R': glyphjson,
                                 'zpoints': zpoints})


class Settings(app.page):

    path = '/view/([-.\w\d]+)/(\d{3,})/(\d+)/settings/'

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

    def GET(self, name, version, glyphid):
        if not is_loggedin():
            raise seeother('/login')

        try:
            version = int(version)
        except TypeError:
            return web.notfound()

        master = models.Project.get_master(projectname=name, version=version)
        if not master:
            return web.notfound()

        localparameters = models.LocalParam.all()
        globalparams = models.GlobalParam.all()

        globalparamform = GlobalParamForm()

        globalparam = models.GlobalParam.get(id=master.idglobal)
        globalparamform.idglobal.args = [(o.id, o.id) for o in globalparams]
        if globalparam:
            globalparamform.fill(globalparam)

        localparamform_a = LocalParamForm()

        local_params = Settings.get_local_params(master.idlocala, 'a')
        localparamform_a.idlocal.args = [(o.id, o.id) for o in localparameters]
        localparamform_a.fill(local_params)

        localparamform_b = LocalParamForm()

        local_params = Settings.get_local_params(master.idlocalb, 'b')
        localparamform_b.idlocal.args = [(o.id, o.id) for o in localparameters]
        localparamform_b.fill(local_params)

        return render.settings(master, glyphid, localparameters, globalparams,
                               globalparamform, localparamform_a, localparamform_b)

    def POST(self, name, version, glyphid):
        if not is_loggedin():
            raise seeother('/login')

        try:
            version = int(version)
        except TypeError:
            return web.notfound()

        master = models.Project.get_master(projectname=name, version=version)
        if not master:
            return web.notfound()

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
            models.Master.update(id=master.id,
                                 values={'idlocal{0}'.format(fontsource.lower()): idlocal})
            master = models.Project.get_master(projectname=name, version=version)

            values = form.d
            del values['ab_source']
            del values['save']
            del values['idlocal']

            models.LocalParam.update(id=idlocal, values=values)

        formg = GlobalParamForm()
        if formg.validates():
            idglobal = formg.d.idglobal
            models.Master.update(id=master.id, values={'idglobal': idglobal})
            master = models.Project.get_master(projectname=name, version=version)

            values = formg.d
            del values['idglobal']
            del values['save']

            models.GlobalParam.update(id=idglobal, values=values)

        web.ctx.orm.commit()

        writeGlobalParam(master)

        glyphA = models.Glyph.get(master_id=master.id,
                                  fontsource='A', name=glyphid)
        xmltomf.xmltomf1(master, glyphA)
        writeGlyphlist(master, glyphid)
        makefont(working_dir(), master, 'A')

        glyphB = models.Glyph.get(master_id=master.id,
                                  fontsource='B', name=glyphid)
        xmltomf.xmltomf1(master, glyphB or glyphA)
        writeGlyphlist(master, glyphid)
        makefont(working_dir(), master, 'B')

        xmltomf.xmltomf1(master, glyphA, glyphB)
        writeGlyphlist(master, glyphid)
        makefont(working_dir(), master, 'M')
        raise seeother('/view/{0}/{1:03d}/{2}/settings/'.format(name, version, glyphid))


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


class ViewVersion(app.page):

    path = '/view/([-.\w\d]+)/(\d{3,})/(\d+)/'

    def GET(self, name, version, glyphid):
        """ View single post """
        if not is_loggedin():
            raise seeother('/login')

        try:
            version = int(version)
        except TypeError:
            return web.notfound()

        master = models.Project.get_master(projectname=name, version=version)
        if not master:
            return web.notfound()

        if not models.GlyphOutline.exists(master_id=master.id,
                                          glyphname=glyphid):
            return web.notfound()

        instancelog = master.project.get_instancelog(master.version, 'a')
        A_glyphjson = get_edges_json(instancelog, glyphid)

        instancelog = master.project.get_instancelog(master.version, 'b')
        B_glyphjson = get_edges_json(instancelog, glyphid)

        instancelog = master.project.get_instancelog(master.version)
        M_glyphjson = get_edges_json(instancelog, glyphid)

        localparametersA = models.LocalParam.get(id=master.idlocala)
        localparametersB = models.LocalParam.get(id=master.idlocalb)
        globalparams = models.GlobalParam.get(id=master.idglobal)

        a_original_glyphjson = get_edges_json_from_db(master, glyphid, 'A')
        b_original_glyphjson = get_edges_json_from_db(master, glyphid, 'B')

        pointform = ParamForm()

        masters = models.Master.filter(project_id=master.project_id)

        return render.view(master, masters, glyphid, A_glyphjson, B_glyphjson,
                           M_glyphjson, localparametersA, localparametersB,
                           globalparams, pointform,
                           origins={'a': simplejson.dumps(a_original_glyphjson),
                                    'b': simplejson.dumps(b_original_glyphjson)})

    def POST(self, name, version, glyphid):
        if not is_loggedin():
            return web.notfound()

        try:
            version = int(version)
        except TypeError:
            return web.notfound()

        master = models.Project.get_master(projectname=name, version=version)
        if not master:
            return web.notfound()

        if not models.GlyphOutline.exists(master_id=master.id,
                                          glyphname=glyphid):
            return web.notfound()

        x = web.input(id='', x='', y='')

        glyphoutline = models.GlyphOutline.get(id=x.id)
        glyphoutline.x = x.x
        glyphoutline.y = x.y
        web.ctx.orm.commit()

        writeGlyphlist(master, glyphid)

        glyphA = models.Glyph.get(master_id=master.id,
                                  fontsource='A', name=glyphid)
        xmltomf.xmltomf1(master, glyphA)
        makefont(working_dir(), master, 'A')

        glyphB = models.Glyph.get(master_id=master.id,
                                  fontsource='B', name=glyphid)
        xmltomf.xmltomf1(master, glyphB or glyphA)
        makefont(working_dir(), master, 'B')

        xmltomf.xmltomf1(master, glyphA, glyphB)
        makefont(working_dir(), master, 'M')

        instancelog = master.project.get_instancelog(master.version)
        M_glyphjson = get_edges_json(instancelog, glyphid)

        if glyphoutline.fontsource == 'A':
            instancelog = master.project.get_instancelog(master.version, 'a')
        else:
            instancelog = master.project.get_instancelog(master.version, 'b')

        glyphjson = get_edges_json(instancelog, glyphid)
        zpoints = get_edges_json_from_db(master, glyphid,
                                         ab_source=glyphoutline.fontsource)
        return simplejson.dumps({'M': M_glyphjson, 'R': glyphjson,
                                 'zpoints': zpoints})


class View(app.page):

    path = '/view/([-.\w\d]+)/(\d+)/'

    def GET(self, name, glyphid):
        """ View single post """
        if not is_loggedin():
            raise seeother('/login')

        master = models.Project.get_master(projectname=name, version=1)
        if not master:
            return web.notfound()

        if not models.GlyphOutline.exists(master_id=master.id,
                                          glyphname=glyphid):
            return web.notfound()

        return web.seeother('/view/{0}/{1:03d}/{2}/'.format(name, master.version,
                                                            glyphid))


class CreateMasterVersion(app.page):

    path = '/view/([-.\w\d]+)/(\d{3,})/create/'

    def GET(self, projectname, version):
        if not is_loggedin():
            raise seeother('/login')

        try:
            version = int(version)
        except TypeError:
            return web.notfound()

        sourcemaster = models.Project.get_master(projectname=projectname,
                                                 version=version)
        if not sourcemaster:
            return web.notfound()

        version = models.Master.max(models.Master.version,
                                    project_id=sourcemaster.project_id)

        master = models.Master.create(project_id=sourcemaster.project_id,
                                      version=(version + 1))
        prepare_master_environment(master)

        logpath = sourcemaster.project.get_instancelog(version=sourcemaster.version)
        for glyph in sourcemaster.get_glyphs('a'):
            glyphB = models.Glyph.get(master_id=sourcemaster.id, fontsource='B',
                                      name=glyph.name)

            newglypha = models.Glyph.create(master_id=master.id, fontsource='A',
                                            name=glyph.name, width=glyph.width,
                                            unicode=glyph.unicode)
            newglyphb = models.Glyph.create(master_id=master.id, fontsource='B',
                                            name=glyph.name, width=glyph.width,
                                            unicode=glyph.unicode)

            zpoints = glyph.get_zpoints()

            json = get_edges_json(logpath, glyph.name)
            i = 0
            for contourpoints in json['edges'][0]['contours']:
                for point in contourpoints:
                    glyphoutline = models.GlyphOutline.create(glyph_id=newglypha.id,
                                                              master_id=master.id,
                                                              glyphname=newglypha.name,
                                                              fontsource=newglypha.fontsource,
                                                              pointnr=(i + 1),
                                                              x=int(float(point['x'])),
                                                              y=int(float(point['y'])))

                    models.GlyphParam.create(glyphoutline_id=glyphoutline.id,
                                             glyph_id=newglypha.id,
                                             fontsource=newglypha.fontsource,
                                             master_id=newglypha.master_id,
                                             pointname=zpoints[i].pointname,
                                             startp=zpoints[i].startp)

                    glyphoutline = models.GlyphOutline.create(glyph_id=newglyphb.id,
                                                              master_id=master.id,
                                                              glyphname=newglyphb.name,
                                                              fontsource='B',
                                                              pointnr=(i + 1),
                                                              x=int(float(point['x'])),
                                                              y=int(float(point['y'])))
                    models.GlyphParam.create(glyphoutline_id=glyphoutline.id,
                                             glyph_id=newglyphb.id,
                                             fontsource='B',
                                             master_id=newglyphb.master_id,
                                             pointname=zpoints[i].pointname,
                                             startp=zpoints[i].startp)
                    i += 1

        for glyph in master.get_glyphs('a'):
            xmltomf.xmltomf1(master, glyph)
            writeGlyphlist(master)
            makefont(working_dir(), master, 'A')

        for glyph in master.get_glyphs('b'):
            xmltomf.xmltomf1(master, glyph)
            writeGlyphlist(master)
            makefont(working_dir(), master, 'B')

        for glyph in master.get_glyphs('a'):
            glyphB = models.Glyph.get(master_id=master.id, fontsource='B',
                                      name=glyph.name)
            xmltomf.xmltomf1(master, glyph, glyphB)
            writeGlyphlist(master)
            makefont(working_dir(), master, 'M')

        sourcemaster.idlocala = None
        sourcemaster.idlocalb = None
        sourcemaster.idglobal = None
        web.ctx.orm.commit()

        writeGlobalParam(sourcemaster)

        for glyph in sourcemaster.get_glyphs('a'):
            glyph.flushparams()
            xmltomf.xmltomf1(sourcemaster, glyph)
            writeGlyphlist(sourcemaster)
            makefont(working_dir(), sourcemaster, 'A')

        for glyph in sourcemaster.get_glyphs('b'):
            glyph.flushparams()
            xmltomf.xmltomf1(sourcemaster, glyph)
            writeGlyphlist(sourcemaster)
            makefont(working_dir(), sourcemaster, 'B')

        for glyph in sourcemaster.get_glyphs('a'):
            glyphB = models.Glyph.get(master_id=sourcemaster.id, fontsource='B',
                                      name=glyph.name)
            xmltomf.xmltomf1(sourcemaster, glyph, glyphB)
            writeGlyphlist(sourcemaster)
            makefont(working_dir(), sourcemaster, 'M')

        return web.seeother('/fonts/{0}/'.format(master.id))


class ViewFont(app.page):

    path = '/specimen/'

    def GET(self):
        """ View single post """
        if not is_loggedin():
            raise seeother('/login')
        return render.specimen()


class Fonts(app.page):

    path = '/fonts/'

    def GET(self):
        if not is_loggedin():
            raise seeother('/login')
        projects = models.Master.all()
        return render.font1(projects)


class Font(app.page):

    path = '/fonts/(.+)'

    def GET(self, id):
        if not is_loggedin():
            raise seeother('/login')
        projects = models.Master.all()

        master = models.Master.get(id=id)

        return render.font1(projects, master)


class GlobalParams(app.page):

    path = '/settings/globals/'

    def GET(self):
        if not is_loggedin():
            raise seeother('/login')
        gml = models.GlobalParam.all()
        return render.globals(gml)

    def POST(self):
        if not is_loggedin():
            raise seeother('/login')
        # create new one and redirect to edit page
        newid = models.GlobalParam.create()
        raise seeother('/settings/globals/%s' % newid)


class GlobalParam(app.page):

    path = '/settings/globals/([1-9][0-9]{0,})'

    def GET(self, id):
        if not is_loggedin():
            raise seeother('/login')

        gm = models.GlobalParam.get(id=id)
        if not gm:
            return web.notfound()

        formg = GlobalParamForm()
        formg.fill(gm.as_dict())

        gml = models.GlobalParam.all()
        return render.globals(gml, formg)

    def POST(self, id):
        if not is_loggedin():
            raise seeother('/login')

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

    def GET(self):
        if not is_loggedin():
            raise seeother('/login')

        localparams = models.LocalParam.all()
        return render.locals(localparams)

    def POST(self):
        if not is_loggedin():
            raise seeother('/login')

        localparam = models.LocalParam.create()
        raise seeother('/settings/locals/edit/%s' % localparam.idlocal)


class LocalParam(app.page):

    path = '/settings/locals/edit/(.*)'

    def getform(self, localparam=None):
        form = LocalParamForm()
        if localparam:
            form.fill(localparam.as_dict())
        return form

    def GET(self, id):
        if not is_loggedin():
            raise seeother('/login')

        localparam = models.LocalParam.get(id=id)
        if not localparam:
            return web.notfound()

        form = self.getform(localparam)

        glo = models.LocalParam.all()
        return render.editlocals(localparam, glo, form)

    def POST(self, id):
        if not is_loggedin():
            raise seeother('/login')

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

    def GET(self):
        if not is_loggedin():
            raise seeother('/login')
        return render.create_project()

    def POST(self):
        if not is_loggedin():
            raise seeother('/login')

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
                ufo2mf(master)
                writeGlyphlist(master)
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
