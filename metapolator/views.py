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
import os
import os.path as op
import re
import sys
import web
import zipfile

from web import seeother
from passlib.hash import bcrypt


from config import app, cFont, is_loggedin, session, working_dir, \
    working_url
from forms import FontForm, ParamForm, GroupParamForm, PointForm, \
    GlobalParamForm, RegisterForm, LocalParamAForm, LocalParamBForm
from tools import ufo2mf, writeallxmlfromdb, putFontAllglyphs, \
    writeGlyphlist, makefont, get_json


### Templates
t_globals = {
    'datestr': web.datestr,
    'working_url': working_url,
    'is_loggedin': is_loggedin
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


class View(app.page):

    path = '/view/([0-9]+)'

    def GET(self, id):
        """ View single post """
        if not is_loggedin():
            raise seeother('/login')
        form = PointForm()

        if int(id) > 0:
            post = model.get_post(int(id))
            glyphparam = model.get_glyphparam(int(id))
            groupparam = model.get_groupparam(int(id))
            form.fill(post)
        posts = model.get_posts()
        postspa = model.get_postspa()

        formParam = ParamForm()
        formParamG = GroupParamForm()

        if glyphparam is not None:
            formParam.fill(glyphparam)
        if groupparam is not None:
            formParamG.fill(groupparam)
        mastglobal = model.get_globalparam(cFont.idglobal)
        master = model.get_master(cFont.idmaster) or []
        if master:
            master = [master]
        webglyph = cFont.glyphName

        try:
            fp = open(op.join(working_dir(), u'%s.log' % cFont.fontname))
            content = fp.read()
            fp.close()
            json = get_json(content, cFont.glyphunic)
        except (IOError, OSError):
            json = {}

        return render.view(posts, post, form, formParam, formParamG, master, mastglobal, webglyph, glyphparam, groupparam, cFont, postspa, json)

    def POST(self, id):
        if not is_loggedin():
            raise seeother('/login')
        form = PointForm()

        formParam = ParamForm()
        formParamG = GroupParamForm()
        post = model.get_post(int(id))
        postspa = model.get_postspa()
        if not form.validates():
            posts = model.get_posts()
            master = model.get_master(cFont.idmaster)
            mastglobal = model.get_globalparam(cFont.idglobal)
            webglyph = cFont.glyphName
            return render.view(posts, post, form, formParam, master, mastglobal, webglyph, glyphparam, groupparam, cFont, postspa)

        if form.d.PointName is not None:
            if not formParam.validates():
                return render.view(posts, post, form, formParam, master, mastglobal)
            if model.get_glyphparam(int(id)) is not None:
                model.update_glyphparam(int(id), form.d.PointName, form.d.groupn)
                model.update_glyphparamD(int(id), formParam.d.Param, formParam.d.parmval)
                if model.get_groupparam0(form.d.groupn) is not None:
                    model.update_groupparamD(form.d.groupn, formParamG.d.Group, formParamG.d.groupval)
                else:
                    model.insert_groupparam(form.d.groupn)

            else:
                model.insert_glyphparam(int(id), form.d.PointName)
                model.update_glyphparam(int(id), form.d.PointName, form.d.groupn)
                if model.get_groupparam0(form.d.groupn) is not None:
                    model.update_groupparamD(form.d.groupn, formParamG.d.Group, formParamG.d.groupval)
                else:
                    model.insert_groupparam(form.d.groupn)

            if not formParamG.validates():
                return render.view(posts, post, form, formParam, formParamG, master, mastglobal)
            if model.get_groupparam(int(id)) is not None:
                if form.d.groupn is not None:
                    if model.get_groupparam0(form.d.groupn) is not None:
                        model.update_groupparamD(form.d.groupn, formParamG.d.Group, formParamG.d.groupval)
                    else:
                        model.insert_groupparam(form.d.groupn)

        model.update_post(int(id), form.d.x, form.d.y)
        posts = model.get_posts()
        master = model.get_master(cFont.idmaster)
        mastglobal = model.get_globalparam(cFont.idglobal)
        webglyph = cFont.glyphName
        glyphparam = model.get_glyphparam(int(id))
        groupparam = model.get_groupparam(int(id))
        model.writexml()

        makefont(working_dir(), cFont.fontname, cFont.fontpath)

        master = [master]
        return render.view(posts, post, form, formParam, formParamG, master, mastglobal, webglyph, glyphparam, groupparam, cFont, postspa)


class ViewFont(app.page):

    path = '/viewfont/'

    def GET(self):
        """ View single post """
        if not is_loggedin():
            raise seeother('/login')
        param = cFont.glyphName
        return render.viewfont(param)


class Font1(app.page):

    path = '/font1/(.*)'

    def GET(self, id):
        if not is_loggedin():
            raise seeother('/login')
        mmaster = list(model.get_masters())
        ida = 0
        if id == 'i0':
            cFont.loadoption = 0
            cFont.loadoptionAll = 0
            model.putFont()
            ida = 1
        if id == 'i1':
            cFont.loadoption = 1
            cFont.loadoptionAll = 0
            model.putFont()
            ida = 1
        if id == 'i2':
            cFont.loadoption = 0
            cFont.loadoptionAll = 1
            putFontAllglyphs()
            ida = 1
        if id == 'i3':
            cFont.loadoption = 1
            cFont.loadoptionAll = 1
            putFontAllglyphs()
            ida = 1
        if id == 'e4':
            mfoption = 0
            model.writexml()
            ida = 1
        if id == 'e5':
            mfoption = 1
            alist = list(get_activeglyph())
            writeallxmlfromdb(alist)
            ida = 1
        if id == '20000':
            return render.cproject()

        if ida == 0:
            id = int(id)
            if id > 1000 and id < 10000:
                cFont.glyphName = chr(id - 1001 + 32)
                cFont.glyphunic = str(id - 1001)

            if id > 0 and id < 1000:
                model.get_master(id)

        fontname = cFont.fontname
        fontna = cFont.fontna
        fontnb = cFont.fontnb
        fontlist = [f for f in glob.glob(working_dir('fonts') + "/*/*.ufo")]
        fontlist.sort()
        form = FontForm()
        form.fill({'Name': fontname, 'UFO_A': fontna, 'UFO_B': fontnb})
        return render.font1(fontlist, form, mmaster, cFont)

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


class GlobalParam(app.page):

    path = '/font2/([0-9]+)'

    def GET(self, id):
        if not is_loggedin():
            raise seeother('/login')
        print "getparam", id
        gml = list(model.get_globalparams())
        formg = GlobalParamForm()
        if id > '0':
            gm = list(model.get_globalparam(id))
        else:
            gm = None

        if gm is not None:
            formg.fill({'metapolation': gm[0].metapolation, 'fontsize': gm[0].fontsize,
                        'mean': gm[0].mean, 'cap': gm[0].cap, 'ascl': gm[0].ascl,
                        'des': gm[0].des, 'box': gm[0].box})
        return render.font2(formg, gml, cFont)

    def POST(self, id):
        if not is_loggedin():
            raise seeother('/login')
        print "postparam", id
        gml = list(model.get_globalparams())
        gm = list(model.get_globalparam(id))
        formg = GlobalParamForm()
        if formg.validates:
            model.update_globalparam(id, formg.d.metapolation, formg.d.fontsize, formg.d.mean, formg.d.cap, formg.d.ascl, formg.d.des, formg.d.box)
        if not formg.validates():
            return render.font2(formg, gml, cFont)

        model.writeGlobalParam()

        return render.font2(formg, gml, cFont)


class localParamA(app.page):

    path = '/font3/([0-9]+)'

    def GET(self, id):
        if not is_loggedin():
            raise seeother('/login')
        print "getparam", id
        gml = list(model.get_globalparams())
        formg = GlobalParamForm()
        glo = list(model.get_localparams())
        formlA = LocalParamAForm()
        formlB = LocalParamBForm()

        gm = list(model.get_globalparam(cFont.idglobal))
        formg.fill({'metapolation': gm[0].metapolation, 'fontsize': gm[0].fontsize,
                    'mean': gm[0].mean, 'cap': gm[0].cap, 'ascl': gm[0].ascl,
                    'des': gm[0].des, 'box': gm[0].box})
        idlA = id

        idlB = cFont.idlocalB
        if idlA > '0':
            cFont.idlocalA = id
            gloA = list(model.get_localparam(id))
        else:
            gloA = None
        if idlB > '0':
            gloB = list(model.get_localparam(idlB))
        else:
            gloB = None

        if gloA is not None:
            formlA.fill({'px': gloA[0].px, 'width': gloA[0].width, 'space': gloA[0].space, 'xheight': gloA[0].xheight, 'capital': gloA[0].capital, 'boxheight': gloA[0].boxheight, 'ascender': gloA[0].ascender, 'descender': gloA[0].descender, 'inktrap': gloA[0].inktrap, 'stemcut': gloA[0].stemcut, 'skeleton': gloA[0].skeleton, 'superness': gloA[0].superness, 'over': gloA[0].over})
        if gloB is not None:
            formlB.fill({'px': gloB[0].px, 'width': gloB[0].width, 'space': gloB[0].space, 'xheight': gloB[0].xheight, 'capital': gloB[0].capital, 'boxheight': gloB[0].boxheight, 'ascender': gloB[0].ascender, 'descender': gloB[0].descender, 'inktrap': gloB[0].inktrap, 'stemcut': gloB[0].stemcut, 'skeleton': gloB[0].skeleton, 'superness': gloB[0].superness, 'over': gloB[0].over})

        return render.font3(formg, gml, cFont, glo, formlA, formlB)

    def POST(self, id):
        if not is_loggedin():
            raise seeother('/login')
        gml = list(model.get_globalparams())
        glo = list(model.get_localparams())
        idlB = cFont.idlocalB
        idlA = id
        cFont.idlocalA = id
        gloA = list(model.get_localparam(idlA))
        gloB = list(model.get_localparam(idlB))

        formg = GlobalParamForm()
        formlA = LocalParamAForm()
        formlB = LocalParamBForm()

        formlB.fill({'px': gloB[0].px, 'width': gloA[0].width, 'space': gloB[0].space, 'xheight': gloB[0].xheight, 'capital': gloB[0].capital, 'boxheight': gloB[0].boxheight, 'ascender': gloB[0].ascender, 'descender': gloB[0].descender, 'inktrap': gloB[0].inktrap, 'stemcut': gloB[0].stemcut, 'skeleton': gloB[0].skeleton, 'superness': gloB[0].superness, 'over': gloB[0].over})

        if formlA.validates():
            model.update_localparam(idlA, formlA.d.px, formlA.d.width, formlA.d.space, formlA.d.xheight, formlA.d.capital, formlA.d.boxheight, formlA.d.ascender, formlA.d.descender, formlA.d.inktrap, formlA.d.stemcut, formlA.d.skeleton, formlA.d.superness, formlA.d.over)

        if not formlA.validates():
            return render.font3(formg, gml, cFont, glo, formlA, formlB)

        model.writeGlobalParam()
        return render.font3(formg, gml, cFont, glo, formlA, formlB)


class localParamB(app.page):

    path = '/font4/([0-9]+)'

    def GET(self, id):
        if not is_loggedin():
            raise seeother('/login')
        gml = list(model.get_globalparams())

        formg = GlobalParamForm()
        glo = list(model.get_localparams())
        formlA = LocalParamAForm()
        formlB = LocalParamBForm()
        gm = list(model.get_globalparam(cFont.idglobal))
        formg.fill({'metapolation': gm[0].metapolation, 'fontsize': gm[0].fontsize, 'mean': gm[0].mean, 'cap': gm[0].cap, 'ascl': gm[0].ascl, 'des': gm[0].des, 'box': gm[0].box})
        idlA = cFont.idlocalA
        idlB = id
        if idlA > '0':
            gloA = list(model.get_localparam(idlA))
        else:
            gloA = None
        if idlB > '0':
            gloB = list(model.get_localparam(id))
        else:
            gloB = None

        if gloA is not None:
            formlA.fill({'px': gloA[0].px, 'width': gloA[0].width, 'space': gloA[0].space, 'xheight': gloA[0].xheight, 'capital': gloA[0].capital, 'boxheight': gloA[0].boxheight, 'ascender': gloA[0].ascender, 'descender': gloA[0].descender, 'inktrap': gloA[0].inktrap, 'stemcut': gloA[0].stemcut, 'skeleton': gloA[0].skeleton, 'superness': gloA[0].superness, 'over': gloA[0].over})
        if gloB is not None:
            formlB.fill({'px': gloB[0].px, 'width': gloB[0].width, 'space': gloB[0].space, 'xheight': gloB[0].xheight, 'capital': gloB[0].capital, 'boxheight': gloB[0].boxheight, 'ascender': gloB[0].ascender, 'descender': gloB[0].descender, 'inktrap': gloB[0].inktrap, 'stemcut': gloB[0].stemcut, 'skeleton': gloB[0].skeleton, 'superness': gloB[0].superness, 'over': gloB[0].over})

        return render.font4(formg, gml, cFont, glo, formlA, formlB)

    def POST(self, id):
        if not is_loggedin():
            raise seeother('/login')
        gml = list(model.get_globalparams())
        glo = list(model.get_localparams())
        idlA = cFont.idlocalA
        cFont.idlocalB = id
        idlB = id
        #
        # id argument via the html
        #
        gloB = list(model.get_localparam(id))
        gloA = list(model.get_localparam(idlA))
        formlB = LocalParamBForm()
        formlA = LocalParamAForm()
        formg = GlobalParamForm()

        formlA.fill({'px': gloA[0].px, 'width': gloA[0].width, 'space': gloA[0].space, 'xheight': gloA[0].xheight, 'capital': gloA[0].capital, 'boxheight': gloA[0].boxheight, 'ascender': gloA[0].ascender, 'descender': gloA[0].descender, 'inktrap': gloA[0].inktrap, 'stemcut': gloA[0].stemcut, 'skeleton': gloA[0].skeleton, 'superness': gloA[0].superness, 'over': gloA[0].over})

        if formlB.validates():
            model.update_localparam(idlB, formlB.d.px, formlB.d.width, formlB.d.space, formlB.d.xheight, formlB.d.capital, formlB.d.boxheight, formlB.d.ascender, formlB.d.descender, formlB.d.inktrap, formlB.d.stemcut, formlB.d.skeleton, formlB.d.superness, formlB.d.over)
        if not formlB.validates():
            return render.font4(formg, gml, cFont, glo, formlA, formlB)

        model.writeGlobalParam()

        return render.font4(formg, gml, cFont, glo, formlA, formlB)


class copyproject (app.page):

    path = '/cproject/([0-9]+)'

    def GET(self, id):
        if not is_loggedin():
            raise seeother('/login')
        print "** in cproject copy project ", cFont.idmaster
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

        from distutils.dir_util import copy_tree
        copy_tree(working_dir(user='skel'), working_dir())

        # create static files for users so that he can download his fonts
        working_dir('static')
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
        if 'zipfile' in x and 'name' in x and x.name:
            filename = os.path.join(working_dir(), x.zipfile.filename)

            try:
                with open(filename, 'w') as fp:
                    fp.write(x.zipfile.file.read())
            except (IOError, OSError):
                return render.create_project(error='Could not upload this file to disk')

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
                    FontNameB = FontNameA
                newid = model.Master.insert(idglobal=1, FontName=x.name,
                                            FontNameA=FontNameA,
                                            FontNameB=FontNameB,
                                            user_id=session.user)
                cFont.fontpath = 'fonts/%s' % newid
                cFont.fontna = FontNameA
                cFont.fontnb = FontNameB

                fzip.extractall(working_dir(cFont.fontpath))

                import shutil
                for f in os.listdir(working_dir('commons', user='skel')):
                    filename = working_dir(os.path.join('commons', f),
                                           user='skel')
                    try:
                        if filename == 'font.mf':
                            shutil.copy2(filename, os.path.join(working_dir(cFont.fontpath), x.name) + '.mf')
                        else:
                            shutil.copy2(filename, working_dir(cFont.fontpath))
                    except IOError:
                        print 'unable to copy file', filename, 'to', working_dir(cFont.fontpath)

                makefont(working_dir(), cFont.fontname, cFont.fontpath)
            except (zipfile.BadZipfile, OSError, IOError):
                raise
                # return render.create_project(error='Could not extract file to %s' % working_dir(cFont.fontpath))
            return seeother('/')

        return render.create_project(error='Please fill all fields in form')
