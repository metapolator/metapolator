import os
import os.path as op
import re

import models
from config import working_dir


class DifferentZPointError(Exception):
    pass


def xmltomf1(master, glyphA, glyphB=None, stdout_fip=None):
    """ Save current points to mf file

        master is an instance of models.Master
        glyph is an instance of models.Glyph
    """

    if not glyphB:
        glyphB = glyphA

    if not stdout_fip:
        path = working_dir(op.join(master.get_fonts_directory(), "glyphs"))
        fip = open(os.path.join(path, '%s.mf' % glyphA.name), 'w')
    else:
        fip = stdout_fip

    fip.write("""% File parsed with Metapolator %

% box dimension definition %
""")
    w = str(glyphA.width / 100)
    w2 = str(glyphB.width / 100)
    g = glyphA.name  # get from glyphA as we sure that glypha and glyphb exist in font project
    #  u = glyphA.unicode

    fip.write("\n")
    fip.write('beginfontchar(' + glyphA.name + ', ((' + w + '*A_width + metapolation * (' + w2 + '*B_width - ' + w + '*A_width)) + spacing_' + g + "R) * width_" + g + ", 0, 0 );")

# point coordinates font A ################

    fip.write("\n")
    fip.write("""% point coordinates font A""")
    fip.write("\n")

# points for l

    compositefilter_kwargs = dict(idmaster=master.idmaster, fontsource='A',
                                  glyphname=glyphA.name)
    itemlist = models.GlyphOutline.filter(**compositefilter_kwargs)

    zzn = []
    x = []
    xval = []
    y = []
    yval = []
    i = 1

    for item in itemlist:
        compositefilter_kwargs['pointnr'] = item.pointnr
        param = models.GlyphParam.get(**compositefilter_kwargs)

        znamel = re.match('z(\d+)l', param.pointname)

        ix = item.x
        iy = item.y

        im = param.pointname

        if znamel and im == znamel.group(0):
            zzn.append(i)

            if ix is not None:
                ixval = item.x
                x.append("x")
                xval.append(ixval)

            if iy is not None:
                iyval = item.y
                y.append("y")
                yval.append(iyval)

            i += 1

    zzn.sort()
    zeile = ""

    for i in range(len(zzn)):
        zitem = i + 1
        zeile = "px" + str(zitem) + "l := " + str(xval[i]) + "u ; " + "py" + str(zitem) + "l := " + str(yval[i]) + "u ;"

        fip.write("\n")
        fip.write(zeile)

# points for r

    compositefilter_kwargs = dict(idmaster=master.idmaster, fontsource='A',
                                  glyphname=glyphA.name)
    itemlist = models.GlyphOutline.filter(**compositefilter_kwargs)
    fip.write("\n")

    zzn = []
    x = []
    xval = []
    y = []
    yval = []
    i = 1

    for item in itemlist:
        compositefilter_kwargs['pointnr'] = item.pointnr
        param = models.GlyphParam.get(**compositefilter_kwargs)

        znamer = re.match('z(\d+)r', param.pointname)

        ix = item.x
        iy = item.y

        im = param.pointname

        if znamer and im == znamer.group(0):
            zzn.append(i)

            if ix is not None:
                ixval = item.x
                x.append("x")
                xval.append(ixval)

            if iy is not None:
                iyval = item.y
                y.append("y")
                yval.append(iyval)

            i += 1

    zzn.sort()
    zeile = ""

    for i in range(len(zzn)):
        zitem = i + 1
        zeile = "px" + str(zitem) + "r := " + str(xval[i]) + "u ; " + "py" + str(zitem) + "r := " + str(yval[i]) + "u ;"

        fip.write("\n")
        fip.write(zeile)

# reading mid points font A

    fip.write("\n")
    fip.write("""% point coordinates font A""")
    fip.write("\n")

    compositefilter_kwargs = dict(idmaster=master.idmaster, fontsource='A',
                                  glyphname=glyphA.name)
    itemlist = models.GlyphOutline.filter(**compositefilter_kwargs)
    fip.write("\n")

    zzn = []
    x = []
    xval = []
    y = []
    yval = []
    i = 1

    for item in itemlist:
        compositefilter_kwargs['pointnr'] = item.pointnr
        param = models.GlyphParam.get(**compositefilter_kwargs)

        znamer = re.match('z(\d+)r', param.pointname)

        ix = item.x
        iy = item.y

        im = param.pointname

        if znamer and im == znamer.group(0):
            zzn.append(i)

            if ix is not None:
                ixval = item.x
                x.append("x")
                xval.append(ixval)

            if iy is not None:
                iyval = item.y
                y.append("y")
                yval.append(iyval)

            i += 1

    zzn.sort()
    zeile = ""

    for i in range(len(zzn)):
        zitem = i + 1
        zeile = ".5(px" + str(zitem) + "l + px" + str(zitem) + "r) = x2" + str(zitem) + "0;"
        fip.write(zeile)

        fip.write("\n")
        zeile = ".5(py" + str(zitem) + "l + py" + str(zitem) + "r) = y2" + str(zitem) + "0;"

        fip.write(zeile)
        fip.write("\n")

    fip.write("\n")
    fip.write("""% point coordinates font A""")
    fip.write("\n")

    compositefilter_kwargs = dict(idmaster=master.idmaster, fontsource='A',
                                  glyphname=glyphA.name)
    itemlist = models.GlyphOutline.filter(**compositefilter_kwargs)
    fip.write("\n")

    zzn = []
    x = []
    xval = []
    y = []
    yval = []
    i = 1

    for item in itemlist:
        compositefilter_kwargs['pointnr'] = item.pointnr
        param = models.GlyphParam.get(**compositefilter_kwargs)

        znamer = re.match('z(\d+)r', param.pointname)

        ix = item.x
        iy = item.y

        im = param.pointname

        if znamer and im == znamer.group(0):
            zzn.append(i)

            if ix is not None:
                ixval = item.x
                x.append("x")
                xval.append(ixval)

            if iy is not None:
                iyval = item.y
                y.append("y")
                yval.append(iyval)

            i += 1

    zzn.sort()
    zeile = ""

    for i in range(len(zzn)):
        zitem = i + 1
        zeile = "px" + str(zitem) + "l = x" + str(zitem) + "Bl; py" + str(zitem) + "l = y" + str(zitem) + "Bl; "
        fip.write(zeile)

        fip.write("\n")
        zeile = "px" + str(zitem) + "r = x" + str(zitem) + "Br; py" + str(zitem) + "r = y" + str(zitem) + "Br; "

        fip.write(zeile)
        fip.write("\n")




