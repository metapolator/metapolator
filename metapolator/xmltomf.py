import os
import os.path as op
import re
import web

import models


def set_value_for_index(index, primary, *args):

    for arg in list(args):
        try:
            arg[index]
        except IndexError:
            arg[index] = primary[index]


class DifferentZPointError(Exception):
    pass


def xmltomf1(master, glyphA, glyphB=None, glyphC=None, glyphD=None, stdout_fip=None, interpolated=False):
    """ Save current points to mf file

        master is an instance of models.Master
        glyph is an instance of models.Glyph
    """

#    if session.get('mfparser', '') == 'controlpoints':
#        import xmltomf_new
#        return xmltomf_new.xmltomf1(master, glyphA, glyphB=glyphB,
#                                    stdout_fip=stdout_fip)

    if master.project.mfparser == 'controlpoints':
        import xmltomf_new
        return xmltomf_new.xmltomf1(master, glyphA, glyphB=glyphB, glyphC=glyphC, glyphD=glyphD,
                                    stdout_fip=stdout_fip)

    import time

    starttime = time.time()

    if not glyphB:
        glyphB = glyphA

    if not glyphC:
        glyphC = glyphA

    if not glyphD:
        glyphD = glyphA

    if not stdout_fip:
        glyphsdir = "metaglyphs" if interpolated else "glyphs"
        path = op.join(master.get_fonts_directory(), glyphsdir)
        if not op.exists(path):
            os.makedirs(path)
        fip = open(op.join(path, '%s.mf' % glyphA.name), 'w')
    else:
        fip = stdout_fip

    fip.write("% File parsed with Metapolator %\n")
    
    wA = '%.2f' % (glyphA.width / 100.)
    wB = '%.2f' % (glyphB.width / 100.)
    wC = '%.2f' % (glyphC.width / 100.)
    wD = '%.2f' % (glyphD.width / 100.)

    wA_new = '%.2f' % (glyphA.width_new / 100.)
    wB_new = '%.2f' % (glyphB.width_new / 100.)
    wC_new = '%.2f' % (glyphC.width_new / 100.)
    wD_new = '%.2f' % (glyphD.width_new / 100.)

#    w = str(glyphA.width / 100)
#    w2 = str(glyphB.width / 100)
    g = glyphA.name  # get from glyphA as we sure that glypha and glyphb exist in font project

    fip.write("\n")
    print 'width A -', wA
    print 'width B -', wB
    print 'width C -', wC
    print 'width D -', wD

    str_ = ('beginfontchar({glyph}, (((({Awidth}*A_width + metapolation * ({Bwidth}*B_width - {Awidth}*A_width)) + ({Cwidth}*C_width + metapolationCD * ({Dwidth}*D_width - {Cwidth}*C_width))  ) /divider ) + spacing_{glyph}R) * width_{glyph}, 0, 0 );')
    fip.write(str_.format(Awidth=wA, glyph=glyphA.name, Bwidth=wB, Cwidth=wC, Dwidth=wD))

    fip.write("\n")
    fip.write("""currenttransform := identity slanted slant;
                 italcorr slant - .5u#;""")

    # point coordinates font A ################

    fip.write("\n")
    fip.write("""% point coordinates font A""")
    fip.write("\n")

    query = web.ctx.orm.query(models.GlyphOutline, models.GlyphParam)
    query = query.filter(models.GlyphOutline.glyph_id == glyphA.id)
    query = query.filter(models.GlyphParam.glyphoutline_id == models.GlyphOutline.id)
    fonta_outlines = list(query)

    query = web.ctx.orm.query(models.GlyphOutline, models.GlyphParam)
    query = query.filter(models.GlyphOutline.glyph_id == glyphB.id)
    query = query.filter(models.GlyphParam.glyphoutline_id == models.GlyphOutline.id)
    fontb_outlines = list(query)

    query = web.ctx.orm.query(models.GlyphOutline, models.GlyphParam)
    query = query.filter(models.GlyphOutline.glyph_id == glyphC.id)
    query = query.filter(models.GlyphParam.glyphoutline_id == models.GlyphOutline.id)
    fontc_outlines = list(query)

    query = web.ctx.orm.query(models.GlyphOutline, models.GlyphParam)
    query = query.filter(models.GlyphOutline.glyph_id == glyphD.id)
    query = query.filter(models.GlyphParam.glyphoutline_id == models.GlyphOutline.id)
    fontd_outlines = list(query)


    for item, param in fonta_outlines:

        znamel = re.match('z(\d+)l', param.pointname)
        znamer = re.match('z(\d+)r', param.pointname)
        zeile = None
        if znamel and param.pointname == znamel.group(0):
            zeile = "Apx{index}l := {xvalue}u ; Apy{index}l := {yvalue}u ;"
            zeile = zeile.format(index=znamel.group(1),
                                 xvalue='%.2f' % (item.x / 100.),
                                 yvalue='%.2f' % (item.y / 100.))

        if znamer and param.pointname == znamer.group(0):
            zeile = "Apx{index}r := {xvalue}u ; Apy{index}r := {yvalue}u ;"
            zeile = zeile.format(index=znamer.group(1),
                                 xvalue='%.2f' % (item.x / 100.),
                                 yvalue='%.2f' % (item.y / 100.))

        if zeile:
            fip.write("\n")
            fip.write(zeile)

    # reading mid points font A

    fip.write("\n")
    fip.write("""% mid points font A""")
    fip.write("\n\n")

    index = 1
    for item, param in fonta_outlines:

        znamer = re.match('z(\d+)r', param.pointname)

        if znamer and param.pointname == znamer.group(0):
            zeile = ".5(Apx{0}l + Apx{0}r) = x{0}A;".format(index)
            fip.write(zeile + '\n')

            zeile = ".5(Apy{0}l + Apy{0}r) = y{0}A;".format(index)
            fip.write(zeile + '\n')

            index += 1

    fip.write("\n")
    fip.write("""%  extra points font A""")
    fip.write("\n\n")

    index = 1
    for item, param in fonta_outlines:
        znamer = re.match('z(\d+)r', param.pointname)

        if znamer and param.pointname == znamer.group(0):
            zeile = "Apx{0}l = x{0}Al; Apy{0}l = y{0}Al;".format(index)
            fip.write(zeile + '\n')

            zeile = "Apx{0}r = x{0}Ar; Apy{0}r = y{0}Ar;".format(index)
            fip.write(zeile + '\n')

            index += 1

    # reading pen widths Font A ################

    fip.write("\n")
    fip.write("""% pen widhts Font A """)
    fip.write("\n\n")

    index = 1

    for item, param in fonta_outlines:
        znamer = re.match('z(\d+)r', param.pointname)

        if znamer and param.pointname == znamer.group(0):
            zeile = "dist{0}A := length (z{0}Al-z{0}Ar);".format(index)
            fip.write(zeile + '\n')

            index += 1

# point coordinates font B ################

    fip.write("\n")
    fip.write("""% point coordinates font B""")
    fip.write("\n")

# points for l

    for item, param in fontb_outlines:
        znamel = re.match('z(\d+)l', param.pointname)
        znamer = re.match('z(\d+)r', param.pointname)
        zeile = None
        if znamel and param.pointname == znamel.group(0):
            zeile = "Bpx{index}l := {xvalue}u ; Bpy{index}l := {yvalue}u ;"
            zeile = zeile.format(index=znamel.group(1),
                                 xvalue='%.2f' % (item.x / 100.),
                                 yvalue='%.2f' % (item.y / 100.))

        if znamer and param.pointname == znamer.group(0):
            zeile = "Bpx{index}r := {xvalue}u ; Bpy{index}r := {yvalue}u ;"
            zeile = zeile.format(index=znamer.group(1),
                                 xvalue='%.2f' % (item.x / 100.),
                                 yvalue='%.2f' % (item.y / 100.))

        if zeile:
            fip.write("\n")
            fip.write(zeile)

# point coordinates font C ################

    fip.write("\n")
    fip.write("""% point coordinates font C""")
    fip.write("\n")

# points for l

    for item, param in fontc_outlines:
        znamel = re.match('z(\d+)l', param.pointname)
        znamer = re.match('z(\d+)r', param.pointname)
        zeile = None
        if znamel and param.pointname == znamel.group(0):
            zeile = "Cpx{index}l := {xvalue}u ; Cpy{index}l := {yvalue}u ;"
            zeile = zeile.format(index=znamel.group(1),
                                 xvalue='%.2f' % (item.x / 100.),
                                 yvalue='%.2f' % (item.y / 100.))

        if znamer and param.pointname == znamer.group(0):
            zeile = "Cpx{index}r := {xvalue}u ; Cpy{index}r := {yvalue}u ;"
            zeile = zeile.format(index=znamer.group(1),
                                 xvalue='%.2f' % (item.x / 100.),
                                 yvalue='%.2f' % (item.y / 100.))

        if zeile:
            fip.write("\n")
            fip.write(zeile)

# point coordinates font D ################

    fip.write("\n")
    fip.write("""% point coordinates font D""")
    fip.write("\n")

# points for l and r

    for item, param in fontd_outlines:
        znamel = re.match('z(\d+)l', param.pointname)
        znamer = re.match('z(\d+)r', param.pointname)
        zeile = None
        if znamel and param.pointname == znamel.group(0):
            zeile = "Dpx{index}l := {xvalue}u ; Dpy{index}l := {yvalue}u ;"
            zeile = zeile.format(index=znamel.group(1),
                                 xvalue='%.2f' % (item.x / 100.),
                                 yvalue='%.2f' % (item.y / 100.))

        if znamer and param.pointname == znamer.group(0):
            zeile = "Dpx{index}r := {xvalue}u ; Dpy{index}r := {yvalue}u ;"
            zeile = zeile.format(index=znamer.group(1),
                                 xvalue='%.2f' % (item.x / 100.),
                                 yvalue='%.2f' % (item.y / 100.))

        if zeile:
            fip.write("\n")
            fip.write(zeile)


# reading mid points font B

    fip.write("\n")
    fip.write("""% point coordinates font B""")
    fip.write("\n\n")

    index = 1
    for item, param in fontb_outlines:

        znamer = re.match('z(\d+)r', param.pointname)

        if znamer and param.pointname == znamer.group(0):
            zeile = ".5(Bpx{0}l + Bpx{0}r) = x{0}B;".format(index)
            fip.write(zeile + '\n')

            zeile = ".5(Bpy{0}l + Bpy{0}r) = y{0}B;".format(index)
            fip.write(zeile + '\n')

            index += 1

