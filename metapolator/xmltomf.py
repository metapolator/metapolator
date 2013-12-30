import os
import os.path as op
import re
import web

import models
from config import working_dir, session
from sqlalchemy import func


class DifferentZPointError(Exception):
    pass


def xmltomf1(master, glyphA, glyphB=None, stdout_fip=None):
    """ Save current points to mf file

        master is an instance of models.Master
        glyph is an instance of models.Glyph
    """
    if session.get('mfparser', '') == 'controlpoints':
        import xmltomf_new
        return xmltomf_new.xmltomf1(master, glyphA, glyphB=glyphB,
                                    stdout_fip=stdout_fip)

    import time

    starttime = time.time()

    if not glyphB:
        glyphB = glyphA

    if not stdout_fip:
        path = op.join(master.get_fonts_directory(), "glyphs")
        if not op.exists(path):
            os.makedirs(path)
        fip = open(op.join(path, '%s.mf' % glyphA.name), 'w')
    else:
        fip = stdout_fip

    fip.write("% File parsed with Metapolator %\n")

    '%.2f' % (glyphA.width / 100.)
    w = '%.2f' % (glyphA.width / 100.)
    w2 = '%.2f' % (glyphB.width / 100.)

#    w = str(glyphA.width / 100)
#    w2 = str(glyphB.width / 100)
    g = glyphA.name  # get from glyphA as we sure that glypha and glyphb exist in font project

    fip.write("\n")

    str_ = ('beginfontchar({glyph}, (({width}*A_width + metapolation * '
            '({bwidth}*B_width - {width}*A_width)) + '
            'spacing_{glyph}R) * width_{glyph}, 0, 0 );')
    fip.write(str_.format(width=w, glyph=glyphA.name, bwidth=w2))

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

    for item, param in fonta_outlines:

        znamel = re.match('z(\d+)l', param.pointname)
        znamer = re.match('z(\d+)r', param.pointname)
        zeile = None
        if znamel and param.pointname == znamel.group(0):
            zeile = "px{index}l := {xvalue}u ; py{index}l := {yvalue}u ;"
            zeile = zeile.format(index=znamel.group(1),
                                 xvalue='%.2f' % (item.x / 100.),
                                 yvalue='%.2f' % (item.y / 100.))

        if znamer and param.pointname == znamer.group(0):
            zeile = "px{index}r := {xvalue}u ; py{index}r := {yvalue}u ;"
            zeile = zeile.format(index=znamer.group(1),
                                 xvalue='%.2f' % (item.x / 100.),
                                 yvalue='%.2f' % (item.y / 100.))

        if zeile:
            fip.write("\n")
            fip.write(zeile)

    # reading mid points font A

    fip.write("\n")
    fip.write("""% point coordinates font A""")
    fip.write("\n\n")

    index = 1
    for item, param in fonta_outlines:

        znamer = re.match('z(\d+)r', param.pointname)

        if znamer and param.pointname == znamer.group(0):
            zeile = ".5(px{0}l + px{0}r) = x2{0}0;".format(index)
            fip.write(zeile + '\n')

            zeile = ".5(py{0}l + py{0}r) = y2{0}0;".format(index)
            fip.write(zeile + '\n')

            index += 1

    fip.write("\n")
    fip.write("""% point coordinates font A""")
    fip.write("\n\n")

    index = 1
    for item, param in fonta_outlines:
        znamer = re.match('z(\d+)r', param.pointname)

        if znamer and param.pointname == znamer.group(0):
            zeile = "px{0}l = x{0}Bl; py{0}l = y{0}Bl;".format(index)
            fip.write(zeile + '\n')

            zeile = "px{0}r = x{0}Br; py{0}r = y{0}Br;".format(index)
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
            zeile = "dist{0} := length (z{0}Bl-z{0}Br);".format(index)
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
            zeile = "ppx{index}l := {xvalue}u ; ppy{index}l := {yvalue}u ;"
            zeile = zeile.format(index=znamel.group(1),
                                 xvalue='%.2f' % (item.x / 100.),
                                 yvalue='%.2f' % (item.y / 100.))

        if znamer and param.pointname == znamer.group(0):
            zeile = "ppx{index}r := {xvalue}u ; ppy{index}r := {yvalue}u ;"
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
            zeile = ".5(ppx{0}l + ppx{0}r) = x2{0}A;".format(index)
            fip.write(zeile + '\n')

            zeile = ".5(ppy{0}l + ppy{0}r) = y2{0}A;".format(index)
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
            zeile = "ppx{0}l = x{0}Cl; ppy{0}l = y{0}Cl;".format(index)
            fip.write(zeile + '\n')

            zeile = "ppx{0}r = x{0}Cr; ppy{0}r = y{0}Cr;".format(index)
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
            zeile = "dist{0}B := length (z{0}Cl - z{0}Cr);".format(index)
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
            zeile = "ang{0} := angle ((z{0}Br + (metapolation * (z{0}Cr - z{0}Br))) - (z{0}Bl + (metapolation * (z{0}Cl - z{0}Bl))));".format(index)
            index += 1
            fip.write(zeile + '\n')