# reading pen widhts Font A ################

    fip.write("\n")
    fip.write( """% pen widhts Font A """)
    fip.write("\n")

    compositefilter_kwargs = dict(idmaster=master.idmaster, fontsource='A',
                                  glyphname=glyphA.name)
    itemlist = models.GlyphOutline.filter(**compositefilter_kwargs)
    fip.write("\n")

    zzn = []
    x = []
    xval = []
    y = []
    yval = []
    i = 1

    for item in itemlist:
        compositefilter_kwargs['pointnr'] = item.pointnr
        param = models.GlyphParam.get(**compositefilter_kwargs)

        znamer = re.match('z(\d+)r', param.pointname)

        ix = item.x
        iy = item.y

        im = param.pointname

        if znamer and im == znamer.group(0):
            zzn.append(i)

            if ix is not None:
                ixval = item.x
                x.append("x")
                xval.append(ixval)

            if iy is not None:
                iyval = item.y
                y.append("y")
                yval.append(iyval)

            i += 1

    zzn.sort()
    zeile = ""

    for i in range(len(zzn)):
        zitem = i + 1
        zeile = "dist" + str(zitem) + " := length (z" + str(zitem) + "Bl-z" + str(zitem) + "Br); "
        fip.write(zeile)

        fip.write("\n")





# point coordinates font B ################

    fip.write("\n")
    fip.write( """% point coordinates font B""")
    fip.write("\n")

# points for l

    compositefilter_kwargs = dict(idmaster=master.idmaster, fontsource='B',
                                  glyphname=glyphB.name)
    itemlist = models.GlyphOutline.filter(**compositefilter_kwargs)

    zzn = []
    x = []
    xval = []
    y = []
    yval = []
    i = 1

    for item in itemlist:
        compositefilter_kwargs['pointnr'] = item.pointnr
        param = models.GlyphParam.get(**compositefilter_kwargs)

        znamel = re.match('z(\d+)l', param.pointname)

        ix = item.x
        iy = item.y

        im = param.pointname

        if znamel and im == znamel.group(0):
            zzn.append(i)

            if ix is not None:
                ixval = item.x
                x.append("x")
                xval.append(ixval)

            if iy is not None:
                iyval = item.y
                y.append("y")
                yval.append(iyval)

            i += 1

    zzn.sort()
    zeile = ""

    for i in range(len(zzn)):
        zitem = i + 1
        zeile = "ppx" + str(zitem) + "l := " + str(xval[i]) + "u ; " + "ppy" + str(zitem) + "l := " + str(yval[i]) + "u ;"

        fip.write("\n")
        fip.write(zeile)

# points for r

    compositefilter_kwargs = dict(idmaster=master.idmaster, fontsource='B',
                                  glyphname=glyphB.name)
    itemlist = models.GlyphOutline.filter(**compositefilter_kwargs)
    fip.write("\n")

    zzn = []
    x = []
    xval = []
    y = []
    yval = []
    i = 1

    for item in itemlist:
        compositefilter_kwargs['pointnr'] = item.pointnr
        param = models.GlyphParam.get(**compositefilter_kwargs)

        znamer = re.match('z(\d+)r', param.pointname)

        ix = item.x
        iy = item.y

        im = param.pointname

        if znamer and im == znamer.group(0):
            zzn.append(i)

            if ix is not None:
                ixval = item.x
                x.append("x")
                xval.append(ixval)

            if iy is not None:
                iyval = item.y
                y.append("y")
                yval.append(iyval)

            i += 1

    zzn.sort()
    zeile = ""

    for i in range(len(zzn)):
        zitem = i + 1
        zeile = "ppx" + str(zitem) + "r := " + str(xval[i]) + "u ; " + "ppy" + str(zitem) + "r := " + str(yval[i]) + "u ;"

        fip.write("\n")
        fip.write(zeile)





# reading mid points font B

    fip.write("\n")
    fip.write( """% point coordinates font B""")
    fip.write("\n")

    compositefilter_kwargs = dict(idmaster=master.idmaster, fontsource='B',
                                  glyphname=glyphB.name)
    itemlist = models.GlyphOutline.filter(**compositefilter_kwargs)
    fip.write("\n")

    zzn = []
    x = []
    xval = []
    y = []
    yval = []
    i = 1

    for item in itemlist:
        compositefilter_kwargs['pointnr'] = item.pointnr
        param = models.GlyphParam.get(**compositefilter_kwargs)

        znamer = re.match('z(\d+)r', param.pointname)

        ix = item.x
        iy = item.y

        im = param.pointname

        if znamer and im == znamer.group(0):
            zzn.append(i)

            if ix is not None:
                ixval = item.x
                x.append("x")
                xval.append(ixval)

            if iy is not None:
                iyval = item.y
                y.append("y")
                yval.append(iyval)

            i += 1

    zzn.sort()
    zeile = ""

    for i in range(len(zzn)):
        zitem = i + 1
        zeile = ".5(ppx" + str(zitem) + "l + ppx" + str(zitem) + "r) = x2" + str(zitem) + "A;"
        fip.write(zeile)

        fip.write("\n")
        zeile = ".5(ppy" + str(zitem) + "l + ppy" + str(zitem) + "r) = y2" + str(zitem) + "A;"

        fip.write(zeile)
        fip.write("\n")




# reading fake l and r points Font B ################

    fip.write("\n")
    fip.write("""% fake l and r points Font B""")
    fip.write("\n")

    compositefilter_kwargs = dict(idmaster=master.idmaster, fontsource='B',
                                  glyphname=glyphB.name)
    itemlist = models.GlyphOutline.filter(**compositefilter_kwargs)
    fip.write("\n")

    zzn = []
    x = []
    xval = []
    y = []
    yval = []
    i = 1

    for item in itemlist:
        compositefilter_kwargs['pointnr'] = item.pointnr
        param = models.GlyphParam.get(**compositefilter_kwargs)

        znamer = re.match('z(\d+)r', param.pointname)

        ix = item.x
        iy = item.y

        im = param.pointname

        if znamer and im == znamer.group(0):
            zzn.append(i)

            if ix is not None:
                ixval = item.x
                x.append("x")
                xval.append(ixval)

            if iy is not None:
                iyval = item.y
                y.append("y")
                yval.append(iyval)

            i += 1

    zzn.sort()
    zeile = ""

    for i in range(len(zzn)):
        zitem = i + 1
        zeile = "ppx" + str(zitem) + "l = x" + str(zitem) + "Cl; ppy" + str(zitem) + "l = y" + str(zitem) + "Cl; "
        fip.write(zeile)

        fip.write("\n")
        zeile = "ppx" + str(zitem) + "r = x" + str(zitem) + "Cr; ppy" + str(zitem) + "r = y" + str(zitem) + "Cr; "

        fip.write(zeile)
        fip.write("\n")