# reading mid points font C

    fip.write("\n")
    fip.write("""% point coordinates font C""")
    fip.write("\n\n")

    index = 1
    for item, param in fontc_outlines:

        znamer = re.match('z(\d+)r', param.pointname)

        if znamer and param.pointname == znamer.group(0):
            zeile = ".5(Cpx{0}l + Cpx{0}r) = x{0}C;".format(index)
            fip.write(zeile + '\n')

            zeile = ".5(Cpy{0}l + Cpy{0}r) = y{0}C;".format(index)
            fip.write(zeile + '\n')

            index += 1

# reading mid points font D

    fip.write("\n")
    fip.write("""% point coordinates font D""")
    fip.write("\n\n")

    index = 1
    for item, param in fontd_outlines:

        znamer = re.match('z(\d+)r', param.pointname)

        if znamer and param.pointname == znamer.group(0):
            zeile = ".5(Dpx{0}l + Dpx{0}r) = x{0}D;".format(index)
            fip.write(zeile + '\n')

            zeile = ".5(Dpy{0}l + Dpy{0}r) = y{0}D;".format(index)
            fip.write(zeile + '\n')

            index += 1

# reading fake l and r points Font B ################

    fip.write("\n")
    fip.write("""% fake l and r points Font B""")
    fip.write("\n\n")

    index = 1

    for item, param in fontb_outlines:
        znamer = re.match('z(\d+)r', param.pointname)

        if znamer and param.pointname == znamer.group(0):
            zeile = "Bpx{0}l = x{0}Bl; Bpy{0}l = y{0}Bl;".format(index)
            fip.write(zeile + '\n')

            zeile = "Bpx{0}r = x{0}Br; Bpy{0}r = y{0}Br;".format(index)
            fip.write(zeile + '\n')

            index += 1

# reading fake l and r points Font C ################

    fip.write("\n")
    fip.write("""% fake l and r points Font C""")
    fip.write("\n\n")

    index = 1

    for item, param in fontc_outlines:
        znamer = re.match('z(\d+)r', param.pointname)

        if znamer and param.pointname == znamer.group(0):
            zeile = "Cpx{0}l = x{0}Cl; Cpy{0}l = y{0}Cl;".format(index)
            fip.write(zeile + '\n')

            zeile = "Cpx{0}r = x{0}Cr; Cpy{0}r = y{0}Cr;".format(index)
            fip.write(zeile + '\n')

            index += 1

# reading fake l and r points Font D ################

    fip.write("\n")
    fip.write("""% fake l and r points Font D""")
    fip.write("\n\n")

    index = 1

    for item, param in fontd_outlines:
        znamer = re.match('z(\d+)r', param.pointname)

        if znamer and param.pointname == znamer.group(0):
            zeile = "Dpx{0}l = x{0}Dl; Dpy{0}l = y{0}Dl;".format(index)
            fip.write(zeile + '\n')

            zeile = "Dpx{0}r = x{0}Dr; Dpy{0}r = y{0}Dr;".format(index)
            fip.write(zeile + '\n')

            index += 1

# reading pen widths Font B ################

    fip.write("\n")
    fip.write("""% pen width Font B""")
    fip.write("\n\n")

    index = 1
    for item, param in fontb_outlines:

        znamer = re.match('z(\d+)r', param.pointname)

        if znamer and param.pointname == znamer.group(0):
            zeile = "dist{0}B := length (z{0}Bl - z{0}Br);".format(index)
            fip.write(zeile + '\n')

            index += 1

# reading pen widths Font C ################

    fip.write("\n")
    fip.write("""% pen width Font C""")
    fip.write("\n\n")

    index = 1
    for item, param in fontc_outlines:

        znamer = re.match('z(\d+)r', param.pointname)

        if znamer and param.pointname == znamer.group(0):
            zeile = "dist{0}C := length (z{0}Cl - z{0}Cr);".format(index)
            fip.write(zeile + '\n')

            index += 1

# reading pen widths Font D ################

    fip.write("\n")
    fip.write("""% pen width Font D""")
    fip.write("\n\n")

    index = 1
    for item, param in fontd_outlines:

        znamer = re.match('z(\d+)r', param.pointname)

        if znamer and param.pointname == znamer.group(0):
            zeile = "dist{0}D := length (z{0}Dl - z{0}Dr);".format(index)
            fip.write(zeile + '\n')

            index += 1



# pen angle (A and B, for B we dont need to read from db) ################

    fip.write("\n")
    fip.write("""% pen angle Font A""")
    fip.write("\n\n")

    index = 1
    for item, param in fonta_outlines:
        znamer = re.match('z(\d+)r', param.pointname)

        if znamer and param.pointname == znamer.group(0):
            zeile = "ang{0} := angle ((((z{0}Ar + (metapolation * (z{0}Br - z{0}Ar))) + (z{0}Cr + (metapolationCD * (z{0}Dr - z{0}Cr)))) /divider) - (((z{0}Al + (metapolation * (z{0}Bl - z{0}Al))) + (z{0}Cl + (metapolationCD * (z{0}Dl - z{0}Cl)))) /divider));".format(index)
            index += 1
            fip.write(zeile + '\n')

# reading extra pen angle Font B  ################

#    fip.write("\n")
#    fip.write("""% test extra pen angle Font B""")

    inattr = 0
    ivn = 0
    strz = ""
    zznb = []  # for font B save zzn

    angle = []
    angleB = []

    angleval_B = []
    startp = []
    startpval = []

    i = 1
    for item, param in fontb_outlines:
        znamer = re.match('z(\d+)r', param.pointname)
        znamel = re.match('z(\d+)l', param.pointname)
        zname = re.match('z(\d+)l', param.pointname)

        x = item.x
        y = item.y

        im = param.pointname

        istartp = param.startp
        iangleB = param.angle

        if znamel and im == znamel.group(0):
            zznb.append(i)
            if istartp is not None:
                istartpval = param.startp
                startp.append("startp")
                startpval.append(istartpval)

            if iangleB is not None:
                iangleval_B = param.angle
                angleB.append("angle")
                angleval_B.append(iangleval_B)
            else:
                angleB.append("")
                angleval_B.append(0)

    # passing angleval_B to extra pen angle Font A

# reading extra pen angle Font C  ################

#    fip.write("\n")
#    fip.write("""% test extra pen angle Font C""")

    inattr = 0
    ivn = 0
    strz = ""
    zznc = []  # for font B save zzn

    angle = []
    angleC = []

    angleval_C = []
    startp = []
    startpval = []

    i = 1
    for item, param in fontc_outlines:
        znamer = re.match('z(\d+)r', param.pointname)
        znamel = re.match('z(\d+)l', param.pointname)
        zname = re.match('z(\d+)l', param.pointname)

        x = item.x
        y = item.y

        im = param.pointname

        istartp = param.startp
        iangleC = param.angle

        if znamel and im == znamel.group(0):
            zznc.append(i)
            if istartp is not None:
                istartpval = param.startp
                startp.append("startp")
                startpval.append(istartpval)

            if iangleC is not None:
                iangleval_C = param.angle
                angleC.append("angle")
                angleval_C.append(iangleval_C)
            else:
                angleC.append("")
                angleval_C.append(0)

    # passing angleval_C to extra pen angle Font A

# reading extra pen angle Font D  ################

#    fip.write("\n")
#    fip.write("""% test extra pen angle Font D""")

    inattr = 0
    ivn = 0
    strz = ""
    zznd = []  # for font B save zzn

    angle = []
    angleD = []

    angleval_D = []
    startp = []
    startpval = []

    i = 1
    for item, param in fontd_outlines:
        znamer = re.match('z(\d+)r', param.pointname)
        znamel = re.match('z(\d+)l', param.pointname)
        zname = re.match('z(\d+)l', param.pointname)

        x = item.x
        y = item.y

        im = param.pointname

        istartp = param.startp
        iangleD = param.angle

        if znamel and im == znamel.group(0):
            zznd.append(i)
            if istartp is not None:
                istartpval = param.startp
                startp.append("startp")
                startpval.append(istartpval)

            if iangleD is not None:
                iangleval_D = param.angle
                angleD.append("angle")
                angleval_D.append(iangleval_D)
            else:
                angleD.append("")
                angleval_D.append(0)

    # passing angleval_D to extra pen angle Font A


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

    i = 1
    for item, param in fonta_outlines:

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

    # if len(zzn) != len(zznb):
    #     # glyphs in A and B have different set of Z-points, so raise exception
    #     # to handle this case
    #     raise DifferentZPointError()

    for i in range(len(zzn)):
        zitem = i + 1

        if angle[i]:
            set_value_for_index(i, angleval, angleval_B,
                                angleval_C, angleval_D)
            zeile = "ang" + str(zitem) + " := ((" + str(angleval[i]) + "+ (metapolation * (" + str(angleval_B[i]) + " - " + str(angleval[i]) + " ))) + (" + str(angleval_C[i]) + "+ (metapolationCD * (" + str(angleval_D[i]) + " - " + str(angleval_C[i]) + " )))) /divider;"
        else:
            zeile = "ang" + str(zitem) + " := ang" + str(zitem) + ";"

        fip.write("\n")
        fip.write(zeile)

# reading font Pen Positions Font B

    inattr = 0
    ivn = 0
    strz = ""
    zzn = []

    penwidth = []
    penwidthval = []
    B_penwidthval = []

    startp = []
    startpval = []

    pointshifted = []
    pointshiftedval = []
    B_pointshiftedval = []

    i = 1

    for item, param in fontb_outlines:
        znamer = re.match('z(\d+)r', param.pointname)
        znamel = re.match('z(\d+)l', param.pointname)
        zname = re.match('z(\d+)l', param.pointname)

        x = item.x
        y = item.y

        im = param.pointname

        ipenwidth = param.penwidth
        istartp = param.startp

        ipointshifted = param.pointshifted

        if znamel and im == znamel.group(0):
            zzn.append(i)
            if istartp is not None:
                istartpval = param.startp
                startp.append("startp")
                startpval.append(istartpval)

            if ipenwidth is not None:
                ipenwidthval = param.penwidth
                penwidth.append("penwidth")
                B_penwidthval.append(ipenwidthval)
            else:
                penwidth.append("")
                B_penwidthval.append(0)

            if ipointshifted is not None:
                ipointshiftedval = param.pointshifted
                pointshifted.append("shifted")
                B_pointshiftedval.append(ipointshiftedval)
            else:
                pointshifted.append("")
                B_pointshiftedval.append(0)

