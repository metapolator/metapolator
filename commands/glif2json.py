import lxml.etree
import os.path as op


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

    def add_point(self, x, y, name, number, parameters):
        """ Put to current set new point with name and its (x, y)-coords """
        parameters.update({'x': x, 'y': y})
        keys = ['control-in', 'control-out', 'startp', 'smooth']
        for k, value in parameters.items():
            if value is None:
                parameters.pop(k, None)
                continue
            if k == 'extra':
                del parameters[k]
                parameters['added'] = True
            if k in keys:
                parameters[k] = True
        self.points.append(parameters)


class glif2json:

    def __init__(self, glifpath):
        self.glifpath = glifpath
        self.glifdir = op.dirname(glifpath)

    def glif_contour2points(self, glif, pointnr=0):
        points = []
        for contour in glif.xpath('//outline/contour'):

            pointset = PointSet()

            for point in contour.findall('point'):
                pointname = point.attrib.get('name')
                type = point.attrib.get('type')

                preset = {'type': type,
                          'control-out': point.attrib.get('control_out'),
                          'control-in': point.attrib.get('control_in'),
                          'point-name': pointname}

                if not pointname:
                    preset['point-name'] = 'p%s' % (pointnr + 1)

                attribs = {}
                for attr in point.attrib:
                    if attr in ['name', 'control_in', 'control_out']:
                        continue
                    attribs[attr] = point.attrib[attr]

                attribs.update(preset)

                pointset.add_point(float(point.attrib['x']),
                                   float(point.attrib['y']),
                                   preset['point-name'], pointnr + 1, attribs)
                pointnr += 1

            points += pointset.points
        return points, pointnr

    def glif_components2contours(self, sourceglif):
        for comp in sourceglif.xpath('//outline/component'):
            baseglifpath = op.join(self.glifdir, comp.attrib['base'] + '.glif')
            with open(baseglifpath) as fp:
                yield comp.attrib, lxml.etree.parse(fp)

    def convert(self, fp):
        glif = lxml.etree.parse(fp)
        points, last_pointnr = self.glif_contour2points(glif)

        components = []

        for attribs, baseglif in self.glif_components2contours(glif):
            basepoints, last_pointnr = self.glif_contour2points(baseglif, pointnr=last_pointnr)
            if not basepoints:
                continue
            component = {'scale-x': attribs.get('xScale', 1),
                         'scale-y': attribs.get('yScale', 1),
                         'points': basepoints}
            if attribs.get('xyScale'):
                component['scale-xy'] = attribs['xyScale']
            if attribs.get('yxScale'):
                component['scale-yx'] = attribs['yxScale']
            if attribs.get('base'):
                component['name'] = attribs['base']
            components.append(component)

        result = {'points': points,
                  'name': glif.getroot().attrib['name'],
                  'advanceWidth': float(glif.find('advance').attrib['width'])}

        if components:
            result['components'] = components

        return result
