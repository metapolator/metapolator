import lxml.etree
import os
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

    def __init__(self, glifpath, glifcontent=None):
        self.glifpath = glifpath
        self.glifdir = op.dirname(glifpath)
        self.anchors = []
        if not glifcontent:
            self.xmldoc = lxml.etree.fromstring(open(glifpath).read())
        else:
            self.xmldoc = lxml.etree.fromstring(glifcontent)

    def find_components(self):
        return self.xmldoc.xpath('//outline/component')

    def append_component(self, node):
        self.xmldoc.find('outline').append(node)

    def append_anchors(self, anchors):
        # In GLIF 1 there was no official anchor element. Anchors were
        # unofficially but widely supported through the use of a contour
        # containing only one "move" point.
        glyph = self.xmldoc.xpath('//outline')
        for anchor in anchors:
            contour = lxml.etree.fromstring('<contour />')
            point = lxml.etree.fromstring('<point type="move" />')
            contour.append(point)
            point.attrib['x'] = '%.1f' % anchor['x']
            point.attrib['y'] = '%.1f' % anchor['y']
            point.attrib['name'] = anchor['name']
            glyph[0].append(contour)

    def write(self):
        et = lxml.etree.ElementTree(self.xmldoc)
        et.write(self.glifpath, xml_declaration=True, pretty_print=True, encoding='utf-8')

    def glif_contour2points(self, glif, pointnr=0):
        points = []
        for contour in glif.xpath('//outline/contour'):

            pointset = PointSet()

            for point in contour.findall('point'):
                pointname = point.attrib.get('name')
                type = point.attrib.get('type')
                if type == 'move' and len(contour.findall('point')) == 1:
                    self.anchors.append(anchor2dict(point))
                    continue

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

            # do not append to total pointset empty list
            if pointset.points:
                points += pointset.points
        return points, pointnr

    def find_glif(self, glifname):
        for filename in os.listdir(self.glifdir):
            glifcontent = open(op.join(self.glifdir, filename)).read()
            doc = lxml.etree.fromstring(glifcontent)
            if doc.attrib.get('name') == glifname:
                return filename
        return

    def glif_components2contours(self, sourceglif):
        for comp in self.find_components():
            baseglifpath = op.join(self.glifdir, self.find_glif(comp.attrib['base']))
            with open(baseglifpath) as fp:
                yield comp.attrib, lxml.etree.parse(fp)

    def convert(self):
        points, last_pointnr = self.glif_contour2points(self.xmldoc)

        components = []

        for attribs, baseglif in self.glif_components2contours(self.xmldoc):
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
                  'name': self.xmldoc.attrib['name'],
                  'sysname': op.basename(self.glifpath),
                  'advanceWidth': float(self.xmldoc.find('advance').attrib['width'])}

        if components:
            result['components'] = components

        # loop through anchors points presented in UFOv3 version
        # to print them in json-formatted string

        if self.xmldoc.find('anchor'):
            for anchor in self.xmldoc.find('anchor'):
                self.anchors.append(anchor2dict(anchor))

        if self.anchors:
            result['anchors'] = self.anchors

        return result


def anchor2dict(anchor):
    anchordict = {}
    for key, value in anchor.attrib.items():
        if anchor.attrib[key]:
            anchordict[key] = value
    return anchordict