# reading font Pen Positions Font C


#    fip.write("\n")
#    fip.write("""% penposition font C""")

    inattr = 0
    ivn = 0
    strz = ""
    zzn = []

    penwidth = []
    penwidthval = []
    C_penwidthval = []

    startp = []
    startpval = []

    pointshifted = []
    pointshiftedval = []
    C_pointshiftedval = []


    i = 1

    for item, param in fontc_outlines:
        znamer = re.match('z(\d+)r', param.pointname)
        znamel = re.match('z(\d+)l', param.pointname)
        zname = re.match('z(\d+)l', param.pointname)

        x = item.x
        y = item.y

        im = param.pointname

        ipenwidth = param.penwidth
        istartp = param.startp

        ipointshifted = param.pointshifted


        if znamel and im == znamel.group(0):
            zzn.append(i)
            if istartp is not None:
                istartpval = param.startp
                startp.append("startp")
                startpval.append(istartpval)

            if ipenwidth is not None:
                ipenwidthval = param.penwidth
                penwidth.append("penwidth")
                C_penwidthval.append(ipenwidthval)
            else:
                penwidth.append("")
                C_penwidthval.append(0)

            if ipointshifted is not None:
                ipointshiftedval = param.pointshifted
                pointshifted.append("shifted")
                C_pointshiftedval.append(ipointshiftedval)
            else:
                pointshifted.append("")
                C_pointshiftedval.append(0)


# reading font Pen Positions Font D

#    fip.write("\n")
#    fip.write("""% penposition font D""")

    inattr = 0
    ivn = 0
    strz = ""
    zzn = []

    penwidth = []
    penwidthval = []
    D_penwidthval = []

    startp = []
    startpval = []

    pointshifted = []
    pointshiftedval = []
    D_pointshiftedval = []


    i = 1

    for item, param in fontd_outlines:
        znamer = re.match('z(\d+)r', param.pointname)
        znamel = re.match('z(\d+)l', param.pointname)
        zname = re.match('z(\d+)l', param.pointname)

        x = item.x
        y = item.y

        im = param.pointname

        ipenwidth = param.penwidth
        istartp = param.startp

        ipointshifted = param.pointshifted


        if znamel and im == znamel.group(0):
            zzn.append(i)
            if istartp is not None:
                istartpval = param.startp
                startp.append("startp")
                startpval.append(istartpval)

            if ipenwidth is not None:
                ipenwidthval = param.penwidth
                penwidth.append("penwidth")
                D_penwidthval.append(ipenwidthval)
            else:
                penwidth.append("")
                D_penwidthval.append(0)

            if ipointshifted is not None:
                ipointshiftedval = param.pointshifted
                pointshifted.append("shifted")
                D_pointshiftedval.append(ipointshiftedval)
            else:
                pointshifted.append("")
                D_pointshiftedval.append(0)


# reading Pen Positions Font A

    fip.write("\n")
    fip.write("""% penpositions""")

    inattr = 0
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

    i = 1

    for item, param in fonta_outlines:

        znamer = re.match('z(\d+)r', param.pointname)
        znamel = re.match('z(\d+)l', param.pointname)
        zname = re.match('z(\d+)l', param.pointname)

        x = item.x
        y = item.y

        im = param.pointname

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

            if ipenwidth is not None:
                ipenwidthval = param.penwidth
                penwidth.append("penwidth")
                A_penwidthval.append(ipenwidthval)
            else:
                penwidth.append("")
                penwidthval.append(0)
                A_penwidthval.append(0)

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
    semi = ";"
    close = ")"
    for i in range(len(zzn)):
        zitem = i + 1

        if penwidth[i]:
            set_value_for_index(i, A_penwidthval, B_penwidthval,
                                C_penwidthval, D_penwidthval)

#            zeile = """penpos"""  + str(zitem) + "((" + str(A_penwidthval[i]) +" + metapolation * (" + str(B_penwidthval[i]) + " - " + str(A_penwidthval[i]) + ")) * " + "((dist" +str(zitem) + " + metapolation * (dist" +str(zitem) + "B - dist" +str(zitem) + ")) + (A_px + metapolation * (B_px - A_px)) + ((A_skeleton/50 + metapolation * (B_skeleton/50-A_skeleton/50)) * (dist" +str(zitem) + " + metapolation * (dist" +str(zitem) + "B - dist" +str(zitem) + "))))"
#            zeile = """penpos"""  + str(zitem) + "((((((" + str(A_penwidthval[i]) +" + metapolation * (" + str(B_penwidthval[i]) + " - " + str(A_penwidthval[i]) + ")) + (" + str(C_penwidthval[i]) +" + metapolationCD * (" + str(D_penwidthval[i]) + " - " + str(C_penwidthval[i]) + "))) /divider) * " + "((((dist" +str(zitem) + "A + metapolation * (dist" +str(zitem) + "B - dist" +str(zitem) + "A)) + (dist" +str(zitem) + "C + metapolationCD * (dist" +str(zitem) + "D - dist" +str(zitem) + "C))) /divider) + (((A_px + metapolation * (B_px - A_px)) + (C_px + metapolationCD * (D_px - C_px))) /divider) + ((((A_skeleton/50 + metapolation * (B_skeleton/50-A_skeleton/50)) + (C_skeleton/50 + metapolationCD * (D_skeleton/50-C_skeleton/50))) /divider) * (((dist" +str(zitem) + "A + metapolation * (dist" +str(zitem) + "B - dist" +str(zitem) + "A)) + (dist" +str(zitem) + "C + metapolationCD * (dist" +str(zitem) + "D - dist" +str(zitem) + "C))) /divider ))))"
            zeile = """penpos"""  + str(zitem) + "((((((" + str(A_penwidthval[i]) +" + metapolation * (" + str(B_penwidthval[i]) + " - " + str(A_penwidthval[i]) + ")) + (" + str(C_penwidthval[i]) +" + metapolationCD * (" + str(D_penwidthval[i]) + " - " + str(C_penwidthval[i]) + "))) /divider) * " + "(((dist" +str(zitem) + "A + metapolation * (dist" +str(zitem) + "B - dist" +str(zitem) + "A)) + (dist" +str(zitem) + "C + metapolationCD * (dist" +str(zitem) + "D - dist" +str(zitem) + "C))) /divider)) + (((A_px + metapolation * (B_px - A_px)) + (C_px + metapolationCD * (D_px - C_px))) /divider) + ((((A_skeleton/50 + metapolation * (B_skeleton/50-A_skeleton/50)) + (C_skeleton/50 + metapolationCD * (D_skeleton/50-C_skeleton/50))) /divider) * (((dist" +str(zitem) + "A + metapolation * (dist" +str(zitem) + "B - dist" +str(zitem) + "A)) + (dist" +str(zitem) + "C + metapolationCD * (dist" +str(zitem) + "D - dist" +str(zitem) + "C))) /divider )))"

        else:
#            zeile = """penpos"""  + str(zitem) + "((dist" +str(zitem) + " + metapolation * (dist" +str(zitem) + "B - dist" +str(zitem) + ")) + (A_px + metapolation * (B_px - A_px)) + ((A_skeleton/50 + metapolation * (B_skeleton/50-A_skeleton/50)) * (dist" +str(zitem) + " + metapolation * (dist" +str(zitem) + "B - dist" +str(zitem) + ")))"
            zeile = """penpos"""  + str(zitem) + "((((((dist" +str(zitem) + "A + metapolation * (dist" +str(zitem) + "B - dist" +str(zitem) + "A)) + (dist" +str(zitem) + "C + metapolationCD * (dist" +str(zitem) + "D - dist" +str(zitem) + "C))) /divider)) + (((A_px + metapolation * (B_px - A_px)) + (C_px + metapolationCD * (D_px - C_px))) /divider) + ((((A_skeleton/50 + metapolation * (B_skeleton/50-A_skeleton/50)) + (C_skeleton/50 + metapolationCD * (D_skeleton/50-C_skeleton/50))) /divider) * (((dist" +str(zitem) + "A + metapolation * (dist" +str(zitem) + "B - dist" +str(zitem) + "A)) + (dist" +str(zitem) + "C + metapolationCD * (dist" +str(zitem) + "D - dist" +str(zitem) + "C))) /divider )))"

        zeile = zeile + ", ang" + str(zitem) + ");"
        fip.write("\n")
        fip.write(zeile)


# testing new center points

    fip.write("\n")
    fip.write( """% test new center (z) points""" )

    mean = ['198', '232', '136', '138', '244', '243', '249', '175', '200', '205', '151', '250', '255', '162', '216', '215', '213', '262', '268', '220', '150']
    mean_acc = [ '264', '190', '163','234', '235', '236', '233', '144', '142', '143', '140', '141', '182', '183', '186', '184', '185', '201', '207', '206', '208', '139', '251', '164', '165', '166', '210', '252' ]
    #des = ['12','27','63','71','80','81','89']
    asc = ['192', '148', '171', '180', '194', '265', '226', '159' ]
