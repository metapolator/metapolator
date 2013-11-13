import os
import os.path as op
import re
import xmltomf
import model
import web
from lxml import etree

from config import cFont, working_dir, buildfname, mf_filename

from models import Glyph, GlyphParam, GlyphOutline


def project_exists(master):
    mf_file1 = op.join(master.get_fonts_directory(), mf_filename(master.fontnamea))
    if op.exists(mf_file1):
        return True

    if master.fontnameb:
        mf_file2 = op.join(master.get_fonts_directory(), mf_filename(master.fontnameb))
        return op.exists(mf_file2)


def makefont(working_dir, master):
    if not project_exists(master):
        return False

    # ufo2mf(master)

    os.environ['MFINPUTS'] = master.get_fonts_directory()
    writeGlyphlist(master)

    strms = "cd %s; sh %s %s" % (working_dir, "makefont.sh", '%sA' % master.fontname)
    os.system(strms)

    strms = "cd %s; sh %s %s" % (working_dir, "makefont.sh", '%sB' % master.fontname)
    os.system(strms)

    strms = "cd %s; sh %s %s" % (working_dir, "makefont.sh", master.fontname)
    os.system(strms)
    return True


def fnextension(filename):
    try:
        basename, extension = filename.split('.')
    except:
        extension = "garbage"
    return extension


def ufo2mf(master):
    dirnamef1 = working_dir(op.join(master.get_fonts_directory('a'), "glyphs"))
    dirnamef2 = working_dir(op.join(master.get_fonts_directory('b'), "glyphs"))
    dirnamep1 = working_dir(op.join(master.get_fonts_directory(), "glyphs"))
    if not op.exists(dirnamep1):
        os.makedirs(dirnamep1)

    charlist1 = filter(lambda f: fnextension(f) == 'glif', os.listdir(dirnamef1))
    charlist2 = filter(lambda f: fnextension(f) == 'glif', os.listdir(dirnamef2))

    for ch1 in charlist1:
        if ch1 in charlist2:
            fnb, ext = buildfname(ch1)
            glyphA = Glyph.get(idmaster=master.idmaster, fontsource='A', name=fnb)
            glyphB = Glyph.get(idmaster=master.idmaster, fontsource='B', name=fnb)
            xmltomf.xmltomf1(master, glyphA, glyphB)


def writeGlyphlist(master, glyphid=None):
    ifile = open(op.join(master.get_fonts_directory(), "glyphlist.mf"), "w")
    dirnamep1 = working_dir(op.join(master.get_fonts_directory(), "glyphs"))

    charlist1 = [f for f in os.listdir(dirnamep1)]

    for ch1 in charlist1:
        fnb, ext = buildfname(ch1)
        if (not glyphid or glyphid == fnb) and ext in ["mf"]:
            ifile.write("input glyphs/" + ch1 + "\n")
    ifile.close()


def create_glyph(glif, master, ab_source):
    itemlist = glif.find('advance')
    width = itemlist.get('width')

    glyph = glif.getroot()
    glyphname = glyph.get('name')

    itemlist = glif.find('unicode')
    unicode = itemlist.get('hex')
    if not Glyph.filter(name=glyphname, idmaster=master.idmaster,
                        fontsource=ab_source).count():
        Glyph.create(name=glyphname, width=width, unicode=unicode,
                     idmaster=master.idmaster, fontsource=ab_source)
    else:
        query = Glyph.filter(name=glyphname, idmaster=master.idmaster,
                             fontsource=ab_source)
        query.update({'width': width, 'unicode': unicode})

    for i, point in enumerate(glif.xpath('//outline/contour/point')):
        pointname = point.attrib.get('name')
        if not pointname:
            pointname = 'p%s' % (i + 1)

        glyphoutline = GlyphOutline.get(glyphname=glyphname, idmaster=master.idmaster,
                                        fontsource=ab_source, pointnr=(i + 1))
        if not glyphoutline:
            glyphoutline = GlyphOutline.create(glyphname=glyphname, idmaster=master.idmaster,
                                               fontsource=ab_source, pointnr=(i + 1))
        glyphoutline.x = float(point.attrib['x'])
        glyphoutline.y = float(point.attrib['y'])

        glyphparam = GlyphParam.get(glyphname=glyphname, idmaster=master.idmaster,
                                    fontsource=ab_source, pointname=pointname, pointnr=(i + 1))
        if not glyphparam:
            glyphparam = GlyphParam.create(glyphname=glyphname, idmaster=master.idmaster,
                                           fontsource=ab_source, pointname=pointname, pointnr=(i + 1))
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

    source_fontpath_A = op.join(master.get_fonts_directory('A'), 'glyphs')
    source_fontpath_B = op.join(master.get_fonts_directory('B'), 'glyphs')

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


def writeallxmlfromdb(master, glyphs):
    dirnamea = op.join(master.get_fonts_directory('A'), "glyphs")
    dirnameb = op.join(master.get_fonts_directory('B'), "glyphs")

    charlista = [f for f in os.listdir(dirnamea) if fnextension(f) == 'glif']
    charlistb = [f for f in os.listdir(dirnameb) if fnextension(f) == 'glif']
    #
    for ch1 in charlista:
        if ch1 in charlistb:
            glyphname, exte = buildfname(ch1)
            if glyphname in glyphs:
                cFont.glyphunic = glyphname
                cFont.glyphName = glyphname
                #   for A and B font
                for iwork in ['0', '1']:
                    cFont.idwork = iwork
                    model.writexml()


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
