# Metapolator
# Beta 0.1
# (c) 2013 by Simon Egli, Walter Egli, Wei Huang
#
# http://github.com/metapolator
#
# GPL v3 (http://www.gnu.org/copyleft/gpl.html).
import datetime
import codecs
import os
import os.path as op
import time
import web
import xmltomf

from lxml import etree
from passlib.hash import bcrypt

from config import cFont, working_dir, session

db = web.database(dbn='mysql', db='blog', user='root', pw='')


def xxmlat(s, dbob, sattr, val, iro):

    if dbob is not None:
        if s.get(sattr):
            del s.attrib[sattr]
        #
        #  this are values with floating point number types
        #
        if val == '':
            #  if a rounding number is set then round the value
            if iro > 0:
                s.attrib[sattr] = str(round(float(dbob), iro))
            else:
                s.attrib[sattr] = str(dbob)
        else:
            #  in this case we will set the fixed value into xml
            s.attrib[sattr] = val
    else:
        #  in this case we look if the attribute is already set in the xml
        #  then we remove it
        if s.get(sattr):
            del s.attrib[sattr]


def xxmrlat(inum, s, sattr):
    cc = s.attrib
    for item in cc:
        if item in sattr:
            val = cc[item]
            update_glyphparamD(inum, item, val)


def delFont(fontName, glyphNamel):
    return None


class Model(object):

    @classmethod
    def db_select(cls, where=None, vars={}, what='*', order=None):
        return db.select(cls.__table__, what=what, where=where,
                         vars=vars, order=order)

    @classmethod
    def db_delete(cls, where=None, vars={}, what='*', order=None):
        return db.delete(cls.__table__, where=where, vars=vars)

    @classmethod
    def db_update(cls, where=None, vars={}, **kwargs):
        return db.update(cls.__table__, where=where, vars=vars,
                         **kwargs)

    @classmethod
    def db_select_first(cls, where=None, vars={}, what='*', order=None):
        try:
            return db.select(cls.__table__, what=what, where=where,
                             vars=vars, order=order)[0]
        except IndexError:
            pass

    @classmethod
    def insert(cls, **kwargs):
        db.insert(cls.__table__, **kwargs)


class GlyphOutline(Model):

    __table__ = 'glyphoutline'

    @classmethod
    def select(cls, user, glyphName, idmaster):
        query = cls.db_select(where=('glyphName=$glyphName'
                                     ' and idmaster=$idmaster'
                                     ' and user_id=$user'),
                              vars=dict(idmaster=idmaster, glyphName=glyphName,
                                        user=user))
        return list(query)

    @classmethod
    def select_vdate(cls, user, glyphName, idmaster):
        return cls.db_select(what='unix_timestamp(max(vdate)) vdate',
                             where=("user_id=$user and glyphName=$glyphName"
                                    " and idmaster=$idmaster"),
                             vars=dict(user=user, glyphName=glyphName,
                                       idmaster=idmaster))

    @classmethod
    def select_pip_only(cls, user, glyphName, idmaster):
        query = cls.db_select(where=("GlyphName=$glyphName"
                                     " and idmaster=$idmaster"
                                     " and user_id=$user"),
                              what="id, pip",
                              vars=dict(user=user, glyphName=glyphName,
                                        idmaster=idmaster))
        return list(query)

    @classmethod
    def select_one_pip(cls, user, id, glyphName, idmaster):
        return cls.db_select_first(what='pip',
                                   where='id=$id'
                                         ' and glyphName=$glyphName'
                                         ' and idmaster=$idmaster'
                                         ' and user_id=$user',
                                   vars=dict(id=id, user=user,
                                             idmaster=idmaster,
                                             glyphName=glyphName))

    @classmethod
    def update(cls, user, id, glyphName, idmaster, **kwargs):
        cls.db_update(where=('id=$id and GlyphName=$glyphName'
                             ' and idmaster=$idmaster"'
                             ' and user_id=$user'),
                      vars=dict(id=id, user=user, glyphName=glyphName,
                                idmaster=idmaster), **kwargs)

    @classmethod
    def delete(cls, user, glyphName, idmaster):
        cls.db_delete(where=('Glyphname=$glyphName and idmaster=$idmaster'
                             ' and user_id=$user'),
                      vars=dict(user=user, glyphName=glyphName,
                                idmaster=idmaster))


class VGlyphOutline(Model):

    __table__ = 'vglyphoutline'

    @classmethod
    def select(cls, user, glyphName, idmaster):
        return cls.db_select(what="id, IFNULL(PointName, '') PointNr, x, y, concat('position: absolute; left: ', 0 + x, 'px; top:', 0 - y, 'px; ', IF (PointName > '', 'color:black;', IF (contrp > 0 , 'z-index:1;color:blue;', 'z-index:0;color:CCFFFF;'))) position",
                             where="glyphName=$glyphName and idmaster=$idmaster and user_id=$user",
                             vars=dict(glyphName=glyphName, idmaster=idmaster,
                                       user=user))

    @classmethod
    def select_one(cls, user, id, glyphName, idmaster):
        return cls.db_select_first(where=('id=$id and glyphName=$glyphName'
                                          ' and idmaster=$idmaster'
                                          ' and user_id=$user'),
                                   vars=dict(id=id, glyphName=glyphName,
                                             idmaster=idmaster, user=user))


