# Metapolator
# Beta 0.1
# (c) 2013 by Simon Egli, Walter Egli, Wei Huang 
#
# http://github.com/metapolator
#
# GPL v3 (http://www.gnu.org/copyleft/gpl.html). 

""" Basic metafont point interface using webpy  """
import web
import model
import os
import sys
import glob 
### Url mappings

urls = (
    '/', 'Index',
    '/view/(\d+)', 'View',
    '/metap/(\d+)', 'Metap',
    '/viewfont/', 'ViewFont',
    '/font1/(\d+)', 'Font1',
    '/font2/(\d+)', 'GlobalParam',
    '/font3/(\d+)', 'localParamA',
    '/font4/(\d+)', 'localParamB',
    '/cproject/(\d+)', 'copyproject')


### Templates
t_globals = {
    'datestr': web.datestr
}
render = web.template.render('templates', base='base', globals=t_globals)
###  classes



### preset font loading

class cFont:
     fontpath = "fonts/1/"
     fontna = ""
     fontnb = ""
     fontname = ""
     idglobal = 1
     idmaster = 1
     idwork   = '0'
     glyphName =""
     glyphunic = "1"
     metapolation=0.5
     unitwidth=1
     fontsize=10
     mean=0.5
     cap=0.8
     ascl=0.2
     des=0.2
     box=1
     timestamp=0
     idlocalA = 1
     idlocalB = 2
     loadoption = '0'
     mfoption = '0'

class Index:

    def GET (self):
        """ Show page """
        posts = model.get_posts()
        master = model.get_masters()
        fontsource = [cFont.fontna,cFont.fontnb,cFont.glyphName]
	webglyph = cFont.glyphName
        return render.metap(posts,master,fontsource,webglyph)


class Metap:

    def GET (self,id):
        """ Show page """
        posts = model.get_posts()
        master = model.get_masters()

        if id =='0':
#          we are working on font A
           cFont.idwork=id
#
           fontsource = [cFont.fontna,cFont.glyphName]
        if id =='1':
#          we are working on font B
           cFont.idwork=id
#          
           fontsource = [cFont.fontnb,cFont.glyphName]

        posts = model.get_posts()
        master = model.get_masters()

	webglyph = cFont.glyphName
        return render.metap(posts,master,fontsource,webglyph)

class View:
    form = web.form.Form(
        web.form.Textbox('PointNr', web.form.notnull, 
            size=3,
            description="nr"),
        web.form.Textbox('x', web.form.notnull, 
            size=5,
            description="x"), 
        web.form.Textbox('y', web.form.notnull, 
            size=5,
            description="y"),
        web.form.Textbox('PointName',  
            size=5,
            description="name"),
        web.form.Textbox('groupn',  
            size=5,
            description="groupn"),
        web.form.Button('save'), 
        )

# add glyphparameters here:

    formParam = web.form.Form(
        web.form.Dropdown('Param',
            [('select','select'),('startp','startp'),('doubledash','doubledash'),('tripledash','tripledash'),('superleft','superleft'),('superright','superright'),('leftp','leftp'),('rightp','rightp'),('downp','downp'),('upp','upp'),('dir','dir'),('leftp2','leftp2'),('rightp2','rightp2'),('downp2','downp2'),('upp2','upp2'),('dir2','dir2'),('tension','tension'),('tensionand','tensionand'),('cycle','cycle'),('penshifted','penshifted'),('pointshifted','pointshifted'),('angle','angle'),('penwidth','penwidth'),('overx','overx'),('overbase','overbase'),('overcap','overcap'),('overasc','overasc'),('overdesc','overdesc'),('ascpoint','ascpoint'),('descpoint','descpoint'),('stemcutter','stemcutter'),('stemshift','stemshift'),('inktrap_l','inktrap_l'),('inktrap_r','inktrap_r')]), 
        web.form.Textbox('parmval',
            size=15, 
            description="parmval",
            id="parmvaltext"),
        web.form.Button('saveParam'), 
        )
