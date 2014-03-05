import plistlib
import os.path as op


def fontinfo(ufofile):
    return plistlib.readPlist(op.join(ufofile, 'fontinfo.plist'))


def update(ufofile, values):
    d = fontinfo(ufofile)
    d.update(values)
    plistlib.writePlist(d, op.join(ufofile, 'fontinfo.plist'))