# reading pen widths Font B ################

    fip.write("\n")
    fip.write( """% pen width Font B""")
    fip.write("\n")

    compositefilter_kwargs = dict(idmaster=master.idmaster, fontsource='B',
                                  glyphname=glyphB.name)
    itemlist = models.GlyphOutline.filter(**compositefilter_kwargs)
    fip.write("\n")

    zzn = []
    x = []
    xval = []
    y = []
    yval = []
    i = 1

    for item in itemlist:
        compositefilter_kwargs['pointnr'] = item.pointnr
        param = models.GlyphParam.get(**compositefilter_kwargs)

        znamer = re.match('z(\d+)r', param.pointname)

        ix = item.x
        iy = item.y

        im = param.pointname

        if znamer and im == znamer.group(0):
            zzn.append(i)

            if ix is not None:
                ixval = item.x
                x.append("x")
                xval.append(ixval)

            if iy is not None:
                iyval = item.y
                y.append("y")
                yval.append(iyval)

            i += 1

    zzn.sort()
    zeile = ""

    for i in range(len(zzn)):
        zitem = i + 1
        zeile = "dist" + str(zitem) + "B := length (z" + str(zitem) + "Cl - z" + str(zitem) + "Cr); "

        fip.write(zeile)

        fip.write("\n")





# pen angle (A and B, for B we dont need to read from db) ################

    fip.write("\n")
    fip.write( """% pen angle Font A""")
    fip.write("\n")

    compositefilter_kwargs = dict(idmaster=master.idmaster, fontsource='A',
                                  glyphname=glyphA.name)
    itemlist = models.GlyphOutline.filter(**compositefilter_kwargs)
    fip.write("\n")

    zzn = []
    x = []
    xval = []
    y = []
    yval = []
    i = 1

    for item in itemlist:
        compositefilter_kwargs['pointnr'] = item.pointnr
        param = models.GlyphParam.get(**compositefilter_kwargs)

        znamer = re.match('z(\d+)r', param.pointname)

        ix = item.x
        iy = item.y

        im = param.pointname

        if znamer and im == znamer.group(0):
            zzn.append(i)

            if ix is not None:
                ixval = item.x
                x.append("x")
                xval.append(ixval)

            if iy is not None:
                iyval = item.y
                y.append("y")
                yval.append(iyval)

            i += 1

    zzn.sort()
    zeile = ""

    for i in range(len(zzn)):
        zitem = i + 1
        zeile = "ang" + str(zitem) + " := angle ((z" + str(zitem) + "Br + (metapolation * (z" + str(zitem) + "Cr - z" + str(zitem) + "Br))) - (z" + str(zitem) + "Bl + (metapolation * (z" + str(zitem) + "Cl - z" + str(zitem) + "Bl))));"

        fip.write(zeile)

        fip.write("\n")



# reading extra pen angle Font B  ################

    fip.write("\n")
    fip.write("""% test extra pen angle Font B""")

    inattr = 0
    ivn = 0
    strz = ""
    zznb = []  # for font B save zzn

    angle = []
    angleval_B = []
    startp = []
    startpval = []

    compositefilter_kwargs = dict(idmaster=master.idmaster, fontsource='B',
                                  glyphname=glyphB.name)
    itemlist = models.GlyphOutline.filter(**compositefilter_kwargs)

    i = 1
    for item in itemlist:
        compositefilter_kwargs['pointnr'] = item.pointnr
        param = models.GlyphParam.get(**compositefilter_kwargs)

        znamer = re.match('z(\d+)r', param.pointname)
        znamel = re.match('z(\d+)l', param.pointname)
        zname = re.match('z(\d+)l', param.pointname)

        x = item.x
        y = item.y

        im = param.pointname

        istartp = param.startp
        iangle = param.angle

        if znamel and im == znamel.group(0):
            zznb.append(i)
            if istartp is not None:
                istartpval = param.startp
                startp.append("startp")
                startpval.append(istartpval)

            if iangle is not None:
                iangleval = param.angle
                angle.append("angle")
                angleval_B.append(iangleval)
            else:
                angle.append("")
                angleval_B.append(0)

    # passing angleval_B to extra pen angle Font A


    # reading extra pen angle Font A

    fip.write("\n")
    fip.write("""% test extra pen angle Font A""")

    inattr = 0
    ivn = 0
    strz = ""
    zzn = []

    angle = []
    angleval = []
    startp = []
    startpval = []

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

        x = item.x
        y = item.y

        im = param.pointname

        # x and y are attributes of GlyphOutline
        # another attributes are in GlyphParam, so we have to make query
        # to that to get attributes
        istartp = param.startp
        iangle = param.angle

        if znamel and im == znamel.group(0):
            zzn.append(i)
            if istartp is not None:
                istartpval = param.startp
                startp.append("startp")
                startpval.append(istartpval)

            if iangle is not None:
                iangleval = param.angle
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

    if len(zzn) != len(zznb):
        # glyphs in A and B have different set of Z-points, so raise exception
        # to handle this case
        raise DifferentZPointError()

    for i in range(len(zzn)):
        zitem = i + 1

        if angle[i]:
            angleb = angleval_B[i]
            zeile = "ang" + str(zitem) + " := ang" + str(zitem) + "  " + str(angleval[i]) + "+ (metapolation * (" + str(angleb) + " - " + str(angleval[i]) + " ));"
        else:
            zeile = "ang" + str(zitem) + " := ang" + str(zitem) + ";"

        fip.write("\n")
        fip.write(zeile)




# reading font Pen Positions Font B


    fip.write("\n")
    fip.write( """% penposition font B""" )

    inattr= 0
    ivn = 0
    strz = ""
    zzn = []

    penwidth = []
    penwidthval = []
    B_penwidthval = []

    startp = []
    startpval = []

    compositefilter_kwargs = dict(idmaster=master.idmaster, fontsource='B',
                                  glyphname=glyphB.name)
    itemlist = models.GlyphOutline.filter(**compositefilter_kwargs)

    i = 1

    for item in itemlist:
        compositefilter_kwargs['pointnr'] = item.pointnr
        param = models.GlyphParam.get(**compositefilter_kwargs)

        znamer = re.match('z(\d+)r', param.pointname)
        znamel = re.match('z(\d+)l', param.pointname)
        zname = re.match('z(\d+)l', param.pointname)

        x = item.x
        y = item.y

        im = param.pointname

        ipenwidth = param.penwidth
        istartp = param.startp

        if znamel and im == znamel.group(0):
            zzn.append(i)
            if istartp is not None:
                istartpval = param.startp
                startp.append("startp")
                startpval.append(istartpval)

            if ipenwidth is not None :
                ipenwidthval = param.penwidth
                penwidth.append("penwidth")
                B_penwidthval.append(ipenwidthval)
            else:
                penwidth.append("")
                B_penwidthval.append(0)


