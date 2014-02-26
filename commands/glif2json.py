import lxml.etree


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


def glif2json(fp):
    pointnr = 0
    points = []

    glif = lxml.etree.parse(fp)

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

        points += pointset.points

    return {'points': points,
            'name': glif.getroot().attrib['name'],
            'advanceWidth': float(glif.find('advance').attrib['width'])}
