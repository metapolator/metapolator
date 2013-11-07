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
        master = model.get_master(id)
        if not master:
            return web.notfound()

        working_dir('static')

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


class SettingsRestUpdate(app.page):

    path = '/view/([-.\w\d]+)/(\d+)/settings/rest/update/'

    def POST(self, name, glyphid):
        if not is_loggedin():
            raise seeother('/login')

        master = model.Master.get_by_name(name, session.user)
        if not master:
            return web.notfound()

        x = web.input(update='', idglobal='', idlocal='')

        if x['update'] == 'a':
            model.Master.update(session.user, master.idmaster,
                                idlocalA=x.idlocal)
        if x['update'] == 'b':
            model.Master.update(session.user, master.idmaster,
                                idlocalB=x.idlocal)
        if x['update'] == 'g':
            model.Master.update(session.user, master.idmaster,
                                idglobal=x.idglobal)

        raise seeother('/view/{0}/{1}/settings/'.format(master.FontName, glyphid))


class SettingsRestCreate(app.page):

    path = '/view/([-.\w\d]+)/(\d+)/settings/rest/create/'

    def POST(self, name, glyphid):
        if not is_loggedin():
            raise seeother('/login')

        master = model.Master.get_by_name(name, session.user)
        if not master:
            return web.notfound()

        x = web.input(create='')
        if x['create'] == 'a':
            newid = model.LocalParam.insert(user_id=session.user)
            model.Master.update(session.user, master.idmaster, idlocalA=newid)

        if x['create'] == 'b':
            newid = model.LocalParam.insert(user_id=session.user)
            model.Master.update(session.user, master.idmaster, idlocalB=newid)

        if x['create'] == 'g':
            newid = model.GlobalParam.insert(user_id=session.user)
            model.Master.update(session.user, master.idmaster, idglobal=newid)

        raise seeother('/view/{0}/{1}/settings/'.format(master.FontName, glyphid))