#asc = ['2','7','11','28','30','62','64','66','68','70','72','73','75','76','84']
#    cap = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24', '25', '26', '27', '28', '29', '30', '31', '32', '33', '34', '35', '36', '37', '38', '39', '40', '41', '42', '43', '44', '45', '46', '47', '48', '49', '50', '51', '52', '53', '54', '55', '56', '57', '58', '59', '60', '61', '62', '63', '64', '65', '66', '67', '68', '69', '70', '71', '72', '73', '74', '75', '76', '77', '78', '79', '80', '81', '82', '83', '84', '85', '86', '87', '88', '89', '90', '91', '92', '93', '94', '95', '96', '97', '98', '99', '100', '101', '102', '103', '104', '105', '106', '107', '108', '109', '110', '111', '112', '113', '114', '115', '116', '117', '118', '119', '120', '121', '122', '123', '124', '125', '126', '127', '128', '129', '130', '131', '132', '133', '134', '135', '136', '137', '138', '139', '140', '141', '142', '143', '144', '145', '146', '147', '148', '149', '150', '151', '152', '153', '154', '155', '156', '157', '158', '159', '160', '161', '162', '163', '164', '165', '166', '167', '168', '169', '170', '171', '172', '173', '174', '175', '176', '177', '178', '179', '180', '181', '182', '183', '184', '185', '186', '187', '188', '189', '190', '191', '192', '193', '194', '195', '196', '197', '198', '199', '200', '201', '202', '203', '204', '205', '206', '207', '208', '209', '210', '211', '212', '213', '214', '215', '216', '217', '218', '219', '220', '221', '222', '223', '224', '225', '226', '227', '228', '229', '230', '231', '232', '233', '234', '235', '236', '237', '238', '239', '240', '241', '242', '243', '244', '245', '246', '247', '248', '249', '250', '251', '252', '253', '254', '255', '256', '257', '258', '259', '260', '261', '262', '263', '264', '265', '266', '267', '268', '269', '270', '271', '272', '273', '274', '275', '276', '277', '278', '279', '280', '281', '282', '283', '284', '285', '286', '287', '288', '289', '290', '291', '292', '293', '294', '295', '296', '297', '298', '299', '300', '301', '302', '303', '304', '305', '306', '307', '308', '309', '310', '311', '312', '313', '314', '315', '316', '317', '318', '319', '320', '321', '322', '323', '324', '325', '326', '327', '328', '329', '330', '331', '332', '333', '334', '335', '336', '337', '338', '339', '340', '341', '342', '343', '344', '345', '346', '347', '348', '349', '350', '351', '352', '353', '354', '355', '356', '357', '358', '359', '360', '361', '362', '363', '364', '365', '366', '367', '368', '369', '370', '371', '372', '373', '374', '375', '376', '377', '378', '379', '380', '381', '382', '383', '384', '385', '386', '387', '388', '389', '390', '391', '392', '393', '394', '395', '396', '397', '398', '399', '400', '401', '402', '403', '404', '405', '406', '407', '408', '409', '410', '411', '412', '413', '414', '415', '416', '417', '418', '419', '420', '421', '422', '423', '424', '425', '426', '427', '428', '429', '430', '431', '432', '433', '434', '435', '436', '437', '438', '439', '440', '441', '442', '443', '444', '445', '446', '447', '448', '449', '450', '451', '452', '453', '454', '455', '456', '457', '458', '459', '460', '461', '462', '463', '464', '465', '466', '467', '468', '469', '470', '471', '472', '473', '474', '475', '476', '477', '478', '479', '480', '481', '482', '483', '484', '485', '486', '487', '488', '489', '490', '491', '492', '493', '494', '495', '496', '497', '498', '499', '500', '501', '502', '503', '504', '505', '506', '507', '508', '509', '510', '511', '512', '513', '514', '515', '516', '517', '518', '519', '520', '521', '522', '523', '524', '525', '526', '527', '528', '529', '530', '531', '532', '533', '534', '535', '536', '537', '538', '539', '540', '541', '542', '543', '544', '545', '546', '547', '548', '549', '550', '551', '552', '553', '554', '555', '556', '557', '558', '559', '560', '561', '562', '563', '564', '565', '566', '567', '568', '569', '570', '571', '572', '573', '574', '575', '576', '577', '578', '579', '580', '581', '582', '583', '584', '585', '586', '587', '588', '589', '590', '591', '592', '593', '594', '595', '596', '597', '598', '599', '600', '601', '602', '603', '604', '605', '606', '607', '608', '609', '610', '611', '612', '613', '614', '615', '616', '617', '618', '619', '620', '621', '622', '623', '624', '625', '626', '627', '628', '629', '630', '631', '632', '633', '634', '635', '636', '637', '638', '639', '640', '641', '642', '643', '644', '645', '646', '647', '648', '649', '650', '651', '652', '653', '654', '655', '656', '657', '658', '659', '660', '661', '662', '663', '664', '665', '666', '667', '668', '669', '670', '671', '672', '673', '674', '675', '676', '677', '678', '679', '680', '681', '682', '683', '684', '685', '686', '687', '688', '689', '690', '691', '692', '693', '694', '695', '696', '697', '698', '699', '700', '701', '702', '703', '704', '705', '706', '707', '708', '709', '710', '711', '712', '713', '714', '715', '716', '717', '718', '719', '720', '721', '722', '723', '724', '725', '726', '727', '728', '729', '730', '731', '732', '733' ]#box = ['4','8','9','15','59','60','61','74','91','92','93']
    cap_acc = ['209', '90', '108', '6', '91', '93', '92', '24', '25', '26', '23', '7', '2', '3', '60', '65', '66', '67', '68', '69', '42', '4', '44', '43', '41', '5']
    cap = ['599', '598', '38', '33', '31', '107', '106', '101', '100', '1', '718', '716', '715', '713', '595', '597', '596', '610', '611', '616', '617', '615', '689', '688', '685', '687', '686', '498', '494', '495', '496', '492', '493', '22', '705', '700', '703', '89', '85', '586', '585', '623', '622', '621', '627', '626', '625', '624', '629', '628', '11', '13', '14', '19', '75', '74', '72', '79', '669', '668', '667', '666', '665', '664', '663', '662', '696', '697', '695', '698', '699', '499', '497', '604', '259', '731', '730', '500', '501', '630', '631', '632', '633', '634', '635', '636', '637', '638', '677', '670', '671', '263', '261', '260', '59', '57', '51', '53', '64', '117', '116', '112', '119', '118', '565', '566', '567', '724', '605', '606', '609', '49', '40', '488', '487']

    ggroup=""
    gggroup =""

    if g in mean:
        ggroup = 'xheight'
        gggroup = 'mean'

    if g in cap_acc:
        ggroup = 'capital_acc'
        gggroup = 'cap_acc'

    if g in cap:
        ggroup = 'capital'
        gggroup = 'cap'

    if g in mean_acc:
        ggroup = 'xheight_acc'
        gggroup = 'mean_acc'

    if g in asc:
        ggroup = 'ascender'
        gggroup = 'asc'

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

    i = 1

# search for parameters

    for item, param in fonta_outlines:
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
        # iinktrap_l = param.inktrap_l
        # iinktrap_r = param.inktrap_r
        # istemshift = param.stemshift
        # iascpoint = param.ascpoint
        # idescpoint = param.descpoint

        if znamel and im == znamel.group(0):
            zzn.append(i)

        # do not delete that lines while you are sure
#       if im == znamel or im == znamer:

            if istartp is not None:
                istartpval = param.startp
                startp.append("startp")
                startpval.append(istartpval)

            if ipointshifted is not None:
                ipointshiftedval = param.pointshifted
                pointshifted.append("shifted")
                pointshiftedval.append(ipointshiftedval)
            else:
                pointshifted.append("")
                pointshiftedval.append(0)

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

            # if iinktrap_l is not None:
            #     iinktrap_lval = param.inktrap_l
            #     inktrap_l.append("inktrapcut")
            #     inktrap_lval.append(iinktrap_lval)
            # else:
            #     inktrap_l.append("")
            #     inktrap_lval.append(0)

            # if iinktrap_r is not None:
            #     iinktrap_rval = param.inktrap_r
            #     inktrap_r.append("inktrapcut")
            #     inktrap_rval.append(iinktrap_rval)
            # else:
            #     inktrap_r.append("")
            #     inktrap_rval.append(0)

            # if istemshift is not None:
            #     istemshiftval = param.stemshift
            #     stemshift.append("stemshift")
            #     stemshiftval.append(istemshiftval)
            # else:
            #     stemshift.append("")
            #     stemshiftval.append(0)

            # if iascpoint is not None:
            #     iascpointval = param.ascpoint
            #     ascpoint.append("ascpoint")
            #     ascpointval.append(iascpointval)
            # else:
            #     ascpoint.append("")
            #     ascpointval.append(0)

            # if idescpoint is not None:
            #     idescpointval = param.descpoint
            #     descpoint.append("descpoint")
            #     descpointval.append(idescpointval)
            # else:
            #     descpoint.append('')
            #     descpointval.append(0)

            i += 1

#   nnz = 0
#   for zitem in zzn :
#     nnz = nnz +1

    zzn.sort()
    semi = ";"
    close = ")"

    for i in range(len(zzn)):
        zitem = i + 1

        #   zitemb = zzn[i]
        #   zitemc = zzn[i-1]
        zeile = ''

        ## default string

        # if ascpoint[i] != '':
        #     zeile = "z" + str(zitem) + "=((A_width + metapolation * (B_width - A_width)) * (x2" + str(zitem) + "0 + metapolation * (x2" + str(zitem) + "A - x2" + str(zitem) + "0) + spacing_" + g + "L) * width_" + g + ", (y2" + str(zitem) + "0 + metapolation *(y2" + str(zitem) + "A - y2" + str(zitem) + "0))*((A_ascender + metapolation * (B_ascender - A_ascender)) / asc#))"
        # if descpoint[i] != "":
        #     zeile = "z" + str(zitem) + "=((A_width + metapolation * (B_width - A_width)) * (x2" + str(zitem) + "0 + metapolation * (x2" + str(zitem) + "A - x2" + str(zitem) + "0) + spacing_" + g + "L) * width_" + g + ", (y2" + str(zitem) + "0 + metapolation *(y2" + str(zitem) + "A - y2" + str(zitem) + "0))*((A_descender + metapolation * (B_descender - A_descender)) / desc#))"
        # else:

#       zeile = "z" + str(zitem) + "=((A_width + metapolation * (B_width - A_width)) * (x2" + str(zitem) + "0 + metapolation * (x2" + str(zitem) + "A - x2" + str(zitem) + "0) + spacing_" + g + "L) * width_" + g + ", (y2" + str(zitem) + "0 + metapolation *(y2" + str(zitem) + "A - y2" + str(zitem) + "0))*((A_" + ggroup + " + metapolation * (B_" + ggroup + " - A_" + ggroup + ")) / " + gggroup + "#))"