# and the same parameters for groups here:

    formParamG = web.form.Form(
        web.form.Dropdown('Group',
            [('select','select'),('startp','startp'),('doubledash','doubledash'),('tripledash','tripledash'),('superleft','superleft'),('superright','superright'),('leftp','leftp'),('rightp','rightp'),('downp','downp'),('upp','upp'),('dir','dir'),('leftp2','leftp2'),('rightp2','rightp2'),('downp2','downp2'),('upp2','upp2'),('dir2','dir2'),('tension','tension'),('tensionand','tensionand'),('cycle','cycle'),('penshifted','penshifted'),('pointshifted','pointshifted'),('angle','angle'),('penwidth','penwidth'),('overx','overx'),('overbase','overbase'),('overcap','overcap'),('overasc','overasc'),('overdesc','overdesc'),('ascpoint','ascpoint'),('descpoint','descpoint'),('stemcutter','stemcutter'),('stemshift','stemshift'),('inktrap_l','inktrap_l'),('inktrap_r','inktrap_r')]), 
        web.form.Textbox('groupval',
            size=15, 
            description="groupval"),
        web.form.Button('saveGroup'), 
        )

    def GET(self,id):
        """ View single post """
        form=self.form()
        
        if id > '0' : 
           post = model.get_post(int(id))
           glyphparam = model.get_glyphparam(int(id))
           groupparam = model.get_groupparam(int(id))         
           form.fill(post)
        posts = model.get_posts()
        postspa = model.get_postspa()
        formParam = self.formParam()
        formParamG = self.formParamG()
        if glyphparam != None :
           formParam.fill(glyphparam)
        if groupparam != None :
           formParamG.fill(groupparam)
        mastglobal = model.get_globalparam(cFont.idglobal)
        master = model.get_master(cFont.idmaster)
	webglyph = cFont.glyphName
        return render.view(posts,post,form,formParam,formParamG,master,mastglobal,webglyph,glyphparam,groupparam,cFont,postspa)

    def POST(self, id):
        form = View.form()
        formParam = View.formParam()
        formParamG = View.formParamG()
        post = model.get_post(int(id))
        postspa = model.get_postspa()
        formParam = self.formParam()
        if not form.validates() :
            posts = model.get_posts()
            master = model.get_master(cFont.idmaster)
            mastglobal = model.get_globalparam(cFont.idglobal)
	    webglyph = cFont.glyphName
            return render.view(posts, post, form, formParam, master,mastglobal, webglyph,glyphparam,groupparam,cFont,postspa)
        if form.d.PointName != None :
            if not formParam.validates() :
                return render.view(posts, post, form, formParam, master,mastglobal)
            if model.get_glyphparam(int(id)) != None :
                model.update_glyphparam(int(id),form.d.PointName,form.d.groupn)
                model.update_glyphparamD(int(id),formParam.d.Param, formParam.d.parmval)
                if model.get_groupparam0(form.d.groupn) != None: 
                    model.update_groupparamD(form.d.groupn, formParamG.d.Group, formParamG.d.groupval)
                else:
                    model.insert_groupparam( form.d.groupn )
             
            else :
                model.insert_glyphparam(int(id),form.d.PointName )
                model.update_glyphparam(int(id),form.d.PointName,form.d.groupn)
                if model.get_groupparam0(form.d.groupn) != None: 
                    model.update_groupparamD(form.d.groupn, formParamG.d.Group, formParamG.d.groupval)
                else:
                    model.insert_groupparam( form.d.groupn )
           
            if not formParamG.validates() :
                return render.view(posts, post, form, formParam, formParamG, master,mastglobal)
            if model.get_groupparam(int(id)) != None :
                if form.d.groupn != None :
                   if model.get_groupparam0(form.d.groupn) != None: 
                      model.update_groupparamD(form.d.groupn, formParamG.d.Group, formParamG.d.groupval)
                   else:
                     model.insert_groupparam( form.d.groupn )
                
        model.update_post(int(id), form.d.x, form.d.y)
        posts = model.get_posts()
        master = model.get_master(cFont.idmaster)
        mastglobal = model.get_globalparam(cFont.idglobal)
	webglyph = cFont.glyphName
        glyphparam = model.get_glyphparam(int(id))
        groupparam = model.get_groupparam(int(id))

        if cFont.mfoption =='1' :
           model.writeallxmlfromdb()
        else:
           model.writexml()        
        
        model.ufo2mf() 
        os.environ['MFINPUTS'] = cFont.fontpath
