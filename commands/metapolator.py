#!/usr/bin/env python2.7
# -*- coding: utf-8 -*-
"""
@author Vitaly Volkov (@hash3g) <hash.3g@gmail.com>

Example command line usage

$ metapolator.py \
  --axis   "name:foo|A.ufo:B.ufo|koef=0.15,metap=0.25" \
  --axis   "name:bar|A.ufo:C.ufo|koef=0.75,metap=1" \
  --family "EncodeNormal-Beta70" \
  --stylename "400 Regular"
  output.ufo
$
"""
import argparse
import os
import os.path as op
import fontinfo
import points2mf
import re
import subprocess
import sys

from fixglif import fix
from logger import logger

# MetaPost working directory
metap_workdir = op.join(op.dirname(__file__), 'data')

# Font Working Directory
fwd = op.join(metap_workdir, 'fontbox')

masters = []


def get_temp_dir():
    # dir = tempfile.gettempdir()
    dir = fwd
    d = op.join(dir, 'glyphs')
    if op.exists(d):
        return d
    # try:
    #     os.removedirs(d)
    # except OSError, e:
    #     if e.errno != 2:
    #         raise
    os.mkdir(d)
    return d


def get_master_alias(ufofile):
    return op.basename(re.sub('\W', '_', ufofile))


def init_master(ufofile):
    print
    print 'Read data from UFOs for font information'
    info = fontinfo.fontinfo(op.join(fwd, ufofile))
    kerns = fontinfo.kerninginfo(op.join(fwd, ufofile))
    logger.lapse()

    glypharray = points2mf.GLYPHNAME
    return dict(name=ufofile, glyphs={}, info=info, kerning=kerns,
                glyphorder=glypharray, alias=get_master_alias(op.splitext(ufofile)[0]))


def get_from_config(config, key):
    _ = config.split(',')
    kv = dict(map(lambda x: (x.split('=')[0], x.split('=')[1]), _))
    return float(kv.get(key, 0))


def parse_arguments(argv):
    # collect masters pair for each axes
    if not argv.axis:
        return
    for ax in argv.axis:
        # TODO: check for invalid argument?
        a, masterlist, config = ax.split('|')

        alias = ''  # axis alias is concatinated masters aliases
        for ufofile in masterlist.split(':'):
            master = init_master(ufofile)
            masters.append(master)

            alias += master['alias']

        # values for coefficient and metapolation applying to zero
        points2mf.cachekoef[alias] = get_from_config(config, 'coefficient')
        points2mf.metapolationcache[alias] = get_from_config(config, 'metapolation')

    print
    print 'Definition of axis'
    logger.lapse()

    print
    print 'Definition of glyphs for masters'
    for master in masters:
        for glyph in iterate_glyphs(master):
            master['glyphs'][glyph['name']] = glyph
    logger.lapse()


def generate_mf(masters):
    # loop the glyph in primary master glyphs
    # import pprint
    directory = get_temp_dir()
    for glyphname in masters[0]['glyphs']:
        if not glyph_exist(glyphname, *masters[1:]):
            # check that glyph exist in another masters
            # if it does not, so just ignore it
            # from generating new ufo
            continue
        # print 'processing {0}.mf'.format(glyphname)
        with open(op.join(directory, '%s.mf' % glyphname), 'w') as fp:
            fp.write(points2mf.points2mf(glyphname, *masters))


def fill_components(output_ufo, masters):
    from glif2json import glif2json
    master = masters[0]
    glyphsdir = op.join(fwd, master['name'], 'glyphs')
    output_glyphs_dir = op.join(output_ufo, 'glyphs')
    for filename in os.listdir(glyphsdir):
        if op.splitext(filename)[1].lower() != '.glif':
            continue
        glifpath = op.join(glyphsdir, filename)
        output_glyphs_path = op.join(output_glyphs_dir, filename)
        try:
            outputglif = glif2json(output_glyphs_path)
        except IOError:
            continue
        for node in glif2json(glifpath).find_components():
            outputglif.append_component(node)
        outputglif.write()


def find_anchor(glyphname, glyphs, anchorname):
    for k, value in glyphs.items():
        if k == glyphname:
            for anchor in glyphs[k].get('anchors', []):
                if anchor['name'] == anchorname:
                    return anchor
    return


