import os
import os.path as op
import re
import web
from lxml import etree

from config import buildfname

from models import Glyph, GlyphParam, GlyphOutline, LocalParam


def create_glyph(glif, master):
    itemlist = glif.find('advance')
    width = itemlist.get('width')

    glyph = glif.getroot()
    glyphname = glyph.get('name')

    if Glyph.exists(name=glyphname, master_id=master.id):
        return

    glyph = Glyph.create(name=glyphname, width=width,
                         master_id=master.id, project_id=master.project_id)

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
    return glyph


def extract_gliflist_from_ufo(master, glyph=None, extract_first=False):
    fontpath = op.join(master.get_ufo_path(), 'glyphs')

    charlista = [f for f in os.listdir(fontpath)]

    if glyph:
        charlista = filter(lambda f: f == '%s.glif' % glyph, charlista)

    if extract_first and charlista:
        charlista = [charlista[0]]

    return charlista


def put_font_all_glyphs(master, glyph=None, preload=False, force_update=False):
    gliflist = extract_gliflist_from_ufo(master, glyph, extract_first=preload)
    fontpath = op.join(master.get_ufo_path(), 'glyphs')

    glyphs = []
    for ch1 in gliflist:
        glyphName, ext = buildfname(ch1)
        if not glyphName or glyphName.startswith('.') or ext not in ["glif"]:
            continue

        if force_update:
            glyph_obj = Glyph.get(name=glyphName, master_id=master.id)
            if glyph_obj:
                GlyphParam.filter(glyph_id=glyph_obj.id).delete()
                GlyphOutline.filter(glyph_id=glyph_obj.id).delete()
                Glyph.delete(glyph_obj)

        glif = etree.parse(op.join(fontpath, ch1))
        newglyph_obj = create_glyph(glif, master)
        if newglyph_obj:
            glyphs.append(newglyph_obj.name)

    try:
        return glyphs[0]
    except IndexError:
        return


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


def get_edges_json(log_filename, glyphid=None, master=None):
    try:
        fp = open(log_filename)
        content = fp.read()
        fp.close()
        return get_json(content, glyphid=glyphid, master=master)
    except (IOError, OSError):
        pass
    return []


def get_edges_json_from_db(master, glyphid):
    glyph = Glyph.get(master_id=master.id, name=glyphid)

    points = GlyphOutline.filter(glyph_id=glyph.id)
    localparam = LocalParam.get(id=master.idlocala)

    _points = []
    for point in points.order_by(GlyphOutline.pointnr.asc()):
        param = GlyphParam.get(glyphoutline_id=point.id)
        iszpoint = False
        if re.match('z(\d+)[lr]', param.pointname):
            iszpoint = True

        x = point.x
        if localparam:
            x += localparam.px
        _points.append({'x': x, 'y': point.y, 'pointnr': point.pointnr,
                        'iszpoint': iszpoint, 'data': param.as_dict()})

    return {'width': glyph.width, 'points': _points}


def get_json(content, glyphid=None, master=None):
    contour_pattern = re.compile(r'Filled\scontour\s:\n(.*?)..cycle',
                                 re.I | re.S | re.M)
    point_pattern = re.compile(r'\(([-\d.]+),([-\d.]+)\)..controls\s'
                               r'\(([-\d.]+),([-\d.]+)\)\sand\s'
                               r'\(([-\d.]+),([-\d.]+)\)')

    pattern = re.findall(r'\[(\d+)\]\s+Edge structure(.*?)End edge', content,
                         re.I | re.DOTALL | re.M)
    glyphs = []
    for glyph, edge in pattern:
        if glyphid and int(glyphid) != int(glyph):
            continue

        x_min = 0
        y_min = 0
        x_max = 0
        y_max = 0

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

                x_min = min(x_min, x_max, float(X),
                            float(handleOut_X), float(handleIn_X))
                y_min = min(y_min, y_max, float(Y),
                            float(handleOut_Y), float(handleIn_Y))
                x_max = max(x_max, x_min, float(X),
                            float(handleOut_X), float(handleIn_X))
                y_max = max(y_max, y_min, float(Y),
                            float(handleOut_Y), float(handleIn_Y))

            if handleIn_X and handleIn_Y:
                _contours[0]['controls'][0] = {'x': handleIn_X,
                                               'y': handleIn_Y}

            contours.append(_contours)

        zpoints = []
        if master:
            zpoints = get_edges_json_from_db(master, glyph)

            g = Glyph.get(master_id=master.id, name=glyph)
            maxx, minx = GlyphOutline.minmax(GlyphOutline.x, glyph_id=g.id)[0]
            maxy, miny = GlyphOutline.minmax(GlyphOutline.y, glyph_id=g.id)[0]

            if maxx is not None and minx is not None and maxy is not None and miny is not None:
                x_min = min(x_min, minx, x_max, maxx)
                x_max = max(x_min, minx, x_max, maxx)
                y_min = min(y_max, maxy, y_min, miny)
                y_max = max(y_max, maxy, y_min, miny)

        if x_min < 0:
            width = abs(x_max) + abs(x_min)
        else:
            width = abs(x_max)

        if y_min < 0:
            height = abs(y_max) + abs(y_min)
        else:
            height = abs(y_max)

        glyphs.append({'name': glyph, 'contours': contours,
                       'zpoints': zpoints, 'width': width, 'height': height})

    return glyphs