# when using 4-spaces instead tabs it looks beatiful :)
# any <> must be changed to !=
# any != None must be changed to `is not None`




# reading Pen Positions Font A

    fip.write("\n")
    fip.write( """% penposition font A""" )

    inattr=0
    ivn = 0
    strz = ""
    zzn = []

    stemcutter = []
    stemcutterval = []

    inktrap_l = []
    inktrap_lval = []

    inktrap_r = []
    inktrap_rval = []

    penwidth = []
    penwidthval = []
    A_penwidthval = []

    comp = []
    compval = []
    A_compval = []

    angle = []
    angleval = []

    startp = []
    startpval = []

    compositefilter_kwargs = dict(idmaster=master.idmaster, fontsource='A',
                      glyphname=glyphA.name)
    itemlist = models.GlyphOutline.filter(**compositefilter_kwargs)

    i = 1

    for item in itemlist :
        compositefilter_kwargs['pointnr'] = item.pointnr
        param = models.GlyphParam.get(**compositefilter_kwargs)

        znamer = re.match('z(\d+)r', param.pointname)
        znamel = re.match('z(\d+)l', param.pointname)
        zname = re.match('z(\d+)l', param.pointname)

        x = item.x
        y = item.y

        im = param.pointname

        istemcutter = param.stemcutter
        iinktrap_l = param.inktrap_l
        iinktrap_r = param.inktrap_r
        ipenwidth = param.penwidth
        iangle = param.angle
        istartp = param.startp

#        icomp = param.comp

        # have to check for znamel as it can raise exception when access
        # to group(0)
        if znamel and im == znamel.group(0):
            zzn.append(i)

            if istartp is not None:
                istartpval = param.startp
                startp.append("startp")
                startpval.append(istartpval)

            if istemcutter is not None:
                istemcutterval = param.stemcutter
                stemcutterval.append(istemcutterval)

            if iinktrap_l is not None:
                iinktrap_lval = param.inktrap_l
                inktrap_l.append("inktrap_l")
                inktrap_lval.append(iinktrap_lval)

            if iinktrap_r is not None:
                iinktrap_rval = param.inktrap_r
                iktrap_r.append("inktrapcut")
                inktrap_rval.append(iinktrap_rval)

            if ipenwidth is not None:
                ipenwidthval = param.penwidth
                penwidth.append("penwidth")
                A_penwidthval.append(ipenwidthval)

            else:
                penwidth.append("")
                penwidthval.append(0)

            if iangle is not None:
                iangleval = param.angle
                angle.append("angle")
                angleval.append(iangleval)
            else:
                angle.append("")
                angleval.append(0)

#            if icomp is not None:
#                icompval = param.comp
#                comp.append("comp")
#                compval.append(icompval)
            i += 1

    zzn.sort()
    zeile =""
    zeileend =""
    semi = ";"
    close = ")"

    for i in range(len(zzn)):
        zitem = i + 1

        if penwidth[i]:
            zeile = """penpos"""  +str(zitem) + "((" + str(A_penwidthval[i]) +" + metapolation * (" + str(B_penwidthval[i]) + " - " + str(A_penwidthval[i]) + ")) * " + "(dist" +str(zitem) + " + (A_px + metapolation * (B_px - A_px)) + ((A_skeleton/50 + metapolation * (B_skeleton/50-A_skeleton/50)) * dist" +str(zitem) + "))"
        else :
            zeile = """penpos"""  +str(zitem) + "(dist" +str(zitem) + " + (A_px + metapolation * (B_px - A_px)) + ((A_skeleton/50 + metapolation * (B_skeleton/50-A_skeleton/50)) * dist" +str(zitem) + ")"

#        if stemcutter[i]:
#        zeile = zeile + "-" + stemcutter[i] + "(" +  str(stemcutterval[i]) + ")"

#    if inktrap_l[i]:
#        zeile = zeile + "- inktrapcut (" +  str(inktrap_lval[i]) + ")"

#    if inktrap_r[i]:
#        zeile = zeile + "- inktrapcut (" +  str(inktrap_rval[i]) + ")"

#    else:
#        zeile = zeile

        zeile = zeile + ", ang" +str(zitem) + ");"
        fip.write("\n")
        fip.write( zeile)




# testing new center points

    fip.write("\n")
    fip.write( """% test new center (z) points""" )

    mean = ['13','14','26','29','65','67','69','77','78','79','82','83','85','86','87','88','90','94','95','12','27','63','71','80','81','89','2','7','11','28','30','62','64','66','68','70','72','73','75','76','84','4','8','9','15','59','60','61','74','91','92','93']
#des = ['12','27','63','71','80','81','89']
#asc = ['2','7','11','28','30','62','64','66','68','70','72','73','75','76','84']
    cap = ['1','3','5','6','10','16','17','18','19','20','21','22','23','24','25','31','32','33','34','35','36','37','38','39','40','41','42','43','44','45','46','47','48','49','50','51','52','53','54','55','56','57','58']
#box = ['4','8','9','15','59','60','61','74','91','92','93']

    ggroup=""
    gggroup =""

    if g in mean:
        ggroup = 'xheight'
        gggroup = 'mean'

    if g in cap:
        ggroup = 'capital'
        gggroup = 'cap'

    inattr=0
    ivn = 0
    strz = ""
    zzn = []
    startp = []
    startpval = []

    pointshifted= []
    pointshiftedval= []

    pointshiftedy = []
    pointshiftedyval = []

    overx = []
    overxval = []

    overbase = []
    overbaseval = []

    overcap = []
    overcapval = []

    inktrap_l = []
    inktrap_lval = []

    inktrap_r = []
    inktrap_rval = []

    stemshift = []
    stemshiftval = []

    ascpoint = []
    ascpointval = []

    descpoint = []
    descpointval = []

    compositefilter_kwargs = dict(idmaster=master.idmaster, fontsource='A',
                                  glyphname=glyphA.name)
    itemlist = models.GlyphOutline.filter(**compositefilter_kwargs)

    i = 1