def make_anchors(output_ufo, masters):
    from glif2json import glif2json

    output_glyphs_dir = op.join(output_ufo, 'glyphs')

    # Have to list all glyphs in primary master to add missed anchors
    # after generating UFO with fontforge process
    for key in masters[0]['glyphs']:
        anchors = []
        glyph = masters[0]['glyphs'][key]
        if 'anchors' not in glyph:
            continue
        for anchor in glyph['anchors']:
            divider = 0
            values_x = []
            values_y = []
            for left, right in points2mf.iterate(masters):
                koef = points2mf.getcoefficient(left, right)
                metapolation = points2mf.getmetapolation(left, right)

                divider += koef

                lft = find_anchor(key, left['glyphs'], anchor['name']) or anchor
                rgt = find_anchor(key, right['glyphs'], anchor['name']) or anchor
                values_x.append(points2mf.func(koef, metapolation, float(lft['x']), float(rgt['x'])))
                values_y.append(points2mf.func(koef, metapolation, float(lft['y']), float(rgt['y'])))
            x = sum(values_x) / (divider or 1)
            y = sum(values_y) / (divider or 1)
            anchors.append({'x': x, 'y': y, 'name': anchor['name']})

        output_glyphs_path = op.join(output_glyphs_dir, glyph['sysname'])
        try:
            outputglif = glif2json(output_glyphs_path)
        except IOError:
            continue
        outputglif.append_anchors(anchors)
        outputglif.write()


def main():
    print
    print 'Parsing arguments'
    argv = parse_command_line_arguments()
    logger.lapse()

    if argv.json:
        from glif2json import glif2json
        import pprint
        pprint.pprint(glif2json(argv.output_ufo, glifcontent=fix(argv.output_ufo)).convert())
        logger.lapse()

        sys.exit(0)

    if argv.mf:
        try:
            print open(argv.output_ufo).read()
        except (OSError, IOError) as er:
            print "I/O error({0}): {1}".format(er.errno, er.strerror)
            sys.exit(er.errno)
        sys.exit(0)

    print
    print 'Prepare axis and json masters'
    parse_arguments(argv)

    print
    print 'Generating METAFONT for glyphs'
    generate_mf(masters)
    logger.lapse()

    os.environ['MFINPUTS'] = op.realpath(fwd)
    os.environ['MFMODE'] = 'controlpoints'

    arguments = []
    if argv.family:
        arguments += ['--family', argv.family]
    if argv.fontversion:
        arguments += ['--fontversion', argv.fontversion]

    process = subprocess.Popen(
        ["sh", "makefont.sh", "fontbox"] + arguments,
        stdout=subprocess.PIPE, stderr=subprocess.PIPE, cwd=metap_workdir
    )

    errorcontent = ''
    while True:
        line = process.stdout.readline()
        errorcontent += line
        if not line or '<to be read again>' in errorcontent:
            process.kill()
            break

    fill_components(op.join(metap_workdir, 'fontbox.ufo'), masters)

    make_anchors(op.join(metap_workdir, 'fontbox.ufo'), masters)

    # postprocess for generated ufo file
    # 1. update metrics
    fontinfo.update(op.join(metap_workdir, 'fontbox.ufo'),
                    points2mf.metrics(*masters))

    # 2. update kernings
    fontinfo.update_kerning(op.join(metap_workdir, 'fontbox.ufo'),
                            points2mf.kernings(*masters))

    # 3. change contour directions
    fontinfo.correct_contours_direction(op.join(metap_workdir, 'fontbox.ufo'))
    print
    print 'Call METAPOST'
    logger.lapse()


def glyph_exist(glyphname, *masters):
    """ Returns True if ALL masters contain glyph with name """
    for m in masters:
        if glyphname not in m['glyphs']:
            return False
    return True


def iterate_glyphs(master):
    """ Returns JSON with glyphs description for master """
    assert isinstance(master, dict)
    from glif2json import glif2json
    glyphsdir = op.join(fwd, master['name'], 'glyphs')
    for filename in os.listdir(glyphsdir):
        if op.splitext(filename)[1].lower() != '.glif':
            continue
        glifpath = op.join(glyphsdir, filename)
        yield glif2json(glifpath, glifcontent=fix(glifpath)).convert()


def parse_command_line_arguments():
    parser = argparse.ArgumentParser(description=('Interpolates several ufos '
                                                  'into a new one '
                                                  'with custom axis'))
    if len(sys.argv) == 1:
        print 'Metapolator (https://github.com/metapolator/metapolator)'
        parser.print_help()
        sys.exit(1)

    parser.add_argument('--axis', type=str, action='append')
    parser.add_argument('--family', type=str, default='')
    parser.add_argument('--style', type=str, default='Regular')
    parser.add_argument('--fontversion', type=str, default='1')
    parser.add_argument('--mf', action='store_true')
    parser.add_argument('--json', action='store_true')
    parser.add_argument('output_ufo', metavar='output_ufo', type=str)
    return parser.parse_args()


if __name__ == '__main__':
    main()