#        os.environ['MPINPUTS'] = cFont.fontpath
        model.writeGlyphlist()
        strms = "sh makefont.sh font.mf"
        os.system(strms)
        return render.view(posts, post, form, formParam, formParamG, master, mastglobal,webglyph,glyphparam,groupparam,cFont,postspa)

class ViewFont:
    def GET(self):
        """ View single post """
        param=cFont.glyphName
        return render.viewfont(param)

class Font1:
    form = web.form.Form(
        web.form.Textbox('Name', web.form.notnull, 
            size=30,
            description="name", value=cFont.fontna),
        web.form.Textbox('UFO_A', web.form.notnull, 
            size=20,
            description="fontnameA", value=cFont.fontna),
        web.form.Textbox('UFO_B', web.form.notnull, 
            size=20,
            description="fontnameB", value=cFont.fontnb),
        web.form.Textbox('GLYPH', web.form.notnull, 
            size=5,
            description="glyph", value="c"),
        web.form.Textbox('loadoption', web.form.notnull, 
            size=1,
            description="loadoption", value="0"),
        web.form.Textbox('mfprocess', web.form.notnull, 
            size=1,
            description="mfprocess", value="0"),

        web.form.Button('savefont'),
        )
    def GET(self,id):
        mmaster= list(model.get_masters())
        if int(id) > 0 and int(id) <1000: 
           master= list(model.get_master(id))
        if int(id) > 1000 :
              cFont.glyphName = chr(int(id)-1001+32)
              cFont.glyphunic = str(int(id)-1001)
        fontname =cFont.fontname 
        fontna = cFont.fontna
        fontnb = cFont.fontnb
        loadoption = cFont.loadoption
        fontlist = [f for f in glob.glob("fonts/*/*.ufo")]
        fontlist.sort()
        form=self.form()
        form=Font1.form()
        form.fill({'Name':fontname,'UFO_A':fontna,'UFO_B':fontnb,'GLYPH':cFont.glyphName,'loadoption':cFont.loadoption,'mfprocess':cFont.mfoption})
        return render.font1(fontlist,form,mmaster,cFont)

    def POST (self,id):
        print "post",id
        mmaster= list(model.get_masters())
        form = Font1.form()
        form.fill()
        cFont.fontname = form.d.Name
        cFont.fontna = form.d.UFO_A
        cFont.fontnb = form.d.UFO_B
        if int(id) >1000 :
           form.d.GLYPH=chr(int(id)-1001+32)
           cFont.glyphunic = str(int(id)-1001)
           form.fill()
        cFont.glyphName  = form.d.GLYPH
#
#   switch on off mfoption
#   mfoption = '0' only the xml file of the current character will be written
#   mfoption = '1' all characters stored in DB will be written for the font 
#   process
#
        if form.d.mfprocess == '0' :
           cFont.mfoption = '0'
        if form.d.mfprocess == '1' :
           cFont.mfoption = '1'

        cFont.loadoption = form.d.loadoption

        if int(id) > 0 and int(id) <1000:
           model.update_master(id)
           master= list(model.get_master(id))
#       model.putFont()
        model.putFontAllglyphs()
        fontlist = [f for f in glob.glob("fonts/*/*.ufo")]
        fontlist.sort()

        if cFont.loadoption == '1001':
            return render.cproject() 
        print "loadoption ",cFont.loadoption
        if cFont.loadoption == '2':
            model.writeallxmlfromdb()
            
        return render.font1(fontlist,form,mmaster,cFont)