#        zeile = "z" + str(zitem) + "=((((A_width + metapolation * (B_width - A_width)) + (C_width + metapolationCD * (D_width - C_width))) /divider ) * ((((x" + str(zitem) + "A + metapolation * (x" + str(zitem) + "B - x" + str(zitem) + "A)) + (x" + str(zitem) + "C + metapolationCD * (x" + str(zitem) + "D - x" + str(zitem) + "C))) /divider ) + spacing_" + g + "L) * width_" + g + ", (((y" + str(zitem) + "A + metapolation *(y" + str(zitem) + "B - y" + str(zitem) + "A)) + (y" + str(zitem) + "C + metapolationCD *(y" + str(zitem) + "D - y" + str(zitem) + "C))) /divider ) * ((((A_" + ggroup + " + metapolation * (B_" + ggroup + " - A_" + ggroup + ")) + (C_" + ggroup + " + metapolationCD * (D_" + ggroup + " - C_" + ggroup + "))) /divider ) / " + gggroup + "#))"
        zeile = "z" + str(zitem) + "=((((A_width + metapolation * (B_width - A_width)) + (C_width + metapolationCD * (D_width - C_width))) /divider ) * ((((x" + str(zitem) + "A + metapolation * (x" + str(zitem) + "B - x" + str(zitem) + "A)) + (x" + str(zitem) + "C + metapolationCD * (x" + str(zitem) + "D - x" + str(zitem) + "C))) /divider ) + spacing_" + g + "L) * width_" + g + " / " + "(((" + wA + " + metapolation *(" + wB + "-" + wA + ")) + ((" + wC + " + metapolation * (" + wD + "-" + wC + ")))) / 2) * (((" + wA_new + " + metapolation *(" + wB_new + "-" + wA_new + ")) + ((" + wC_new + " + metapolation * (" + wD_new + "-" + wC_new + ")))) / 2) ,"





        if pointshifted[i] != '':
#            zeile = zeile + " shifted (" + str(pointshiftedval[i]) + " + metapolation * (" + str(B_pointshiftedval[i]) + " - " + str(pointshiftedval[i]) + "))"
            zeile = zeile + " shifted (" + str(pointshiftedval[i]) + ")"

        # if stemshift[i] != '':
        #     zeile = zeile + " stemshift (" + str(stemshiftval[i]) + ")"

        # if inktrap_l[i] != '':
        #     zeile = zeile + " inktrap_l (" + str(inktrap_lval[i]) + ")"

        # if inktrap_r[i] != '':
        #     zeile = zeile + " inktrap_r (" + str(inktrap_rval[i]) + ")"

        zeile = zeile + semi
        fip.write("\n")
        fip.write(zeile)



# reading penstrokes font B


    inattr = 0
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

    i = 1

    for item, param in fontb_outlines:
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
        # itension = param.tension
        itensionand = param.tensionand
        # isuperright = param.superright
        # isuperleft = param.superleft
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

            if idir is not None :
                idirval = param.dir
                dirB.append("dir")
                dirvalB.append(idirval)
            else :
                dirB.append("")
                dirvalB.append(0)


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

            # if itension is not None:
            #     itensionval = param.tension
            #     tensionB.append("tension")
            #     tensionvalB.append(itensionval)

            if itensionand is not None :
                itensionandval = param.tensionand
                tensionandB.append("tensionand")
                tensionandvalB.append(itensionandval[:3])
                tensionandval2B.append(itensionandval[-3:])
            else :
                tensionandB.append("")
                tensionandvalB.append(0)
                tensionandval2B.append(0)

            # if isuperright is not None:
            #     isuperrightval = param.superright
            #     superright.append("superright")
            #     superrightvalB.append(isuperrightval)

            # if isuperleft is not None:
            #     isuperleftval = param.superleft
            #     superleft.append("superleft")
            #     superleftvalB.append(isuperleftval)


            if idir2 is not None :
                idir2val = param.dir2
                dir2B.append("dir")
                dir2valB.append(idir2val)
            else :
                dir2B.append("")
                dir2valB.append(0)


            if ipenshifted is not None:
                ipenshiftedval = param.penshifted
                penshifted.append("shifted")
                penshiftedvalB.append(ipenshiftedval)

            else :
                penshifted.append("")
                penshiftedvalB.append("0,0")


# reading penstrokes font C

    inattr = 0
    ivn = 0
    stre = " ... "
    strtwo = " .. "
    stline = " -- "
    strz = ""
    zzn = []

    startp = []
    startpval = []

    doubledash = []
    doubledashvalC = []

    tripledash = []
    tripledashvalC = []

    tension = []
    tensionC = []
    tensionvalC = []

    tensionand = []
    tensionandC = []
    tensionandvalC = []
    tensionandval2C = []

    superright = []
    superrightvalC = []

    superleft = []
    superleftvalC = []

    dir = []
    dirC = []
    dirvalC = []

    dir2 = []
    dir2C = []
    dir2valC = []

    leftp = []
    leftpvalC = []

    rightp = []
    rightpvalC = []

    upp = []
    uppvalC = []

    downp = []
    downpvalC = []

    penshifted = []
    penshiftedvalC = []

    i = 1

    for item, param in fontc_outlines:
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
        # itension = param.tension
        itensionand = param.tensionand
        # isuperright = param.superright
        # isuperleft = param.superleft
        ipenshifted = param.penshifted

        if znamel and im == znamel.group(0):
            zzn.append(i)

        # do not delete that lines while you are sure
#        if im == znamel or im == znamer:

            if idoubledash is not None:
                idoubledashval = param.doubledash
                doubledash.append("doubledash")
                doubledashvalC.append(idoubledashval)

            if itripledash is not None:
                itripledashval = param.tripledash
                tripledash.append(" ---")
                tripledashvalC.append(itripledashval)

            if idir is not None :
                idirval = param.dir
                dirC.append("dir")
                dirvalC.append(idirval)
            else :
                dirC.append("")
                dirvalC.append(0)


            if iupp is not None:
                iuppval = param.upp
                upp.append("up")
                uppvalC.append(iuppval)

            if ileftp is not None:
                ileftpval = param.leftp
                leftp.append("left")
                leftpvalC.append(ileftpval)

            if irightp is not None:
                irightpval = param.rightp
                rightp.append("right")
                rightpvalC.append(irightpval)

            if idownp is not None:
                idownpval = param.downp
                downp.append("down")
                downpvalC.append(idownpval)

            # if itension is not None:
            #     itensionval = param.tension
            #     tensionC.append("tension")
            #     tensionvalC.append(itensionval)


            if itensionand is not None :
                itensionandval = param.tensionand
                tensionandC.append("tensionand")
                tensionandvalC.append(itensionandval[:3])
                tensionandval2C.append(itensionandval[-3:])
            else :
                tensionandC.append("")
                tensionandvalC.append(0)
                tensionandval2C.append(0)



            # if isuperright is not None:
            #     isuperrightval = param.superright
            #     superright.append("superright")
            #     superrightvalC.append(isuperrightval)

            # if isuperleft is not None:
            #     isuperleftval = param.superleft
            #     superleft.append("superleft")
            #     superleftvalC.append(isuperleftval)


            if idir2 is not None :
                idir2val = param.dir2
                dir2C.append("dir")
                dir2valC.append(idir2val)
            else :
                dir2C.append("")
                dir2valC.append(0)


            if ipenshifted is not None:
                ipenshiftedval = param.penshifted
                penshifted.append("shifted")
                penshiftedvalC.append(ipenshiftedval)

            else :
                penshifted.append("")
                penshiftedvalC.append("0,0")


# reading penstrokes font D


    inattr = 0
    ivn = 0
    stre = " ... "
    strtwo = " .. "
    stline = " -- "
    strz = ""
    zzn = []

    startp = []
    startpval = []

    doubledash = []
    doubledashvalD = []

    tripledash = []
    tripledashvalD = []

    tension = []
    tensionD = []
    tensionvalD = []

    tensionand = []
    tensionandD = []
    tensionandvalD = []
    tensionandval2D = []

    superright = []
    superrightvalD = []

    superleft = []
    superleftvalD = []

    dir = []
    dirD = []
    dirvalD = []

    dir2 = []
    dir2D = []
    dir2valD = []

    leftp = []
    leftpvalD = []

    rightp = []
    rightpvalD = []

    upp = []
    uppvalD = []

    downp = []
    downpvalD = []

    penshifted = []
    penshiftedvalD = []

    i = 1

    for item, param in fontd_outlines:
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
        # itension = param.tension
        itensionand = param.tensionand
        # isuperright = param.superright
        # isuperleft = param.superleft
        ipenshifted = param.penshifted

        if znamel and im == znamel.group(0):
            zzn.append(i)

        # do not delete that lines while you are sure
#        if im == znamel or im == znamer:

            if idoubledash is not None:
                idoubledashval = param.doubledash
                doubledash.append("doubledash")
                doubledashvalD.append(idoubledashval)

            if itripledash is not None:
                itripledashval = param.tripledash
                tripledash.append(" ---")
                tripledashvalD.append(itripledashval)

            if idir is not None :
                idirval = param.dir
                dirD.append("dir")
                dirvalD.append(idirval)
            else :
                dirD.append("")
                dirvalD.append(0)


            if iupp is not None:
                iuppval = param.upp
                upp.append("up")
                uppvalD.append(iuppval)

            if ileftp is not None:
                ileftpval = param.leftp
                leftp.append("left")
                leftpvalD.append(ileftpval)

            if irightp is not None:
                irightpval = param.rightp
                rightp.append("right")
                rightpvalD.append(irightpval)

            if idownp is not None:
                idownpval = param.downp
                downp.append("down")
                downpvalD.append(idownpval)

            # if itension is not None:
            #     itensionval = param.tension
            #     tensionD.append("tension")
            #     tensionvalD.append(itensionval)


            if itensionand is not None :
                itensionandval = param.tensionand
                tensionandD.append("tensionand")
                tensionandvalD.append(itensionandval[:3])
                tensionandval2D.append(itensionandval[-3:])
            else :
                tensionandD.append("")
                tensionandvalD.append(0)
                tensionandval2D.append(0)


            # if isuperright is not None:
            #     isuperrightval = param.superright
            #     superright.append("superright")
            #     superrightvalD.append(isuperrightval)

            # if isuperleft is not None:
            #     isuperleftval = param.superleft
            #     superleft.append("superleft")
            #     superleftvalD.append(isuperleftval)


            if idir2 is not None :
                idir2val = param.dir2
                dir2D.append("dir")
                dir2valD.append(idir2val)
            else :
                dir2D.append("")
                dir2valD.append(0)


            if ipenshifted is not None:
                ipenshiftedval = param.penshifted
                penshifted.append("shifted")
                penshiftedvalD.append(ipenshiftedval)

            else :
                penshifted.append("")
                penshiftedvalD.append("0,0")


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

    i = 1

    for item, param in fonta_outlines:

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
        # itension = param.tension
        itensionand = param.tensionand
        # isuperright = param.superright
        # isuperleft = param.superleft
        ipenshifted = param.penshifted
        ioverx = param.overx
        ioverbase = param.overbase
        iovercap = param.overcap
        ioverasc = param.overasc
        ioverdesc = param.overdesc
        # icycle = param.cycle

        if znamel and im == znamel.group(0):
            zzn.append(i)

        # do not delete that lines while you are sure