# search for parameters

    for item in itemlist :
        compositefilter_kwargs['pointnr'] = item.pointnr
        param = models.GlyphParam.get(**compositefilter_kwargs)

        znamer = re.match('z(\d+)r', param.pointname)
        znamel = re.match('z(\d+)l', param.pointname)
        zname = re.match('z(\d+)l', param.pointname)

        x = item.x
        y = item.y

        im = param.pointname

        ipointshifted = param.pointshifted
 #       ipointshiftedy = param.pointshiftedy
        istartp = param.startp
        ioverx = param.overx
        ioverbase = param.overbase
        iovercap = param.overcap
        iinktrap_l = param.inktrap_l
        iinktrap_r = param.inktrap_r
        istemshift = param.stemshift
        iascpoint = param.ascpoint
        idescpoint = param.descpoint

        if znamel and im == znamel.group(0):
            zzn.append(i)

        # do not delete that lines while you are sure
#       if im == znamel or im == znamer:

            if istartp is not None:
                istartpval = param.startp
                startp.append("startp")
                startpval.append(istartpval)

            if ipointshifted is not None:
                ipointshiftedval= param.pointshifted
                pointshifted.append("shifted")
                pointshiftedval.append(ipointshiftedval)
            else:
                pointshifted.append("")
                pointshiftedval.append(0)

#       if ipointshiftedy is not None:
#           ipointshiftedyval = param.pointshiftedy
#           pointshiftedy.append("shifted")
#           pointshiftedyval.append(ipointshiftedyval)

            if ioverx is not None:
                ioverxval = param.overx
                overx.append("shifted")
                overxval.append(ioverxval)

            if ioverx is not None:
                ioverxval = param.overx
                overx.append("shifted")
                overxval.append(ioverxval)

            if ioverbase is not None:
                ioverbaseval = param.overbase
                overbase.append("shifted")
                overbaseval.append(ioverbaseval)

            if iovercap is not None:
                iovercapval = param.overcap
                overcap.append("shifted")
                overcapval.append(iovercapval)

#       if iinktrap_l != None :
#       iinktrap_lval = param.inktrap_l
#       inktrap_l.append("inktrapcut")
#       inktrap_lval.append(iinktrap_lval)
#
#       if iinktrap_r is not None:
#       iinktrap_rval = param.inktrap_r
#       inktrap_r.append("inktrapcut")
#       inktrap_rval.append(iinktrap_rval)

#       if istemshift is not None:
#       istemshiftval = param.stemshift
#       stemshift.append("stemshift")
#       stemshiftval.append(istemshiftval)

            if iascpoint is not None:
                iascpointval = param.ascpoint
                ascpoint.append("ascpoint")
                ascpointval.append(iascpointval)
            else:
                ascpoint.append("")
                ascpointval.append(0)

            if idescpoint is not None:
                idescpointval = param.descpoint
                descpoint.append("descpoint")
                descpointval.append(idescpointval)

            i += 1

#   nnz = 0
#   for zitem in zzn :
#     nnz = nnz +1

    zzn.sort()
    zeile =""
    zeileend =""
    semi = ";"
    close = ")"

    for i in range(len(zzn)):
        zitem = i + 1

     #   zitemb = zzn[i]
     #   zitemc = zzn[i-1]

## default string

#     zeile =""

    if ascpoint[i]:

        zeile = "z"+str(zitem)+ "=((A_width + metapolation * (B_width - A_width)) * (x2"+ str(zitem)+ "0 + metapolation * (x2"+str(zitem)+"A - x2" +str(zitem)+"0) + spacing_" + g + "L) * width_" + g + ", (y2" +str(zitem)+ "0 + metapolation *(y2"+str(zitem)+ "A - y2" +str(zitem)+ "0))*((A_ascender + metapolation * (B_ascender - A_ascender)) / asc#))"

#        if descpoint[i]:

#       zeile = "z"+str(zitem)+ "=((A_width + metapolation * (B_width - A_width)) * (x2"+ str(zitem)+ "0 + metapolation * (x2"+str(zitem)+"A - x2" +str(zitem)+"0) + spacing_" + g + "L) * width_" + g + ", (y2" +str(zitem)+ "0 + metapolation *(y2"+str(zitem)+ "A - y2" +str(zitem)+ "0))*((A_descender + metapolation * (B_descender - A_descender)) / desc#))"

    else :
        zeile = "z"+str(zitem)+ "=((A_width + metapolation * (B_width - A_width)) * (x2"+ str(zitem)+ "0 + metapolation * (x2"+str(zitem)+"A - x2" +str(zitem)+"0) + spacing_" + g + "L) * width_" + g + ", (y2" +str(zitem)+ "0 + metapolation *(y2"+str(zitem)+ "A - y2" +str(zitem)+ "0))*((A_" + ggroup + " + metapolation * (B_" +ggroup + " - A_" + ggroup + ")) / " + gggroup + "#))"

    if pointshifted[i]:
        zeile = zeile +" shifted (" + str(pointshiftedval[i]) + ")"
#       if stemshift[i]:
#           zeile = zeile +" stemshift (" + str(stemshiftval[i]) + ")"
#       if inktrap_l[i]:
#           zeile = zeile +" inktrap_l (" + str(inktrap_lval[i]) + ")"
#       if inktrap_r[i]:
#           zeile = zeile +" inktrap_r (" + str(inktrap_rval[i]) + ")"

    else:
        zeile = zeile
    zeile = zeile + semi
    fip.write("\n")
    fip.write( zeile)





# reading penstrokes font B

    inattr=0
    ivn = 0
    stre = " ... "
    strtwo = " .. "
    stline = " -- "
    strz = ""
    zzn = []

    startp = []
    startpval = []

    doubledash = []
    doubledashvalB = []

    tripledash = []
    tripledashvalB = []

    tension = []
    tensionB = []
    tensionvalB = []

    tensionand = []
    tensionandB = []
    tensionandvalB = []
    tensionandval2B = []

    superright = []
    superrightvalB = []

    superleft = []
    superleftvalB = []

    dir = []
    dirB = []
    dirvalB = []

    dir2 = []
    dir2B = []
    dir2valB = []

    leftp = []
    leftpvalB = []

    rightp = []
    rightpvalB = []

    upp = []
    uppvalB = []

    downp = []
    downpvalB = []

    penshifted = []
    penshiftedvalB = []

    compositefilter_kwargs = dict(idmaster=master.idmaster, fontsource='A', glyphname=glyphA.name)
    itemlist = models.GlyphOutline.filter(**compositefilter_kwargs)

    i = 1

    for item in itemlist :
        compositefilter_kwargs['pointnr'] = item.pointnr
        param = models.GlyphParam.get(**compositefilter_kwargs)

        znamer = re.match('z(\d+)r', param.pointname)
        znamel = re.match('z(\d+)l', param.pointname)
        zname = re.match('z(\d+)l', param.pointname)

        x = item.x
        y = item.y

        im = param.pointname

        idoubledash = param.doubledash
        itripledash = param.tripledash
        idir = param.dir
        idir2 = param.dir2
        ileftp = param.leftp
        iupp = param.upp
        irightp = param.rightp
        idownp = param.downp
        itension = param.tension
        itensionand = param.tensionand
        isuperright = param.superright
        isuperleft = param.superleft
        ipenshifted = param.penshifted

        if znamel and im == znamel.group(0):
            zzn.append(i)

        # do not delete that lines while you are sure
