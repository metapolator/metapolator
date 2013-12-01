import os
import os.path as op
import re
import xmltomf
import web
from lxml import etree

from config import buildfname, working_dir

from models import Glyph, GlyphParam, GlyphOutline, GlobalParam, LocalParam


def project_exists(master):
    return master.metafont_exists('a') and master.metafont_exists('b')


def makefont(working_dir, master, cells=['A', 'B', 'M']):
    if not project_exists(master):
        return False

    os.environ['MFINPUTS'] = master.get_fonts_directory()

    for cell in cells:
        if not cell or cell.upper() == 'A':
            metafont = master.get_metafont('a')
            strms = "cd %s; sh %s %s" % (working_dir, "makefont.sh", metafont)
            os.system(strms)

        if not cell or cell.upper() == 'B':
            metafont = master.get_metafont('b')
            strms = "cd %s; sh %s %s" % (working_dir, "makefont.sh", metafont)
            os.system(strms)

        if not cell or cell.upper() == 'M':
            metafont = master.get_metafont()
            strms = "cd %s; sh %s %s" % (working_dir, "makefont.sh", metafont)
            os.system(strms)
    return True


def fnextension(filename):
    try:
        basename, extension = filename.split('.')
    except:
        extension = "garbage"
    return extension


def ufo2mf(master):
    dirnamef1 = op.join(master.get_ufo_path('a'), "glyphs")
    dirnamef2 = op.join(master.get_ufo_path('b'), "glyphs")
    dirnamep1 = op.join(master.get_fonts_directory(), "glyphs")
    if not op.exists(dirnamep1):
        os.makedirs(dirnamep1)

    charlist1 = filter(lambda f: fnextension(f) == 'glif', os.listdir(dirnamef1))
    charlist2 = filter(lambda f: fnextension(f) == 'glif', os.listdir(dirnamef2))

    for ch1 in charlist1:
        if ch1 in charlist2:
            fnb, ext = buildfname(ch1)
            glyphA = Glyph.get(master_id=master.id, fontsource='A', name=fnb)
            glyphB = Glyph.get(master_id=master.id, fontsource='B', name=fnb)
            xmltomf.xmltomf1(master, glyphA, glyphB)

    writeGlyphlist(master, glyphA.name)
    makefont(working_dir(), master)


def writeGlyphlist(master, glyphid=None):
    ifile = open(op.join(master.get_fonts_directory(), "glyphlist.mf"), "w")
    dirnamep1 = op.join(master.get_fonts_directory(), "glyphs")

    charlist1 = [f for f in os.listdir(dirnamep1)]

    for ch1 in charlist1:
        fnb, ext = buildfname(ch1)
        if (not glyphid or str(glyphid) == fnb) and ext in ["mf"]:
            ifile.write("input glyphs/" + ch1 + "\n")
    ifile.close()


def create_glyph(glif, master, ab_source):
    itemlist = glif.find('advance')
    width = itemlist.get('width')

    glyph = glif.getroot()
    glyphname = glyph.get('name')

    itemlist = glif.find('unicode')
    unicode = itemlist.get('hex')
    if not Glyph.exists(name=glyphname, master_id=master.id,
                        fontsource=ab_source):
        glyph = Glyph.create(name=glyphname, width=width, unicode=unicode,
                             master_id=master.id, fontsource=ab_source)
    else:
        glyph = Glyph.get(name=glyphname, master_id=master.id,
                          fontsource=ab_source)
        glyph.width = width
        glyph.unicode = unicode
        web.ctx.orm.commit()

    for i, point in enumerate(glif.xpath('//outline/contour/point')):
        pointname = point.attrib.get('name')
        if not pointname:
            pointname = 'p%s' % (i + 1)

        glyphoutline = GlyphOutline.get(glyphname=glyphname, glyph_id=glyph.id,
                                        master_id=master.id,
                                        fontsource=ab_source, pointnr=(i + 1))
        if not glyphoutline:
            glyphoutline = GlyphOutline.create(glyphname=glyphname,
                                               glyph_id=glyph.id,
                                               master_id=master.id,
                                               fontsource=ab_source,
                                               pointnr=(i + 1))
        glyphoutline.x = float(point.attrib['x'])
        glyphoutline.y = float(point.attrib['y'])

        glyphparam = GlyphParam.get(glyphoutline_id=glyphoutline.id,
                                    glyph_id=glyph.id)
        if not glyphparam:
            glyphparam = GlyphParam.create(glyphoutline_id=glyphoutline.id,
                                           master_id=master.id,
                                           glyph_id=glyph.id,
                                           pointname=pointname)
        for attr in point.attrib:
            if attr == 'name':
                continue
            setattr(glyphparam, attr, point.attrib[attr])
        web.ctx.orm.commit()