#        if im == znamel or im == znamer:

            if istartp is not None:
                istartpval = param.startp
                startp.append("penstroke ")
                startpval.append(istartpval)
            else:
                startp.append("")
                startpval.append(0)

            # if icycle is not None :
            #     icycleval = param.cycle
            #     cycle.append("cycle")
            #     cycleval.append(icycleval)
            # else :
            #     cycle.append("")
            #     cycleval.append(0)

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
                leftpval.append(0)

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


            # if itension is not None :
            #     itensionval = param.tension
            #     tension.append("tension")
            #     tensionval.append(itensionval)
            # else :
            #     tension.append("")
            #     tensionval.append(0)

            if itensionand is not None :
                itensionandval = param.tensionand
                tensionand.append("tensionand")
                tensionandval.append(itensionandval[:3])
                tensionandval2.append(itensionandval[-3:])
            else :
                tensionand.append("")
                tensionandval.append(0)
                tensionandval2.append(0)


            # if isuperright is not None :
            #     isuperrightval = param.superright
            #     superright.append("super_qr")
            #     superrightval.append(isuperrightval)
            # else :
            #     superright.append("")
            #     superrightval.append(0)

            # if isuperleft is not None :
            #     isuperleftval = param.superleft
            #     superleft.append("super_ql")
            #     superleftval.append(isuperleftval)
            # else :
            #     superleft.append("")
            #     superleftval.append(0)

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
                penshiftedval.append("0,0")

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
            elif doubledash[i] != "":
                dash = " -- "

            elif tensionand[i] != "":
                dash = ""

            elif dir2[i] != "":
                dash = ""

            if penshifted[i] != "":
#                set_value_for_index(i, penshiftedval, penshiftedvalB,
#                                    penshiftedvalC, penshiftedvalD)
                zeile += " shifted ((((" + str(penshiftedval[i]) + ") + metapolation * ((" + str(penshiftedvalB[i]) + ") - (" + str(penshiftedval[i]) + "))) + ((" + str(penshiftedvalC[i]) + ") + metapolationCD * ((" + str(penshiftedvalD[i]) + ") - (" + str(penshiftedvalC[i]) + "))))/divider)"

            if overx[i] != "":
                zeile += " shifted (0, (((A_xheight*pt + metapolation * (B_xheight*pt - A_xheight*pt)) + (C_xheight*pt + metapolationCD * (D_xheight*pt - C_xheight*pt))) /divider) - " + str(overxval[i]) + ") + (((0, A_over + metapolation * (B_over - A_over)) + (0, C_over + metapolationCD * (D_over - C_over))) /divider)"

            if overbase[i] != "":
                zeile += " shifted (0, - " + str(overbaseval[i]) + ") - (((0, A_over + metapolation * (B_over - A_over)) + (0, C_over + metapolationCD * (D_over - C_over))) /divider)"

            if overcap[i] != "":
                zeile += " shifted (0, (((A_capital*pt + metapolation * (B_capital*pt - A_capital*pt)) + (C_capital*pt + metapolationCD * (D_capital*pt - C_capital*pt))) /divider) - " + str(overcapval[i]) + ") + (((0, A_over + metapolation * (B_over - A_over)) + (0, C_over + metapolationCD * (D_over - C_over))) /divider)"

            if overasc[i] != "":
#                zeile += " shifted (0, (((A_ascender*pt + metapolation * (B_ascender*pt - A_ascender*pt)) + (C_ascender*pt + metapolationCD * (D_ascender*pt - C_ascender*pt))) /divider) - " + str(overascval[i]) + ") + (((0, A_over + metapolation * (B_over - A_over)) + (0, C_over + metapolationCD * (D_over - C_over))) /divider)"
                zeile += " shifted (0, (((A_ascender*pt + metapolation * (B_ascender*pt - A_ascender*pt)) + (C_ascender*pt + metapolationCD * (D_ascender*pt - C_ascender*pt))) /divider) - " + str(overascval[i]) + ")"
                zeile += " + (0, (((A_over + metapolation * (B_over - A_over)) + (C_over + metapolationCD * (D_over - C_over))) /divider))"

            if overdesc[i] != "":
                zeile += " shifted (0, (((A_descender*pt + metapolation * (B_descender*pt  - A_descender*pt )) + (C_descender*pt + metapolationCD * (D_descender*pt  - C_descender*pt ))) /divider) - " + str(overdescval[i]) + ") - (((0, A_over + metapolation * (B_over - A_over)) + (0, C_over + metapolationCD * (D_over - C_over))) /divider)"

            if dir[i] != "":
                set_value_for_index(i, dirval, dirvalB,
                                    dirvalC, dirvalD)
                zeile += " {dir (((" + str(dirval[i]) + " + metapolation * (" + str(dirvalB[i]) + " - " + str(dirval[i]) + ")) + (" + str(dirvalC[i]) + " + metapolationCD * (" + str(dirvalD[i]) + " - " + str(dirvalC[i]) + ")))/divider)}"

            if tensionand[i] != "":
                set_value_for_index(i, tensionandval, tensionandvalB,
                                    tensionandvalC, tensionandvalD)
                set_value_for_index(i, tensionandval2, tensionandval2B,
                                    tensionandval2C, tensionandval2D)
                zeile += strtwo + "tension" + " ((((" + str(tensionandval[i]) + '/100) + (metapolation * ((' + str(tensionandvalB[i]) + '/100) - (' + str(tensionandval[i]) + '/100)))) + ((' + str(tensionandvalC[i]) + '/100) + (metapolationCD * ((' + str(tensionandvalD[i]) + '/100) - (' + str(tensionandvalC[i]) + '/100))))) /divider)' + " and ((((" + str(tensionandval2[i]) + '/100) + (metapolation * ((' + str(tensionandval2B[i]) + '/100) - (' + str(tensionandval2[i]) + '/100)))) + ((' + str(tensionandval2C[i]) + '/100) + (metapolationCD * ((' + str(tensionandval2D[i]) + '/100) - (' + str(tensionandval2C[i]) + '/100))))) /divider)' + strtwo

            if dir2[i] != "":
                set_value_for_index(i, dir2val, dir2valB,
                                    dir2valC, dir2valD)
                zeile += " ... {dir (((" + str(dir2val[i]) + " + metapolation * (" + str(dir2valB[i]) + " - " + str(dir2val[i]) + ")) + (" + str(dir2valC[i]) + " + metapolationCD * (" + str(dir2valD[i]) + " - " + str(dir2valC[i]) + "))) /divider)}"

            zeile += dash

        else:

            if dir[i] != "":
                set_value_for_index(i, dirval, dirvalB,
                                    dirvalC, dirvalD)
                zeile = zeile + " {dir (((" + str(dirval[i]) + " + metapolation * (" + str(dirvalB[i]) + " - " + str(dirval[i]) + ")) + (" + str(dirvalC[i]) + " + metapolationCD * (" + str(dirvalD[i]) + " - " + str(dirvalC[i]) + ")))/divider)}"

            if overx[i] != "":
                zeile = zeile + " shifted (0, (((A_xheight*pt + metapolation * (B_xheight*pt - A_xheight*pt)) + (C_xheight*pt + metapolationCD * (D_xheight*pt - C_xheight*pt))) /divider) - " + str(overxval[i]) + ") + (0, (((A_over + metapolation * (B_over - A_over)) + (C_over + metapolationCD * (D_over - C_over))) /divider))"

            if overbase[i] != "":
                zeile = zeile + " shifted (0, - " + str(overbaseval[i]) + ") - ((0, A_over + metapolation * (B_over - A_over)) + (0, C_over + metapolationCD * (D_over - C_over)) /divider)"

            if overcap[i] != "":
                zeile = zeile + " shifted ((0, (A_capital*pt + metapolation * (B_capital*pt - A_capital*pt)) + (C_capital*pt + metapolationCD * (D_capital*pt - C_capital*pt)) /divider) - " + str(overcapval[i]) + ") + ((0, A_over + metapolation * (B_over - A_over)) + (0, C_over + metapolationCD * (D_over - C_over)) /divider)"

            if overasc[i] != "":
                zeile = zeile +  " shifted (0, (((A_ascender*pt + metapolation * (B_ascender*pt - A_ascender*pt)) + (C_ascender*pt + metapolationCD * (D_ascender*pt - C_ascender*pt))) /divider) - " + str(overascval[i]) + ")"
                zeile = zeile +  " + (0, (((A_over + metapolation * (B_over - A_over)) + (C_over + metapolationCD * (D_over - C_over))) /divider))"

            if overdesc[i] != "":
                zeile = zeile + " shifted (0, ((A_descender*pt + metapolation * (B_descender*pt  - A_descender*pt )) + (C_descender*pt + metapolationCD * (D_descender*pt  - C_descender*pt )) /divider) - " + str(overdescval[i]) + ") - ((0, A_over + metapolation * (B_over - A_over)) + (0, C_over + metapolationCD * (D_over - C_over)) /divider)"

            if penshifted[i] != "":