class VGlyphOutlines(Model):

    __table__ = 'vglyphoutlines'

    @classmethod
    def select_one(cls, user, id, glyphName, idmaster):
        return cls.db_select_first(where=('id=$id and GlyphName=$glyphName'
                                          ' and idmaster=$idmaster'
                                          ' and user_id=$user'),
                                   vars=dict(id=id, idmaster=idmaster,
                                             glyphName=glyphName, user=user))


class VGLS(Model):

    __table__ = 'vgls'

    @classmethod
    def select(cls, user, glyphName, idmaster):
        # dbstr=db.select('vglyphoutlines',
        #   where='glyphName='+'"'+glyphName+'"' +ids, vars=locals())
        dbstr = cls.db_select(where=('glyphName=$glyphName'
                                     ' and idmaster=$idmaster'
                                     ' and user_id=$user'),
                              vars=dict(user=user, glyphName=glyphName,
                                        idmaster=idmaster),
                              order='length(PointName) asc, PointName asc')
        return list(dbstr)


class VGLGroup(Model):

    __table__ = 'vglgroup'

    @classmethod
    def select_one(cls, user, id, glyphName, idmaster):
        return cls.db_select_first(where=('id=$id and GlyphName=$glyphName'
                                          ' and idmaster=$idmaster'
                                          ' and user_id=$user'),
                                   vars=dict(id=id, user=user,
                                             glyphName=glyphName,
                                             idmaster=idmaster))


class GlyphParam(Model):

    __table__ = 'glyphparam'

    @classmethod
    def select_vdate(cls, user, glyphName, idmaster):
        return list(cls.db_select(what='unix_timestamp(max(vdate)) vdate',
                                  where=("user_id=$user and glyphName=$glyphName"
                                         " and idmaster=$idmaster"),
                                  vars=dict(user=session.user, glyphName=glyphName,
                                            idmaster=idmaster)))

    @classmethod
    def select_one_id(cls, user, glyphName, nameval, idmaster):
        query = db.db_select_first(what='id',
                                   where=('GlyphName=$glyphName'
                                          ' and PointName=$PointName'
                                          ' idmaster=$idmaster'
                                          ' and user_id=$user'),
                                   vars=dict(idmaster=idmaster, PointName=nameval,
                                             user=user, glyphName=glyphName))
        try:
            return query.id
        except AttributeError:
            pass

    @classmethod
    def delete(cls, user, glyphName, idmaster):
        cls.db_delete(where=('glyphName=$glyphName and idmaster=$idmaster'
                             ' and user_id=$user'),
                      vars=dict(user=user, glyphName=glyphName,
                                idmaster=idmaster))

    @classmethod
    def update(cls, user, id, glyphName, idmaster, **kwargs):
        cls.db_update(where='id=$id and glyphName=$glyphName'
                            ' and idmaster=$idmaster and user_id=$user',
                      vars=dict(id=id, user=user, glyphName=glyphName,
                                idmaster=idmaster),
                      **kwargs)


class GroupParam(object):

    __table__ = 'groupparam'

    @classmethod
    def select_one(cls, user, groupname, idmaster):
        return cls.db_select_first(where=('groupname=$groupname'
                                          ' and idmaster=$idmaster'
                                          ' and user_id=$user'),
                                   vars=dict(idmaster=idmaster, user=user,
                                             groupname=groupname))

    @classmethod
    def update(cls, user, groupname, idmaster, **kwargs):
        cls.db_update(where='groupname=$groupname and idmaster=$idmaster'
                            ' and user_id=$user',
                      vars=dict(groupname=groupname, user=user,
                                idmaster=idmaster),
                      **kwargs)


class Master(Model):

    __table__ = 'master'

    @classmethod
    def select_one(cls, user, id):
        return cls.db_select_first(where='idmaster=$id and user_id=$user',
                                   vars=dict(id=id, user=user))

    @classmethod
    def update(cls, user, id, **kwargs):
        cls.db_update(where='user_id=$user and idmaster=$id',
                      vars=dict(user=user, id=id),
                      **kwargs)


class GlobalParam(Model):

    __table__ = 'globalparam'

    @classmethod
    def update(cls, user, id, **kwargs):
        cls.db_update(where='idglobal=$id and user_id=$user',
                      vars={'user': user, 'id': id},
                      **kwargs)


class LocalParam(Model):

    __table__ = 'localparam'

    @classmethod
    def update(cls, user, id, **kwargs):
        cls.db_update(where='idlocal=$id and user_id=$user',
                      vars={'user': user, 'id': id},
                      **kwargs)