# reading extra pen angle Font B  ################

    fip.write("\n")
    fip.write("""% test extra pen angle Font B""")

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

    if len(zzn) != len(zznb):
        # glyphs in A and B have different set of Z-points, so raise exception
        # to handle this case
        raise DifferentZPointError()

    for i in range(len(zzn)):
        zitem = i + 1

        if angle[i]:
#            angleb = angleval_B[i]
            zeile = "ang" + str(zitem) + " := " + str(angleval[i]) + "+ (metapolation * (" + str(angleval_B[i]) + " - " + str(angleval[i]) + " ));"
        else:
            zeile = "ang" + str(zitem) + " := ang" + str(zitem) + ";"

        fip.write("\n")
        fip.write(zeile)

# reading font Pen Positions Font B

    fip.write("\n")
    fip.write("""% penposition font B""")

    inattr = 0
    ivn = 0
    strz = ""
    zzn = []

    penwidth = []
    penwidthval = []
    B_penwidthval = []

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

        ipenwidth = param.penwidth
        istartp = param.startp

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

# reading Pen Positions Font A

    fip.write("\n")
    fip.write("""% penposition font A""")

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

        # istemcutter = param.stemcutter
        # iinktrap_l = param.inktrap_l
        # iinktrap_r = param.inktrap_r
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

            # if istemcutter is not None:
            #     istemcutterval = param.stemcutter
            #     stemcutterval.append(istemcutterval)

            # if iinktrap_l is not None:
            #     iinktrap_lval = param.inktrap_l
            #     inktrap_l.append("inktrap_l")
            #     inktrap_lval.append(iinktrap_lval)

            # if iinktrap_r is not None:
            #     iinktrap_rval = param.inktrap_r
            #     inktrap_r.append("inktrapcut")
            #     inktrap_rval.append(iinktrap_rval)

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

#            if icomp is not None:
#                icompval = param.comp
#                comp.append("comp")
#                compval.append(icompval)
            i += 1

    zzn.sort()
    zeile = ""
    zeileend = ""
    semi = ";"
    close = ")"
    for i in range(len(zzn)):
        zitem = i + 1

        if penwidth[i]:
            zeile = """penpos"""  + str(zitem) + "((" + str(A_penwidthval[i]) +" + metapolation * (" + str(B_penwidthval[i]) + " - " + str(A_penwidthval[i]) + ")) * " + "((dist" +str(zitem) + " + metapolation * (dist" +str(zitem) + "B - dist" +str(zitem) + ")) + (A_px + metapolation * (B_px - A_px)) + ((A_skeleton/50 + metapolation * (B_skeleton/50-A_skeleton/50)) * (dist" +str(zitem) + " + metapolation * (dist" +str(zitem) + "B - dist" +str(zitem) + "))))"
        else:
            zeile = """penpos"""  + str(zitem) + "((dist" +str(zitem) + " + metapolation * (dist" +str(zitem) + "B - dist" +str(zitem) + ")) + (A_px + metapolation * (B_px - A_px)) + ((A_skeleton/50 + metapolation * (B_skeleton/50-A_skeleton/50)) * (dist" +str(zitem) + " + metapolation * (dist" +str(zitem) + "B - dist" +str(zitem) + ")))"

        zeile = zeile + ", ang" + str(zitem) + ");"
        fip.write("\n")
        fip.write(zeile)

# testing new center points

    fip.write("\n")
    fip.write( """% test new center (z) points""" )

    mean = ['13','14','26','29','65','67','69','77','78','79','82','83','85','86','87','88','90','94','95','12','27','63','71','80','81','89','2','7','11','28','30','62','64','66','68','70','72','73','75','76','84','4','8','9','15','59','60','61','74','91','92','93']
