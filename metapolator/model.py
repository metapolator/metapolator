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

from config import cFont, working_dir, session, buildfname, \
    DATABASE_USER, DATABASE_PWD, mf_filename, engine

db = web.database(dbn='mysql', db='blog',
                  user=DATABASE_USER, pw=DATABASE_PWD)


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


def xxmrlat(idmaster, fontsource, glyphid, inum, s):
    sattr = ['groupname', 'startp', 'doubledash', 'tripledash',
             'superleft', 'superright', 'leftp', 'rightp', 'downp', 'upp',
             'dir', 'tension', 'tensionand', 'cycle', 'penshifted',
             'pointshifted', 'angle', 'penwidth', 'overx', 'overbase',
             'overcap', 'overasc', 'overdesc', 'ascpoint', 'descpoint',
             'stemcutter', 'stemshift', 'inktrap_l', 'inktrap_r']

    ids = " and idmaster="+'"'+str(idmaster)+'"'

    cc = s.attrib
    for item in cc:
        if item in sattr:
            val = cc[item]
            if item not in ['', 'select']:
                update_glyphparamX(idmaster, fontsource, glyphid, item, val, ids)

    return None


class Model(object):

    @classmethod
    def db_select(cls, where=None, vars={}, what='*', order=None, group=None):
        return db.select(cls.__table__, what=what, where=where,
                         vars=vars, order=order, group=group)

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
        return db.insert(cls.__table__, **kwargs)


class DBGlyphOutline(Model):

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
    def update(cls, user, id, glyphName, idmaster, fontsource, segment, **kwargs):
        cls.db_update(where=('PointNr=$id and GlyphName=$glyphName'
                             ' and idmaster=$idmaster'
                             ' and user_id=$user and fontsource=$source'
                             ' and segment=$segment'),
                      vars=dict(id=id, user=user, glyphName=glyphName,
                                idmaster=idmaster, source=fontsource,
                                segment=segment),
                      **kwargs)

    @classmethod
    def delete(cls, user, glyphName, idmaster, fontsource):
        cls.db_delete(where=('Glyphname=$glyphName and idmaster=$idmaster'
                             ' and user_id=$user and fontsource=$source'),
                      vars=dict(user=user, glyphName=glyphName,
                                idmaster=idmaster, source=fontsource))


class VDBGlyphOutline(Model):

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


class VDBGlyphOutlines(Model):

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
        query = cls.db_select_first(what='id',
                                    where=('GlyphName=$glyphName'
                                           ' and PointName=$PointName'
                                           ' and idmaster=$idmaster'
                                           ' and user_id=$user'),
                                    vars=dict(idmaster=idmaster, PointName=nameval,
                                              user=user, glyphName=glyphName))
        try:
            return query.id
        except AttributeError:
            pass

    @classmethod
    def delete(cls, user, glyphName, idmaster, fontsource):
        cls.db_delete(where=('glyphName=$glyphName and idmaster=$idmaster'
                             ' and user_id=$user and fontsource=$source'),
                      vars=dict(user=user, glyphName=glyphName,
                                idmaster=idmaster, source=fontsource))

    @classmethod
    def update(cls, user, id, glyphName, idmaster, fontsource, **kwargs):
        cls.db_update(where='id=$id and glyphName=$glyphName'
                            ' and idmaster=$idmaster and user_id=$user'
                            ' and fontsource=$source',
                      vars=dict(id=id, user=user, glyphName=glyphName,
                                idmaster=idmaster, source=fontsource),
                      **kwargs)