def putFontG(glyphName, glyphsource, idmaster):
    #  Read one glyph from xml file with glif extension
    #  and put the data into db
    #  There is a loadoption with values:
    #
    #  loadoption '0' :  read data and put it in db when timestamp
    #                    in xmlfile is newer than db
    #  loadoption '1' :  read only x-y coordinates independent of
    #                    timestamp and use parameters stored in db
    #  loadoption '99':  read data and put it in db independent of timestamp
    #
    paramattr = ['groupname', 'startp', 'doubledash', 'tripledash',
                 'superleft', 'superright', 'leftp', 'rightp', 'downp', 'upp',
                 'dir', 'tension', 'tensionand', 'cycle', 'penshifted',
                 'pointshifted', 'angle', 'penwidth', 'overx', 'overbase',
                 'overcap', 'overasc', 'overdesc', 'ascpoint', 'descpoint',
                 'stemcutter', 'stemshift', 'inktrap_l', 'inktrap_r']

    if idmaster > 0:
        cFont.idwork = '0'
    if idmaster < 0:
        cFont.idwork = '1'

    #
    #  decide when to load new entries from xml file
    #
    dbq = GlyphOutline.select_vdate(session.user, glyphName, idmaster)[0]
    dbqp = GlyphParam.select_vdate(session.user, glyphName, idmaster)[0]
    #
    # check if glyphoutline exists
    #
    if dbq.vdate is None:
        vdatedb = 0
        vdatedbp = 0
    else:
        vdatedb = int(dbq.vdate)
        if dbqp.vdate is None:
            vdatedbp = 0
        else:
            vdatedbp = int(dbqp.vdate)

    idel = 0
    if dbq:
        vdateos = int(op.getmtime(glyphsource))
        if (max(vdatedb, vdatedbp) < vdateos) and cFont.loadoption == '0' \
                or cFont.loadoption == '99':
            GlyphOutline.delete(session.user, glyphName, idmaster)
            GlyphParam.delete(session.user, glyphName, idmaster)
            idel = 1

    # check if list is empty
    glyphs = GlyphOutline.select(session.user, glyphName, idmaster)
    if not glyphs or cFont.loadoption == '1':
        #  put data into db
        inum = 0
        strg = ""
        xmldoc = etree.parse(glyphsource)
        outline = xmldoc.find("outline")
        for itemlist in outline:
            for s in itemlist:
                inum = inum + 1
                # find a named point, convention the name begin
                # with the letter z
                if cFont.loadoption == '0' or idel == 1:
                    idpar = inum
                    if s.get('name'):
                        nameval = s.get('name')
                        GlyphParam.insert(user_id=session.user, id=inum,
                                          GlyphName=glyphName,
                                          idmaster=idmaster,
                                          PointName=nameval)
                        #  find  all parameter and save it in db
                        # add glyphparameters here:
                        xxmrlat(inum, s, paramattr)
                    else:
                        nameval = ""
                        startp = 0
                        idpar = None

                    pointno = "p" + str(inum)

                    if s.get('type'):
                        mainpoint = 1
                    else:
                        mainpoint = 0

                    GlyphOutline.insert(id=inum,
                                        glyphName=glyphName,
                                        PointNr=pointno,
                                        x=s.get('x'),
                                        y=s.get('y'),
                                        contrp=mainpoint,
                                        idmaster=idmaster,
                                        pip=idpar,
                                        user_id=session.user)
                #
                #  load option 1  read from xml files only x,y coordinates
                #  it could be the order of the records has been changed
                #
                if cFont.loadoption == '1' and idel < 1:
                    if s.get('type'):
                        mainpoint = 1
                    else:
                        mainpoint = 0
                    update_postp0(inum, s.get('x'), s.get('y'), str(mainpoint))
                    # in this case we read only the coordinates
                    # from the xml file
                    if s.get('name'):
                        nameval = s.get('name')
                        # get the link pip to the parameter table
                        pip = get_glyphparamid(glyphName, idmaster, nameval)
                        update_postp(inum, s.get('x'), s.get('y'), pip)


def putFont():
    #
    #  create glypsource names
    #  create fontpath
    #  read font A and font B
    #  put font A and font B into DB according the loadoption rule
    #
    idworks = cFont.idwork
    cFont.fontpath = "fonts/" + str(cFont.idmaster) + "/"

    print cFont.glyphName, cFont.glyphunic

    glyphName = cFont.glyphunic
    glyphNameNew = glyphName + ".glif"

    glyphPath = op.join("glyphs", glyphNameNew)

    glyphsourceA = op.join(working_dir(cFont.fontpath), cFont.fontna, glyphPath)
    glyphsourceB = op.join(working_dir(cFont.fontpath), cFont.fontna, glyphPath)

    print glyphNameNew
    print "lastmodifiedA: %s" % time.ctime(op.getmtime(glyphsourceA))
    print "lastmodifiedB: %s" % time.ctime(op.getmtime(glyphsourceB))

    idmaster = cFont.idmaster
    #
    putFontG(glyphName, glyphsourceA, int(idmaster))
    putFontG(glyphName, glyphsourceB, -int(idmaster))

    cFont.idwork = idworks


