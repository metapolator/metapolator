import os
import os.path as op
import re
import xmltomf
import model

from config import cFont, working_dir, buildfname, remove_ext, mf_filename
from model import putFont


def project_exists(master):
    mf_file1 = op.join(working_dir(), 'fonts/{0}'.format(master.idmaster),
                       mf_filename(master.FontNameA))
    if op.exists(mf_file1):
        return True

    if master.FontNameB:
        mf_file2 = op.join(working_dir(), 'fonts/{0}'.format(master.idmaster),
                           mf_filename(master.FontNameB))
        return op.exists(mf_file2)


def makefont(working_dir, master):
    if not project_exists(master):
        return False
    fontpath = 'fonts/{0}'.format(master.idmaster)

    ufo2mf(master)

    os.environ['MFINPUTS'] = op.join(working_dir, fontpath)
    writeGlyphlist(fontpath)
    strms = "cd %s; sh %s %s" % (working_dir, "makefont.sh", remove_ext(master.FontNameA))
    os.system(strms)

    FontNameB = master.FontNameB
    if not master.FontNameB:
        FontNameB = remove_ext(master.FontNameA) + '.B.UFO'

    strms = "cd %s; sh %s %s" % (working_dir, "makefont.sh", remove_ext(FontNameB))
    os.system(strms)

    strms = "cd %s; sh %s %s" % (working_dir, "makefont.sh", remove_ext(master.FontName))
    os.system(strms)
    return True


def fnextension(filename):
    try:
        basename, extension = filename.split('.')
    except:
        extension = "garbage"
    return extension


def ufo2mf(master):
    fontpath = 'fonts/{0}'.format(master.idmaster)

    dirnamef1 = working_dir(op.join(fontpath, master.FontNameA, "glyphs"))
    dirnamef2 = working_dir(op.join(fontpath, master.FontNameB, "glyphs"))
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
                    model.writexml()
    #
    #    restore old idwork value
    cFont.idwork = idworks


def get_json(content, glyphid=None):
    contour_pattern = re.compile(r'Filled\scontour\s:\n(.*?)..cycle', re.I | re.S | re.M)
    point_pattern = re.compile(r'\(([-\d.]+),([-\d.]+)\)..controls\s'
                               r'\(([-\d.]+),([-\d.]+)\)\sand\s'
                               r'\(([-\d.]+),([-\d.]+)\)')

    pattern = re.findall(r'\[(\d+)\]\s+Edge structure(.*?)End edge', content,
                         re.I | re.DOTALL | re.M)
    edges = []
    x_min = 0
    y_min = 0
    x_max = 0
    y_max = 0
    for glyph, edge in pattern:
        if glyphid and int(glyphid) != int(glyph):
            continue
        contours = []
        for contour in contour_pattern.findall(edge.strip()):
            contour = re.sub('\n(\S)', '\\1', contour)
            _contours = []
            handleIn_X, handleIn_Y = None, None
            for point in contour.split('\n'):
                point = point.strip().strip('..')
                match = point_pattern.match(point)
                if not match:
                    continue

                X = match.group(1)
                Y = match.group(2)

                handleOut_X = match.group(3)
                handleOut_Y = match.group(4)

                controlpoints = [{'x': 0, 'y': 0},
                                 {'x': handleOut_X, 'y': handleOut_Y}]
                if handleIn_X is not None and handleIn_Y is not None:
                    controlpoints[0] = {'x': handleIn_X, 'y': handleIn_Y}

                _contours.append({'x': X, 'y': Y,
                                  'controls': controlpoints})
                handleIn_X = match.group(5)
                handleIn_Y = match.group(6)

                x_min = min(x_min, float(X), float(handleOut_X), float(handleIn_X))
                y_min = min(y_min, float(Y), float(handleOut_Y), float(handleIn_Y))
                x_max = max(x_max, float(X), float(handleOut_X), float(handleIn_X))
                y_max = max(y_max, float(Y), float(handleOut_Y), float(handleIn_Y))

            if handleIn_X and handleIn_Y:
                _contours[0]['controls'][0] = {'x': handleIn_X,
                                               'y': handleIn_Y}

            contours.append(_contours)
        edges.append({'glyph': glyph, 'contours': contours})

    width = abs(x_max) + abs(x_min)
    height = abs(y_max) + abs(y_min)
    return {'total_edges': len(edges), 'edges': edges,
            'width': width, 'height': height}
