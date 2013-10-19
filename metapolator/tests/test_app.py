import unittest

# from metapolator.config import app
from metapolator.tools import get_json


RAWLOG_INPUT = """
) (fonts/2/glyphs/39.mf [39]
Edge structure at line 0 (just shipped out):
Filled contour :
(440.20761,352.00063)..controls (393.0693,352.00063) and (345.93102,352.00063)
 ..(298.79271,352.00063)..controls (298.79271,351.98401) and (298.79271,147.996
75)
 ..(298.79271,147.98015)..controls (298.79268,112.58653) and (286.33878,99.8460
2)
 ..(251.00726,99.56268)..controls (214.69847,99.2715) and (201.70805,112.44139)
 ..(201.70805,148.84912)..controls (201.70805,148.8861) and (201.70805,603.1282
3)
 ..(201.70805,603.1652)..controls (201.70805,637.3652) and (213.72311,649.42825
)
 ..(248.00427,650.45207)..controls (284.6379,651.54616) and (298.293,638.51492)
 ..(298.293,601.94727)..controls (298.293,601.93842) and (298.293,493.23502)
 ..(298.293,493.22617)..controls (345.43129,493.22617) and (392.5696,493.22617)
 ..(439.70789,493.22617)..controls (439.70789,493.23254) and (439.70786,571.498
32)
 ..(439.70786,571.5047)..controls (439.70776,707.9578) and (388.18741,754.43709
)
 ..(249.99554,755.0007)..controls (112.17307,755.56284) and (60.29318,709.27966
)
 ..(60.29318,573.28815)..controls (60.29318,573.25629) and (60.29318,181.74522)
 ..(60.29318,181.71336)..controls (60.29315,43.34723) and (111.0048,-5.38892)
 ..(249.99248,-5.00032)..controls (389.65285,-4.60986) and (440.20761,44.46085)
 ..(440.20761,183.58029)..controls (440.20761,183.594) and (440.20761,351.98692
)
 ..cycle

Filled contour :
(440.20761,296.23361)..controls (440.20761,333.74477) and (440.20761,371.25594)
 ..(440.20761,408.76707)..controls (440.1922,408.76707) and (251.01498,408.7670
7)
 ..(250.99957,408.76707)..controls (250.99957,371.25594) and (250.99957,333.744
77)
 ..(250.99957,296.23361)..controls (251.01498,296.23361) and (440.1922,296.2336
1)
 ..cycle
End edges
"""


class TestCode(unittest.TestCase):

    def equalCoords(self, point, expected):
        self.assertEqual(point['x'], str(expected[0][0]))
        self.assertEqual(point['y'], str(expected[0][1]))
        self.assertEqual(point['controls'][0]['x'], str(expected[1][0]))
        self.assertEqual(point['controls'][0]['y'], str(expected[1][1]))
        self.assertEqual(point['controls'][1]['x'], str(expected[2][0]))
        self.assertEqual(point['controls'][1]['y'], str(expected[2][1]))

    def test_index(self):
        result = get_json(RAWLOG_INPUT, glyphid=39)
        assert result

        edges = result['edges']
        points = edges[0]['contours'][0]
        self.equalCoords(points[0], [(927.00089, 532.001), (1013.4187, 276.31506), (881.66751, 532.001)])
        self.equalCoords(points[1], [(791.00076, 532.001), (836.33414, 532.001), (868.31212, 361.20222)])
        self.equalCoords(points[2], [(550.00029, 178.99945), (737.22511, 169.19466), (391.54794, 187.29747)])
        self.equalCoords(points[3], [(280.9999, 507.00099), (287.69502, 340.04211), (273.76192, 687.49776)])
        self.equalCoords(points[4], [(550.00029, 864.99983), (380.83722, 857.35077), (726.72194, 872.99068)])
        self.equalCoords(points[5], [(791.00076, 532.001), (853.82108, 697.3733), (836.33414, 532.001)])
        self.equalCoords(points[6], [(927.00089, 532.001), (881.66751, 532.001), (1002.2784, 782.62794)])
        self.equalCoords(points[7], [(550.00029, 1028.99983), (811.64153, 1033.94402), (292.6291, 1024.1363)])
        self.equalCoords(points[8], [(122.99963, 507.00099), (114.89835, 777.92451), (130.67274, 250.39648)])
        self.equalCoords(points[9], [(550.00029, 17.99931), (304.44907, 23.10724), (819.83696, 12.3862)])