class GlobalParam:

    formg = web.form.Form( 
        web.form.Textbox('metapolation', web.form.notnull, 
            size=3,
            description="metapolation", value="0.5"),
#         web.form.Textbox('unitwidth', web.form.notnull, 
#             size=3,
#             description="unitwidth", value="1.0"),
        web.form.Textbox('fontsize', web.form.notnull, 
            size=3,
            description="fontsize", value="10"),
        web.form.Textbox('mean', web.form.notnull, 
            size=3,
            description="mean", value="0.5"),
        web.form.Textbox('cap', web.form.notnull, 
            size=3,
            description="cap", value="0.8"),
        web.form.Textbox('ascl', web.form.notnull, 
            size=3,
            description="asc", value="0.2"),
        web.form.Textbox('des', web.form.notnull, 
            size=3,
            description="desc", value="0.2"),
        web.form.Textbox('box', web.form.notnull, 
            size=3,
            description="box", value="1"),
        web.form.Button('saveg'),
        )

    def GET(self,id):
        
        print "getparam",id
        gml = list(model.get_globalparams())
        formg = self.formg()
        if id > '0' :
          gm = list(model.get_globalparam(id))
        else:
          gm = None

        if gm != None:
             formg.fill({'metapolation':gm[0].metapolation,'fontsize':gm[0].fontsize,'mean':gm[0].mean,'cap':gm[0].cap,'ascl':gm[0].ascl,'des':gm[0].des,'box':gm[0].box})
        return render.font2(formg,gml,cFont)

    def POST (self,id):
        print "postparam",id
        gml = list(model.get_globalparams())
        gm = list(model.get_globalparam(id))
        formg = self.formg()
        formg.fill()
        if formg.validates  :
               model.update_globalparam(id, formg.d.metapolation, formg.d.fontsize, formg.d.mean, formg.d.cap, formg.d.ascl, formg.d.des, formg.d.box)
        if not formg.validates() :
               return render.font2(formg,gml,cFont)

        model.writeGlobalParam()

        return render.font2(formg,gml,cFont)
