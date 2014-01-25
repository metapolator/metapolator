import unittest
import lxml.etree
import os.path as op

from metapolator.tools import get_pointsets


datapath = op.abspath(op.join(op.dirname(__file__), 'data'))


with open(op.join(datapath, 'at.glif')) as f:
    xml_at = lxml.etree.fromstring(f.read())

with open(op.join(datapath, '9.glif')) as f:
    xml_nine = lxml.etree.fromstring(f.read())

with open(op.join(datapath, 'J.glif')) as f:
    xml_J = lxml.etree.fromstring(f.read())


class PointSetTestCase(unittest.TestCase):

    def test_create_pointset(self):
        pointset = get_pointsets(xml_at)[0]
        self.assertTrue(not pointset.is_counterclockwise())
        print 'at', pointset.castling()

        pointset = get_pointsets(xml_nine)[0]
        self.assertTrue(pointset.is_counterclockwise())
        print 'nine', pointset.castling()

        pointset = get_pointsets(xml_J)[0]
        self.assertTrue(not pointset.is_counterclockwise())
        print 'J', pointset.castling()