#        if im == znamel or im == znamer:

            if idoubledash is not None:
                idoubledashval = param.doubledash
                doubledash.append("doubledash")
                doubledashvalB.append(idoubledashval)

            if itripledash is not None:
                itripledashval = param.tripledash
                tripledash.append(" ---")
                tripledashvalB.append(itripledashval)

            if idir is not None:
                idirval = param.dir
                dirB.append("dir")
                dirvalB.append(idirval)

            if idir2 is not None:
                idir2val = param.dir2
                dir2B.append("dir")
                dir2valB.append(idir2val)

            if iupp is not None:
                iuppval = param.upp
                upp.append("up")
                uppvalB.append(iuppval)

            if ileftp is not None:
                ileftpval = param.leftp
                leftp.append("left")
                leftpvalB.append(ileftpval)

            if irightp is not None:
                irightpval = param.rightp
                rightp.append("right")
                rightpvalB.append(irightpval)

            if idownp is not None:
                idownpval = param.downp
                downp.append("down")
                downpvalB.append(idownpval)

            if itension is not None:
                itensionval = param.tension
                tensionB.append("tension")
                tensionvalB.append(itensionval)

            if itensionand is not None:
                itensionandval = param.tensionand
                tensionandB.append("tensionand")
                tensionandvalB.append(itensionandval[:3])
                tensionandval2B.append(itensionandval[-3:])

            if isuperright is not None:
                isuperrightval = param.superright
                superright.append("superright")
                superrightvalB.append(isuperrightval)

            if isuperleft is not None:
                isuperleftval = param.superleft
                superleft.append("superleft")
                superleftvalB.append(isuperleftval)

            if idir is not None:
                idirval = param.dir
                dir.append("dir")
                dirvalB.append(idirval)

            if ipenshifted is not None:
                ipenshiftedval = param.penshifted
                penshifted.append("shifted")
                penshiftedvalB.append(ipenshiftedval)




# reading font penstrokes Font A

    fip.write("\n")
    fip.write( """% penstrokes""")

    inattr=0
    ivn = 0
    stre = " ... "
    tripledash = "---"
    strtwo = " .. "
    stline = " -- "
    strz = ""
    zzn = []
    startp = []
    startpval = []

    doubledash = []
    doubledashval = []

    tripledash = []
    tripledashval = []

    tension = []
    tensionval = []

    tensionand = []
    tensionandval = []
    tensionandval2 = []

    superright = []
    superrightval = []

    superleft = []
    superleftval = []

    dir = []
    dirval = []

    leftp = []
    leftpval = []

    rightp = []
    rightpval = []

    upp = []
    uppval = []

    downp = []
    downpval = []

    dir2 = []
    dir2val = []

    leftp2 = []
    leftp2val = []

    rightp2 = []
    rightp2val = []

    upp2 = []
    upp2val = []

    downp2= []
    downp2val = []

    penshifted = []
    penshiftedval = []

    overx = []
    overxval = []

    overbase = []
    overbaseval = []

    overcap = []
    overcapval = []

    overasc = []
    overascval = []

    overdesc = []
    overdescval = []

    cycle = []
    cycleval = []

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

        x = item.x
        y = item.y

        im = param.pointname

        istartp = param.startp
        idoubledash = param.doubledash
        itripledash = param.tripledash
        idir = param.dir
        idir2 = param.dir2
        ileftp = param.leftp
        ileftp2 = param.leftp2
        iupp = param.upp
        iupp2 = param.upp2
        irightp = param.rightp
        irightp2 = param.rightp2
        idownp = param.downp
        idownp2 = param.downp2
        itension = param.tension
        itensionand = param.tensionand
        isuperright = param.superright
        isuperleft = param.superleft
        ipenshifted = param.penshifted
        ioverx = param.overx
        ioverbase = param.overbase
        iovercap = param.overcap
        ioverasc = param.overasc
        ioverdesc = param.overdesc
        icycle = param.cycle

        if znamel and im == znamel.group(0):
            zzn.append(i)

        # do not delete that lines while you are sure