def putFontAllglyphs():
    #
    #  read all fonts (xml files with glif extension) in unix directory
    #  and put the xml data into db using the rule applied in loadoption
    #  only the fonts (xml file) will be read when the glifs are present in both fonts A and B
    #
    # save the values for restore
    idworks = cFont.idwork
    glyphnames = cFont.glyphName
    glyphunics = cFont.glyphunic

    dirnamea = op.join(working_dir(cFont.fontpath), cFont.fontna, "glyphs")
    dirnameb = op.join(working_dir(cFont.fontpath), cFont.fontnb, "glyphs")

    charlista = [f for f in os.listdir(dirnamea)]
    charlistb = [f for f in os.listdir(dirnameb)]
    for ch1 in charlista:
        if ch1 in charlistb:
            fnb, ext = buildfname(ch1)
            if ext in ["glif"]:
                glyphName = fnb
                cFont.glyphName = glyphName
                cFont.glyphunic = glyphName
                putFont()
    #
    #   save previous values back
    cFont.idwork = idworks
    cFont.glyphName = glyphnames
    cFont.glyphunic = glyphunics


def gidmast(idwork):
    if idwork == '0':
        idmaster = int(cFont.idmaster)
    if idwork == '1':
        idmaster = -int(cFont.idmaster)
    return idmaster


def get_posts():
    idmaster = gidmast(cFont.idwork)
    glyphName = cFont.glyphunic
    return list(VGlyphOutline.select(session.user, glyphName, idmaster))


def get_postspa():
    idmaster = gidmast(cFont.idwork)
    glyphName = cFont.glyphunic
    return VGLS.select(session.user, glyphName, idmaster)


def get_post(id):
    glyphName = cFont.glyphunic
    idmaster = gidmast(cFont.idwork)
    return VGlyphOutline.select_one(session.user, id, glyphName, idmaster)


def get_postspip():
    glyphName = cFont.glyphunic
    idmaster = gidmast(cFont.idwork)
    return GlyphOutline.select_pip_only(session.user, glyphName, idmaster)


def get_glyphparamid(glyphName, idmaster, nameval):
    return GlyphParam.select_one_id(session.user, glyphName, nameval, idmaster)


def get_glyphparam(id):
    glyphName = cFont.glyphunic
    idmaster = gidmast(cFont.idwork)
    return VGlyphOutlines.select_one(session.user, id, glyphName, idmaster)


def get_groupparam(id):
    glyphName = cFont.glyphunic
    idmaster = gidmast(cFont.idwork)
    return VGLGroup.select_one(session.user, id, glyphName, idmaster)


def get_groupparam0(groupname):
    idmaster = gidmast(cFont.idwork)
    return GroupParam.select_one(session.user, groupname, idmaster)


def update_post(id, x, y):
    glyphName = cFont.glyphunic
    idmaster = gidmast(cFont.idwork)
    GlyphOutline.update(session.user, id, glyphName, idmaster, x=x, y=y)


def update_postp0(id, x, y, contr):
    glyphName = cFont.glyphunic
    idmaster = gidmast(cFont.idwork)
    GlyphOutline.update(session.user, id, glyphName, idmaster,
                        x=x, y=y, pip=None, contrp=contr)


def update_postp(id, x, y, idpar):
    glyphName = cFont.glyphunic
    idmaster = gidmast(cFont.idwork)

    if x is None:
        GlyphOutline.update(session.user, id, glyphName, idmaster, pip=idpar)
    else:
        GlyphOutline.update(session.user, id, glyphName, idmaster,
                            x=x, y=y, pip=idpar)


def update_glyphparamD(id, ap, bp):
    # string:syntax update glyphparam set leftp='1' where id=75 and Glyphname='p' and idmaster=1;
    glyphName = cFont.glyphunic
    idmaster = gidmast(cFont.idwork)
    #
    #   get id from glyphoutline
    lli = list(GlyphOutline.select_one_pip(session.user, id,
                                           glyphName, idmaster))
    if not lli:
        idp = id
        update_postp(id, None, None, idp)
    else:
        idp = str(lli.pip)
    print "link id,pip", id, idp

    if ap in ['', 'select']:
        return
    if bp != '':
        bb = bp
        bbstr = str(bb)
        GlyphParam.update(session.user, idp, glyphName, idmaster,
                          **{ap: str(bbstr)})
    else:
        GlyphParam.update(session.user, idp, glyphName, idmaster, **{ap: None})


def update_glyphparam(id, a, b):
    glyphName = cFont.glyphunic
    idmaster = gidmast(cFont.idwork)
    #
    #   get id from glyphoutline
    lli = list(GlyphOutline.select_one_pip(session.user, id,
                                           glyphName, idmaster))
    if not lli:
        return

    idp = str(lli.pip)
    print "link id,pip", id, idp
#
    if a == '':
        GlyphParam.update(session.user, idp, glyphName, idmaster,
                          pointName=None, groupname=None)
        return
    
    aa = a
    if b != '':
        bb = b
        GlyphParam.update(session.user, idp, glyphName, idmaster,
                          pointName=aa, groupname=bb)
    else:
        GlyphParam.update(session.user, idp, glyphName, idmaster,
                          pointName=aa, groupname=None)


