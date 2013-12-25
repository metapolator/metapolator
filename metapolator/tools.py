import os
import os.path as op
import re
import web
from lxml import etree

from config import buildfname, working_dir, session

from models import Glyph, GlyphParam, GlyphOutline, LocalParam, Metapolation


def project_exists(master):
    return master.metafont_exists()


def makefont_single(master, cell=''):
    if not project_exists(master):
        return False

    cell = cell.upper()
    os.environ['MFINPUTS'] = master.get_fonts_directory()
    os.environ['MFMODE'] = session.get('mfparser', '')
    if cell == 'A':
        metafont = master.get_metafont('a')
    else:
        metafont = master.get_metafont()

    import subprocess
    process = subprocess.Popen(
        ["sh", "makefont.sh", metafont],
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        cwd=working_dir()
    )

    while True:
        line = process.stdout.readline()
        if not line or '<to be read again>' in line:
            process.kill()
            break


def writeGlyphlist(master, glyphid=None):
    ifile = open(op.join(master.get_fonts_directory(), "glyphlist.mf"), "w")
    dirnamep1 = op.join(master.get_fonts_directory(), "glyphs")

    charlist1 = [f for f in os.listdir(dirnamep1)]

    for ch1 in charlist1:
        fnb, ext = buildfname(ch1)
        if (not glyphid or str(glyphid) == fnb) and ext in ["mf"]:
            ifile.write("input glyphs/" + ch1 + "\n")
    ifile.close()


def create_glyph(glif, master):
    itemlist = glif.find('advance')
    width = itemlist.get('width')

    glyph = glif.getroot()
    glyphname = glyph.get('name')

    if not Glyph.exists(name=glyphname, master_id=master.id):
        glyph = Glyph.create(name=glyphname, width=width,
                             master_id=master.id,
                             project_id=master.project_id)
    else:
        glyph = Glyph.update(name=glyphname, master_id=master.id,
                             values={'width': glyph.width})

    for i, point in enumerate(glif.xpath('//outline/contour/point')):
        pointname = point.attrib.get('name')
        type = point.attrib.get('type')
        control_in = point.attrib.get('control_in')
        control_out = point.attrib.get('control_out')
        if not pointname:
            pointname = 'p%s' % (i + 1)

        glyphoutline = GlyphOutline.get(glyphname=glyphname, glyph_id=glyph.id,
                                        master_id=master.id,
                                        pointnr=(i + 1))
        if not glyphoutline:
            glyphoutline = GlyphOutline.create(glyphname=glyphname,
                                               glyph_id=glyph.id,
                                               master_id=master.id,
                                               pointnr=(i + 1))
        glyphoutline.x = float(point.attrib['x'])
        glyphoutline.y = float(point.attrib['y'])

        glyphparam = GlyphParam.get(glyphoutline_id=glyphoutline.id,
                                    glyph_id=glyph.id)
        if not glyphparam:
            glyphparam = GlyphParam.create(glyphoutline_id=glyphoutline.id,
                                           master_id=master.id,
                                           glyph_id=glyph.id,
                                           pointname=pointname,
                                           type=type,
                                           control_in=control_in,
                                           control_out=control_out)
        for attr in point.attrib:
            if attr == 'name':
                continue
            setattr(glyphparam, attr, point.attrib[attr])
        web.ctx.orm.commit()


def putFontAllglyphs(master, glyphid=None):
    fontpath = op.join(master.get_ufo_path(), 'glyphs')

    charlista = [f for f in os.listdir(fontpath)]

    for ch1 in charlista:
        glyphName, ext = buildfname(ch1)
        if not glyphName or glyphName.startswith('.'):
            continue
        if ext in ["glif"] and (not glyphid or glyphid == glyphName):
            glif = etree.parse(op.join(fontpath, ch1))
            create_glyph(glif, master)


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
    'over': 0,
    'jut': 1,
    'slab': 1,
    'bracket': 1,
    'serif_darkness': 1,
    'slant': 1

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