def putFontAllglyphs(master, glyphid=None):
    # read all fonts (xml files with glif extension) in unix directory
    # and put the xml data into db using the rule applied in loadoption
    # only the fonts (xml file) will be read when the glifs are present
    # in both fonts A and B

    source_fontpath_A = op.join(master.get_ufo_path('a'), 'glyphs')
    source_fontpath_B = op.join(master.get_ufo_path('b'), 'glyphs')

    charlista = [f for f in os.listdir(source_fontpath_A)]
    charlistb = [f for f in os.listdir(source_fontpath_B)]

    for ch1 in charlista:
        glyphName, ext = buildfname(ch1)
        if ext in ["glif"] and (not glyphid or glyphid == glyphName):
            glif = etree.parse(op.join(source_fontpath_A, ch1))
            create_glyph(glif, master, 'A')

    for ch1 in charlistb:
        glyphName, ext = buildfname(ch1)
        if ext in ["glif"] and (not glyphid or glyphid == glyphName):
            glif = etree.parse(op.join(source_fontpath_B, ch1))
            create_glyph(glif, master, 'B')


def get_json(content, glyphid=None):
    contour_pattern = re.compile(r'Filled\scontour\s:\n(.*?)..cycle', re.I | re.S | re.M)
    point_pattern = re.compile(r'\(([-\d.]+),([-\d.]+)\)..controls\s'
                               r'\(([-\d.]+),([-\d.]+)\)\sand\s'
                               r'\(([-\d.]+),([-\d.]+)\)')

    pattern = re.findall(r'\[(\d+)\]\s+Edge structure(.*?)End edge', content,
                         re.I | re.DOTALL | re.M)
    edges = []
    x_min = 0
    y_min = 0
    x_max = 0
    y_max = 0
    for glyph, edge in pattern:
        if glyphid and int(glyphid) != int(glyph):
            continue
        contours = []
        for contour in contour_pattern.findall(edge.strip()):
            contour = re.sub('\n(\S)', '\\1', contour)
            _contours = []
            handleIn_X, handleIn_Y = None, None
            for point in contour.split('\n'):
                point = point.strip().strip('..')
                match = point_pattern.match(point)
                if not match:
                    continue

                X = match.group(1)
                Y = match.group(2)

                handleOut_X = match.group(3)
                handleOut_Y = match.group(4)

                controlpoints = [{'x': 0, 'y': 0},
                                 {'x': handleOut_X, 'y': handleOut_Y}]
                if handleIn_X is not None and handleIn_Y is not None:
                    controlpoints[0] = {'x': handleIn_X, 'y': handleIn_Y}

                _contours.append({'x': X, 'y': Y,
                                  'controls': controlpoints})
                handleIn_X = match.group(5)
                handleIn_Y = match.group(6)

                x_min = min(x_min, float(X), float(handleOut_X), float(handleIn_X))
                y_min = min(y_min, float(Y), float(handleOut_Y), float(handleIn_Y))
                x_max = max(x_max, float(X), float(handleOut_X), float(handleIn_X))
                y_max = max(y_max, float(Y), float(handleOut_Y), float(handleIn_Y))

            if handleIn_X and handleIn_Y:
                _contours[0]['controls'][0] = {'x': handleIn_X,
                                               'y': handleIn_Y}

            contours.append(_contours)
        edges.append({'glyph': glyph, 'contours': contours})

    width = abs(x_max) + abs(x_min)
    height = abs(y_max) + abs(y_min)
    return {'total_edges': len(edges), 'edges': edges,
            'width': width, 'height': height}


GLOBAL_DEFAULTS = {
    'metapolation': 0,
    'unitwidth': 1,
    'fontsize': 10,
    'mean': 5,
    'cap': 6,
    'ascl': 8,
    'desc': -2,
    'box': 10
}