class localParamA:

    formlocA = web.form.Form(
        web.form.Textbox('px', web.form.notnull, 
            size=3,
            description="px", value="1"),
	web.form.Textbox('width', web.form.notnull, 
	    size=3,
            description="width", value="1"),
	web.form.Textbox('space', web.form.notnull, 
	    size=3,
            description="space", value="0"),
        web.form.Textbox('xheight', web.form.notnull, 
            size=3,
            description="xheight", value="10"),
        web.form.Textbox('capital', web.form.notnull, 
            size=3,
            description="capital", value="10"),
        web.form.Textbox('boxheight', web.form.notnull, 
            size=3,
            description="boxheight", value="10"),
        web.form.Textbox('ascender', web.form.notnull, 
            size=3,
            description="ascender", value="10"),
        web.form.Textbox('descender', web.form.notnull, 
            size=3,
            description="descender", value="10"),
        web.form.Textbox('inktrap', web.form.notnull, 
            size=3,
            description="inktrap", value="10"),
        web.form.Textbox('stemcut', web.form.notnull, 
            size=3,
            description="stemcut", value="10"),
        web.form.Textbox('skeleton', web.form.notnull, 
            size=3,
            description="skeleton", value="10"),
        web.form.Textbox('superness', web.form.notnull, 
            size=3,
            description="superness", value="30"),
        web.form.Textbox('over', web.form.notnull, 
            size=3,
            description="over", value="0.05"),
        web.form.Button('saveA'),
        )
    def GET(self,id):
        
        print "getparam",id
        gml = list(model.get_globalparams())
        formg = GlobalParam.formg()
        glo = list(model.get_localparams())
        formlA = self.formlocA()
        formlB = localParamB.formlocB()
        gm = list(model.get_globalparam(cFont.idglobal))
        formg.fill({'metapolation':gm[0].metapolation,'fontsize':gm[0].fontsize,'mean':gm[0].mean,'cap':gm[0].cap,'ascl':gm[0].ascl,'des':gm[0].des,'box':gm[0].box})
        idlA =id 
        
        idlB =cFont.idlocalB
        if idlA > '0' :
          cFont.idlocalA = id
          gloA = list(model.get_localparam(id))
        else:
          gloA = None
        if idlB > '0' :
          gloB = list(model.get_localparam(idlB))
        else:
          gloB = None

        if gloA != None:
           formlA.fill({'px':gloA[0].px,'width':gloA[0].width,'space':gloA[0].space,'xheight':gloA[0].xheight,'capital':gloA[0].capital,'boxheight':gloA[0].boxheight,'ascender':gloA[0].ascender,'descender':gloA[0].descender,'inktrap':gloA[0].inktrap,'stemcut':gloA[0].stemcut,'skeleton':gloA[0].skeleton,'superness':gloA[0].superness,'over':gloA[0].over})
        if gloB != None:
           formlB.fill({'px':gloB[0].px,'width':gloB[0].width,'space':gloB[0].space,'xheight':gloB[0].xheight,'capital':gloB[0].capital,'boxheight':gloB[0].boxheight,'ascender':gloB[0].ascender,'descender':gloB[0].descender,'inktrap':gloB[0].inktrap,'stemcut':gloB[0].stemcut,'skeleton':gloB[0].skeleton,'superness':gloB[0].superness,'over':gloB[0].over})

        return render.font3(formg,gml,cFont,glo,formlA,formlB)

    def POST (self,id):
        gml = list(model.get_globalparams())
        glo = list(model.get_localparams())
        idlB = cFont.idlocalB 
        idlA = id
        cFont.idlocalA=id 
        gloA = list(model.get_localparam(idlA))
        gloB = list(model.get_localparam(idlB))
        formg = GlobalParam.formg()
        formlA = self.formlocA() 
        formlB = localParamB.formlocB() 
        formlA.fill()

        formlB.fill({'px':gloB[0].px,'width':gloA[0].width,'space':gloB[0].space,'xheight':gloB[0].xheight,'capital':gloB[0].capital,'boxheight':gloB[0].boxheight,'ascender':gloB[0].ascender,'descender':gloB[0].descender,'inktrap':gloB[0].inktrap,'stemcut':gloB[0].stemcut,'skeleton':gloB[0].skeleton,'superness':gloB[0].superness,'over':gloB[0].over})

        if formlA.validates() :
               model.update_localparam(idlA,formlA.d.px,formlA.d.width,formlA.d.space,formlA.d.xheight,formlA.d.capital,formlA.d.boxheight,formlA.d.ascender,formlA.d.descender,formlA.d.inktrap,formlA.d.stemcut,formlA.d.skeleton,formlA.d.superness,formlA.d.over)

        if not formlA.validates() :
               return render.font3(formg,gml,cFont,glo,formlA,formlB)

        model.writeGlobalParam()
        return render.font3(formg,gml,cFont,glo,formlA,formlB)


