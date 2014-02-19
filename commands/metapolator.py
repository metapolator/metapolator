#!/usr/bin/env python2.7
# -*- coding: utf-8 -*-
"""
@author Vitaly Volkov (@hash3g) <hash.3g@gmail.com>

Example command line usage

$ metapolator.py \
  --axis   "name:foo|A.ufo:B.ufo|-0.2,1.2" \
  --axis   "name:bar|C.ufo:D.ufo|-0.2,1.2" \
  --master "A.ufo|foo:0.0|bar:0.0" \
  --master "B.ufo|foo:0.0|bar:1.0" \
  --master "C.ufo|foo:1.0|bar:0.0" \
  --master "D.ufo|foo:1.0|bar:1.0" \
  --instance "foo:0.75|bar:0.29030000000000001|family:EncodeNormal-Beta70|stylename:400 Regular"
  I.ufo
$
"""
import argparse
import lxml.etree
import os
import re
import subprocess
import sys
import tempfile
import xmltomf

fwd = os.path.join(os.path.dirname(__file__), 'fontbox')
axes = {}  # contains description of axes
font = {}  # contains description of new ufo


def get_temp_dir():
    d = os.path.join(tempfile.gettempdir(), 'mp-glyphs')
    try:
        os.removedirs(d)
    except OSError, e:
        if e.errno != 2:
            raise
    os.mkdir(d)
    return d


def parse_argument_master(master_string):
    """ Parse string master description and returns dictionary
        of master's description """
    ufofile, width_desc, weight_desc = master_string.split('|')
    _, widthvalue = width_desc.split(':')
    _, weightvalue = width_desc.split(':')
    return dict(width=float(widthvalue), weight=float(weightvalue),
                name=ufofile, glyphs={}, alias=os.path.splitext(ufofile)[0])


def main():
    argv = parse_command_line_arguments()

    masters = []
    for master in argv.master:
        data = parse_argument_master(master)
        for glyph in iterate_glyphs(data):
            data['glyphs'][glyph['name']] = glyph
        masters.append(data)

    # collect masters pair for each axes
    for ax in argv.axis:
        axis, masterlist, values = ax.split('|')
        try:
            f, s = masterlist.split(':')
        except ValueError:
            f = s = masterlist
        l_master = filter(lambda m: m['name'] == f, masters)[0]
        r_master = filter(lambda m: m['name'] == s, masters)[0]
        axes[re.sub(r'name:', '', axis, re.I)] = [l_master, r_master]

    for arg in argv.instance.split('|'):
        try:
            key, value = arg.split(':')
        except ValueError:
            key = arg
            value = 0
        if key in axes.keys():
            axes[key].append(float(value))
            continue
        if key.lower() in ['family', 'stylename']:
            font[key.lower()] = value if value else ''

    # loop the glyph in primary master glyphs
    # import pprint
    for glyphname in masters[0]['glyphs']:
        if not glyph_exist(glyphname, *masters[1:]):
            # check that glyph exist in another masters
            # if it does not, so just ignore it
            # from generating new ufo
            continue
        print xmltomf.xmltomf(glyphname, axes)

        # pprint.pprint(glyph)

    # os.environ['MFINPUTS'] = get_temp_dir()
    # os.environ['MFMODE'] = 'controlpoints'

    # process = subprocess.Popen(
    #     ["sh", "makefont.sh", metafont, self.version],
    #     stdout=subprocess.PIPE, stderr=subprocess.PIPE, cwd=working_dir()
    # )


def glyph_exist(glyphname, *masters):
    """ Returns True if ALL masters contain glyph with name """
    for m in masters:
        if glyphname not in m['glyphs']:
            return False
    return True


def iterate_glyphs(master):
    """ Returns JSON with glyphs description for master """
    assert isinstance(master, dict)
    glyphsdir = os.path.join(fwd, master['name'], 'glyphs')
    for filename in os.listdir(glyphsdir):
        if os.path.splitext(filename)[1].lower() != '.glif':
            continue
        yield glif2json(open(os.path.join(glyphsdir, filename)))


def glif2json(fp):
    doctree = lxml.etree.parse(fp)

    contours = []
    for contour in doctree.xpath('.//outline/contour'):
        points = []

        xml_points = list(contour.findall('point'))
        index = 0
        while index < len(xml_points):
            offset = 1  # reset offset each time of while-loop

            point = xml_points[index]
            pointtype = point.attrib.get('type', 'offcurve')
            if pointtype != 'offcurve':
                coords = {'x': point.attrib['x'], 'y': point.attrib['y']}
                if pointtype == 'line':
                    try:
                        checkpoint = xml_points[index + 1]
                        if checkpoint.attrib.get('type', 'offcurve') == 'offcurve':
                            coords.update({'x1': checkpoint.attrib['x'],
                                           'y1': checkpoint.attrib['y']})
                            offset = 2  # next offset is a 2 as we have control point
                    except IndexError:
                        pass

                elif pointtype == 'curve':
                    try:
                        checkpoint = xml_points[index + 1]
                        if checkpoint.attrib.get('type', 'offcurve') == 'offcurve':
                            coords.update({'x2': checkpoint.attrib['x'],
                                           'y2': checkpoint.attrib['y']})
                            offset = 2  # next offset is a 2 as we have control point
                    except IndexError:
                        pass

                    try:
                        checkpoint = xml_points[index - 1]
                        if checkpoint.attrib.get('type', 'offcurve') == 'offcurve':
                            coords.update({'x1': checkpoint.attrib['x'],
                                           'y1': checkpoint.attrib['y']})
                            offset = 2  # next offset is a 2 as we have control point
                    except IndexError:
                        pass

                points.append(coords)
            index += offset

        contours.append(points)

    return {'contours': contours,
            'name': doctree.getroot().attrib['name'],
            'advanceWidth': doctree.find('advance').attrib['width']}


def parse_command_line_arguments():
    parser = argparse.ArgumentParser(description=('Interpolates several ufos '
                                                  'into a new one '
                                                  'with custom axis'))
    if len(sys.argv) == 1:
        print 'Metapolator (https://github.com/metapolator/metapolator)'
        parser.print_help()
        sys.exit(1)

    parser.add_argument('--axis', type=str, action='append')
    parser.add_argument('--master', type=str, action='append')
    parser.add_argument('--instance', type=str, default='')
    parser.add_argument('output_ufo', metavar='output_ufo', type=str)
    return parser.parse_args()


if __name__ == '__main__':
    main()
