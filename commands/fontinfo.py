import os
import os.path as op
import plistlib


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


def update_kerning(ufofile, values):
    return


def correct_contours_direction(ufofile):
    return
    # import fontforge
    # fp = fontforge.open(ufofile)
    # import pdb; pdb.set_trace()
