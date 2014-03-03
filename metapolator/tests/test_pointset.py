import unittest
import lxml.etree
import os.path as op

from metapolator.glif2points import get_pointsets


datapath = op.abspath(op.join(op.dirname(__file__), 'data'))


with open(op.join(datapath, 'at.glif')) as f:
    xml_at = lxml.etree.fromstring(f.read())

with open(op.join(datapath, '9.glif')) as f:
    xml_nine = lxml.etree.fromstring(f.read())

with open(op.join(datapath, 'J.glif')) as f:
    xml_J = lxml.etree.fromstring(f.read())

with open(op.join(datapath, '4.glif')) as f:
    xml_4 = lxml.etree.fromstring(f.read())


class PointSetTestCase(unittest.TestCase):

    def test_checking_clockwise_pointset_with_prepared_glif(self):
        pointset = get_pointsets(xml_at)[0]
        self.assertTrue(not pointset.is_counterclockwise())

        pointset = get_pointsets(xml_J)[0]
        self.assertTrue(not pointset.is_counterclockwise())

    def test_assign_point_attribute(self):
        pointsets = get_pointsets(xml_4)

        pointset = pointsets[0]

        self.assertEqual(pointset.points[0]['preset']['startp'], 1)
        self.assertEqual(pointset.points[0]['preset']['pointname'], 'z1l')
        self.assertEqual(pointset.points[0]['preset']['type'], 'line')

        self.assertEqual(pointset.points[1]['preset']['pointname'], 'z2l')
        self.assertEqual(pointset.points[1]['preset']['tripledash'], 1)
        self.assertEqual(pointset.points[1]['preset']['type'], 'line')

        self.assertEqual(pointset.points[2]['preset']['pointname'], 'z2r')
        self.assertEqual(pointset.points[2]['preset']['tripledash'], 1)
        self.assertEqual(pointset.points[2]['preset']['type'], 'line')

        self.assertEqual(pointset.points[3]['preset']['pointname'], 'z1r')
        self.assertEqual(pointset.points[3]['preset']['tripledash'], 1)
        self.assertEqual(pointset.points[3]['preset']['type'], 'line')

        pointset = pointsets[1]

        self.assertEqual(pointset.points[0]['preset']['startp'], 1)
        self.assertEqual(pointset.points[0]['preset']['pointname'], 'z3l')
        self.assertEqual(pointset.points[0]['preset']['type'], 'line')

        self.assertEqual(pointset.points[1]['preset']['pointname'], 'z4l')
        self.assertEqual(pointset.points[1]['preset']['tripledash'], 1)
        self.assertEqual(pointset.points[1]['preset']['type'], 'line')

        self.assertEqual(pointset.points[2]['preset']['pointname'], 'z4r')
        self.assertEqual(pointset.points[2]['preset']['tripledash'], 1)
        self.assertEqual(pointset.points[2]['preset']['type'], 'line')

        self.assertEqual(pointset.points[3]['preset']['pointname'], 'z3r')
        self.assertEqual(pointset.points[3]['preset']['tripledash'], 1)
        self.assertEqual(pointset.points[3]['preset']['type'], 'line')

        pointset = pointsets[2]

        self.assertEqual(pointset.points[0]['preset']['startp'], 1)
        self.assertEqual(pointset.points[0]['preset']['pointname'], 'z5l')
        self.assertEqual(pointset.points[0]['preset']['type'], 'line')

        self.assertEqual(pointset.points[1]['preset']['pointname'], 'z6l')
        self.assertEqual(pointset.points[1]['preset']['tripledash'], 1)
        self.assertEqual(pointset.points[1]['preset']['type'], 'line')

        self.assertEqual(pointset.points[2]['preset']['pointname'], 'z6r')
        self.assertEqual(pointset.points[2]['preset']['tripledash'], 1)
        self.assertEqual(pointset.points[2]['preset']['type'], 'line')

        self.assertEqual(pointset.points[3]['preset']['pointname'], 'z5r')
        self.assertEqual(pointset.points[3]['preset']['tripledash'], 1)
        self.assertEqual(pointset.points[3]['preset']['type'], 'line')

        self.assertTrue(not pointset.is_counterclockwise())