#des = ['12','27','63','71','80','81','89']
#asc = ['2','7','11','28','30','62','64','66','68','70','72','73','75','76','84']
    cap = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24', '25', '26', '27', '28', '29', '30', '31', '32', '33', '34', '35', '36', '37', '38', '39', '40', '41', '42', '43', '44', '45', '46', '47', '48', '49', '50', '51', '52', '53', '54', '55', '56', '57', '58', '59', '60', '61', '62', '63', '64', '65', '66', '67', '68', '69', '70', '71', '72', '73', '74', '75', '76', '77', '78', '79', '80', '81', '82', '83', '84', '85', '86', '87', '88', '89', '90', '91', '92', '93', '94', '95', '96', '97', '98', '99', '100', '101', '102', '103', '104', '105', '106', '107', '108', '109', '110', '111', '112', '113', '114', '115', '116', '117', '118', '119', '120', '121', '122', '123', '124', '125', '126', '127', '128', '129', '130', '131', '132', '133', '134', '135', '136', '137', '138', '139', '140', '141', '142', '143', '144', '145', '146', '147', '148', '149', '150', '151', '152', '153', '154', '155', '156', '157', '158', '159', '160', '161', '162', '163', '164', '165', '166', '167', '168', '169', '170', '171', '172', '173', '174', '175', '176', '177', '178', '179', '180', '181', '182', '183', '184', '185', '186', '187', '188', '189', '190', '191', '192', '193', '194', '195', '196', '197', '198', '199', '200', '201', '202', '203', '204', '205', '206', '207', '208', '209', '210', '211', '212', '213', '214', '215', '216', '217', '218', '219', '220', '221', '222', '223', '224', '225', '226', '227', '228', '229', '230', '231', '232', '233', '234', '235', '236', '237', '238', '239', '240', '241', '242', '243', '244', '245', '246', '247', '248', '249', '250', '251', '252', '253', '254', '255', '256', '257', '258', '259', '260', '261', '262', '263', '264', '265', '266', '267', '268', '269', '270', '271', '272', '273', '274', '275', '276', '277', '278', '279', '280', '281', '282', '283', '284', '285', '286', '287', '288', '289', '290', '291', '292', '293', '294', '295', '296', '297', '298', '299', '300', '301', '302', '303', '304', '305', '306', '307', '308', '309', '310', '311', '312', '313', '314', '315', '316', '317', '318', '319', '320', '321', '322', '323', '324', '325', '326', '327', '328', '329', '330', '331', '332', '333', '334', '335', '336', '337', '338', '339', '340', '341', '342', '343', '344', '345', '346', '347', '348', '349', '350', '351', '352', '353', '354', '355', '356', '357', '358', '359', '360', '361', '362', '363', '364', '365', '366', '367', '368', '369', '370', '371', '372', '373', '374', '375', '376', '377', '378', '379', '380', '381', '382', '383', '384', '385', '386', '387', '388', '389', '390', '391', '392', '393', '394', '395', '396', '397', '398', '399', '400', '401', '402', '403', '404', '405', '406', '407', '408', '409', '410', '411', '412', '413', '414', '415', '416', '417', '418', '419', '420', '421', '422', '423', '424', '425', '426', '427', '428', '429', '430', '431', '432', '433', '434', '435', '436', '437', '438', '439', '440', '441', '442', '443', '444', '445', '446', '447', '448', '449', '450', '451', '452', '453', '454', '455', '456', '457', '458', '459', '460', '461', '462', '463', '464', '465', '466', '467', '468', '469', '470', '471', '472', '473', '474', '475', '476', '477', '478', '479', '480', '481', '482', '483', '484', '485', '486', '487', '488', '489', '490', '491', '492', '493', '494', '495', '496', '497', '498', '499', '500', '501', '502', '503', '504', '505', '506', '507', '508', '509', '510', '511', '512', '513', '514', '515', '516', '517', '518', '519', '520', '521', '522', '523', '524', '525', '526', '527', '528', '529', '530', '531', '532', '533', '534', '535', '536', '537', '538', '539', '540', '541', '542', '543', '544', '545', '546', '547', '548', '549', '550', '551', '552', '553', '554', '555', '556', '557', '558', '559', '560', '561', '562', '563', '564', '565', '566', '567', '568', '569', '570', '571', '572', '573', '574', '575', '576', '577', '578', '579', '580', '581', '582', '583', '584', '585', '586', '587', '588', '589', '590', '591', '592', '593', '594', '595', '596', '597', '598', '599', '600', '601', '602', '603', '604', '605', '606', '607', '608', '609', '610', '611', '612', '613', '614', '615', '616', '617', '618', '619', '620', '621', '622', '623', '624', '625', '626', '627', '628', '629', '630', '631', '632', '633', '634', '635', '636', '637', '638', '639', '640', '641', '642', '643', '644', '645', '646', '647', '648', '649', '650', '651', '652', '653', '654', '655', '656', '657', '658', '659', '660', '661', '662', '663', '664', '665', '666', '667', '668', '669', '670', '671', '672', '673', '674', '675', '676', '677', '678', '679', '680', '681', '682', '683', '684', '685', '686', '687', '688', '689', '690', '691', '692', '693', '694', '695', '696', '697', '698', '699', '700', '701', '702', '703', '704', '705', '706', '707', '708', '709', '710', '711', '712', '713', '714', '715', '716', '717', '718', '719', '720', '721', '722', '723', '724', '725', '726', '727', '728', '729', '730', '731', '732', '733' ]#box = ['4','8','9','15','59','60','61','74','91','92','93']

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

        # if ascpoint[i] != '':
        #     zeile = "z" + str(zitem) + "=((A_width + metapolation * (B_width - A_width)) * (x2" + str(zitem) + "0 + metapolation * (x2" + str(zitem) + "A - x2" + str(zitem) + "0) + spacing_" + g + "L) * width_" + g + ", (y2" + str(zitem) + "0 + metapolation *(y2" + str(zitem) + "A - y2" + str(zitem) + "0))*((A_ascender + metapolation * (B_ascender - A_ascender)) / asc#))"
        # if descpoint[i] != "":
        #     zeile = "z" + str(zitem) + "=((A_width + metapolation * (B_width - A_width)) * (x2" + str(zitem) + "0 + metapolation * (x2" + str(zitem) + "A - x2" + str(zitem) + "0) + spacing_" + g + "L) * width_" + g + ", (y2" + str(zitem) + "0 + metapolation *(y2" + str(zitem) + "A - y2" + str(zitem) + "0))*((A_descender + metapolation * (B_descender - A_descender)) / desc#))"
        # else:
        zeile = "z" + str(zitem) + "=((A_width + metapolation * (B_width - A_width)) * (x2" + str(zitem) + "0 + metapolation * (x2" + str(zitem) + "A - x2" + str(zitem) + "0) + spacing_" + g + "L) * width_" + g + ", (y2" + str(zitem) + "0 + metapolation *(y2" + str(zitem) + "A - y2" + str(zitem) + "0))*((A_" + ggroup + " + metapolation * (B_" + ggroup + " - A_" + ggroup + ")) / " + gggroup + "#))"

        if pointshifted[i] != '':
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

