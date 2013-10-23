import unittest

# from metapolator.config import app
from metapolator.tools import get_json


RAWLOG_INPUT = """
) (/var/www/webpy-app/metapolator/users/1/fonts/15/glyphs/39.mf [39]
Edge structure at line 0 (just shipped out):
Filled contour :
(944.99995,241.00027)..controls (1000.3336,240.66678) and (1055.66722,240.33325
)
 ..(1111.00087,239.99974)..controls (1111.00087,240.03606) and (1111.00063,685.
96411)
 ..(1111.00063,686.00041)..controls (1055.66713,686.00041) and (1000.33366,686.
00041)
 ..(945.00017,686.00041)..controls (945.00017,685.9642) and (944.99995,241.0365
)
 ..cycle

Filled contour :
(1110.00165,240.00014)..controls (1055.00098,261.99986) and (1000.00035,283.999
57)
 ..(944.99968,305.99928)..controls (878.44684,200.035) and (757.46405,141.09454
)
 ..(633.00049,153.99942)..controls (391.73312,179.01498) and (249.36276,423.402
04)
 ..(249.0007,680.00064)..controls (248.63754,937.36165) and (391.09033,1182.718
72)
 ..(633.00049,1208.00078)..controls (729.89316,1218.12704) and (826.17616,1183.
9499)
 ..(894.99957,1115.00012)..controls (926.66655,1156.0004) and (958.3335,1197.00
064)
 ..(990.00047,1238.00092)..controls (895.3457,1330.92632) and (765.29404,1378.6
4838)
 ..(633.00049,1369.00095)..controls (302.6072,1344.9072) and (85.33588,1026.598
46)
 ..(88.00058,680.00064)..controls (90.63011,337.97992) and (305.42595,25.3267)
 ..(633.00049,-7.00075)..controls (826.83458,-26.12971) and (1013.75888,70.6635
1)
 ..cycle

Filled contour :
(639.00027,686.00041)..controls (639.00027,632.00056) and (639.00027,578.00067)
 ..(639.00027,524.00082)..controls (639.03168,524.00082) and (1024.9691,524.000
82)
 ..(1025.0005,524.00082)..controls (1025.0005,578.00067) and (1025.0005,632.000
56)
 ..(1025.0005,686.00041)..controls (1024.9691,686.00041) and (639.03168,686.000
41)
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
        self.equalCoords(points[0], [(944.99995,241.00027), (1013.4187, 276.31506), (881.66751, 532.001)])
        self.equalCoords(points[1], [(791.00076, 532.001), (836.33414, 532.001), (868.31212, 361.20222)])
        self.equalCoords(points[2], [(550.00029, 178.99945), (737.22511, 169.19466), (391.54794, 187.29747)])
        self.equalCoords(points[3], [(280.9999, 507.00099), (287.69502, 340.04211), (273.76192, 687.49776)])
        self.equalCoords(points[4], [(550.00029, 864.99983), (380.83722, 857.35077), (726.72194, 872.99068)])
        self.equalCoords(points[5], [(791.00076, 532.001), (853.82108, 697.3733), (836.33414, 532.001)])
        self.equalCoords(points[6], [(927.00089, 532.001), (881.66751, 532.001), (1002.2784, 782.62794)])
        self.equalCoords(points[7], [(550.00029, 1028.99983), (811.64153, 1033.94402), (292.6291, 1024.1363)])
        self.equalCoords(points[8], [(122.99963, 507.00099), (114.89835, 777.92451), (130.67274, 250.39648)])
        self.equalCoords(points[9], [(550.00029, 17.99931), (304.44907, 23.10724), (819.83696, 12.3862)])