#                set_value_for_index(i, penshiftedval, penshiftedvalB,
#                                    penshiftedvalC, penshiftedvalD)
                zeile = zeile +  " shifted ((((" + str(penshiftedval[i]) + ") + metapolation * ((" + str(penshiftedvalB[i]) + ") - (" + str(penshiftedval[i]) + "))) + ((" + str(penshiftedvalC[i]) + ") + metapolationCD * ((" + str(penshiftedvalD[i]) + ") - (" + str(penshiftedvalC[i]) + ")))) /divider)"

            if tensionand[i] != "":
                set_value_for_index(i, tensionandval, tensionandvalB,
                                    tensionandvalC, tensionandvalD)
                set_value_for_index(i, tensionandval2, tensionandval2B,
                                    tensionandval2C, tensionandval2D)
                zeile = zeile + strtwo + "tension" + " (((" + str(tensionandval[i]) + '/100) + (metapolation * ((' + str(tensionandvalB[i]) + '/100) - (' + str(tensionandval[i]) + '/100)))) + ((' + str(tensionandvalC[i]) + '/100) + (metapolationCD * ((' + str(tensionandvalD[i]) + '/100) - (' + str(tensionandvalC[i]) + '/100)))) /divider)' + " and (((" + str(tensionandval2[i]) + '/100) + (metapolation * ((' + str(tensionandval2B[i]) + '/100) - (' + str(tensionandval2[i]) + '/100)))) + ((' + str(tensionandval2C[i]) + '/100) + (metapolationCD * ((' + str(tensionandval2D[i]) + '/100) - (' + str(tensionandval2C[i]) + '/100)))) /divider)' + strtwo

            zeile += semi + '\n'

        fip.write(zeile)

        zitemb = zzn[i + 1]
        zeile = "z" + str(zitemb) + "e"

    if len(zzn) >= i:
        i += 1

        # write final point with i + 1
        if penshifted[i] != "":
#            set_value_for_index(i, penshiftedval, penshiftedvalB,
#                                penshiftedvalC, penshiftedvalD)
            zeile += " shifted ((((" + str(penshiftedval[i]) + ") + metapolation * ((" + str(penshiftedvalB[i]) + ") - (" + str(penshiftedval[i]) + "))) + ((" + str(penshiftedvalC[i]) + ") + metapolationCD * ((" + str(penshiftedvalD[i]) + ") - (" + str(penshiftedvalC[i]) + ")))) /divider)"

        if dir[i] != "":
            set_value_for_index(i, dirval, dirvalB,
                                dirvalC, dirvalD)
            zeile += " {dir ((" + str(dirval[i]) + " + metapolation * (" + str(dirvalB[i]) + " - " + str(dirval[i]) + ")) + (" + str(dirvalC[i]) + " + metapolationCD * (" + str(dirvalD[i]) + " - " + str(dirvalC[i]) + "))/divider)}"

        if overx[i] != "":
            zeile += " shifted (0, ((A_xheight*pt + metapolation * (B_xheight*pt - A_xheight*pt)) + (C_xheight*pt + metapolationCD * (D_xheight*pt - C_xheight*pt)) /divider) - " + str(overxval[i]) + ") + ((0, A_over + metapolation * (B_over - A_over)) + (0, C_over + metapolationCD * (D_over - C_over)) /divider)"

        if overbase[i] != "":
            zeile += " shifted (0, - " + str(overbaseval[i]) + ") - ((0, A_over + metapolation * (B_over - A_over)) + (0, C_over + metapolationCD * (D_over - C_over)) /divider)"

        if overcap[i] != "":
            zeile += " shifted ((0, (A_capital*pt + metapolation * (B_capital*pt - A_capital*pt)) + (C_capital*pt + metapolationCD * (D_capital*pt - C_capital*pt)) /divider) - " + str(overcapval[i]) + ") + ((0, A_over + metapolation * (B_over - A_over)) + (0, C_over + metapolationCD * (D_over - C_over)) /divider)"

        if overasc[i] != "":
#            zeile += " shifted ((0, (A_ascender*pt + metapolation * (B_ascender*pt - A_ascender*pt)) + (C_ascender*pt + metapolationCD * (D_ascender*pt - C_ascender*pt)) /divider) - " + str(overascval[i]) + ") + ((0, A_over + metapolation * (B_over - A_over)) + (0, C_over + metapolationCD * (D_over - C_over)) /divider)"
            zeile += " shifted (0, (((A_ascender*pt + metapolation * (B_ascender*pt - A_ascender*pt)) + (C_ascender*pt + metapolationCD * (D_ascender*pt - C_ascender*pt))) /divider) - " + str(overascval[i]) + ")"
            zeile += " + (0, (((A_over + metapolation * (B_over - A_over)) + (C_over + metapolationCD * (D_over - C_over))) /divider))"

        if overdesc[i] != "":
            zeile += " shifted (0, ((A_descender*pt + metapolation * (B_descender*pt  - A_descender*pt )) + (C_descender*pt + metapolationCD * (D_descender*pt  - C_descender*pt )) /divider) - " + str(overdescval[i]) + ") - ((0, A_over + metapolation * (B_over - A_over)) + (0, C_over + metapolationCD * (D_over - C_over)) /divider)"

        if tensionand[i] != ""and dir2[i] != "":
            set_value_for_index(i, dir2val, dir2valB, dir2valC, dir2valD)
            set_value_for_index(i, tensionandval, tensionandvalB,
                                tensionandvalC, tensionandvalD)
            set_value_for_index(i, tensionandval2, tensionandval2B,
                                tensionandval2C, tensionandval2D)
            zeile += strtwo + "tension" + " (((" + str(tensionandval[i]) + '/100) + (metapolation * ((' + str(tensionandvalB[i]) + '/100) - (' + str(tensionandval[i]) + '/100)))) + ((' + str(tensionandvalC[i]) + '/100) + (metapolationCD * ((' + str(tensionandvalD[i]) + '/100) - (' + str(tensionandvalC[i]) + '/100)))) /divider)' + " and (((" + str(tensionandval2[i]) + '/100) + (metapolation * ((' + str(tensionandval2B[i]) + '/100) - (' + str(tensionandval2[i]) + '/100)))) + ((' + str(tensionandval2C[i]) + '/100) + (metapolationCD * ((' + str(tensionandval2D[i]) + '/100) - (' + str(tensionandval2C[i]) + '/100)))) /divider)'
            zeile += strtwo + " {dir ((" + str(dir2val[i]) + " + metapolation * (" + str(dir2valB[i]) + " - " + str(dir2val[i]) + ")) + (" + str(dir2valC[i]) + " + metapolationCD * (" + str(dir2valD[i]) + " - " + str(dir2valC[i]) + ")) /divider)}"

#        if upp2[i] != "":
#            zeile += dash + upp2[i]
        elif dir2[i] != "":
            set_value_for_index(i, dir2val, dir2valB, dir2valC, dir2valD)
            zeile += " ... {dir ((" + str(dir2val[i]) + " + metapolation * (" + str(dir2valB[i]) + " - " + str(dir2val[i]) + ")) + (" + str(dir2valC[i]) + " + metapolationCD * (" + str(dir2valD[i]) + " - " + str(dir2valC[i]) + ")) /divider)}"

#        elif downp2[i] != "":
#            zeile += dash + downp2[i]
#        elif upp2[i] != "":
#            zeile += dash + upp2[i]
#        elif leftp2[i] != "":
#            zeile += dash + leftp2[i]
#        elif rightp2[i] != "":
#            zeile += dash + rightp2[i]
        # elif tension[i] != "":
        #     zeile += strtwo + "tension" + " (" + tensionval[i] + '/100 + (metapolation * (' + tensionvalB[i] + '/100-' + tensionval[i] + '/100)))' + strtwo + downp2[i]
#        elif tensionand[i] != ""and cycle[i] != "":
#            zeile += strtwo + "tension" + " ((" + str(tensionandval[i]) + '/100) + (metapolation * ((' + str(tensionandvalB[i]) + '/100) - (' + str(tensionandval[i]) + '/100))))' + " and ((" + str(tensionandval2[i]) + '/100) + (metapolation * ((' + str(tensionandval2B[i]) + '/100) - (' + str(tensionandval2[i]) + '/100))))' + strtwo + "cycle"
        # elif cycle[i] != "":
        #     zeile += dash + cycle[i]

        fip.write(zeile + semi)

    fip.write("\n")
    fip.write("% pen labels\n")
    fip.write("penlabels(range 1 thru 99);\n")



# routines for serifs  ################

    fip.write("\n")

    inattr = 0
    ivn = 0
    strz = ""
    zznd = []  # for font D save zzn

    theta = []
    thetaD = []
    thetaval_D = []
    thetaval = []

    serif_h_bot = []
    serif_h_top = []
    serif_v_left = []
    serif_v_right = []

    serif_h_botD = []
    serif_h_topD = []
    serif_v_leftD = []
    serif_v_rightD = []

    serif_h_botval = []
    serif_h_topval = []
    serif_v_leftval = []
    serif_v_rightval = []


    serif_h_botval_D = []
    serif_h_topval_D = []
    serif_v_leftval_D = []
    serif_v_rightval_D = []


    i = 1
    for item, param in fontd_outlines:
        znamer = re.match('z(\d+)r', param.pointname)
        znamel = re.match('z(\d+)l', param.pointname)
        zname = re.match('z(\d+)l', param.pointname)

        x = item.x
        y = item.y

        im = param.pointname

        itheta = param.theta
        iserif_h_bot = param.serif_h_bot
        iserif_h_top = param.serif_h_top
        iserif_v_left = param.serif_v_left
        iserif_v_right = param.serif_v_right


        if znamel and im == znamel.group(0):
            zznb.append(i)

            if itheta is not None:
                ithetaval_D = param.theta
                thetaD.append("theta")
                thetaval_D.append(ithetaval_D)
            else:
                thetaD.append("")
                thetaval_D.append(0)

            if iserif_h_bot is not None:
                iserif_h_botval_D = param.serif_h_bot
                serif_h_botD.append("serif_h_bot")
                serif_h_botval_D.append(iserif_h_botval_D)
            else:
                serif_h_botD.append("")
                serif_h_botval_D.append(0)

            if iserif_h_top is not None:
                iserif_h_topval_D = param.serif_h_top
                serif_h_topD.append("serif_h_top")
                serif_h_topval_D.append(iserif_h_topval_D)
            else:
                serif_h_topD.append("")
                serif_h_topval_D.append(0)

            if iserif_v_left is not None:
                iserif_v_leftval_D = param.serif_v_left
                serif_v_leftD.append("serif_v_left")
                serif_v_leftval_D.append(iserif_v_leftval_D)
            else:
                serif_v_leftD.append("")
                serif_v_leftval_D.append(0)

            if iserif_v_right is not None:
                iserif_v_rightval_D = param.serif_v_right
                serif_v_rightD.append("serif_v_right")
                serif_v_rightval_D.append(iserif_v_rightval_D)
            else:
                serif_v_rightD.append("")
                serif_v_rightval_D.append(0)