class Settings(app.page):

    path = '/view/([-.\w\d]+)/(\d+)/settings/'

    def GET(self, name, glyphid):
        if not is_loggedin():
            raise seeother('/login')

        master = model.Master.get_by_name(name, session.user)
        if not master:
            return web.notfound()

        globalparamform = GlobalParamForm()
        globalparams = model.get_globalparams()
        try:
            globalparam = model.get_globalparam(master.idglobal)[0]
            globalparamform.fill(globalparam)
        except IndexError:
            pass

        localparamform_a = LocalParamForm()
        localA = model.get_localparam(master.idlocalA)
        d = dict()
        if localA:
            d.update(localA)
        d.update({'ab_source': 'a'})
        localparamform_a.fill(d)

        localparamform_b = LocalParamForm()
        localB = model.get_localparam(master.idlocalB)
        d = dict()
        if localB:
            d.update(localB)
        d.update({'ab_source': 'b'})
        localparamform_b.fill(d)

        localparameters = list(model.get_localparams())

        return render.settings(master, glyphid, localparameters, globalparams, globalparamform, localparamform_a, localparamform_b)

    def POST(self, name, glyphid):
        if not is_loggedin():
            raise seeother('/login')

        master = model.Master.get_by_name(name, session.user)
        if not master:
            return web.notfound()

        form = LocalParamForm()
        if 'ab_source' in form.d and form.validates():
            if form.d.ab_source == 'a':
                idlocal = master.idlocalA
            else:
                idlocal = master.idlocalB
            model.update_localparam(idlocal, form.d.px, form.d.width,
                                    form.d.space, form.d.xheight, form.d.capital,
                                    form.d.boxheight, form.d.ascender, form.d.descender,
                                    form.d.inktrap, form.d.stemcut, form.d.skeleton,
                                    form.d.superness, form.d.over)
            master = model.Master.select_one(session.user, master.idmaster)
            if model.writeGlobalParam(master):
                makefont(working_dir(), master)
            raise seeother('/view/{0}/{1}/settings/'.format(master.FontName, glyphid))

        formg = GlobalParamForm()
        if formg.validates():
            model.update_globalparam(master.idglobal, formg.d.metapolation, formg.d.fontsize,
                                     formg.d.mean, formg.d.cap, formg.d.ascl,
                                     formg.d.des, formg.d.box)
        raise seeother('/view/{0}/{1}/settings/'.format(master.FontName, glyphid))


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
    segments = models.query(models.GlyphOutline.segment.label('number'))
    segments = segments.filter_by(idmaster=master.idmaster, glyphname=glyphid,
                                  fontsource=ab_source.upper())
    segments = segments.group_by(models.GlyphOutline.segment)
    result = {'edges': []}
    contours = []
    x_min = 0
    y_min = 0
    x_max = 0
    y_max = 0
    for segment in segments:
        points = models.GlyphOutline.filter(idmaster=master.idmaster,
                                            segment=segment.number,
                                            fontsource=ab_source.upper(),
                                            glyphname=glyphid)
        _contours = []
        for point in points:
            _contours.append({'x': point.x, 'y': point.y,
                              'controls': [{'x': point.vector_xIn, 'y': point.vector_yIn},
                                           {'x': point.vector_xOut, 'y': point.vector_yOut}]})
            x_min = min(x_min, float(point.x), float(point.vector_xOut), float(point.vector_xIn))
            y_min = min(y_min, float(point.y), float(point.vector_yOut), float(point.vector_yIn))
            x_max = max(x_max, float(point.x), float(point.vector_xOut), float(point.vector_xIn))
            y_max = max(y_max, float(point.y), float(point.vector_yOut), float(point.vector_yIn))
        contours.append(_contours)

    result['edges'].append({'glyph': glyphid, 'contours': contours})
    width = abs(x_max) + abs(x_min)
    height = abs(y_max) + abs(y_min)
    result.update({'width': width, 'height': height, 'total_edges': 1})

    return simplejson.dumps(result)


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

        A_glyphjson = get_edges_json_from_db(master, glyphid, ab_source='A')
        B_glyphjson = get_edges_json_from_db(master, glyphid, ab_source='B')
        M_glyphjson = get_edges_json(u'%s.log' % master.fontname, glyphid)

        localparametersA = models.LocalParam.get(idlocal=master.idlocala)
        localparametersB = models.LocalParam.get(idlocal=master.idlocalb)

        return render.view(master, glyphid, A_glyphjson, B_glyphjson,
                           M_glyphjson, localparametersA, localparametersB)

    def POST(self, name, glyphid):
        if not is_loggedin():
            return web.notfound()

        master = models.Master.get(fontname=name)
        if not master:
            return web.notfound()

        x = web.input(pointid='', source='',
                      x='', y='', xIn='', yIn='', xOut='', yOut='',
                      segment='')

        query = models.GlyphOutline.filter(idmaster=master.idmaster,
                                           segment=x.segment,
                                           fontsource=x.source.upper(),
                                           glyphname=glyphid,
                                           pointnr=x.pointid)
        query.update(dict(x=x.x, y=x.y, vector_xIn=x.xIn, vector_xOut=x.xOut,
                          vector_yIn=x.yIn, vector_yOut=x.yOut))

        writeGlyphlist(master.get_fonts_directory(), glyphid)
        return ''


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
        mmaster = list(model.get_masters())
        fontlist = [f for f in glob.glob(working_dir('fonts') + "/*/*.ufo")]
        fontlist.sort()
        form = FontForm()
        return render.font1(fontlist, form, mmaster, cFont)


class Font(app.page):

    path = '/fonts/(.+)'

    def GET(self, id):
        if not is_loggedin():
            raise seeother('/login')
        mmaster = list(model.get_masters())

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
            master = model.get_master(id)

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
        gml = list(model.get_globalparams())
        return render.globals(gml)

    def POST(self):
        if not is_loggedin():
            raise seeother('/login')
        # create new one and redirect to edit page
        newid = model.GlobalParam.insert(user_id=session.user)
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

                makefont(working_dir(), master)

                glyphjson = get_edges_json(u'%sA.log' % master.FontName)
                for glyph in glyphjson['edges']:
                    for segmentnumber, points in enumerate(glyph['contours']):
                        for point in points:
                            models.GlyphOutline.create(point, master, 'A', glyph['glyph'], segmentnumber)

                glyphjson = get_edges_json(u'%sB.log' % master.FontName)
                for glyph in glyphjson['edges']:
                    for segmentnumber, points in enumerate(glyph['contours']):
                        for point in points:
                            models.GlyphOutline.create(point, master, 'B', glyph['glyph'], segmentnumber)

            except (zipfile.BadZipfile, OSError, IOError):
                if master:
                    fontpath = master.get_fonts_directory()
                    model.Master.delete(where='idmaster=$id', vars={'id': master.id})
                    model.DBGlyphOutline.delete(where='idmaster=$id', vars={'id': master.id})
                    model.GlyphParam.delete(where='idmaster=$id', vars={'id': master.id})
                    shutil.rmtree(fontpath)
            return seeother('/')

        return render.create_project(error='Please fill all fields in form')