def writeParams(project, filename, masters, is_concrete_master=False, metapolation=0):

    # TODO: make global parameter to project related and not master
    globalparam = None

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
    if is_concrete_master:
        ifile.write("metapolation:=%.2f;\n" % metapolation)
    else:
        metap = Metapolation.get(label='AB', project_id=project.id) or 0
        if metap:
            metap = metap.value
        ifile.write("metapolation:=%.2f;\n" % metap)

    metap = Metapolation.get(label='CD', project_id=project.id)
    if metap:
        metap = metap.value
    else:
        metap = 0
    ifile.write("metapolationCD:=%.2f;\n" % metap)

    ifile.write("font_size:=%.3fpt#;\n" % fontsize)
    ifile.write("mean#:=%.3fpt#;\n" % mean)
    ifile.write("cap#:=%.3fpt#;\n" % cap)
    ifile.write("asc#:=%.3fpt#;\n" % ascl)
    ifile.write("desc#:=%.3fpt#;\n" % des)
    ifile.write("box#:=%.3fpt#;\n" % box)
    ifile.write("u#:=%.3fpt#;\n" % unitwidth)

    lmast = masters[:]
    if len(lmast) < 4:
        lmast += [None] * (4 - len(masters))

    for i, master in enumerate(lmast):
        imlo = None
        if master:
            imlo = LocalParam.get(id=master.idlocala)
        uniqletter = chr(ord('A') + i)
        ifile.write("%s_px#:=%.2fpt#;\n" % (uniqletter, get_local_param(imlo, 'px')))
        ifile.write("%s_width:=%.2f;\n" % (uniqletter, get_local_param(imlo, 'width')))
        ifile.write("%s_space:=%.2f;\n" % (uniqletter, get_local_param(imlo, 'space')))
        ifile.write("%s_spacept:=%.2fpt;\n" % (uniqletter, get_local_param(imlo, 'space')))
        ifile.write("%s_xheight:=%.2f;\n" % (uniqletter, get_local_param(imlo, 'xheight')))
        ifile.write("%s_capital:=%.2f;\n" % (uniqletter, get_local_param(imlo, 'capital')))
        ifile.write("%s_ascender:=%.2f;\n" % (uniqletter, get_local_param(imlo, 'ascender')))
        ifile.write("%s_descender:=%.2f;\n" % (uniqletter, get_local_param(imlo, 'descender')))
        ifile.write("%s_skeleton#:=%.2fpt#;\n" % (uniqletter, get_local_param(imlo, 'skeleton')))
        ifile.write("%s_over:=%.2fpt;\n" % (uniqletter, get_local_param(imlo, 'over')))
        ifile.write("%s_jut:=%.2fpt;\n" % (uniqletter, get_local_param(imlo, 'jut')))
        ifile.write("%s_slab:=%.2fpt;\n" % (uniqletter, get_local_param(imlo, 'slab')))
        ifile.write("%s_bracket:=%.2fpt;\n" % (uniqletter, get_local_param(imlo, 'bracket')))
        ifile.write("%s_serif_darkness:=%.2f;\n" % (uniqletter, get_local_param(imlo, 'serif_darkness')))
        ifile.write("%s_slant:=%.2f;\n" % (uniqletter, get_local_param(imlo, 'slant')))

    ifile.write("\n")
    ifile.write("input glyphs\n")
    ifile.write("bye\n")
    ifile.close()


def writeGlobalParam(project):
    masters = project.get_ordered_masters()

    for i, m in enumerate(masters):
        if not i:
            writeParams(project, m.metafont_filepath(), masters)
        if i == 1:
            metapolation = 1
        else:
            metapolation = 0

        writeParams(project, m.metafont_filepath('a'), masters, is_concrete_master=True, metapolation=metapolation)


def dopair(pair):
    pair = list(pair)
    if pair[0] is None:
        pair[0] = pair[1]
    if pair[1] is None:
        pair[1] = pair[0]
    return pair


def unifylist(masters):
    p1 = masters[::2]
    p2 = masters[1::2]
    if len(p1) != len(p2):
        p2 += [None] * (len(p1) - len(p2))

    pairs = zip(p1, p2)
    result = []
    for p in map(dopair, pairs):
        if p[0] is not None and p[1] is not None:
            result += p
    return result