LOCAL_DEFAULTS = {
    'px': 0,
    'width': 1,
    'space': 0,
    'xheight': 5,
    'capital': 6,
    'ascender': 8,
    'descender': -2,
    'skeleton': 0,
    'over': 0
}


def get_global_param(param, key):
    if not param:
        try:
            return GLOBAL_DEFAULTS[key]
        except KeyError:
            return 0
    return getattr(param, key, 0)


def get_local_param(param, key):
    if not param:
        try:
            return LOCAL_DEFAULTS[key]
        except KeyError:
            return 0
    return getattr(param, key, 0)


def writeParams(master, filename, metapolation=None):
    globalparam = GlobalParam.get(id=master.idglobal)

    metap = get_global_param(globalparam, 'metapolation')
    unitwidth = get_global_param(globalparam, 'unitwidth')

    fontsize = get_global_param(globalparam, 'fontsize')
    mean = get_global_param(globalparam, 'mean')
    cap = get_global_param(globalparam, 'cap')
    ascl = get_global_param(globalparam, 'ascl')
    des = get_global_param(globalparam, 'des')
    box = get_global_param(globalparam, 'box')

    ifile = open(filename, "w")
    # global parameters
    ifile.write("% parameter file \n")
    if metapolation is not None:
        ifile.write("metapolation:=%.2f;\n" % metapolation)
    else:
        ifile.write("metapolation:=%.2f;\n" % metap)
    ifile.write("font_size:=%.3fpt#;\n" % fontsize)
    ifile.write("mean#:=%.3fpt#;\n" % mean)
    ifile.write("cap#:=%.3fpt#;\n" % cap)
    ifile.write("asc#:=%.3fpt#;\n" % ascl)
    ifile.write("desc#:=%.3fpt#;\n" % des)
    ifile.write("box#:=%.3fpt#;\n" % box)
    ifile.write("u#:=%.3fpt#;\n" % unitwidth)

    imlo = LocalParam.get(id=master.idlocala)
    ifile.write("A_px#:=%.2fpt#;\n" % get_local_param(imlo, 'px'))
    ifile.write("A_width:=%.2f;\n" % get_local_param(imlo, 'width'))
    ifile.write("A_space:=%.2f;\n" % get_local_param(imlo, 'space'))
    ifile.write("A_spacept:=%.2fpt;\n" % get_local_param(imlo, 'space'))
    ifile.write("A_xheight:=%.2f;\n" % get_local_param(imlo, 'xheight'))
    ifile.write("A_capital:=%.2f;\n" % get_local_param(imlo, 'capital'))
    ifile.write("A_ascender:=%.2f;\n" % get_local_param(imlo, 'ascender'))
    ifile.write("A_descender:=%.2f;\n" % get_local_param(imlo, 'descender'))
    ifile.write("A_skeleton#:=%.2fpt#;\n" % get_local_param(imlo, 'skeleton'))
    ifile.write("A_over:=%.2fpt;\n" % get_local_param(imlo, 'over'))

    # local parameters B
    imlo = LocalParam.get(id=master.idlocalb)
    ifile.write("B_px#:=%.2fpt#;\n" % get_local_param(imlo, 'px'))
    ifile.write("B_width:=%.2f;\n" % get_local_param(imlo, 'width'))
    ifile.write("B_space:=%.2f;\n" % get_local_param(imlo, 'space'))
    ifile.write("B_spacept:=%.2fpt;\n" % get_local_param(imlo, 'space'))
    ifile.write("B_xheight:=%.2f;\n" % get_local_param(imlo, 'xheight'))
    ifile.write("B_capital:=%.2f;\n" % get_local_param(imlo, 'capital'))
    ifile.write("B_ascender:=%.2f;\n" % get_local_param(imlo, 'ascender'))
    ifile.write("B_descender:=%.2f;\n" % get_local_param(imlo, 'descender'))
    ifile.write("B_skeleton#:=%.2fpt#;\n" % get_local_param(imlo, 'skeleton'))
    ifile.write("B_over:=%.2fpt;\n" % get_local_param(imlo, 'over'))

    ifile.write("\n")
    ifile.write("input glyphs\n")
    ifile.write("bye\n")
    ifile.close()


def writeGlobalParam(master):
    writeParams(master, master.metafont_filepath())
    writeParams(master, master.metafont_filepath('a'), 0)
    writeParams(master, master.metafont_filepath('b'), 1)
