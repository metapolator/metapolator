#!/usr/bin/env python
#
# A small python script to allow you to select glyphs from a font
# which you want to keep in a resulting output based on that font.
# Note that the other glyphs are cut out of the font, so all the font
# metadata should remain intact in the output font.
#
#
import fontforge
import argparse

parser = argparse.ArgumentParser(description='Process some integers.')
parser.add_argument('-i', '--input',  required=1, 
                    help='input file in any format FontForge can read')
parser.add_argument('-o', '--output', required=1, 
                    help='output file you wish to generate with extension')
parser.add_argument('-g', '--glyph',  required=1, action='append',
                    help='glyph you would like in output')
args = parser.parse_args()
print "Loading your font from " + args.input

f=fontforge.open( args.input ) 
sel = f.selection
for g in args.glyph:
    print "adding to selection " + g
    sel.select( ("more",None), g )
sel.invert()
f.cut()
f.generate( args.output )
print "Saved output to " + args.output