def update_glyphparamName(id, a):
    glyphName = cFont.glyphunic
    idmaster = gidmast(cFont.idwork)
    #
    #   get id from glyphoutline

    lli = list(GlyphOutline.select_one_pip(session.user, id,
                                           glyphName, idmaster))
    if not lli:
        return

    idp = str(lli.pip)
    print "link id, pip", id, idp

    if a != '':
        aa = a
        GlyphParam.update(session.user, idp, glyphName, idmaster,
                          pointName=aa)
    else:
        GlyphParam.update(session.user, idp, glyphName, idmaster,
                          pointName=None)


def insert_glyphparam(idp, a):
    glyphName = cFont.glyphunic
    idmaster = gidmast(cFont.idwork)
    ligl = get_postspip()
    piplist = []
    idlist = []
    idpar = 0
    for liid in ligl:
        idlist.append(liid.id)
        if liid.pip not in []:
            piplist.append(liid.pip)

    for idpa in idlist:
        if idpa not in piplist:
            print "insert glyphparam", idpa
            idpar = str(idpa)
            break

    GlyphOutline.update(session.user, idp, glyphName, idmaster,
                        pip=idpar)
    try:
        GlyphParam.insert(id=idpar,
                          GlyphName=glyphName,
                          PointName=a,
                          idmaster=idmaster,
                          user_id=session.user)
    except:
        print "error during insert into glyphparam"


def update_groupparamD(groupname, a, b):
    # string:syntax update groupparam set leftp='1' where id=75 and groupname='g1' and idmaster=1;
    print a, b
    glyphName = cFont.glyphunic
    idmaster = gidmast(cFont.idwork)
    aa = a
    print "*****group", groupname, a, b
    if a is not None and a != 'select':
        if b != '':
            bb = b
            bbstr = str(bb)
            GroupParam.update(session.user, groupname, idmaster,
                              **{aa: bbstr})
        else:
            GroupParam.update(session.user, groupname, idmaster,
                              **{aa: None})


def insert_groupparam(a):
    if a == '':
        return
    glyphName = cFont.glyphunic
    idmaster = gidmast(cFont.idwork)
    GroupParam.insert(groupname=a, idmaster=idmaster,
                      user_id=session.user)


def get_masters():
    return Master.db_select(where='user_id=$user',
                            vars=dict(user=session.user))


def get_master(id):
    cFont.idmaster = id
    ssmr = Master.select_one(session.user, id)
    if not ssmr:
        return
    cFont.fontname = str(ssmr.FontName)
    cFont.fontna = str(ssmr.FontNameA)
    cFont.fontnb = str(ssmr.FontNameB)

    return ssmr


def update_master(id):
    fontNameA = cFont.fontna
    fontNameB = cFont.fontnb
    fontName = cFont.fontname

    Master.update(session.user, id, fontNameA=fontNameA,
                  fontNameB=fontNameB, FontName=fontName)


def get_globalparams():
    return GlobalParam.db_select(where='user_id=$user',
                                 vars={'user': session.user})


def put_master():
    fontName = cFont.fontname
    fontNameA = cFont.fontna
    fontNameB = cFont.fontnb
    idglobal = cFont.idglobal
    t = db.transaction()

    try:
        Master.insert(user_id=session.user,
                      FontName=fontName, FontNameA=fontNameA,
                      FontNameB=fontNameB, idglobal=idglobal)
    except:
        t.rollback()
        raise
    else:
        t.commit()


def get_globalparam(id):
    cFont.idglobal = id
    return GlobalParam.db_select(where='user_id=$user and idglobal=$id',
                                 vars={'user': session.user, 'id': id})


def get_localparams():
    return LocalParam.db_select(where='user_id=$user',
                                vars={'user': session.user})


def get_localparam(id):
    print "idididget local", id
    return LocalParam.db_select(where='user_id=$user and idlocal=$id',
                                vars={'user': session.user, 'id': id})


def put_globalparam(id):
    metapolation = cFont.metapolation
    unitwidth = cFont.unitwidth
    fontsize = cFont.fontsize
    mean = cFont.mean
    cap = cFont.cap
    ascl = cFont.ascl
    des = cFont.des
    box = cFont.box

    db.insert('globalparam', where='idglobal=$id', vars=locals(),
              metapolation=metapolation, unitwidth=unitwidth,
              fontsize=fontsize, mean=mean, cap=cap, ascl=ascl, des=des,
              box=box)
    db.query("commit")


def updatemaster(id, a, b, c, d):
    Master.update(session.user, id, FontName=a, FontNameA=b,
                  FontNameB=c, idglobal=d)
    

def update_globalparam(id, a, b, c, d, e, f, g):
    GlobalParam.update(session.user, id, metapolation=a, fontsize=b, mean=c,
                       cap=d, ascl=e, des=f, box=g)


def update_localparam(id, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13):
    print "id local param update", id
    LocalParam.update(session.user, id,
                      px=a1, width=a2, space=a3, xheight=a4, capital=a5,
                      boxheight=a6, ascender=a7, descender=a8, inktrap=a9,
                      stemcut=a10, skeleton=a11, superness=a12, over=a13)