class GroupParam(Model):

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

    @staticmethod
    def get_fonts_directory(master, ab_source=None):
        fonts_directory = op.join(working_dir(), 'fonts', str(master.idmaster))
        if ab_source.lower() == 'a':
            return op.join(fonts_directory, master.FontNameA)
        elif ab_source.lower() == 'b' and master.FontNameB:
            return op.join(fonts_directory, master.FontNameB)
        elif ab_source.lower() == 'b':
            return op.join(fonts_directory, master.FontNameA)
        return fonts_directory

    @classmethod
    def select_one(cls, user, id):
        return cls.db_select_first(where='idmaster=$id and user_id=$user',
                                   vars=dict(id=id, user=user))

    @classmethod
    def update(cls, user, id, **kwargs):
        cls.db_update(where='user_id=$user and idmaster=$id',
                      vars=dict(user=user, id=id),
                      **kwargs)

    @classmethod
    def select_maxid(cls, user):
        return cls.db_select(where='user_id=$user',
                                   what='max(idmaster) maxid',
                                   vars=dict(user=user))

    @classmethod
    def get_by_name(cls, projectname, user):
        return cls.db_select_first(where='FontName=$name and user_id=$user',
                                   vars=dict(user=user, name=projectname))


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


def add_segment(segment, master, ab_source, glyphid, segmentnumber):
    p = DBGlyphOutline.db_select_first(where='user_id=$user and fontsource=$source'
                                           ' and idmaster=$idmaster and glyphName=$glyph'
                                           ' and segment=$segment',
                                     vars=dict(user=session.user,
                                               source=ab_source.upper(),
                                               idmaster=master.idmaster,
                                               glyph=glyphid,
                                               segment=segmentnumber),
                                     what='PointNr',
                                     order='PointNr desc')
    try:
        PointNr = (not p and -1) or int(p.PointNr)
    except TypeError:
        PointNr = -1

    p = GlyphParam.db_select_first(where='user_id=$user and fontsource=$source'
                                         ' and idmaster=$idmaster',
                                   vars=dict(user=session.user,
                                             source=ab_source.upper(),
                                             idmaster=master.idmaster),
                                   what='id',
                                   order='id desc')
    id = (p and (p.id or 0) + 1) or 1

    GlyphParam.insert(user_id=session.user, id=id,
                      GlyphName=glyphid,
                      idmaster=master.idmaster,
                      fontsource=ab_source.upper())

    DBGlyphOutline.insert(id=id,
                        PointNr=PointNr + 1,
                        glyphName=glyphid,
                        x=segment.get('x'),
                        y=segment.get('y'),
                        vector_xIn=segment['controls'][0].get('x'),
                        vector_yIn=segment['controls'][0].get('y'),
                        vector_xOut=segment['controls'][1].get('x'),
                        vector_yOut=segment['controls'][1].get('y'),
                        idmaster=master.idmaster,
                        fontsource=ab_source.upper(),
                        user_id=session.user,
                        segment=segmentnumber)
    return PointNr


def save_segment(segment, master, ab_source, glyphid, segmentnumber=1, pointnumber=None):
    """
    Save point coordinates and its in and out vector points.

    >>> segment = {'y': '1372.00081', 'x': '633.00049',
    ...            'controls': [{'y': '1347.09734', 'x': '965.15842'},
    ...                         {'y': '1400.20862', 'x': '256.76935'}]}
    >>> pointnumber = save_segment(segment, master, ab_source, glyphid, 1)
    >>> DBGlyphOutline.get(master, ab_source, glyphid, pointnumber)
    <DBGlyphOutline (633.00049, 1372.00081)>
    >>> segment = {'y': '945.94874', 'x': '500.23445',
    ...            'controls': [{'y': '1347.09734', 'x': '965.15842'},
    ...                         {'y': '1400.20862', 'x': '256.76935'}]}
    >>> result = save_segment(segment, master, ab_source, glyphid, 1, pointnumber)
    >>> DBGlyphOutline.get(master, ab_source, glyphid, pointnumber)
    <DBGlyphOutline (500.23445, 945.94874)>
    """

    if not pointnumber:
        return add_segment(segment, master, ab_source, glyphid, segmentnumber)

    DBGlyphOutline.update(session.user, pointnumber, glyphid,
                        master.idmaster, ab_source.upper(),
                        x=segment.get('x'),
                        y=segment.get('y'),
                        vector_xIn=segment['controls'][0].get('x'),
                        vector_yIn=segment['controls'][0].get('y'),
                        vector_xOut=segment['controls'][1].get('x'),
                        vector_yOut=segment['controls'][1].get('y'),
                        segment=segmentnumber)
    return pointnumber