# routines for serifs  ################

    fip.write("\n")

    inattr = 0
    ivn = 0
    strz = ""
    zznc = []  # for font C save zzn

    theta = []
    thetaC = []
    thetaval_C = []
    thetaval = []

    serif_h_bot = []
    serif_h_top = []
    serif_v_left = []
    serif_v_right = []

    serif_h_botC = []
    serif_h_topC = []
    serif_v_leftC = []
    serif_v_rightC = []

    serif_h_botval = []
    serif_h_topval = []
    serif_v_leftval = []
    serif_v_rightval = []


    serif_h_botval_C = []
    serif_h_topval_C = []
    serif_v_leftval_C = []
    serif_v_rightval_C = []


    i = 1
    for item, param in fontc_outlines:
        znamer = re.match('z(\d+)r', param.pointname)
        znamel = re.match('z(\d+)l', param.pointname)
        zname = re.match('z(\d+)l', param.pointname)

        x = item.x
        y = item.y

        im = param.pointname

        itheta = param.theta
        iserif_h_bot = param.serif_h_bot
        iserif_h_top = param.serif_h_top
        iserif_v_left = param.serif_v_left
        iserif_v_right = param.serif_v_right


        if znamel and im == znamel.group(0):
            zznb.append(i)

            if itheta is not None:
                ithetaval_C = param.theta
                thetaC.append("theta")
                thetaval_C.append(ithetaval_C)
            else:
                thetaC.append("")
                thetaval_C.append(0)

            if iserif_h_bot is not None:
                iserif_h_botval_C = param.serif_h_bot
                serif_h_botC.append("serif_h_bot")
                serif_h_botval_C.append(iserif_h_botval_C)
            else:
                serif_h_botC.append("")
                serif_h_botval_C.append(0)

            if iserif_h_top is not None:
                iserif_h_topval_C = param.serif_h_top
                serif_h_topC.append("serif_h_top")
                serif_h_topval_C.append(iserif_h_topval_C)
            else:
                serif_h_topC.append("")
                serif_h_topval_C.append(0)

            if iserif_v_left is not None:
                iserif_v_leftval_C = param.serif_v_left
                serif_v_leftC.append("serif_v_left")
                serif_v_leftval_C.append(iserif_v_leftval_C)
            else:
                serif_v_leftC.append("")
                serif_v_leftval_C.append(0)

            if iserif_v_right is not None:
                iserif_v_rightval_C = param.serif_v_right
                serif_v_rightC.append("serif_v_right")
                serif_v_rightval_C.append(iserif_v_rightval_C)
            else:
                serif_v_rightC.append("")
                serif_v_rightval_C.append(0)
# routines for serifs  ################

    fip.write("\n")

    inattr = 0
    ivn = 0
    strz = ""
    zznb = []  # for font B save zzn

    theta = []
    thetaB = []
    thetaval_B = []
    thetaval = []

    serif_h_bot = []
    serif_h_top = []
    serif_v_left = []
    serif_v_right = []

    serif_h_botB = []
    serif_h_topB = []
    serif_v_leftB = []
    serif_v_rightB = []

    serif_h_botval = []
    serif_h_topval = []
    serif_v_leftval = []
    serif_v_rightval = []


    serif_h_botval_B = []
    serif_h_topval_B = []
    serif_v_leftval_B = []
    serif_v_rightval_B = []


    i = 1
    for item, param in fontb_outlines:
        znamer = re.match('z(\d+)r', param.pointname)
        znamel = re.match('z(\d+)l', param.pointname)
        zname = re.match('z(\d+)l', param.pointname)

        x = item.x
        y = item.y

        im = param.pointname

        itheta = param.theta
        iserif_h_bot = param.serif_h_bot
        iserif_h_top = param.serif_h_top
        iserif_v_left = param.serif_v_left
        iserif_v_right = param.serif_v_right


        if znamel and im == znamel.group(0):
            zznb.append(i)

            if itheta is not None:
                ithetaval_B = param.theta
                thetaB.append("theta")
                thetaval_B.append(ithetaval_B)
            else:
                thetaB.append("")
                thetaval_B.append(0)

            if iserif_h_bot is not None:
                iserif_h_botval_B = param.serif_h_bot
                serif_h_botB.append("serif_h_bot")
                serif_h_botval_B.append(iserif_h_botval_B)
            else:
                serif_h_botB.append("")
                serif_h_botval_B.append(0)

            if iserif_h_top is not None:
                iserif_h_topval_B = param.serif_h_top
                serif_h_topB.append("serif_h_top")
                serif_h_topval_B.append(iserif_h_topval_B)
            else:
                serif_h_topB.append("")
                serif_h_topval_B.append(0)

            if iserif_v_left is not None:
                iserif_v_leftval_B = param.serif_v_left
                serif_v_leftB.append("serif_v_left")
                serif_v_leftval_B.append(iserif_v_leftval_B)
            else:
                serif_v_leftB.append("")
                serif_v_leftval_B.append(0)

            if iserif_v_right is not None:
                iserif_v_rightval_B = param.serif_v_right
                serif_v_rightB.append("serif_v_right")
                serif_v_rightval_B.append(iserif_v_rightval_B)
            else:
                serif_v_rightB.append("")
                serif_v_rightval_B.append(0)

    # passing val_B to Font A

    # reading Font A

    fip.write("\n")
    #fip.write("""% serifs """)
    fip.write("if serifs :")

#        if theta[i] != "":
    fip.write("\n")
    fip.write("numeric theta[];")
    fip.write("\n")

    inattr = 0
    ivn = 0
    strz = ""
    zzn = []

    theta = []
    serif_h_bot = []
    serif_h_top = []
    serif_v_left = []
    serif_v_right = []

    i = 1
    for item, param in fonta_outlines:

        znamer = re.match('z(\d+)r', param.pointname)
        znamel = re.match('z(\d+)l', param.pointname)
        zname = re.match('z(\d+)l', param.pointname)

        x = item.x
        y = item.y

        im = param.pointname

        itheta = param.theta
        iserif_h_bot = param.serif_h_bot
        iserif_h_top = param.serif_h_top
        iserif_v_left = param.serif_v_left
        iserif_v_right = param.serif_v_right


        if znamel and im == znamel.group(0):
            zzn.append(i)

            if itheta is not None:
                ithetaval = param.theta
                theta.append("theta")
                thetaval.append(ithetaval)
            else:
                theta.append("")
                thetaval.append(0)

            if iserif_h_bot is not None:
                iserif_h_botval = param.serif_h_bot
                serif_h_bot.append("serif_h_bot")
                serif_h_botval.append(iserif_h_botval)
            else:
                serif_h_bot.append("")
                serif_h_botval.append(0)

            if iserif_h_top is not None:
                iserif_h_topval = param.serif_h_top
                serif_h_top.append("serif_h_top")
                serif_h_topval.append(iserif_h_topval)
            else:
                serif_h_top.append("")
                serif_h_topval.append(0)

            if iserif_v_left is not None:
                iserif_v_leftval = param.serif_v_left
                serif_v_left.append("serif_v_left")
                serif_v_leftval.append(iserif_v_leftval)
            else:
                serif_v_left.append("")
                serif_v_leftval.append(0)

            if iserif_v_right is not None:
                iserif_v_rightval = param.serif_v_right
                serif_v_right.append("serif_v_right")
                serif_v_rightval.append(iserif_v_rightval)
            else:
                serif_v_right.append("")
                serif_v_rightval.append(0)




            i += 1
    zzn.sort()
    zeile = ""
    zeileend = ""
    semi = ");"

    # if len(zzn) != len(zznb):
    #     # glyphs in A and B have different set of Z-points, so raise exception
    #     # to handle this case
    #     raise DifferentZPointError()

    for i in range(len(zzn)):
        zitem = i + 1


        if theta[i] != "":
            zeile += "theta" + str(zitem) + " := angle(" + str(thetaval[i]) + ");" + "\n"

 #       fip.write(zeile)
 #       fip.write("\n")

        if serif_h_bot[i] != "":
            zeile += "serif_h (" + str(zitem) + ", dist" + str(zitem) + ", theta" + str(zitem) + ", " + str(serif_h_botval[i]) + ");"
 #       fip.write(zeile)
 #       fip.write("\n")

        if serif_h_bot[i] != "":
            zeile += "fill serif_edge" + str(zitem) + " shifted (0,+slab) shifted (" + str(penshiftedval[i]) + ") -- cycle;"  + "\n"
 #       else:
  #          zeile = ""
        else:
#            zeile = ""

            if serif_h_top[i] != "":
                zeile += "serif_h (" + str(zitem) + ", dist" + str(zitem) + ", theta" + str(zitem) + ", " + str(serif_h_topval[i]) + ");"
 #       fip.write(zeile)
 #       fip.write("\n")

            if serif_h_top[i] != "":
                zeile += "fill serif_edge" + str(zitem) + " shifted (0,-slab) shifted (" + str(penshiftedval[i]) + ") -- cycle;"  + "\n"
 #       else:
  #          zeile = ""

     #  else:
      #      zeile = ""


            else:
                if serif_v_left[i] != "":
                    zeile += "serif_v (" + str(zitem) + ", dist" + str(zitem) + ", theta" + str(zitem) + ", " + str(serif_v_leftval[i]) + ");" + "\n"
#        fip.write(zeile)
#        fip.write("\n")

                if serif_v_left[i] != "":
                    zeile += "fill serif_edge_v" + str(zitem) + " shifted (+slab,0) shifted (" + str(penshiftedval[i]) + ") -- cycle;"  + "\n"
 #       else:
 #            zeile = ""
    #    else:
   #         zeile = ""

                else:
                    if serif_v_right[i] != "":
                        zeile += "serif_v (" + str(zitem) + ", dist" + str(zitem) + ", theta" + str(zitem) + ", " + str(serif_v_rightval[i]) + ");" + "\n"
#        fip.write(zeile)
#        fip.write("\n")

#                    if serif_v_right[i] != "":
#                        zeile += "fill serif_edge" + str(zitem) + " shifted (0,0) shifted (" + str(penshiftedval[i]) + ") -- cycle;"  + "\n"

                    if serif_v_right[i] != "":
                        zeile += "fill serif_edge_v" + str(zitem) + " shifted (-slab,0)  shifted (" + str(penshiftedval[i]) + ") -- cycle;"  + "\n"

 #       else:
 #            zeile = ""

    fip.write(zeile)
    fip.write("fi;")
    fip.write("\n")



    fip.write("endchar;")

    print time.time() - starttime
    fip.close()
