import os
import os.path as op
import re
import web
from lxml import etree

from config import buildfname

from models import Glyph, GlyphParam, GlyphOutline, LocalParam


zpoint_re = re.compile('(?P<name>z(?P<number>[\d]+))(?P<side>[lr])')


class PointSet(object):

    def __init__(self):
        self.points = []
        self._zpoints = []

    @property
    def zpoints(self):
        return self._zpoints

    @zpoints.setter
    def zpoints(self, value):
        self._zpoints = value

    def add_point(self, x, y, name, number, preset):
        """ Put to current set new point with name and its (x, y)-coords """
        point = {'name': name, 'coords': {'x': x, 'y': y}, 'preset': preset,
                 'number': number}
        self.points.append(point)

    def extract_zpoints(self):
        self.zpoints = filter(lambda point: bool(zpoint_re.match(point['name'])),
                              self.points)

    def save_to_database(self, glyph):
        """ Save list of point dictionary to database """

        for point in self.points:
            glyphoutline = GlyphOutline.get(glyphname=glyph.name, glyph_id=glyph.id,
                                            master_id=glyph.master_id,
                                            pointnr=point['number'])
            if not glyphoutline:
                glyphoutline = GlyphOutline.create(glyphname=glyph.name,
                                                   glyph_id=glyph.id,
                                                   master_id=glyph.master_id,
                                                   pointnr=point['number'])
            glyphoutline.x = self.x(point)
            glyphoutline.y = self.y(point)

            glyphparam = GlyphParam.get(glyphoutline_id=glyphoutline.id,
                                        glyph_id=glyph.id)
            if not glyphparam:
                glyphparam = GlyphParam.create(glyphoutline_id=glyphoutline.id,
                                               master_id=glyph.master_id,
                                               glyph_id=glyph.id,
                                               pointname=self.name(point))
            for attr in point['preset']:
                if attr == 'name':
                    continue
                setattr(glyphparam, attr, point['preset'][attr])

        web.ctx.orm.commit()

    def castling(self):
        import copy
        pairs = self.extract_pairs()
        if not pairs:
            return False

        points = []
        for i, pair in enumerate(pairs[::-1]):
            point = copy.deepcopy(pair['l'])
            point['name'] = '%sl' % pairs[i]['name']
            point['number'] = pairs[i]['l']['number']
            point['preset']['pointname'] = point['name']
            if not i:
                point['preset']['startp'] = True
                point['preset']['tripledash'] = None
            elif point['preset'].get('startp'):
                del point['preset']['startp']
                point['preset']['tripledash'] = 1
            points.append(point)

        for i, pair in enumerate(pairs):
            point = copy.deepcopy(pair['r'])
            point['name'] = '%sr' % pairs[len(pairs) - i - 1]['name']
            point['number'] = pairs[len(pairs) - i - 1]['r']['number']
            point['preset']['pointname'] = point['name']
            points.append(point)

        self.points = points

    def extract_pairs(self):
        """ Returns dictionary with sequence of (xl, yl), (xr, yr) coordinates
            zpoints. If it is empty then False """
        pairs = []

        def find_pair(name):
            for index, pair in enumerate(pairs):
                if pair['name'] == name:
                    return index
            return -1

        empty_pairs = True
        for point in self.zpoints:
            m = zpoint_re.match(self.name(point))

            index = find_pair(m.group('name'))
            if index < 0:
                pairs.append({'name': m.group('name'),
                              'l': None, 'r': None})

            if m.group('side') == 'l':
                pairs[index]['l'] = point
            else:
                pairs[index]['r'] = point
            empty_pairs = False

        if empty_pairs:
            return False
        return pairs

    def segments(self):
        """A sequence of (x,y) numeric coordinates pairs """
        poly = map(lambda point: (self.x(point), self.y(point)),
                   self.zpoints)
        return zip(poly, poly[1:] + [poly[0]])

    def is_counterclockwise(self):
        clockwise = False
        s = sum(x0 * y1 - x1 * y0
                for ((x0, y0), (x1, y1)) in self.segments())
        if s < 0:
            clockwise = not clockwise
        return clockwise

    def name(self, point):
        return point['name']

    def x(self, point):
        return float(point['coords']['x'])

    def y(self, point):
        return float(point['coords']['y'])


def compare(a, b):
    if not a.attrib.get('name') or not b.attrib.get('name'):
        return 0

    am = zpoint_re.match(a.attrib['name'])
    bm = zpoint_re.match(b.attrib['name'])

    if int(am.group('number')) < int(bm.group('number')):
        return -1
    return 1