def putFontG(glyphName, glyphsource, idmaster, ab_source, loadoption=0):
    #  Read one glyph from xml file with glif extension
    #  and put the data into db
    #  There is a loadoption with values:
    #
    #  There is a loadoption with values:
    #
    #  Load Single:
    #  loadoptionAll '0'
    #  loadoption '0'
    #- Import Single Glyph (Selected Glyph) only x and y coordinates
    #  loadoption '1'
    #- Import Single Glyph (Selected Glyph) x and y coordinates and parameter
    #
    #- Export Single Glyph (Selected Glyph) only x and y coordinates
    #- Export Single Glyph (Selected Glyph) x and y coordinates and parameter

    #  Load All:
    #  loadoptionAll '1'
    #  loadoption '0'
    #- Import All Glyphs only x and y coordinates
    #  loadoption '1'
    #- Import All Glyphs x and y coordinates and parameter
    #
    #- Export All Glyphs only x and y coordinates
    #- Export All Glyphs x and y coordinates and parameter
    #
    #

    xmldoc = etree.parse(glyphsource)
    outline = xmldoc.find("outline")
    items = outline
    #
    if loadoption == 0:
        DBGlyphOutline.delete(session.user, glyphName,
                            idmaster, ab_source.upper())

    if loadoption == 1:
        DBGlyphOutline.delete(session.user, glyphName, idmaster,
                            ab_source.upper())
        GlyphParam.delete(session.user, glyphName, idmaster,
                          ab_source.upper())
    #
    #  load option 0  read from xml files only x,y coordinates
    #  it could be the order of the records has been changed
    #  in this case we read only the coordinates from the xml file
    #

    if loadoption == 0:
    #   put data into db
        inum = 0
        strg = ""
        for itemlist in items:
            for s in itemlist:
                inum = inum + 1
                # find a named point, convention the name begin
                # with the letter z
                idpar = None
                pointno = "p" + str(inum)
                if s.get('name'):
                    nameval = s.get('name')
                    # get the link to the parameter table
                    pip = get_glyphparamid(glyphName, idmaster, nameval)
                    idpar = pip
                    #
                if s.get('type'):
                    mainpoint = 1
                else:
                    mainpoint = 0
                DBGlyphOutline.insert(id=inum,
                                    glyphName=glyphName,
                                    PointNr=pointno,
                                    x=s.get('x'),
                                    y=s.get('y'),
                                    contrp=mainpoint,
                                    idmaster=idmaster,
                                    fontsource=ab_source.upper(),
                                    pip=idpar,
                                    user_id=session.user)

    #
    #
    #  load option 1  read from xml files x,y coordinates
    #                 and parameters

    if loadoption == 1:

        #  put data into db
        inum = 0
        for itemlist in items:
            for s in itemlist:
                inum = inum + 1
                #  find a named point , convention the name begin with the letter z
                idpar = None
                if s.get('name'):
                    nameval = s.get('name')
                    idpar = inum
                    GlyphParam.insert(user_id=session.user, id=inum,
                                      GlyphName=glyphName,
                                      idmaster=idmaster,
                                      fontsource=ab_source.upper(),
                                      PointName=nameval)
                    #  find  all parameter and save it in db
                    # add glyphparameters here:
                    xxmrlat(idmaster, ab_source, glyphName, inum, s)
                else:
                    nameval = ""
                    startp = 0
                    idpar = None
                pointno = "p" + str(inum)
                #
                if s.get('type'):
                    mainpoint = 1
                else:
                    mainpoint = 0
                #
                DBGlyphOutline.insert(id=inum,
                                    glyphName=glyphName,
                                    PointNr=pointno,
                                    x=s.get('x'),
                                    y=s.get('y'),
                                    contrp=mainpoint,
                                    idmaster=idmaster,
                                    fontsource=ab_source.upper(),
                                    pip=idpar,
                                    user_id=session.user)