class localParamB:

    formlocB = web.form.Form(
        web.form.Textbox('px', web.form.notnull, 
            size=3,
            description="px", value="1"),
	web.form.Textbox('width', web.form.notnull, 
            size=3,
            description="width", value="1"),
	web.form.Textbox('space', web.form.notnull, 
            size=3,
            description="space", value="0"),
        web.form.Textbox('xheight', web.form.notnull, 
            size=3,
            description="xheight", value="10"),
        web.form.Textbox('capital', web.form.notnull, 
            size=3,
            description="capital", value="10"),
        web.form.Textbox('boxheight', web.form.notnull, 
            size=3,
            description="boxheight", value="10"),
        web.form.Textbox('ascender', web.form.notnull, 
            size=3,
            description="ascender", value="10"),
        web.form.Textbox('descender', web.form.notnull, 
            size=3,
            description="descender", value="10"),
        web.form.Textbox('inktrap', web.form.notnull, 
            size=3,
            description="inktrap", value="10"),
        web.form.Textbox('stemcut', web.form.notnull, 
            size=3,
            description="stemcut", value="10"),
        web.form.Textbox('skeleton', web.form.notnull, 
            size=3,
            description="skeleton", value="10"),
        web.form.Textbox('superness', web.form.notnull, 
            size=3,
            description="superness", value="20"),
        web.form.Textbox('over', web.form.notnull, 
            size=3,
            description="over", value="0.05"),
        web.form.Button('saveB'),
        )
    def GET(self,id):
        
        gml = list(model.get_globalparams())
        formg = GlobalParam.formg()
        glo = list(model.get_localparams())
        formlA = localParamA.formlocA()
        formlB = self.formlocB()
        gm = list(model.get_globalparam(cFont.idglobal))
        formg.fill({'metapolation':gm[0].metapolation,'fontsize':gm[0].fontsize,'mean':gm[0].mean,'cap':gm[0].cap,'ascl':gm[0].ascl,'des':gm[0].des,'box':gm[0].box})
        idlA = cFont.idlocalA  
        idlB =id 
        if idlA > '0' :
          gloA = list(model.get_localparam(idlA))
        else:
          gloA = None
        if idlB > '0' :
          gloB = list(model.get_localparam(id))
        else:
          gloB = None

        if gloA != None:
           formlA.fill({'px':gloA[0].px,'width':gloA[0].width,'space':gloA[0].space,'xheight':gloA[0].xheight,'capital':gloA[0].capital,'boxheight':gloA[0].boxheight,'ascender':gloA[0].ascender,'descender':gloA[0].descender,'inktrap':gloA[0].inktrap,'stemcut':gloA[0].stemcut,'skeleton':gloA[0].skeleton,'superness':gloA[0].superness,'over':gloA[0].over})
        if gloB != None:
           formlB.fill({'px':gloB[0].px,'width':gloB[0].width,'space':gloB[0].space,'xheight':gloB[0].xheight,'capital':gloB[0].capital,'boxheight':gloB[0].boxheight,'ascender':gloB[0].ascender,'descender':gloB[0].descender,'inktrap':gloB[0].inktrap,'stemcut':gloB[0].stemcut,'skeleton':gloB[0].skeleton,'superness':gloB[0].superness,'over':gloB[0].over})

        return render.font4(formg,gml,cFont,glo,formlA,formlB)

    def POST (self,id):
        gml = list(model.get_globalparams())
        glo = list(model.get_localparams())
        idlA = cFont.idlocalA 
        cFont.idlocalB = id
        idlB =id 
#                id argument via the html
#
        gloB = list(model.get_localparam(id))
        gloA = list(model.get_localparam(idlA))
        formlB = self.formlocB()
        formlA = localParamA.formlocA()
        formg = GlobalParam.formg()
        formlB.fill()

        formlA.fill({'px':gloA[0].px,'width':gloA[0].width,'space':gloA[0].space,'xheight':gloA[0].xheight,'capital':gloA[0].capital,'boxheight':gloA[0].boxheight,'ascender':gloA[0].ascender,'descender':gloA[0].descender,'inktrap':gloA[0].inktrap,'stemcut':gloA[0].stemcut,'skeleton':gloA[0].skeleton,'superness':gloA[0].superness,'over':gloA[0].over})

        if formlB.validates() :
              model.update_localparam(idlB,formlB.d.px,formlB.d.width,formlB.d.space,formlB.d.xheight,formlB.d.capital,formlB.d.boxheight,formlB.d.ascender,formlB.d.descender,formlB.d.inktrap,formlB.d.stemcut,formlB.d.skeleton,formlB.d.superness,formlB.d.over)
        if not formlB.validates() :
               return render.font4(formg,gml,cFont,glo,formlA,formlB)

        model.writeGlobalParam()

        return render.font4(formg,gml,cFont,glo,formlA,formlB)

class copyproject:

   def GET (self,id):
       print "** in cproject copy project ",cFont.idmaster
       if id == '1001' :
          ip=model.copyproject()
       cFont.loadoption='0'
       return render.cproject()
   

app = web.application(urls, globals())

if __name__ == '__main__':
    app.run()

application = None
if os.environ.get('PRODUCTION', False):
    application = app.wsgifunc()