#        if im == znamel or im == znamer:

            if istartp is not None :
                istartpval = param.startp
                startp.append("penstroke ")
                startpval.append(istartpval)
            else:
                startp.append("")
                startpval.append(0)

            if icycle is not None :
                icycleval = param.cycle
                cycle.append("cycle")
                cycleval.append(icycleval)
            else :
                cycle.append("")
                cycleval.append(0)

            if idoubledash is not None :
                idoubledashval = param.doubledash
                doubledash.append(" -- ")
                doubledashval.append(idoubledashval)
            else :
                doubledash.append("")
                doubledashval.append(0)

            if itripledash is not None :
                itripledashval = param.tripledash
                tripledash.append(" ---")
                tripledashval.append(itripledashval)
            else:
                tripledash.append("")
                tripledashval.append(0)

            if idir is not None :
                idirval = param.dir
                dir.append("dir")
                dirval.append(idirval)
            else :
                dir.append("")
                dirval.append(0)

            if idir2 is not None :
                idir2val = param.dir2
                dir2.append("dir")
                dir2val.append(idir2val)
            else :
                dir2.append("")
                dir2val.append(0)

            if iupp is not None :
                iuppval = param.upp
                upp.append("{up} ")
                uppval.append(iuppval)
            else :
                upp.append("")
                uppval.append(0)

            if ileftp is not None :
                ileftpval = param.leftp
                leftp.append("{left} ")
                leftpval.append(ileftpval)
            else:
                leftp.append("")
                leftp.append(0)

            if irightp is not None :
                irightpval = param.rightp
                rightp.append("{right} ")
                rightpval.append(irightpval)
            else :
                rightp.append("")
                rightpval.append(0)

            if idownp is not None :
                idownpval = param.downp
                downp.append(" {down} ")
                downpval.append(idownpval)
            else :
                downp.append("")
                downpval.append(0)

            if idownp2 is not None :
                idownp2val = param.downp2
                downp2.append(" {down} ")
                downp2val.append(idownp2val)
            else :
                downp2.append("")
                downp2val.append(0)

            if iupp2 is not None :
                iupp2val = param.upp2
                upp2.append("{up} ")
                upp2val.append(iupp2val)
            else :
                upp2.append("")
                upp2val.append(0)


            if ileftp2 is not None :
                ileftp2val = param.leftp2
                leftp2.append("{left} ")
                leftp2val.append(ileftp2val)
            else :
                leftp2.append("")
                leftp2val.append(0)

            if irightp2 is not None :
                irightp2val = param.rightp2
                rightp2.append("{right} ")
                rightp2val.append(irightp2val)
            else :
                rightp2.append("")
                rightp2val.append(0)


            if itension is not None :
                itensionval = param.tension
                tension.append("tension")
                tensionval.append(itensionval)
            else :
                tension.append("")
                tensionval.append(0)

            if itensionand is not None :
                itensionandval = param.tensionand
                tensionand.append("tensionand")
                tensionandval.append(itensionandval[:3])
                tensionandval2.append(itensionandval[-3:])
            else :
                tensionand.append("")
                tensionandval.append(0)

            if isuperright is not None :
                isuperrightval = param.superright
                superright.append("super_qr")
                superrightval.append(isuperrightval)
            else :
                superright.append("")
                superrightval.append(0)

            if isuperleft is not None :
                isuperleftval = param.superleft
                superleft.append("super_ql")
                superleftval.append(isuperleftval)
            else :
                superleft.append("")
                superleftval.append(0)

            if idir is not None :
                idirval = param.dir
                dir.append("dir")
                dirval.append(idirval)
            else :
                dir.append("")
                dirval.append(0)

            if ipenshifted is not None :
                ipenshiftedval = param.penshifted
                penshifted.append("shifted")
                penshiftedval.append(ipenshiftedval)
            else :
                penshifted.append("")
                penshiftedval.append(0)

            if ioverx is not None :
                ioverxval = param.overx
                overx.append("shifted")
                overxval.append(ioverxval)
            else :
                overx.append("")
                overxval.append(0)


            if ioverbase is not None :
                ioverbaseval = param.overbase
                overbase.append("shifted")
                overbaseval.append(ioverbaseval)
            else :
                overbase.append("")
                overbaseval.append(0)


            if iovercap is not None :
                iovercapval = param.overcap
                overcap.append("shifted")
                overcapval.append(iovercapval)
            else :
                overcap.append("")
                overcapval.append(0)


            if ioverasc is not None :
                ioverascval = param.overasc
                overasc.append("shifted")
                overascval.append(ioverascval)
            else :
                overasc.append("")
                overascval.append(0)

            if ioverdesc is not None :
                ioverdescval = param.overdesc
                overdesc.append("shifted")
                overdescval.append(ioverdescval)
            else :
                overdesc.append("")
                overdescval.append(0)

            i += 1

    zzn.sort()
    zeile = ""
    semi = ";"

    fip.write('\n')
    for i in range(len(zzn) - 1):
        zitem = zzn[i]
        zitemsuper = zzn[i + 1]
        # zitemc = zzn[i - 1]

## default string

        zeile = str(startp[i]) + "z" + str(zitem) + "e"
        # zeileb = ""
        # zeileb = str(startp[i])
        # zeilec = ""

        # zeilec = str(startp[i]) + "z"+str(zitem)+"e"
        if startp[i + 1] == "":
