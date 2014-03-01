#!/usr/bin/env python2.7
# -*- coding: utf-8 -*-
"""
@author Vitaly Volkov (@hash3g) <hash.3g@gmail.com>

Example command line usage

$ metapolator.py \
  --axis   "name:foo|A.ufo:B.ufo|-0.2,1.2" \
  --axis   "name:bar|A.ufo:C.ufo|-0.2,1.2" \
  --master "A.ufo|AB:0.3|AC:0.2" \
  --master "B.ufo|foo:0.0|bar:1.0" \
  --master "C.ufo|foo:1.0|bar:0.0" \
  --master "D.ufo|foo:1.0|bar:1.0" \
  --instance "foo:0.75|bar:0.29030000000000001|family:EncodeNormal-Beta70|stylename:400 Regular"
  I.ufo
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

axes = []  # contains description of axes
font = {}  # contains description of new ufo


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


def parse_argument_master(master_string):
    """ Parse string master description and returns dictionary
        of master's description """
    ufofile, axis = master_string.split('|', 1)
    result = dict(name=ufofile, glyphs={},
                  alias=os.path.splitext(ufofile)[0],
                  axis=[])

    def cc(value):
        k, v = value.split(':')
        return {k: v}

    result['axis'] = map(cc, axis.split('|'))

    return result


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

        axes.append({'masters': [l_master, r_master],
                     'alias': re.sub(r'name:', '', axis, re.I)})

    for arg in argv.instance.split('|'):
        try:
            key, value = arg.split(':')
        except ValueError:
            key = arg
            value = 0
        # if key in axes.keys():
        #     axes[key].append(float(value))
        #     continue
        if key.lower() in ['family', 'stylename']:
            font[key.lower()] = value if value else ''

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
        stdout=subprocess.PIPE, stderr=open('test.err', 'w'), cwd=cwd
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
    parser.add_argument('--master', type=str, action='append')
    parser.add_argument('--instance', type=str, default='')
    parser.add_argument('output_ufo', metavar='output_ufo', type=str)
    return parser.parse_args()


if __name__ == '__main__':
    main()