def putFont(master, glyphid, loadoption=0):
    #
    #  create glypsource names
    #  create fontpath
    #  read font A and font B
    #  put font A and font B into DB according the loadoption rule
    #

    glyphNameNew = glyphid + ".glif"

    glyphPath = op.join("glyphs", glyphNameNew)

    source_fontpath_A = Master.get_fonts_directory(master, 'A')
    source_fontpath_B = Master.get_fonts_directory(master, 'B')

    glyphsourceA = op.join(source_fontpath_A, glyphPath)
    glyphsourceB = op.join(source_fontpath_B, glyphPath)

    putFontG(glyphid, glyphsourceA, master.idmaster, 'A', loadoption)
    putFontG(glyphid, glyphsourceB, master.idmaster, 'B', loadoption)


def gidmast(idwork):
    if idwork == '0':
        idmaster = int(cFont.idmaster)
    if idwork == '1':
        idmaster = -int(cFont.idmaster)
    return idmaster


def get_posts():
    idmaster = gidmast(cFont.idwork)
    glyphName = cFont.glyphunic
    return list(VDBGlyphOutline.select(session.user, glyphName, idmaster))


def get_postspa():
    idmaster = gidmast(cFont.idwork)
    glyphName = cFont.glyphunic
    return VGLS.select(session.user, glyphName, idmaster)


def get_post(id):
    glyphName = cFont.glyphunic
    idmaster = gidmast(cFont.idwork)
    return VDBGlyphOutline.select_one(session.user, id, glyphName, idmaster)


def get_postspip():
    glyphName = cFont.glyphunic
    idmaster = gidmast(cFont.idwork)
    return DBGlyphOutline.select_pip_only(session.user, glyphName, idmaster)


def get_glyphparamid(glyphName, idmaster, nameval):
    return GlyphParam.select_one_id(session.user, glyphName, nameval, idmaster)


def get_glyphparam(id):
    glyphName = cFont.glyphunic
    idmaster = gidmast(cFont.idwork)
    return VDBGlyphOutlines.select_one(session.user, id, glyphName, idmaster)


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
    DBGlyphOutline.update(session.user, id, glyphName, idmaster, x=x, y=y)


def update_postp0(id, x, y, contr):
    glyphName = cFont.glyphunic
    idmaster = gidmast(cFont.idwork)
    DBGlyphOutline.update(session.user, id, glyphName, idmaster,
                        x=x, y=y, pip=None, contrp=contr)


def update_postp(id, x, y, idpar):
    glyphName = cFont.glyphunic
    idmaster = gidmast(cFont.idwork)

    if x is None:
        DBGlyphOutline.update(session.user, id, glyphName, idmaster, pip=idpar)
    else:
        DBGlyphOutline.update(session.user, id, glyphName, idmaster,
                            x=x, y=y, pip=idpar)


def update_glyphparamX(idmaster, fontsource, glyphid, ap, bp, ids):
    # string:syntax update glyphparam set leftp='1' where id=75 and Glyphname='p' and idmaster=1;
    idp = id
    if bp != '':
        bb = bp
        bbstr = str(bb)
        GlyphParam.update(session.user, idp, glyphid, idmaster, fontsource,
                          **{ap: str(bbstr)})
    return None