#            if itensionand is not None:
#                itensionandval = param.tensionand
#                tensionandB.append("tensionand")
#                tensionandvalB.append(itensionandval[:3])
#                tensionandval2B.append(itensionandval[-3:])

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
            elif doubledash[i] != "":
                dash = " -- "
            # elif tension[i] != "":
            #     dash = ""
            elif tensionand[i] != "":
                dash = ""
            # elif superleft[i] != "":
            #     dash = ""
            # elif superright[i] != "":
            #     dash = ""
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

            # if tension[i] != "" and leftp2[i] != "":
            #     if tensionB[i] != "":
            #         zeile += strtwo + "tension" + " (" + str(tensionval[i]) + '/100 + (metapolation * (' + str(tensionvalB[i]) + '/100 -' + str(tensionval[i]) + '/100 )))' + strtwo + "{left}"
            #     else:
            #         zeile += strtwo + "tension" + " (" + str(tensionval[i]) + '/100 + (metapolation * (' + str(tensionval[i]) + '/100 -' + str(tensionval[i]) + '/100 )))' + strtwo + "{left}"

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

                    # if tension[i] != "" and upp2[i] != "":
                    #     if tensionB[i] != "":
                    #         zeile = zeile + strtwo + "tension" + " (" + str(tensionval[i]) + '/100 + (metapolation * (' + str(tensionvalB[i]) + '/100 -' + str(tensionval[i]) + '/100 )))' + strtwo + "{up}"
                    #     else:
                    #         zeile = zeile + strtwo + "tension" + " (" + str(tensionval[i]) + '/100 + (metapolation * (' + str(tensionval[i]) + '/100 -' + str(tensionval[i]) + '/100 )))' + strtwo + "{up}"

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
                            # if tension[i] != "" and dir2[i] != "":
                            #     zeile += strtwo + "tension" + " (" + str(tensionval[i]) + '/100 + (metapolation * (' + str(tensionvalB[i]) + '/100 -' + str(tensionval[i]) + '/100 )))' + strtwo + " {dir (" + str(dir2val[i]) + " + metapolation * (" + str(dir2valB[i]) + " - " + str(dir2val[i]) + "))}"

                            if tensionand[i] != "" and dir2[i] != "":
                                zeile += strtwo + "tension" + " ((" + str(tensionandval[i]) + '/100) + (metapolation * ((' + str(tensionandvalB[i]) + '/100) - (' + str(tensionandval[i]) + '/100))))' + " and ((" + str(tensionandval2[i]) + '/100) + (metapolation * ((' + str(tensionandval2B[i]) + '/100) - (' + str(tensionandval2[i]) + '/100))))' + strtwo + " {dir (" + str(dir2val[i]) + " + metapolation * (" + str(dir2valB[i]) + " - " + str(dir2val[i]) + "))}"
                            else:
                                if dir2[i] != "":
                                    zeile += " ... {dir (" + str(dir2val[i]) + " + metapolation * (" + str(dir2valB[i]) + " - " + str(dir2val[i]) + "))}"
                                # else:
                                #     if tension[i] != "":
                                #         zeile += strtwo + "tension" + " (" + str(tensionval[i]) + '/100 + (metapolation * (' + str(tensionvalB[i]) + '/100 -' + str(tensionval[i]) + '/100 )))' + strtwo
                                #     elif tensionand[i] != "":
                                #         zeile += strtwo + "tension" + " ((" + str(tensionandval[i]) + '/100) + (metapolation * ((' + str(tensionandvalB[i]) + '/100) - (' + str(tensionandval[i]) + '/100))))' + " and ((" + str(tensionandval2[i]) + '/100) + (metapolation * ((' + str(tensionandval2B[i]) + '/100) - (' + str(tensionandval2[i]) + '/100))))' + strtwo

            zeile += dash
        else:
            if dir[i] != "":
                zeile = zeile + " {dir (" + str(dirval[i]) + " + metapolation * (" + str(dirvalB[i]) + " - " + str(dirval[i]) + "))}"

            if overx[i] != "":
                zeile = zeile + " shifted (0, (A_xheight*pt + metapolation * (B_xheight*pt - A_xheight*pt)) - " + str(overxval[i]) + ") + (0, A_over + metapolation * (B_over - A_over))"

            if overbase[i] != "":
                zeile = zeile + " shifted (0, - " + str(overbaseval[i]) + ") - (0, A_over + metapolation * (B_over - A_over))"

            if overcap[i] != "":
                zeile = zeile + " shifted (0, (A_capital*pt + metapolation * (B_capital*pt - A_capital*pt)) - " + str(overcapval[i]) + ") + (0, A_over + metapolation * (B_over - A_over))"

            if overasc[i] != "":
                zeile = zeile + " shifted (0, (A_ascender*pt + metapolation * (B_ascender*pt - A_ascender*pt )) - " + str(overascval[i]) + ") + (0, A_over + metapolation * (B_over - A_over))"

            if overdesc[i] != "":
                zeile = zeile + " shifted (0, (A_descender*pt + metapolation * (B_descender*pt  - A_descender*pt )) - " + str(overdescval[i]) + ") - (0, A_over + metapolation * (B_over - A_over))"

            if penshifted[i] != "":
                zeile = zeile + " shifted (" + str(penshiftedval[i]) + ")"

            # if tension[i] != ""and upp2[i] != "":
            #     zeile += strtwo + "tension" + " (" + str(tensionval[i]) + '/100 + (metapolation * (' + str(tensionvalB[i]) + '/100-' + str(tensionval[i]) + '/100)))' + strtwo + "{up}"
            # elif upp2[i] != "":
            #     zeile += dash + "{up}"

            # if tension[i] != ""and downp2[i] != "":
            #     zeile += strtwo + "tension" + " (" + str(tensionval[i]) + '/100 + (metapolation * (' + str(tensionvalB[i]) + '/100-' + str(tensionval[i]) + '/100)))' + strtwo + "{down}"
            # elif downp2[i] != "":
            #     zeile += dash + "{down}"

            # if tension[i] != ""and rightp2[i] != "":
            #     zeile += strtwo + "tension" + " (" + str(tensionval[i]) + '/100 + (metapolation * (' + str(tensionvalB[i]) + '/100-' + str(tensionval[i]) + '/100)))' + strtwo + "{right}"
            # elif rightp2[i] != "":
            #     zeile += dash + "{right}"

            # if tension[i] != ""and leftp2[i] != "":
            #     zeile += strtwo + "tension" + " (" + str(tensionval[i]) + '/100 + (metapolation * (' + str(tensionvalB[i]) + '/100-' + str(tensionval[i]) + '/100)))' + strtwo + "{left}"
            # elif leftp2[i] != "":
            #     zeile += dash + "{left}"

            # if tension[i] != ""and dir2[i] != "":
            #     zeile += strtwo + "tension" + " (" + str(tensionval[i]) + '/100 + (metapolation * (' + str(tensionvalB[i]) + '/100-' + str(tensionval[i]) + '/100)))' + strtwo + "{dir " + str(dir2val[i]) + "}"
            # elif dir2[i] != "":
            #     zeile += dash + "{dir " + str(dir2val[i]) + "}"

            # if tension[i] != ""and cycle[i] != "":
            #     zeile += strtwo + "tension" + " (" + str(tensionval[i]) + '/100 + (metapolation * (' + str(tensionvalB[i]) + '/100-' + str(tensionval[i]) + '/100)))' + strtwo + "cycle"
            # else:
                # if tensionand[i] != ""and cycle[i] != "":
                #     zeile += strtwo + "tension" + " ((" + str(tensionandval[i]) + '/100) + (metapolation * ((' + str(tensionandvalB[i]) + '/100) - (' + str(tensionandval[i]) + '/100))))' + " and ((" + str(tensionandval2[i]) + '/100) + (metapolation * ((' + str(tensionandval2B[i]) + '/100) - (' + str(tensionandval2[i]) + '/100))))' + strtwo + "cycle"
                # else:
                #     if cycle[i] != "":
                #         zeile += dash + "cycle"
                #     elif tension[i] != "":
                #         zeile += strtwo + "tension" + " (" + str(tensionval[i]) + '/100 + (metapolation * (' + str(tensionvalB[i]) + '/100 -' + str(tensionval[i]) + '/100 )))' + strtwo

            if tensionand[i] != "":
                zeile += strtwo + "tension" + " ((" + str(tensionandval[i]) + '/100) + (metapolation * ((' + str(tensionandvalB[i]) + '/100) - (' + str(tensionandval[i]) + '/100))))' + " and ((" + str(tensionandval2[i]) + '/100) + (metapolation * ((' + str(tensionandval2B[i]) + '/100) - (' + str(tensionandval2[i]) + '/100))))' + strtwo

            zeile += semi + '\n'

        # fip.write("\n")
        fip.write(zeile)

        zitemb = zzn[i + 1]
        zeile = "z" + str(zitemb) + "e"

    if len(zzn) >= i:
        i += 1

        # write final point with zzn[i + 1]
        if penshifted[i] != "":
            zeile += " shifted (" + str(penshiftedval[i]) + ")"

        if dir[i] != "":
            zeile += " {dir (" + str(dirval[i]) + " + metapolation * (" + str(dirvalB[i]) + " - " + str(dirval[i]) + "))}"

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

        # if tension[i] != "" and upp2[i] != "":
        #     zeile += strtwo + "tension" + " (" + str(tensionval[i]) + '/100 + (metapolation * (' + str(tensionvalB[i]) + '/100-' + str(tensionval[i]) + '/100)))' + strtwo + "{up}"

        # if tension[i] != ""and downp2[i] != "":
        #     zeile += strtwo + "tension" + " (" + str(tensionval[i]) + '/100 + (metapolation * (' + str(tensionvalB[i]) + '/100-' + str(tensionval[i]) + '/100)))' + strtwo + "{down}"

        # if tension[i] != ""and rightp2[i] != "":
        #     zeile += strtwo + "tension" + " (" + str(tensionval[i]) + '/100 + (metapolation * (' + str(tensionvalB[i]) + '/100-' + str(tensionval[i]) + '/100)))' + strtwo + "{right}"

        # if tension[i] != ""and leftp2[i] != "":
        #     zeile += strtwo + "tension" + " (" + str(tensionval[i]) + '/100 + (metapolation * (' + str(tensionvalB[i]) + '/100-' + str(tensionval[i]) + '/100)))' + strtwo + "{left}"

        # if tension[i] != ""and dir2[i] != "":
        #     zeile += strtwo + "tension" + " (" + str(tensionval[i]) + '/100 + (metapolation * (' + str(tensionvalB[i]) + '/100-' + str(tensionval[i]) + '/100)))' + strtwo + "{dir " + str(dir2val[i]) + "}"

        if tensionand[i] != ""and dir2[i] != "":
            zeile += strtwo + "tension" + " ((" + str(tensionandval[i]) + '/100) + (metapolation * ((' + str(tensionandvalB[i]) + '/100) - (' + str(tensionandval[i]) + '/100))))' + " and ((" + str(tensionandval2[i]) + '/100) + (metapolation * ((' + str(tensionandval2B[i]) + '/100) - (' + str(tensionandval2[i]) + '/100))))' + strtwo + " {dir (" + str(dir2val[i]) + " + metapolation * (" + str(dir2valB[i]) + " - " + str(dir2val[i]) + "))}"

        if upp2[i] != "":
            zeile += dash + upp2[i]
        elif dir2[i] != "":
            zeile += " ... {dir " + str(dir2val[i]) + "}"
        elif downp2[i] != "":
            zeile += dash + downp2[i]
        elif upp2[i] != "":
            zeile += dash + upp2[i]
        elif leftp2[i] != "":
            zeile += dash + leftp2[i]
        elif rightp2[i] != "":
            zeile += dash + rightp2[i]
        # elif tension[i] != "":
        #     zeile += strtwo + "tension" + " (" + tensionval[i] + '/100 + (metapolation * (' + tensionvalB[i] + '/100-' + tensionval[i] + '/100)))' + strtwo + downp2[i]
        elif tensionand[i] != ""and cycle[i] != "":
            zeile += strtwo + "tension" + " ((" + str(tensionandval[i]) + '/100) + (metapolation * ((' + str(tensionandvalB[i]) + '/100) - (' + str(tensionandval[i]) + '/100))))' + " and ((" + str(tensionandval2[i]) + '/100) + (metapolation * ((' + str(tensionandval2B[i]) + '/100) - (' + str(tensionandval2[i]) + '/100))))' + strtwo + "cycle"
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
    fip.write("""% serifs """)
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

    if len(zzn) != len(zznb):
        # glyphs in A and B have different set of Z-points, so raise exception
        # to handle this case
        raise DifferentZPointError()

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
            zeile += "fill serif_edge" + str(zitem) + " shifted (0,+slab) -- cycle;"  + "\n"
 #       else:
  #          zeile = "" 
        else:
