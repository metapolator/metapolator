import re
import web

from metapolator.models import GlyphPoint, GlyphPointParam


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
            glyphpoint = GlyphPoint.get(glyphname=glyph.name, glyph_id=glyph.id,
                                        master_id=glyph.master_id,
                                        pointnr=point['number'])
            if not glyphpoint:
                glyphpoint = GlyphPoint.create(glyphname=glyph.name,
                                               glyph_id=glyph.id,
                                               master_id=glyph.master_id,
                                               pointnr=point['number'])
            glyphpoint.x = self.x(point)
            glyphpoint.y = self.y(point)

            glyphpointparam = GlyphPointParam.get(glyphpoint_id=glyphpoint.id,
                                                  glyph_id=glyph.id)
            if not glyphpointparam:
                glyphpointparam = GlyphPointParam.create(glyphpoint_id=glyphpoint.id,
                                                         master_id=glyph.master_id,
                                                         glyph_id=glyph.id,
                                                         pointname=self.name(point))
            for attr in point['preset']:
                if attr == 'name':
                    continue
                setattr(glyphpointparam, attr, point['preset'][attr])

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

        result = []
        for p in pairs:
            if not p['l'] or not p['r']:
                continue
            result.append(p)
        return result

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


def get_controlpmode_pointsets(glif):
    pointnr = 0
    pointsets = []

    for contour in glif.xpath('//outline/contour'):

        pointset = PointSet()

        for point in contour.findall('point'):
            pointname = point.attrib.get('name')
            type = point.attrib.get('type')

            preset = {'type': type,
                      'control_out': point.attrib.get('control_out'),
                      'control_in': point.attrib.get('control_in'),
                      'pointname': pointname}

            if not pointname:
                preset['pointname'] = 'p%s' % (pointnr + 1)

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

        pointsets.append(pointset)
    return pointsets


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
