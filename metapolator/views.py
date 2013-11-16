# Metapolator
# Beta 0.1
# (c) 2013 by Simon Egli, Walter Egli, Wei Huang
#
# http: //github.com/metapolator
#
# GPL v3 (http: //www.gnu.org/copyleft/gpl.html).

""" Basic metafont point interface using webpy  """
import glob
import model
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


from config import app, cFont, is_loggedin, session, working_dir, \
    working_url, mf_filename
from forms import FontForm, GlobalParamForm, RegisterForm, LocalParamForm
from tools import writeallxmlfromdb, putFontAllglyphs, \
    makefont, get_json, project_exists, writeGlyphlist


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
        """ Show page """
        raise seeother('/fonts/')
        if not is_loggedin():
            raise seeother('/login')
        posts = model.get_posts()
        master = model.get_masters()
        fontsource = [cFont.fontna, cFont.fontnb, cFont.glyphName]
        webglyph = cFont.glyphName
        return render.metap(posts, master, fontsource, webglyph)


class Regenerate(app.page):

    path = '/regenerate/(\d+)'

    def GET(self, id):
        master = models.Master.get(idmaster=id)
        if not master:
            return web.notfound()

        prepare_environment_directory()

        putFontAllglyphs(master)
        makefont(working_dir(), master)
        raise seeother('/fonts/')


class Metap(app.page):

    path = '/metap/([0-9]+)'

    def GET(self, id):
        """ Show page """
        if not is_loggedin():
            raise seeother('/login')
        posts = model.get_posts()
        master = model.get_masters()

        if id == '0':
            # we are working on font A
            cFont.idwork = id
            fontsource = [cFont.fontna, cFont.glyphName]

        if id == '1':
            # we are working on font B
            cFont.idwork = id
            fontsource = [cFont.fontnb, cFont.glyphName]

        posts = model.get_posts()
        master = model.get_masters()

        webglyph = cFont.glyphName
        return render.metap(posts, master, fontsource, webglyph)


class SettingsRestCreate(app.page):

    path = '/view/([-.\w\d]+)/(\d+)/settings/rest/create/'

    def POST(self, name, glyphid):
        if not is_loggedin():
            raise seeother('/login')

        master = models.Master.get(fontname=name)
        if not master:
            return web.notfound()

        x = web.input(create='')
        if x['create'] == 'a':
            obj = models.LocalParam.create()
            models.Master.update(idmaster=master.idmaster,
                                 values=dict(idlocala=obj.idlocal))

        if x['create'] == 'b':
            obj = models.LocalParam.create()
            models.Master.update(idmaster=master.idmaster,
                                 values=dict(idlocalb=obj.idlocal))

        if x['create'] == 'g':
            obj = models.GlobalParam.create()
            models.Master.update(idmaster=master.idmaster,
                                 values=dict(idglobal=obj.idglobal))

        raise seeother('/view/{0}/{1}/settings/'.format(master.fontname, glyphid))


class Settings(app.page):

    path = '/view/([-.\w\d]+)/(\d+)/settings/'

    @staticmethod
    def get_local_params(idlocal, ab_source):
        """ Return dictionary with local parameters. Each dictionary contains
            `ab_source` key in addition. """
        local = models.LocalParam.get(idlocal=idlocal)
        d = dict(ab_source=ab_source)
        if local:
            d.update(local.as_dict())
            d.update({'idlocal': idlocal})
        return d

    def GET(self, name, glyphid):
        if not is_loggedin():
            raise seeother('/login')

        master = models.Master.get(fontname=name)
        if not master:
            return web.notfound()

        localparameters = models.LocalParam.all()
        globalparams = models.GlobalParam.all()

        globalparamform = GlobalParamForm()

        globalparam = models.GlobalParam.get(idglobal=master.idglobal)
        globalparamform.idglobal.args = [(o.idglobal, o.idglobal) for o in globalparams]
        if globalparam:
            globalparamform.fill(globalparam)

        localparamform_a = LocalParamForm()

        local_params = Settings.get_local_params(master.idlocala, 'a')
        localparamform_a.idlocal.args = [(o.idlocal, o.idlocal) for o in localparameters]
        localparamform_a.fill(local_params)

        localparamform_b = LocalParamForm()

        local_params = Settings.get_local_params(master.idlocalb, 'b')
        localparamform_b.idlocal.args = [(o.idlocal, o.idlocal) for o in localparameters]
        localparamform_b.fill(local_params)

        return render.settings(master, glyphid, localparameters, globalparams,
                               globalparamform, localparamform_a, localparamform_b)

    def POST(self, name, glyphid):
        if not is_loggedin():
            raise seeother('/login')

        master = models.Master.get(fontname=name)
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
            params = models.GlobalParam.get(idglobal=x.idglobal_changed)
            return simplejson.dumps(params.as_dict())

        if 'ab_source' in form.d and form.validates():
            idlocal = form.d.idlocal
            models.Master.update(idmaster=master.idmaster,
                                 values={'idlocal{0}'.format(form.d.ab_source.lower()): idlocal})
            master = models.Master.get(fontname=name)

            values = form.d
            del values['ab_source']
            del values['save']
            del values['idlocal']

            models.LocalParam.update(idlocal=idlocal, values=values)

        formg = GlobalParamForm()
        if formg.validates():
            idglobal = formg.d.idglobal
            models.Master.update(idmaster=master.idmaster,
                                 values={'idglobal': idglobal})
            master = models.Master.get(fontname=name)

            values = formg.d
            del values['idglobal']
            del values['save']

            models.GlobalParam.update(idglobal=idglobal, values=values)

        writeGlyphlist(master, glyphid)
        if model.writeGlobalParam(master):
            makefont(working_dir(), master)
        raise seeother('/view/{0}/{1}/settings/'.format(master.fontname, glyphid))