# if startp, add parameters

            dash = " ... "
            if tripledash[i] != "":
                dash = " --- "
            else:
                if doubledash[i] != "":
                    dash = " -- "
                elif tension[i] != "":
                    dash = ""
                elif tensionand[i] != "":
                    dash = ""
                elif superleft[i] != "":
                    dash = ""
                elif superright[i] != "":
                    dash = ""
                elif dir2[i] != "":
                    dash = ""
                elif upp2[i] != "":
                    dash = ""
                elif downp2[i] != "":
                    dash = ""
                elif rightp2[i] != "":
                    dash = ""
                elif leftp2[i] != "":
                    dash = ""

                if penshifted[i] != "":
                    zeile += " shifted (" + str(penshiftedval[i]) + ")"

                if overx[i] != "":
                    zeile += " shifted (0, (A_xheight*pt + metapolation * (B_xheight*pt - A_xheight*pt)) - " + str(overxval[i]) + ") + (0, A_over + metapolation * (B_over - A_over))"

                if overbase[i] != "":
                    zeile += " shifted (0, - " + str(overbaseval[i]) + ") - (0, A_over + metapolation * (B_over - A_over))"

                if overcap[i] != "":
                    zeile += " shifted (0, (A_capital*pt + metapolation * (B_capital*pt - A_capital*pt)) - " + str(overcapval[i]) + ") + (0, A_over + metapolation * (B_over - A_over))"

                if overasc[i] != "":
                    zeile += " shifted (0, (A_ascender*pt + metapolation * (B_ascender*pt - A_ascender*pt )) - " + str(overascval[i]) + ") + (0, A_over + metapolation * (B_over - A_over))"

                if overdesc[i] != "":
                    zeile += " shifted (0, (A_descender*pt + metapolation * (B_descender*pt  - A_descender*pt )) - " + str(overdescval[i]) + ") - (0, A_over + metapolation * (B_over - A_over))"

                # if penshiftedy[i] != "":
                #     zeile += " shifted (0, y" + str(penshiftedyval[i]) + ")"

                if superleft[i] != "":
                    zeile += strtwo + superleft[i] + "(" + str(zitem) + "e," + str(zitemsuper) + "e, [" + str(superleftval[i]) + '+ (metapolation * (' + str(superleftvalB[i]) + '-' + str(superleftval[i]) + '))])' + strtwo

                if superright[i] != "":
                    zeile += strtwo + superright[i] + "(" + str(zitem) + "e," + str(zitemsuper) + "e, [" + str(superrightval[i]) + '+ (metapolation * (' + str(superrightvalB[i]) + '-' + str(superrightval[i]) + '))])' + strtwo

                if upp[i] != "":
                    zeile += "{up}"

                if downp[i] != "":
                    zeile += "{down}"

                if leftp[i] != "":
                    zeile += "{left}"

                if rightp[i] != "":
                    zeile += "{right}"

                if dir[i] != "":
                    zeile += " {dir (" + str(dirval[i]) + " + metapolation * (" + str(dirvalB[i]) + " - " + str(dirval[i]) + "))}"

                if tension[i] != "" and leftp2[i] != "":
                    if tensionB[i] != "":
                        zeile += strtwo + "tension" + " (" + str(tensionval[i]) + '/100 + (metapolation * (' + str(tensionvalB[i]) + '/100 -' + str(tensionval[i]) + '/100 )))' + strtwo + "{left}"
                    else:
                        zeile += strtwo + "tension" + " (" + str(tensionval[i]) + '/100 + (metapolation * (' + str(tensionval[i]) + '/100 -' + str(tensionval[i]) + '/100 )))' + strtwo + "{left}"

                # tabs here
                if tensionand[i] != "" and downp2[i] != "":
                    if tensionandB[i] != "":
                        zeile += strtwo + "tension" + " ((" + str(tensionandval[i]) + '/100) + (metapolation * ((' + str(tensionandvalB[i]) + '/100) - (' + str(tensionandval[i]) + '/100))))' + " and ((" + str(tensionandval2[i]) + '/100) + (metapolation * ((' + str(tensionandval2B[i]) + '/100) - (' + str(tensionandval2[i]) + '/100))))' + strtwo + "{down}"
                    else:
                        zeile += strtwo + "tension" + " ((" + str(tensionandval[i]) + '/100) + (metapolation * ((' + str(tensionandval[i]) + '/100) - (' + str(tensionandval[i]) + '/100))))' + " and ((" + str(tensionandval2[i]) + '/100) + (metapolation * ((' + str(tensionandval2[i]) + '/100) - (' + str(tensionandval2[i]) + '/100))))' + strtwo + "{down}"
                else:
                    if downp2[i] != "":
                        zeile = zeile + ' ... ' + downp2[i]
                    else:
                        zeile = zeile

                        ## tension and upp2

                        if tension[i] != "" and upp2[i] != "":
                            if tensionB[i] != "":
                                zeile = zeile + strtwo + "tension" + " (" + str(tensionval[i]) + '/100 + (metapolation * (' + str(tensionvalB[i]) + '/100 -' + str(tensionval[i]) + '/100 )))' + strtwo + "{up}"
                            else:
                                zeile = zeile + strtwo + "tension" + " (" + str(tensionval[i]) + '/100 + (metapolation * (' + str(tensionval[i]) + '/100 -' + str(tensionval[i]) + '/100 )))' + strtwo + "{up}"

                        if tensionand[i] != "" and upp2[i] != "":
                            if tensionandB[i] != "":
                                zeile = zeile + strtwo + "tension" + " ((" + str(tensionandval[i]) + '/100) + (metapolation * ((' + str(tensionandvalB[i]) + '/100) - (' + str(tensionandval[i]) + '/100))))' + " and ((" + str(tensionandval2[i]) + '/100) + (metapolation * ((' + str(tensionandval2B[i]) + '/100) - (' + str(tensionandval2[i]) + '/100))))' + strtwo + "{up}"
                            else:
                                zeile = zeile + strtwo + "tension" + " ((" + str(tensionandval[i]) + '/100) + (metapolation * ((' + str(tensionandval[i]) + '/100) - (' + str(tensionandval[i]) + '/100))))' + " and ((" + str(tensionandval2[i]) + '/100) + (metapolation * ((' + str(tensionandval2[i]) + '/100) - (' + str(tensionandval2[i]) + '/100))))' + strtwo + "{up}"
                        else:
                            if upp2[i] != "":
                                zeile += ' ... ' + upp2[i]
                            else:
                                ## tension and dir2
                                if tension[i] != "" and dir2[i] != "":
                                    zeile += strtwo + "tension" + " (" + str(tensionval[i]) + '/100 + (metapolation * (' + str(tensionvalB[i]) + '/100 -' + str(tensionval[i]) + '/100 )))' + strtwo + " {dir (" + str(dir2val[i]) + " + metapolation * (" + str(dir2valB[i]) + " - " + str(dir2val[i]) + "))}"

                                if tensionand[i] != "" and dir2[i] != "":
                                    zeile += strtwo + "tension" + " ((" + str(tensionandval[i]) + '/100) + (metapolation * ((' + str(tensionandvalB[i]) + '/100) - (' + str(tensionandval[i]) + '/100))))' + " and ((" + str(tensionandval2[i]) + '/100) + (metapolation * ((' + str(tensionandval2B[i]) + '/100) - (' + str(tensionandval2[i]) + '/100))))' + strtwo + " {dir (" + str(dir2val[i]) + " + metapolation * (" + str(dir2valB[i]) + " - " + str(dir2val[i]) + "))}"
                                else:
                                    if dir2[i] != "":
                                        zeile += " ... {dir (" + str(dir2val[i]) + " + metapolation * (" + str(dir2valB[i]) + " - " + str(dir2val[i]) + "))}"
                                    else:
                                        if tension[i] != "":
                                            zeile += strtwo + "tension" + " (" + str(tensionval[i]) + '/100 + (metapolation * (' + str(tensionvalB[i]) + '/100 -' + str(tensionval[i]) + '/100 )))' + strtwo
                                        elif tensionand[i] != "":
                                            zeile += strtwo + "tension" + " ((" + str(tensionandval[i]) + '/100) + (metapolation * ((' + str(tensionandvalB[i]) + '/100) - (' + str(tensionandval[i]) + '/100))))' + " and ((" + str(tensionandval2[i]) + '/100) + (metapolation * ((' + str(tensionandval2B[i]) + '/100) - (' + str(tensionandval2[i]) + '/100))))' + strtwo

            zeile += dash
        else:
            zeile += semi + '\n'

        # fip.write("\n")
        fip.write(zeile)

        zitemb = zzn[i + 1]
        zeile = "z" + str(zitemb) + "e"

    fip.write(zeile + semi)

## default string
        # dash = "... "

        # if startp[i]:
        #     zeile = "penstroke " +  "z" + str(zitem) + "e " + dash
        # else :
        #     zeile = "z" + str(zitem) + "e " + dash

        # fip.write( zeile )

#       rule should be:
#       if last 'zitem' OR 'zitem' before 'penstroke', write 'semiocolon' instead of '...''
#
#       to get:
#       penstroke z1e ... z2e ... z3e ... z4e ... z5e ; penstroke z6e ... z7e ... z8e ... z9e ;

    return fip
