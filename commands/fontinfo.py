import glob
import os.path as op
import plistlib
from lxml import etree


def fontinfo(ufofile):
    return plistlib.readPlist(op.join(ufofile, 'fontinfo.plist'))


def kerninginfo(ufofile):
    try:
        return plistlib.readPlist(op.join(ufofile, 'kerning.plist'))
    except IOError:
        pass
    return {}


def update(ufofile, values):
    d = fontinfo(ufofile)
    d.update(values)
    plistlib.writePlist(d, op.join(ufofile, 'fontinfo.plist'))


def get_plist_lib(ufofile):
    return plistlib.readPlist(op.join(ufofile, 'lib.plist'))


def update_kerning(ufofile, values):
    plistlib.writePlist(values, op.join(ufofile, 'kerning.plist'))


def correct_contours_direction(ufofile):
    for glifname in glob.glob(op.join(ufofile, 'glyphs', '*.glif')):
        with open(glifname) as fp:
            content = fp.read()

        # apply trick to replace commas
        doctree = etree.fromstring(content.replace(',', '.'))
        for outline in doctree.xpath('.//outline/contour'):
            points = list(outline.xpath('point'))
            etree.strip_tags(outline)
            # change direction by hand from known start point
            result = [points[0]] + points[:0:-1]
            for point in result:
                outline.append(point)

        et = etree.ElementTree(doctree)
        et.write(glifname, xml_declaration=True, encoding='utf-8')

    return