def get_sorted_points(points):

    lpoints = []
    rpoints = []

    # Collect points partially and sort each part
    for p in points:
        if not p.attrib.get('name'):
            lpoints.append(p)
            continue
        m = zpoint_re.match(p.attrib['name'])
        if m.group('side') == 'l':
            lpoints.append(p)
        if m.group('side') == 'r':
            rpoints.append(p)

    return sorted(lpoints, cmp=compare) + sorted(rpoints, cmp=compare, reverse=True)


def get_pointsets(glif):
    pointnr = 0
    pointsets = []

    # Links to index of both-sided z-point
    zpoint_current_offset = 0

    for contour in glif.xpath('//outline/contour'):

        total_contour_points = len(contour.xpath('point[@type]'))

        # Start loop for each point in contour. If this point has attribute
        # `type` then we calculate sided z-name

        pointset = PointSet()

        zindex = 0
        for point in get_sorted_points(contour.findall('point')):
            pointname = point.attrib.get('name')
            type = point.attrib.get('type')

            preset = {'type': type,
                      'control_out': point.attrib.get('control_out'),
                      'control_in': point.attrib.get('control_in'),
                      'pointname': pointname,
                      'startp': None,
                      'tripledash': None}

            if not pointname:
                preset['pointname'] = 'p%s' % (pointnr + 1)

            if type is not None:
                if not zindex:
                    # if this is first then set to point preset startp attribute
                    preset['startp'] = True
                    preset['tripledash'] = None
                elif type == 'line':
                    preset['tripledash'] = 1

                # number of contours is calculated by offset of points from
                # first point
                if zindex > (total_contour_points / 2 - 1):
                    number = zpoint_current_offset + total_contour_points - zindex
                    pointname = 'z%sr' % number
                else:
                    number = zpoint_current_offset + zindex + 1
                    pointname = 'z%sl' % number

                preset['pointname'] = pointname
                zindex += 1

            attribs = {}
            for attr in point.attrib:
                if attr == 'name':
                    continue
                attribs[attr] = point.attrib[attr]

            attribs.update(preset)

            pointset.add_point(float(point.attrib['x']),
                               float(point.attrib['y']),
                               preset['pointname'], pointnr + 1, attribs)
            pointnr += 1

        # Make current offset to half of z-points count. In this case next
        # z-points in contour will have correct index
        zpoint_current_offset += total_contour_points / 2

        pointset.extract_zpoints()

        # Final accord is to check correct direction of glyph points
        # If glyph points are not clockwise then make castling
        if pointset.is_counterclockwise():
            pointset.castling()

        pointsets.append(pointset)
    return pointsets


def create_glyph(glif, master):
    itemlist = glif.find('advance')
    width = itemlist.get('width')

    glyph = glif.getroot()
    glyphname = glyph.get('name')

    pointsets = get_pointsets(glif)

    if Glyph.exists(name=glyphname, master_id=master.id):
        return

    glyph = Glyph.create(name=glyphname, width=width,
                         master_id=master.id,
                         project_id=master.project_id,
                         width_new=width)

    for pointset in pointsets:
        pointset.save_to_database(glyph)

    return glyph


def extract_gliflist_from_ufo(master, glyph=None, extract_first=False):
    fontpath = op.join(master.get_ufo_path(), 'glyphs')

    charlista = filter(lambda f: op.splitext(f)[1] == '.glif', os.listdir(fontpath))

    if glyph:
        charlista = filter(lambda f: f == '%s.glif' % glyph, charlista)

    if extract_first and charlista:
        charlista = [charlista[0]]

    return charlista


def put_font_all_glyphs(master, glyph=None, preload=False, force_update=False):
    gliflist = extract_gliflist_from_ufo(master, glyph=glyph, extract_first=preload)
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

        params = param.as_dict()
        params.update({'width': glyph.width})
        params.update({'width_new': glyph.width_new})
        _points.append({'x': x, 'y': point.y, 'pointnr': point.pointnr,
                        'iszpoint': iszpoint, 'data': params})

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

        zpoints_names = []
        if master:
            glyph_obj = Glyph.get(master_id=master.id, name=glyph)
            zpoints_names = map(lambda x: x.pointname,
                                glyph_obj.get_zpoints())

        number = 0
        for ix, contour in enumerate(contour_pattern.findall(edge.strip())):
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

                pointdict = {'x': X, 'y': Y, 'controls': controlpoints}
                _contours.append(pointdict)

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

            if zpoints_names:
                zpoints = []
                ll = zpoints_names[number + 1: len(_contours) + number]
                if len(zpoints_names) > number:
                    zpoints = [zpoints_names[number]] + ll

                number += len(_contours)

                for zix, point in enumerate(_contours):
                    try:
                        point['pointname'] = zpoints[zix]
                    except IndexError:
                        pass

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

        glyphs.append({'name': glyph, 'contours': contours, 'minx': x_min,
                       'miny': y_min, 'zpoints': zpoints,
                       'width': width, 'height': height})

    return glyphs