def get_edges_json(log_filename, glyphid=None):
    result = {'edges': []}
    try:
        fp = open(op.join(working_dir(), log_filename))
        content = fp.read()
        fp.close()
        return get_json(content, glyphid)
    except (IOError, OSError):
        pass
    return result


def get_edges_json_from_db(master, glyphid, ab_source='A'):
    glyph = models.Glyph.get(idmaster=master.idmaster, name=glyphid,
                             fontsource=ab_source)

    points = models.GlyphOutline.filter(idmaster=master.idmaster,
                                        fontsource=ab_source.upper(),
                                        glyphname=glyphid)
    _points = []
    for point in points.order_by(models.GlyphOutline.pointnr.asc()):
        points = models.GlyphOutline.filter(idmaster=master.idmaster,
                                            fontsource=ab_source.upper(),
                                            glyphname=glyphid)
        param = models.GlyphParam.get(idmaster=master.idmaster,
                                      fontsource=ab_source.upper(),
                                      glyphname=glyphid,
                                      pointnr=point.pointnr)
        iszpoint = False
        if re.match('z(\d+)[lr]', param.pointname):
            iszpoint = True
        _points.append({'x': point.x, 'y': point.y, 'pointnr': point.pointnr,
                        'iszpoint': iszpoint})

    return simplejson.dumps({'width': glyph.width, 'points': _points})


class View(app.page):

    path = '/view/([-.\w\d]+)/(\d+)/'

    def GET(self, name, glyphid):
        """ View single post """
        if not is_loggedin():
            raise seeother('/login')

        master = models.Master.get(fontname=name)
        if not master:
            return web.notfound()

        if not models.GlyphOutline.exists(idmaster=master.idmaster,
                                          glyphname=glyphid):
            return web.notfound()

        A_glyphjson = get_edges_json(u'%sA.log' % master.fontname, glyphid)
        B_glyphjson = get_edges_json(u'%sB.log' % master.fontname, glyphid)
        M_glyphjson = get_edges_json(u'%s.log' % master.fontname, glyphid)

        localparametersA = models.LocalParam.get(idlocal=master.idlocala)
        localparametersB = models.LocalParam.get(idlocal=master.idlocalb)
        globalparams = models.GlobalParam.get(idglobal=master.idglobal)

        a_original_glyphjson = get_edges_json_from_db(master, glyphid, 'A')
        b_original_glyphjson = get_edges_json_from_db(master, glyphid, 'B')

        return render.view(master, glyphid, A_glyphjson, B_glyphjson,
                           M_glyphjson, localparametersA, localparametersB,
                           globalparams, origins={'a': a_original_glyphjson,
                                                  'b': b_original_glyphjson})

    def POST(self, name, glyphid):
        if not is_loggedin():
            return web.notfound()

        master = models.Master.get(fontname=name)
        if not master:
            return web.notfound()

        x = web.input(pointnr='', source='', x='', y='')

        query = models.GlyphOutline.filter(idmaster=master.idmaster,
                                           fontsource=x.source.upper(),
                                           glyphname=glyphid,
                                           pointnr=x.pointnr)
        query.update(dict(x=x.x, y=x.y))
        web.ctx.orm.commit()
        writeGlyphlist(master, glyphid)

        glyphA = models.Glyph.get(idmaster=master.idmaster,
                                  fontsource='A', name=glyphid)
        glyphB = models.Glyph.get(idmaster=master.idmaster,
                                  fontsource='A', name=glyphid)
        import xmltomf
        xmltomf.xmltomf1(master, glyphA, glyphB)
        makefont(working_dir(), master)
        M_glyphjson = get_edges_json(u'%s.log' % master.fontname, glyphid)
        if x.source.upper() == 'A':
            glyphjson = get_edges_json(u'%sA.log' % master.fontname, glyphid)
        else:
            glyphjson = get_edges_json(u'%sB.log' % master.fontname, glyphid)
        return simplejson.dumps({'M': M_glyphjson,
                                 'R': glyphjson})


