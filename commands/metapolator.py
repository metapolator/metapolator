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
import points2mf
import re
import subprocess
import sys

cwd = os.path.dirname(__file__)
fwd = os.path.join(os.path.dirname(__file__), 'fontbox')

axismapping = {}  # contains links to masters pairs
font = {}  # contains description of new ufo
masters = []


def get_temp_dir():
    # dir = tempfile.gettempdir()
    dir = fwd
    d = os.path.join(dir, 'glyphs')
    if os.path.exists(d):
        return d
    # try:
    #     os.removedirs(d)
    # except OSError, e:
    #     if e.errno != 2:
    #         raise
    os.mkdir(d)
    return d


def get_master_alias(ufofile):
    return re.sub('\W', '_', ufofile)


def init_master(ufofile):
    return dict(name=ufofile, glyphs={},
                alias=get_master_alias(os.path.splitext(ufofile)[0]))


def get_from_config(config, key):
    _ = config.split(',')
    kv = dict(map(lambda x: (x.split('=')[0], x.split('=')[1]), _))
    return float(kv.get(key, 0))


def parse_arguments(axis):
    # collect masters pair for each axes
    for ax in axis:
        # TODO: check for invalid argument?
        a, masterlist, config = ax.split('|')

        alias = ''  # axis alias is concatinated masters aliases
        for ufofile in masterlist.split(':'):
            searchmaster = filter(lambda m: m['name'] == ufofile, masters)
            if not len(searchmaster):
                master = init_master(ufofile)
                masters.append(master)
            else:
                master = searchmaster[0]

            alias += master['alias']

        # values for coefficient and metapolation applying to zero
        points2mf.cachekoef[alias] = get_from_config(config, 'koef')
        points2mf.metapolationcache[alias] = get_from_config(config, 'metap')

        axismapping[re.sub('name:', '', a)] = alias


def main():
    argv = parse_command_line_arguments()
    parse_arguments(argv.axis)

    for master in masters:
        for glyph in iterate_glyphs(master):
            master['glyphs'][glyph['name']] = glyph

    # loop the glyph in primary master glyphs
    # import pprint
    directory = get_temp_dir()
    for glyphname in masters[0]['glyphs']:
        if not glyph_exist(glyphname, *masters[1:]):
            # check that glyph exist in another masters
            # if it does not, so just ignore it
            # from generating new ufo
            continue
        print 'processing {0}.mf'.format(glyphname)
        with open(os.path.join(directory, '%s.mf' % glyphname), 'w') as fp:
            fp.write(points2mf.points2mf(glyphname, *masters))

    os.environ['MFINPUTS'] = os.path.realpath(fwd)
    os.environ['MFMODE'] = 'controlpoints'

    process = subprocess.Popen(
        ["sh", "makefont.sh", 'fontbox', '1'],
        stdout=subprocess.PIPE, stderr=subprocess.PIPE, cwd=cwd
    )

    errorcontent = ''
    while True:
        line = process.stdout.readline()
        errorcontent += line
        if not line or '<to be read again>' in errorcontent:
            process.kill()
            break


def glyph_exist(glyphname, *masters):
    """ Returns True if ALL masters contain glyph with name """
    for m in masters:
        if glyphname not in m['glyphs']:
            return False
    return True


def iterate_glyphs(master):
    """ Returns JSON with glyphs description for master """
    assert isinstance(master, dict)
    import glif2json
    glyphsdir = os.path.join(fwd, master['name'], 'glyphs')
    for filename in os.listdir(glyphsdir):
        if os.path.splitext(filename)[1].lower() != '.glif':
            continue
        yield glif2json.glif2json(open(os.path.join(glyphsdir, filename)))


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
    parser.add_argument('output_ufo', metavar='output_ufo', type=str)
    return parser.parse_args()


if __name__ == '__main__':
    main()