def update_glyphparamD(id, ap, bp):
    # string:syntax update glyphparam set leftp='1' where id=75 and Glyphname='p' and idmaster=1;
    glyphName = cFont.glyphunic
    idmaster = gidmast(cFont.idwork)
    #
    #   get id from glyphoutline
    lli = DBGlyphOutline.select_one_pip(session.user, id, glyphName, idmaster)
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
    lli = DBGlyphOutline.select_one_pip(session.user, id, glyphName, idmaster)
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

    lli = list(DBGlyphOutline.select_one_pip(session.user, id,
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

    DBGlyphOutline.update(session.user, idp, glyphName, idmaster,
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
    return LocalParam.db_select_first(where='user_id=$user and idlocal=$id',
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
    idma = Master.select_maxid(session.user)
    idmasternew = idma[0].maxid + 1
    print "idmasternew", idmasternew
    #
    import shutil
    new_proj_dir = working_dir(op.join('fonts', str(idmasternew)))
    old_proj_dir = working_dir(op.join('fonts', str(idmaster)))
    shutil.copytree(old_proj_dir, new_proj_dir)
    #
    #
    for iloop in [1, -1]:
        idmnew = "'"+str(iloop*idmasternew)+"'"
        idm = "'"+str(iloop*idmaster)+"'"
        strg = ("insert into master (idmaster,FontName,FontNameA,FontNameB,idglobal,vdate,user_id)"
                " select "+idmnew+", FontName,FontNameA,FontNameB,idglobal,now(),user_id from master where"
                " user_id=%s and idmaster=%s") % (session.user, idm)
        print strg
        db.query(strg)

        strg = ("insert into glyphoutline (idmaster,id,glyphname,PointNr,x,y,contrp,pip,vdate,user_id)"
                " select "+idmnew+",id,glyphname,PointNr,x,y,contrp,pip,now(),user_id from glyphoutline where"
                " user_id=%s and idmaster=%s") % (session.user, idm)
        print strg
        db.query(strg)

        strg = ("insert into groupparam (idmaster,user_id,groupname,vdate,startp,doubledash,tripledash,superleft,superright,leftp,rightp,downp,upp,dir,leftp2,rightp2,downp2,upp2,dir2,tension,tensionand,cycle,penshifted,pointshifted,angle,penwidth,overx,overbase,overcap,overasc,overdesc,ascpoint,descpoint,stemcutter,stemshift,inktrap_l,inktrap_r)"
                " select "+idmnew+",user_id,groupname,now(),startp,doubledash,tripledash,superleft,superright,leftp,rightp,downp,upp,dir,leftp2,rightp2,downp2,upp2,dir2,tension,tensionand,cycle,penshifted,pointshifted,angle,penwidth,overx,overbase,overcap,overasc,overdesc,ascpoint,descpoint,stemcutter,stemshift,inktrap_l,inktrap_r from groupparam where"
                " user_id=%s and idmaster=%s") % (session.user, idm)
        print strg
        db.query(strg)
        strg = ("insert into glyphparam (idmaster,id,glyphname,user_id,PointName,groupname,vdate,startp,doubledash,tripledash,superleft,superright,leftp,rightp,downp,upp,dir,leftp2,rightp2,downp2,upp2,dir2,tension,tensionand,cycle,penshifted,pointshifted,angle,penwidth,overx,overbase,overcap,overasc,overdesc,ascpoint,descpoint,stemcutter,stemshift,inktrap_l,inktrap_r)"
                " select "+idmnew+",id,glyphname,user_id,PointName,groupname,now(),startp,doubledash,tripledash,superleft,superright,leftp,rightp,downp,upp,dir,leftp2,rightp2,downp2,upp2,dir2,tension,tensionand,cycle,penshifted,pointshifted,angle,penwidth,overx,overbase,overcap,overasc,overdesc,ascpoint,descpoint,stemcutter,stemshift,inktrap_l,inktrap_r from glyphparam where"
                " user_id=%s and idmaster=%s") % (session.user, idm)
        print strg
        db.query(strg)
        return


def writexml(master, ab_source=None):
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
        try:
            xmldoc = etree.parse(glyphsourceA)
        except IOError:
            return
        items = xmldoc.find("outline")

    if cFont.idwork == '1':
        glyphsourceB = op.join(working_dir(cFont.fontpath), cFont.fontnb,
                               "glyphs", glyphName + ".glif")
        glyphsource = glyphsourceB
        try:
            xmldoc = etree.parse(glyphsourceB)
        except IOError:
            return
        items = xmldoc.find("outline")

    ids = " and idmaster="+'"'+str(idmaster)+'"'
    inum = 0
    #   db_rows=list(db.query("SELECT PointName,x,y from glyphoutline"))
    #   we assume the number of rows from the db >= the number of the itemlist
    for itemlist in items:
        for s in itemlist:
            inum = inum + 1

            db_row = VDBGlyphOutline.select_one(session.user, inum, glyphName, idmaster)
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

            db_rowpar = VDBGlyphOutlines.select_one(session.user, inum, glyphName, idmaster)
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


def writeParams(filename, master, globalparam, metapolation=None):
    mean = 5.0
    cap = 0.8
    ascl = 0.2
    des = 0.2
    box = 1.0

    metapolation = (metapolation is not None and metapolation) \
        or (metapolation is None and globalparam[0].metapolation)
    u = globalparam[0].unitwidth or 0
    fontsize = globalparam[0].fontsize or 0
    mean = globalparam[0].mean or mean
    cap = globalparam[0].cap or cap
    ascl = globalparam[0].ascl or ascl
    des = globalparam[0].des or des
    box = globalparam[0].box or box

    ifile = open(filename, "w")
    # global parameters
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
    imlo = get_localparam(master.idlocala)
    hasA = False
    if imlo:
        ifile.write("A_px#:=%.2fpt#;\n" % imlo.px)
        ifile.write("A_width:=%.2f;\n" % imlo.width)
        ifile.write("A_space:=%.2f;\n" % imlo.space)
        ifile.write("A_spacept:=%.2fpt;\n" % imlo.space)
        ifile.write("A_xheight:=%.2f;\n" % imlo.xheight)
        ifile.write("A_capital:=%.2f;\n" % imlo.capital)
        ifile.write("A_ascender:=%.2f;\n" % imlo.ascender)
        ifile.write("A_descender:=%.2f;\n" % imlo.descender)
        ifile.write("A_inktrap:=%.2f;\n" % imlo.inktrap)
        ifile.write("A_stemcut:=%.2f;\n" % imlo.stemcut)
        ifile.write("A_skeleton#:=%.2fpt#;\n" % imlo.skeleton)
        ifile.write("A_superness:=%.2f;\n" % imlo.superness)
        ifile.write("A_over:=%.2fpt;\n" % imlo.over)
        hasA = True

    # local parameters B
    imlo = get_localparam(master.idlocalb)
    hasB = False
    if imlo:
        ifile.write("B_px#:=%.2fpt#;\n" % imlo.px)
        ifile.write("B_width:=%.2f;\n" % imlo.width)
        ifile.write("B_space:=%.2f;\n" % imlo.space)
        ifile.write("B_xheight:=%.2f;\n" % imlo.xheight)
        ifile.write("B_capital:=%.2f;\n" % imlo.capital)
        ifile.write("B_ascender:=%.2f;\n" % imlo.ascender)
        ifile.write("B_descender:=%.2f;\n" % imlo.descender)
        ifile.write("B_inktrap:=%.2f;\n" % imlo.inktrap)
        ifile.write("B_stemcut:=%.2f;\n" % imlo.stemcut)
        ifile.write("B_skeleton#:=%.2fpt#;\n" % imlo.skeleton)
        ifile.write("B_superness:=%.2f;\n" % imlo.superness)
        ifile.write("B_over:=%.2fpt;\n" % imlo.over)
        hasB = True

    ifile.write("\n")
    ifile.write("input glyphs\n")
    ifile.write("bye\n")
    ifile.close()

    return hasA and hasB


def writeGlobalParam(master):
    #
    # prepare font.mf parameter file
    # write the file into the directory cFont.fontpath
    #
    globalparam = list(get_globalparam(master.idglobal))

    filename = op.join(master.get_fonts_directory(), '%s.mf' % master.fontname)
    result1 = writeParams(filename, master, globalparam)

    filename = op.join(master.get_fonts_directory(), '%sA.mf' % master.fontname)
    result2 = writeParams(filename, master, globalparam, 0)

    filename = op.join(master.get_fonts_directory(), '%sB.mf' % master.fontname)
    result3 = writeParams(filename, master, globalparam, 1)
    return result1 and result2 and result3


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