class ViewFont(app.page):

    path = '/viewfont/'

    def GET(self):
        """ View single post """
        if not is_loggedin():
            raise seeother('/login')
        param = cFont.glyphName
        return render.viewfont(param)


class Fonts(app.page):

    path = '/fonts/'

    def GET(self):
        if not is_loggedin():
            raise seeother('/login')
        mmaster = models.Master.all()
        fontlist = [f for f in glob.glob(working_dir('fonts') + "/*/*.ufo")]
        fontlist.sort()
        form = FontForm()
        return render.font1(fontlist, form, mmaster, cFont)


class Font(app.page):

    path = '/fonts/(.+)'

    def GET(self, id):
        if not is_loggedin():
            raise seeother('/login')
        mmaster = models.Master.all()

        fontname = cFont.fontname
        fontna = cFont.fontna
        fontnb = cFont.fontnb

        fontlist = [f for f in glob.glob(working_dir('fonts') + "/*/*.ufo")]
        fontlist.sort()
        form = FontForm()
        form.fill({'Name': fontname, 'UFO_A': fontna, 'UFO_B': fontnb})

        if id == 'i0':
            cFont.loadoption = 0
            cFont.loadoptionAll = 0
            model.putFont()
            return render.font1(fontlist, form, mmaster, cFont)
        if id == 'i1':
            cFont.loadoption = 1
            cFont.loadoptionAll = 0
            model.putFont()
            return render.font1(fontlist, form, mmaster, cFont)
        if id == 'i2':
            cFont.loadoption = 0
            cFont.loadoptionAll = 1
            putFontAllglyphs()
            return render.font1(fontlist, form, mmaster, cFont)
        if id == 'i3':
            cFont.loadoption = 1
            cFont.loadoptionAll = 1
            putFontAllglyphs()
            return render.font1(fontlist, form, mmaster, cFont)
        if id == 'e4':
            mfoption = 0
            model.writexml()
            return render.font1(fontlist, form, mmaster, cFont)
        if id == 'e5':
            mfoption = 1
            alist = list(get_activeglyph())
            writeallxmlfromdb(alist)
            return render.font1(fontlist, form, mmaster, cFont)
        if id == '20000':
            return render.cproject()

        id = int(id)

        if id > 1000 and id < 10000:
            cFont.glyphName = chr(id - 1001 + 32)
            cFont.glyphunic = str(id - 1001)

        master = None
        if id > 0 and id < 1000:
            master = models.Master.get(idmaster=id)

        return render.font1(fontlist, form, mmaster, cFont, master)

    def POST(self, id):
        if not is_loggedin():
            raise seeother('/login')
        mmaster = list(model.get_masters())
        form = FontForm()
        form.fill()
        cFont.fontname = form.d.Name
        cFont.fontna = form.d.UFO_A
        cFont.fontnb = form.d.UFO_B
        #
        fontlist = [f for f in glob.glob(working_dir('fonts') + "/*/*.ufo")]
        fontlist.sort()

        return render.font1(fontlist, form, mmaster, cFont)


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

        gm = list(model.get_globalparam(id))
        if not gm:
            return web.notfound()

        formg = GlobalParamForm()
        formg.fill({'metapolation': gm[0].metapolation, 'fontsize': gm[0].fontsize,
                    'mean': gm[0].mean, 'cap': gm[0].cap, 'ascl': gm[0].ascl,
                    'des': gm[0].des, 'box': gm[0].box})

        gml = list(model.get_globalparams())
        return render.globals(gml, formg)

    def POST(self, id):
        if not is_loggedin():
            raise seeother('/login')

        gm = list(model.get_globalparam(id))
        if not gm:
            return web.notfound()

        formg = GlobalParamForm()
        if formg.validates():
            model.update_globalparam(id, formg.d.metapolation, formg.d.fontsize,
                                     formg.d.mean, formg.d.cap, formg.d.ascl,
                                     formg.d.des, formg.d.box)
            return seeother('/settings/globals/')

        gml = list(model.get_globalparams())
        return render.globals(gml, formg)


class LocalParams(app.page):

    path = '/settings/locals/'

    def GET(self):
        if not is_loggedin():
            raise seeother('/login')

        return render.locals(model.get_localparams())

    def POST(self):
        if not is_loggedin():
            raise seeother('/login')

        newid = model.LocalParam.insert(user_id=session.user)
        raise seeother('/settings/locals/%s' % newid)


