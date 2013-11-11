import models
import re


def write_angles_old(fip, font_a):
    from lxml import etree
    glif = etree.parse(font_a)
    itemlist = [point for point in glif.iter() if point.tag == 'point']

    inattr = 0
    ivn = 0
    stre = " ... "
    strtwo = " .. "
    stline = " -- "
    strz = ""
    zzn = []
    startp = []
    startpval = []

# create empty variable list

    angle = []
    angleval = []

# add iteration to string

    for i in range(1, 100):
        startp.append("")
        startpval.append(0)

        angle.append("")
        angleval.append(0)

# search for parameters

    for item in itemlist:
        for i in range(1, 100):
            znamel = 'z' + str(i) + 'l'
            znamer = 'z' + str(i) + 'r'
            ipn = 0
            try:
                x = item.get('x')
                y = item.get('y')
                im = item.get('name')
                istartp = item.get('startp')
                iangle = item.get('angle')
                ipn = 1
            except:
                inattr = inattr+1

            if ipn == 1:
                if im == znamel:
                    zzn.append(i)
                if im == znamel or im == znamer:
                    if istartp is not None:
                        istartpval = item.get('startp')
                        del startp[i-1]
                        startp.insert(i - 1, "startp")
                        del startpval[i - 1]
                        startpval.insert(i - 1, istartpval)

                    if iangle is not None:
                        iangleval = item.get('angle')
                        del angle[i - 1]
                        angle.insert(i - 1, "angle")
                        del angleval[i - 1]
                        angleval.insert(i - 1, iangleval)

    nnz = 0
    for zitem in zzn:
        nnz = nnz + 1

    i = 0
    zzn.sort()
    zeile = ""
    zeileend = ""
    semi = ");"
    for i in range(0, nnz):
        zitem = zzn[i]
        zitemb = zzn[i]
        zitemc = zzn[i - 1]
        if angle[i] != "":
            zeile = zeile + "ang" + str(zitem) + " := ang" + str(zitem) + "  " + str(angleval[i]) + "+ (metapolation * (AngleB - " + str(angleval[i]) + " ));"
        else:
            zeile = zeile + "ang" + str(zitem) + " := ang" + str(zitem) + ";"
        zeile = zeile
        fip.write("\n")
        fip.write(zeile)

    return fip


def write_angles(fip, master, glyphA):
    # reading extra pen angle Font A

    fip.write("\n")
    fip.write("""% test extra pen angle Font A""")

#   glif = etree.parse(font_a)
#   itemlist = [point for point in glif.iter() if point.tag == 'point']

    inattr = 0
    ivn = 0
    strz = ""
    zzn = []

# create empty variable list

    angle = []
    angleval = []

    startp = []
    startpval = []

# add iteration to string

#   for i in range (1,100):
#     angle.append("")
#     angleval.append(0)

# search for parameters
    compositefilter_kwargs = dict(idmaster=master.idmaster, fontsource='A',
                                  glyphname=glyphA.name)
    itemlist = models.GlyphOutline.filter(**compositefilter_kwargs)

    i = 1
    for item in itemlist:
        compositefilter_kwargs['pointnr'] = item.pointnr
        param = models.GlyphParam.get(**compositefilter_kwargs)

        znamer = re.match('z(\d+)r', param.pointname)
        znamel = re.match('z(\d+)l', param.pointname)
        zname = re.match('z(\d+)l', param.pointname)

#     for i in range (1,100):
#        znamel = 'z'+str(i)+'l'
#        znamer = 'z'+str(i)+'r'

#        ipn=0
#        try :
          #x = item.get('x')
          #y = item.get('y')
        x = item.x
        y = item.y

        im = param.pointname
          #im = item.get('name')

          # istartp = item.get('startp')
          # iangle = item.get('angle')
        istartp = param.startp
        iangle = param.angle
    #     ipn = 1
    #        except :
    #          inattr=inattr+1

    #        if ipn == 1 :
        if znamel and im == znamel.group(0):
            zzn.append(i)
            if istartp is not None:
                # istartpval = item.get('startp')
                istartpval = param.startp
                # del startp[i-1]
                startp.append("startp")
                startpval.append(istartpval)

            if iangle is not None:
                # iangleval = item.get('angle')
                iangleval = param.angle
                # del angle[i-1]
                angle.append("angle")
                angleval.append(iangleval)
            else:
                angle.append("")
                angleval.append(0)
            i += 1
    zzn.sort()
    zeile = ""
    zeileend = ""
    semi = ");"
    for i in range(len(zzn)):
        zitem = i + 1

        # zitemb = zzn[i]
        # zitemc = zzn[i-1]

## default string
# parameters
        if angle[i]:
            #zeile = "ang" + str(zitem) + " := ang" + str(zitem) + "  " + str(angleval[i]) + "+ (metapolation * (" + str(angleval_B[i]) + " - " + str(angleval[i]) + " ));"
            zeile = "ang" + str(zitem) + " := ang" + str(zitem) + "  " + str(angleval[i]) + "+ (metapolation * (AngleB - " + str(angleval[i]) + " ));"
        else:
            zeile = "ang" + str(zitem) + " := ang" + str(zitem) + ";"

        # zeile = zeile
        fip.write("\n")
        fip.write(zeile)

    return fip


if __name__ == '__main__':
    import os
    import web
    from sqlalchemy.orm import scoped_session, sessionmaker
    from config import session, engine, working_dir
    session.user = 1
    session.authorized = True

    web.ctx.orm = scoped_session(sessionmaker(bind=engine))

    print "# Test new code"
    master = models.Master.get(fontname='MP_Akku-angle')
    glyph = models.Glyph.get(idmaster=master.idmaster, name='71', fontsource='A')

    import StringIO
    result = write_angles(StringIO.StringIO(), master, glyph)
    result.seek(0)
    print result.read()

    print "# Test old code"
    print master.__dict__
    print master.get_fonts_directory('A')
    print os.path.join(master.get_fonts_directory('A'), 'glyphs', '%s.glif' % glyph.name)
    result = write_angles_old(StringIO.StringIO(), os.path.join(master.get_fonts_directory('A'), 'glyphs', '%s.glif' % glyph.name))
    result.seek(0)
    print result.read()

    import sys
    sys.exit(0)