#            zeile = ""  

            if serif_h_top[i] != "":
                zeile += "serif_h (" + str(zitem) + ", dist" + str(zitem) + ", theta" + str(zitem) + ", " + str(serif_h_topval[i]) + ");" 
 #       fip.write(zeile)
 #       fip.write("\n")

            if serif_h_top[i] != "":
                zeile += "fill serif_edge" + str(zitem) + " shifted (0,-slab) -- cycle;"  + "\n"
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
                    zeile += "fill serif_edge" + str(zitem) + " shifted (+slab,0) -- cycle;"  + "\n"
 #       else:
 #            zeile = "" 
    #    else:
   #         zeile = ""

                else:
                    if serif_v_right[i] != "":
                        zeile += "serif_v (" + str(zitem) + ", dist" + str(zitem) + ", theta" + str(zitem) + ", " + str(serif_v_rightval[i]) + ");" + "\n"
#        fip.write(zeile)
#        fip.write("\n")

                    if serif_v_right[i] != "":
                        zeile += "fill serif_edge" + str(zitem) + " shifted (-slab,0) -- cycle;"  + "\n"
 #       else:
 #            zeile = "" 

    fip.write(zeile)
    fip.write("\n")



    fip.write("endchar;")

    print time.time() - starttime
    fip.close()