def copyproject():
    idmaster = int(cFont.idmaster)
    #
    # copy unix font ufo files
    #
    # mkdir -p fonts/3
    # cp -rpu fonts/1/* fonts/3/
    #
    strg = "select max(idmaster) maxid from master"
    idma = list(db.query(strg))
    idmasternew = idma[0].maxid + 1
    print "idmasternew", idmasternew
    #
    import shutil
    new_proj_dir = working_dir(op.join('fonts', gstr(idmasternew)))
    old_proj_dir = working_dir(op.join('fonts', gstr(idmaster)))
    shutil.copytree(old_proj_dir, new_proj_dir)
    #
    #
    for iloop in [1, -1]:
        idmnew = "'"+str(iloop*idmasternew)+"'"
        idm = "'"+str(iloop*idmaster)+"'"
        strg = ("insert into master (idmaster,FontName,FontNameA,FontNameB,idglobal,vdate,user_id)"
                " select "+idmnew+", FontName,FontNameA,FontNameB,idglobal,now() from master where"
                " user_id=%s and idmaster=%s") % (session.user, idm)
        print strg
        db.query(strg)

        strg = "drop table if exists tmp"
        db.query(strg)
        strg = "create temporary table tmp select * from glyphoutline where user_id=%s anb idmaster=%s" % (session.user, idm)
        db.query(strg)
        strg = "update tmp set idmaster="+idmnew+",vdate=now() where user_id=%s and idmaster=%s" % (session.user, idm)
        db.query(strg)
        strg = "insert into glyphoutline select * from tmp where idmaster=%s and user_id=%s" % (idmnew, session.user)
        db.query(strg)

        strg = "drop table if exists tmp"
        db.query(strg)
        strg = "create temporary table tmp select * from groupparam where idmaster=%s and user_id=%s" % (idm, session.user)
        db.query(strg)
        strg = "update tmp set idmaster="+idmnew+",vdate=now() where idmaster=%s and user_id=%s" % (idm, session.user)
        db.query(strg)
        strg = "insert into groupparam select * from tmp where idmaster=%s and user_id=%s" % (idmnew, session.user)
        db.query(strg)

        strg = "drop table if exists tmp"
        db.query(strg)
        strg = "create temporary table tmp select * from glyphparam where idmaster=%s and user_id=%s" % (idm, session.user)
        db.query(strg)
        strg = "update tmp set idmaster="+idmnew+",vdate=now() where idmaster=%s and user_id=%s" % (idm, session.user)
        db.query(strg)
        strg = "insert into glyphparam select * from tmp where idmaster=%s and user_id=%s" % (idmnew, session.user)
        db.query(strg)


def writexml():
#
#  write  two xml file for glyph in A and B Font
#

    glyphName = cFont.glyphunic
    idworks = cFont.idwork

    idmaster = gidmast(cFont.idwork)

    if cFont.idwork == '0':
        glyphsourceA = op.join(working_dir(cFont.fontpath), cFont.fontna,
                               "glyphs", glyphName + ".glif")
        glyphsource = glyphsourceA
        xmldoc = etree.parse(glyphsourceA)
        items = xmldoc.find("outline")

    if cFont.idwork == '1':
        glyphsourceB = op.join(working_dir(cFont.fontpath), cFont.fontnb,
                               "glyphs", glyphName + ".glif")
        glyphsource = glyphsourceB
        xmldoc = etree.parse(glyphsourceB)
        items = xmldoc.find("outline")

    ids = " and idmaster="+'"'+str(idmaster)+'"'
    inum = 0
    #   db_rows=list(db.query("SELECT PointName,x,y from glyphoutline"))
    #   we assume the number of rows from the db >= the number of the itemlist
    for itemlist in items:
        for s in itemlist:
            inum = inum + 1

            db_row = VGlyphOutline.select_one(session.user, inum, glyphName, idmaster)
            if not db_row:
                continue
            s.attrib['pointNo'] = str(db_row.PointNr)
            s.attrib['x'] = str(db_row.x)
            s.attrib['y'] = str(db_row.y)
            sname = db_row.PointName

            if not sname:
                if s.get('name'):
                    del s.attrib['name']
                continue

            db_rowpar = VGlyphOutlines.select_one(session.user, inum, glyphName, idmaster)
            nameattr = sname
            if s.get('name'):
                s.attrib['name'] = nameattr
            else:
                s.attrib['name'] = nameattr
            #
            # first read group parameters
            if str(db_rowpar.groupn) not in ["None", 'NULL', '']:
                groupname = db_rowpar.groupn
                #     save the groupname in an xml attribute
                #
                if s.get('groupname'):
                    s.attrib['groupname'] = groupname
                else:
                    s.sattrib('groupname', groupname)
                #
                #     get the parameter list included with group parameters (lower priority)
                db_rowpar = VGLS.select_one(session.user, inum, glyphName, idmaster)

            #
            # read param value and write into xml
            # add glyphparameters here:
            xxmlat(s, db_rowpar.startp, 'startp', '1', 0)
            xxmlat(s, db_rowpar.doubledash, 'doubledash', '1', 0)
            xxmlat(s, db_rowpar.tripledash, 'tripledash', '1', 0)
            xxmlat(s, db_rowpar.superleft, 'superleft', '', 5)
            xxmlat(s, db_rowpar.superright, 'superright', '', 5)
            xxmlat(s, db_rowpar.leftp, 'leftp', '1', 0)
            xxmlat(s, db_rowpar.rightp, 'rightp', '1', 0)
            xxmlat(s, db_rowpar.downp, 'downp', '1', 0)
            xxmlat(s, db_rowpar.upp, 'upp', '1', 0)
            xxmlat(s, db_rowpar.dir, 'dir', '', 0)
            xxmlat(s, db_rowpar.leftp2, 'leftp2', '1', 0)
            xxmlat(s, db_rowpar.rightp2, 'rightp2', '1', 0)
            xxmlat(s, db_rowpar.downp2, 'downp2', '1', 0)
            xxmlat(s, db_rowpar.upp2, 'upp2', '1', 0)
            xxmlat(s, db_rowpar.dir2, 'dir2', '', 0)
            xxmlat(s, db_rowpar.tension, 'tension', '', 0)
            xxmlat(s, db_rowpar.tensionand, 'tensionand', '', 0)
            xxmlat(s, db_rowpar.cycle, 'cycle', '', 0)
            xxmlat(s, db_rowpar.penshifted, 'penshifted', '', 0)
            xxmlat(s, db_rowpar.pointshifted, 'pointshifted', '', 0)
            xxmlat(s, db_rowpar.angle, 'angle', '', 0)
            xxmlat(s, db_rowpar.penwidth, 'penwidth', '', 0)
            xxmlat(s, db_rowpar.overx, 'overx', '', 0)
            xxmlat(s, db_rowpar.overbase, 'overbase', '', 0)
            xxmlat(s, db_rowpar.overcap, 'overcap', '', 0)
            xxmlat(s, db_rowpar.overasc, 'overasc', '', 0)
            xxmlat(s, db_rowpar.ascpoint, 'ascpoint', '1', 0)
            xxmlat(s, db_rowpar.descpoint, 'descpoint', '1', 0)
            xxmlat(s, db_rowpar.stemcutter, 'stemcutter', '', 4)
            xxmlat(s, db_rowpar.stemshift, 'stemshift', '', 4)
            xxmlat(s, db_rowpar.inktrap_l, 'inktrap_l', '', 4)
            xxmlat(s, db_rowpar.inktrap_r, 'inktrap_r', '', 4)
