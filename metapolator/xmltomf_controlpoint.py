import os
import os.path as op
import re
import web

from metapolator import models


class DifferentZPointError(Exception):
    pass


def xmltomf1(master, glyphA, glyphB=None, glyphC=None, glyphD=None, stdout_fip=None, interpolated=False):
    """ Save current points to mf file

        master is an instance of models.Master
        glyph is an instance of models.Glyph
    """
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
    fip.write("% box dimension definition %\n")

    wA = '%.2f' % (glyphA.width / 100.)
    wB = '%.2f' % (glyphB.width / 100.)
    wC = '%.2f' % (glyphC.width / 100.)
    wD = '%.2f' % (glyphD.width / 100.)

    g = glyphA.name  # get from glyphA as we sure that glypha and glyphb exist in font project

    fip.write("\n")

    str_ = ('beginfontchar({glyph}, (((({Awidth}*A_width + metapolation * ({Bwidth}*B_width - {Awidth}*A_width)) + ({Cwidth}*C_width + metapolationCD * ({Dwidth}*D_width - {Cwidth}*C_width))  ) / 2 ) + spacing_{glyph}R) * width_{glyph}, 0, 0 );')
    fip.write(str_.format(Awidth=wA, glyph=glyphA.name, Bwidth=wB, Cwidth=wC, Dwidth=wD))

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

# points for l

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




    fip.write("\n")
    fip.write( """% z points""" )

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

        zeile = "z" + str(zitem) + " = ((( Apx" + str(zitem) + "l + metapolation * (Bpx" + str(zitem) + "l - Apx" + str(zitem) + "l)) + ( Cpx" + str(zitem) + "l + metapolationCD * (Dpx" + str(zitem) + "l - Cpx" + str(zitem) + "l))) /2 , (( Apy" + str(zitem) + "l + metapolation * (Bpy" + str(zitem) + "l - Apy" + str(zitem) + "l)) + ( Cpy" + str(zitem) + "l + metapolationCD * (Dpy" + str(zitem) + "l - Cpy" + str(zitem) + "l))) /2 );"

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

    for item, param in fonta_outlines:
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
            else:
                dirB.append("")
                dirvalB.append(0)

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

            # if itension is not None:
            #     itensionval = param.tension
            #     tensionB.append("tension")
            #     tensionvalB.append(itensionval)

            if itensionand is not None:
                itensionandval = param.tensionand
                tensionandB.append("tensionand")
                tensionandvalB.append(itensionandval[:3])
                tensionandval2B.append(itensionandval[-3:])
            else:
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
    fip.write("""% penstrokes""")

    # fip.write("\n")
    # fip.write("""fill""")

    inattr = 0
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

    downp2 = []
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

    type = []
    typeval = []

    control_out = []
    control_outval = []

    control_in = []
    control_inval = []

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
        itype = param.type
        icontrol_out = param.control_out
        icontrol_in = param.control_in

        if znamel and im == znamel.group(0):
            zzn.append(i)

        # do not delete that lines while you are sure
#        if im == znamel or im == znamer:

            if istartp is not None:
                istartpval = param.startp
                startp.append("\nfill\n")
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


            if itype is not None :
                itypeval = param.type
                type.append("type")
                typeval.append(itypeval)
            else :
                type.append("")
                typeval.append(0)


            if icontrol_out is not None :
                icontrol_outval = param.control_out
                control_out.append("control_out")
                control_outval.append(icontrol_outval)
            else :
                control_out.append("")
                control_outval.append(0)

            if icontrol_in is not None :
                icontrol_inval = param.control_in
                control_in.append("control_in")
                control_inval.append(icontrol_inval)
            else :
                control_in.append("")
                control_inval.append(0)

            i += 1

    zzn.sort()
    zeile = ""
    semi = ";"

    fip.write('\n')

    for i in range(len(zzn) - 1):
        zitem = zzn[i]
        zeile = str(startp[i]) + "z" + str(zitem)

        if startp[i + 1] == "":

            dash = " -- "

            if type[i+1] != "":
                zeile += dash

            if control_out[i] != "":
                zeile = " .. controls z" + str(zitem) + " and "

            if control_in[i] != "":
                zeile = " z" + str(zitem) + " .. "

        else :
          if control_out[i] != "":
            zeile +=  " .. cycle" + semi + '\n'
          else :
            zeile +=  " .. cycle" + semi + '\n'



        fip.write(zeile)

        zitemb = zzn[i + 1]
        zeile = "z" + str(zitemb)
        i=i+1

    if len(zzn) >= i:

        fip.write(zeile + " .. cycle" + semi)




    fip.write("\n")
    fip.write("% pen labels\n")
    fip.write("penlabels(range 1 thru 99);\n")
    fip.write("endchar;")

    print time.time() - starttime
    fip.close()