class LocalParam(app.page):

    path = '/settings/locals/edit/(.*)'

    def getform(self, localparam):
        form = LocalParamForm()
        form.fill({'px': localparam.px, 'width': localparam.width, 'space': localparam.space,
                   'xheight': localparam.xheight, 'capital': localparam.capital,
                   'boxheight': localparam.boxheight, 'ascender': localparam.ascender,
                   'descender': localparam.descender, 'inktrap': localparam.inktrap,
                   'stemcut': localparam.stemcut, 'skeleton': localparam.skeleton,
                   'superness': localparam.superness, 'over': localparam.over})
        return form

    def GET(self, id):
        if not is_loggedin():
            raise seeother('/login')

        localparam = model.get_localparam(id)
        if not localparam:
            return web.notfound()

        form = self.getform(localparam)

        glo = list(model.get_localparams())
        return render.editlocals(localparam, glo, form)

    def POST(self, id):
        if not is_loggedin():
            raise seeother('/login')

        localparam = model.get_localparam(id)
        if not localparam:
            return web.notfound()

        form = self.getform(localparam)

        if form.validates():
            model.update_localparam(id, form.d.px, form.d.width,
                                    form.d.space, form.d.xheight, form.d.capital,
                                    form.d.boxheight, form.d.ascender, form.d.descender,
                                    form.d.inktrap, form.d.stemcut, form.d.skeleton,
                                    form.d.superness, form.d.over)
            raise seeother('/settings/locals/')

        glo = list(model.get_localparams())
        return render.editlocals(localparam, glo, form)


class copyproject (app.page):

    path = '/cproject/([0-9]+)'

    def GET(self, id):
        if not is_loggedin():
            raise seeother('/login')
        if id == '1001':
            ip = model.copyproject()

        return render.cproject()


class logout(app.page):

    path = '/logout'

    def GET(self):
        if is_loggedin():
            session.kill()
        raise web.seeother('/login')


def authorize(user):
    session.authorized = True
    session.user = user['id']
    return web.seeother("/")


class Login(app.page):
    """ Processes authorization of users with username and password """

    path = '/login'

    def GET(self):
        return render.login(is_loggedin())

    def POST(self):
        name, pwd = web.input().username, web.input().password
        user = model.get_user_by_username(name)
        if not user:
            return render.login(is_loggedin(), True)

        if bcrypt.verify(pwd, user['password']):
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
        user = model.create_user(form.d.username, form.d.password, form.d.email)
        if not user:
            return render.register(form)
        seeother = authorize(user)

        prepare_environment_directory()
        raise seeother


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
        if 'name' in x and models.Master.exists(fontname=x.name):
            return render.create_project(error='Project with this name already exists')

        if 'zipfile' in x and 'name' in x and x.name:
            filename = op.join(working_dir(), x.zipfile.filename)

            try:
                with open(filename, 'w') as fp:
                    fp.write(x.zipfile.file.read())
            except (IOError, OSError):
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
                master = models.Master.create(fontname=x.name)

                fontpath = master.get_fonts_directory()
                fzip.extractall(fontpath)

                shutil.move(op.join(fontpath, FontNameA),
                            op.join(fontpath, '%sA.UFO' % x.name))
                if FontNameB:
                    shutil.move(op.join(fontpath, FontNameB),
                                op.join(fontpath, '%sB.UFO' % x.name))
                    FontNameB = '%sB.UFO' % x.name

                models.Master.update(idmaster=master.idmaster,
                                     values=dict(fontnamea='%sA.UFO' % x.name,
                                                 fontnameb=FontNameB))

                FontNameA = '%sA.UFO' % x.name
                if not FontNameB:
                    FontNameB = '%sB.UFO' % x.name
                for f in os.listdir(working_dir('commons', user='skel')):
                    filename = working_dir(op.join('commons', f),
                                           user='skel')
                    try:
                        if filename.endswith('font.mf'):
                            shutil.copy2(filename, op.join(fontpath, mf_filename(FontNameA)))
                            shutil.copy2(filename, op.join(fontpath, mf_filename(FontNameB)))
                            shutil.copy2(filename, op.join(fontpath, mf_filename(x.name)))
                        else:
                            shutil.copy2(filename, fontpath)
                    except (IOError, OSError):
                        raise

                putFontAllglyphs(master)
                writeGlyphlist(master)
                makefont(working_dir(), master)
            except (zipfile.BadZipfile, OSError, IOError):
                if master:
                    models.Master.delete(idmaster=master.idmaster)
                    models.GlyphOutline.delete(idmaster=master.idmaster)
                    models.GlyphParam.delete(idmaster=master.idmaster)

                    fontpath = master.get_fonts_directory()
                    shutil.rmtree(fontpath)
            return seeother('/fonts/')

        return render.create_project(error='Please fill all fields in form')
