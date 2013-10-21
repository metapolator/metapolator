import os
import os.path as op
import re
import xmltomf
import model
import simplejson

from config import cFont, working_dir, buildfname
from model import putFont


def makefont(working_dir, fontpath):
    ufo2mf(fontpath)
    os.environ['MFINPUTS'] = op.join(working_dir, fontpath)
    writeGlyphlist(fontpath)
    strms = "cd %s; sh %s font.mf" % (working_dir, "makefont.sh")
    os.system(strms)


def fnextension(filename):
    try:
        basename, extension = filename.split('.')
    except:
        extension = "garbage"
        basename = ""
    return extension


def ufo2mf(fontpath):
    print "ufo2mf", fontpath
    dirnamef1 = working_dir(op.join(fontpath, cFont.fontna, "glyphs"))
    dirnamef2 = working_dir(op.join(fontpath, cFont.fontnb, "glyphs"))
    dirnamep1 = working_dir(op.join(fontpath, "glyphs"))
    if not op.exists(dirnamep1):
        os.makedirs(dirnamep1)

    charlist1 = filter(lambda f: fnextension(f) == 'glif', os.listdir(dirnamef1))
    charlist2 = filter(lambda f: fnextension(f) == 'glif', os.listdir(dirnamef2))

    for ch1 in charlist1:
        if ch1 in charlist2:
            fnb, ext = buildfname(ch1)
            if fnb == cFont.glyphunic or cFont.timestamp == 0 or cFont.mfoption == "1":
                newfile = fnb
                newfilename = newfile + ".mf"
                # commd2 = "python parser_pino_mono.py " +ch1 +" " +dirnamef1 +" " +dirnamef2 +" > " +dirnamep1 +"/" +newfilename
                # os.system(commd2)
                xmltomf.xmltomf1(ch1, dirnamef1, dirnamef2, dirnamep1, newfilename)

    cFont.timestamp = 1


def writeGlyphlist(fontpath):
    print "*** write glyphlist ***"
    ifile = open(working_dir(op.join(fontpath, "glyphlist.mf")), "w")
    dirnamep1 = working_dir(op.join(fontpath, "glyphs"))

    charlist1 = [f for f in os.listdir(dirnamep1)]

    for ch1 in charlist1:
        fnb, ext = buildfname(ch1)
        if ext in ["mf"]:
            ifile.write("input glyphs/"+ch1+"\n")
    ifile.close()


def putFontAllglyphs():
    #
    #  read all fonts (xml files with glif extension) in unix directory
    #  and put the xml data into db using the rule applied in loadoption
    #  only the fonts (xml file) will be read when the glifs are present in both fonts A and B
    #
    # save the values for restore
    idworks = cFont.idwork
    glyphnames = cFont.glyphName
    glyphunics = cFont.glyphunic

    dirnamea = op.join(working_dir(cFont.fontpath), cFont.fontna, "glyphs")
    if not op.exists(dirnamea):
        os.makedirs(dirnamea)

    dirnameb = op.join(working_dir(cFont.fontpath), cFont.fontnb, "glyphs")
    if not op.exists(dirnameb):
        os.makedirs(dirnameb)

    charlista = [f for f in os.listdir(dirnamea)]
    charlistb = [f for f in os.listdir(dirnameb)]
    for ch1 in charlista:
        if ch1 in charlistb:
            fnb, ext = buildfname(ch1)
            if ext in ["glif"]:
                glyphName = fnb
                cFont.glyphName = glyphName
                cFont.glyphunic = glyphName
                putFont()
    #
    #   save previous values back
    cFont.idwork = idworks
    cFont.glyphName = glyphnames
    cFont.glyphunic = glyphunics


def writeallxmlfromdb(alist):
    dirnamea = op.join(working_dir(cFont.fontpath), cFont.fontna, "glyphs")
    dirnameb = op.join(working_dir(cFont.fontpath), cFont.fontnb, "glyphs")

    charlista = [f for f in os.listdir(dirnamea) if fnextension(f) == 'glif']
    charlistb = [f for f in os.listdir(dirnameb) if fnextension(f) == 'glif']

    idworks = cFont.idwork
    aalist = []
    for g in alist:
        aalist.append(g.glyphname)
    #
    for ch1 in charlista:
        if ch1 in charlistb:
            glyphname, exte = buildfname(ch1)
            if glyphname in aalist:
                cFont.glyphunic = glyphname
                cFont.glyphName = glyphname
                #   for A and B font
                for iwork in ['0', '1']:
                    cFont.idwork = iwork
                    writexml()
    #
    #    restore old idwork value
    cFont.idwork = idworks


class Point:

    def __init__(self, x, y):
        self.x = float(x)
        self.y = float(y)
        self.controls = [{'x': None, 'y': None}, {'x': None, 'y': None}]

    def add_controls(self, x, y):
        point = {'x': float(x), 'y': float(y)}
        if float(x) < self.x:
            if self.controls[0]['x'] is not None:
                self.controls[1] = point
            else:
                self.controls[0] = point
        else:
            if self.controls[1]['x'] is not None:
                self.controls[0] = point
            else:
                self.controls[1] = point

    def get_json(self):
        return {'x': self.x, 'y': self.y, 'controls': self.controls}


def get_json(content, glyphid=None):

    contour_pattern = re.compile(r'Filled\scontour\s:\n(.*?)..cycle', re.I | re.S | re.M)
    point_pattern = re.compile(r'\(((-?\d+.?\d+),(-?\d+.\d+))\)'
                               r'..controls\s\(((-?\d+.?\d+),(-?\d+.\d+))\)'
                               r'\sand\s\(((-?\d+.?\d+),(-?\d+.\d+))\)')

    pattern = re.findall(r'\[(\d+)\]\s+Edge structure(.*?)End edge', content,
                         re.I | re.DOTALL | re.M)
    edges = []
    for glyph, edge in pattern:
        if glyphid and int(glyphid) != int(glyph):
            continue
        contours = []
        for contour in contour_pattern.findall(edge.strip()):
            contour = re.sub('\n(\S)', '\\1', contour)
            _contours = []
            control_x_next, control_y_next = None, None
            for point in contour.split('\n'):
                point = point.strip().strip('..')
                match = point_pattern.match(point)
                if match:
                    anchor_x, anchor_y = match.group(1).split(',')
                    control_x, control_y = match.group(4).split(',')
                    p = Point(anchor_x, anchor_y)
                    p.add_controls(control_x, control_y)

                    if control_x_next is not None and control_y_next is not None:
                        p.add_controls(control_x_next, control_y_next)
                    _contours.append(p)
                    control_x_next, control_y_next = match.group(7).split(',')

            if control_x_next and control_y_next:
                _contours[0].add_controls(control_x_next, control_y_next)

            points = []
            for point in _contours:
                points.append(point.get_json())
            contours.append(points)
        edges.append({'glyph': glyph, 'contours': contours})

    return {'total_edges': len(edges), 'edges': edges}