#

    print "glyphsource", glyphsource
    with codecs.open(glyphsource, "w", "utf-8") as out:
        xmldoc.write(out)
    out.close()
#  restore current idwork setting
    cFont.idwork = idworks


def get_activeglyph():
    glyphName = cFont.glyphunic
    idmaster = gidmast(cFont.idwork)
    ids = " idmaster=" + '"' + str(idmaster) + '"'
    strg = 'select distinct(glyphname)  from glyphoutline where ' + ids
    print strg
    return db.query(strg)


def writeallxmlfromdb():
    dirnamea = op.join(working_dir(cFont.fontpath), cFont.fontna, "glyphs")
    dirnameb = op.join(working_dir(cFont.fontpath), cFont.fontnb, "glyphs")

    charlista = [f for f in os.listdir(dirnamea) if fnextension(f) == 'glif']
    charlistb = [f for f in os.listdir(dirnameb) if fnextension(f) == 'glif']

    idworks = cFont.idwork
    alist = list(get_activeglyph())
    aalist = []
    for g in alist:
        aalist.append(g.glyphname)
    #
    for ch1 in charlista:
        if ch1 in charlistb:
            glyphname, exte = buildfname(ch1)
            if glyphname in aalist:
                cFont.glyphunic = glyphname
                cFont.glyphName = glyphname
                #   for A and B font
                for iwork in ['0', '1']:
                    cFont.idwork = iwork
                    writexml()
    #
    #    restore old idwork value
    cFont.idwork = idworks
    return None


def writeGlyphlist():
    ifile = open(op.join(working_dir(cFont.fontpath), "glyphlist.mf"), "w")


def writeGlobalParam():
    #
    # prepare font.mf parameter file
    # write the file into the directory cFont.fontpath
    #
    master = get_master(cFont.idmaster)
    imgl = list(get_globalparam(cFont.idglobal))

    mean = 5.0
    cap = 0.8
    ascl = 0.2
    des = 0.2
    box = 1.0

    metapolation = imgl[0].metapolation
    u = imgl[0].unitwidth
    fontsize = imgl[0].fontsize
    mean = imgl[0].mean
    cap = imgl[0].cap
    ascl = imgl[0].ascl
    des = imgl[0].des
    box = imgl[0].box

    # global parameters
    ifile = open(op.join(working_dir(cFont.fontpath), "font.mf"), "w")
    ifile.write("% parameter file \n")
    ifile.write("metapolation:=%.2f;\n" % metapolation)
    ifile.write("font_size:=%.3fpt#;\n" % fontsize)
    ifile.write("mean#:=%.3fpt#;\n" % mean)
    ifile.write("cap#:=%.3fpt#;\n" % cap)
    ifile.write("asc#:=%.3fpt#;\n" % ascl)
    ifile.write("desc#:=%.3fpt#;\n" % des)
    ifile.write("box#:=%.3fpt#;\n" % box)
    ifile.write("u#:=%.3fpt#;\n" % u)

    # local parameters A
    imlo = list(get_localparam(cFont.idlocalA))

    ifile.write("A_px#:=%.2fpt#;\n" % imlo[0].px)
    ifile.write("A_width:=%.2f;\n" % imlo[0].width)
    ifile.write("A_space:=%.2f;\n" % imlo[0].space)
    ifile.write("A_spacept:=%.2fpt;\n" % imlo[0].space)
    ifile.write("A_xheight:=%.2f;\n" % imlo[0].xheight)
    ifile.write("A_capital:=%.2f;\n" % imlo[0].capital)
    ifile.write("A_ascender:=%.2f;\n" % imlo[0].ascender)
    ifile.write("A_descender:=%.2f;\n" % imlo[0].descender)
    ifile.write("A_inktrap:=%.2f;\n" % imlo[0].inktrap)
    ifile.write("A_stemcut:=%.2f;\n" % imlo[0].stemcut)
    ifile.write("A_skeleton#:=%.2fpt#;\n" % imlo[0].skeleton)
    ifile.write("A_superness:=%.2f;\n" % imlo[0].superness)
    ifile.write("A_over:=%.2fpt;\n" % imlo[0].over)

    # local parameters B
    imlo = list(get_localparam(cFont.idlocalB))

    ifile.write("B_px#:=%.2fpt#;\n" % imlo[0].px)
    ifile.write("B_width:=%.2f;\n" % imlo[0].width)
    ifile.write("B_space:=%.2f;\n" % imlo[0].space)
    ifile.write("B_xheight:=%.2f;\n" % imlo[0].xheight)
    ifile.write("B_capital:=%.2f;\n" % imlo[0].capital)
    ifile.write("B_ascender:=%.2f;\n" % imlo[0].ascender)
    ifile.write("B_descender:=%.2f;\n" % imlo[0].descender)
    ifile.write("B_inktrap:=%.2f;\n" % imlo[0].inktrap)
    ifile.write("B_stemcut:=%.2f;\n" % imlo[0].stemcut)
    ifile.write("B_skeleton#:=%.2fpt#;\n" % imlo[0].skeleton)
    ifile.write("B_superness:=%.2f;\n" % imlo[0].superness)
    ifile.write("B_over:=%.2fpt;\n" % imlo[0].over)

    ifile.write("\n")
    ifile.write("input glyphs\n")
    ifile.write("bye\n")
    ifile.close()


def buildfname(filename):
    try:
        basename, extension = filename.split('.')
    except:
        extension = "garbage"
        basename = ""
    return [basename, extension]


def fnextension(filename):
    try:
        basename, extension = filename.split('.')
    except:
        extension = "garbage"
        basename = ""
    return extension


def ufo2mf():
    print "ufo2mf", cFont.fontpath
    dirnamef1 = working_dir(op.join(cFont.fontpath, cFont.fontna, "glyphs"))
    dirnamef2 = working_dir(op.join(cFont.fontpath, cFont.fontnb, "glyphs"))
    dirnamep1 = working_dir(op.join(cFont.fontpath, "glyphs"))

    charlist1 = [f for f in os.listdir(dirnamef1) if fnextension(f) == 'glif']
    charlist2 = [f for f in os.listdir(dirnamef2) if fnextension(f) == 'glif']

    for ch1 in charlist1:
        if ch1 in charlist2:
            fnb, ext = buildfname(ch1)
            if fnb == cFont.glyphunic or cFont.timestamp == 0 or cFont.mfoption == "1":
                newfile = fnb
                newfilename = newfile + ".mf"
                # commd2 = "python parser_pino_mono.py " +ch1 +" " +dirnamef1 +" " +dirnamef2 +" > " +dirnamep1 +"/" +newfilename
                # os.system(commd2)
                xmltomf.xmltomf1(ch1, dirnamef1, dirnamef2, dirnamep1, newfilename)

    cFont.timestamp = 1


def writeGlyphlist():
    print "*** write glyphlist ***"
    ifile = open(working_dir(op.join(cFont.fontpath, "glyphlist.mf")), "w")
    dirnamep1 = working_dir(op.join(cFont.fontpath, "glyphs"))

    charlist1 = [f for f in os.listdir(dirnamep1)]

    for ch1 in charlist1:
        fnb, ext = buildfname(ch1)
        if ext in ["mf"]:
            ifile.write("input glyphs/"+ch1+"\n")
    ifile.close()


def get_user_by_username(name):
    try:
        return db.select('users', where='username=$name', vars=locals())[0]
    except IndexError:
        pass


def get_user_by_email(email):
    try:
        return db.select('users', where='email=$email', vars=locals())[0]
    except IndexError:
        pass


def create_user(username, password, email):
    pwhash = bcrypt.encrypt(password)
    db.insert('users', username=username, password=pwhash,
              email=email, date_joined=web.SQLLiteral("NOW()"))
    return get_user_by_email(email)
