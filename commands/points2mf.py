import re


class FIP:

    def __init__(self):
        self.content = ''

    def write(self, string):
        if not string:
            return
        self.content += string

    def getcontents(self):
        return self.content


def iterate(objlist):
    # collect all pairs so that master appeared in pair once with one master
    # so that in list should not exist pairs [A,B] and [B,A]
    for i in range(len(objlist) - 1):
        for j in range(i + 1, len(objlist)):
            yield objlist[i], objlist[j]


class DifferentZPointError(Exception):
    pass


cachekoef = {}

metapolationcache = {}


def getcoefficient(left, right):
    axis = ''.join([left['alias'], right['alias']])
    if axis in cachekoef:
        return cachekoef[axis]
    cachekoef[axis] = 0  # random.choice([0, 1])
    return cachekoef[axis]


def getmetapolation(left, right):
    axis = ''.join([left['alias'], right['alias']])
    if axis in metapolationcache:
        return metapolationcache[axis]
    metapolationcache[axis] = 0  # random.random()
    return metapolationcache[axis]


def func(k, m, A, B):
    return k * (A + m * (B - A))


def kernings(*masters):
    if not len(list(masters)):
        return {}

    divider = 0

    kerning_table = {}
    for left, right in iterate(masters):
        koef = getcoefficient(left, right)
        metapolation = getmetapolation(left, right)

        divider += koef

        for kerningkey in left['kerning']:
            if kerningkey not in kerning_table:
                kerning_table[kerningkey] = dict()

            for kernedkey in left['kerning'][kerningkey]:
                if kernedkey not in kerning_table[kerningkey]:
                    kerning_table[kerningkey][kernedkey] = 0

                try:
                    p = func(koef, metapolation,
                             float(left['kerning'][kerningkey][kernedkey]),
                             float(right['kerning'][kerningkey][kernedkey]))
                except KeyError:
                    p = func(koef, metapolation,
                             float(left['kerning'][kerningkey][kernedkey]),
                             float(left['kerning'][kerningkey][kernedkey]))
                kerning_table[kerningkey][kernedkey] += p

    # import pprint
    # pprint.pprint(kerning_table)

    return {}


def metrics(*masters):
    result = {}

    def info(param):
        ar = []  # array for definition of formulas

        divider = 0

        for left, right in iterate(masters):
            koef = getcoefficient(left, right)
            divider += koef
            metapolation = getmetapolation(left, right)

            p = func(koef, metapolation,
                     float(left['info'][param]), float(right['info'][param]))
            ar.append(p)

        if not divider:
            divider = 1
        return round(sum(ar) / divider)

    result['xHeight'] = int(info('xHeight'))
    result['ascender'] = int(info('ascender'))
    result['descender'] = int(info('descender'))
    result['capHeight'] = int(info('capHeight'))
    return result


def points2mf(glyphname, *masters):
    import time

    starttime = time.time()

    if len(masters) < 1:
        return ''

    fip = FIP()

    fip.write("% File parsed with Metapolator %\n")
    fip.write("% box dimension definition %\n")

    fip.write("\n")

    formulas = "{k} * ({A} + {M} * ({B} - {A}))"
    ar = []  # array for definition of formulas

    divider = 0

    for left, right in iterate(masters):
        leftglyph = left['glyphs'][glyphname]
        rightglyph = right['glyphs'][glyphname]

        koef = getcoefficient(left, right)
        divider += koef
        metapolation = getmetapolation(left, right)

        p = formulas.format(A='%.2f' % (leftglyph['advanceWidth'] / 100.),
                            B='%.2f' % (rightglyph['advanceWidth'] / 100.),
                            k=koef,
                            M=metapolation)
        ar.append(p)

    if not divider:
        divider = 1

    try:
        glyph = list(masters)[0]['glyphorder'].index(glyphname) + 1
    except ValueError:
        return ''

    str_ = 'beginfontchar({glyph}, (({p}) / {divider}), 0, 0)'
    fip.write(str_.format(glyph=glyph, p='+'.join(ar), divider=divider))
    fip.write('\n')
    fip.write("""% z points""")

    zzn = []
    startp = []
    startpval = []
    type = []
    typeval = []
    control_out = []
    control_outval = []
    control_in = []
    control_inval = []

    i = 1

# search for parameters

    for item in masters[0]['glyphs'][glyphname]['points']:
        znamel = re.match('z(\d+)l', item.get('point-name'))

        im = item.get('point-name')
        istartp = item.get('startp')
        itype = item.get('type')
        icontrol_out = item.get('control-out')
        icontrol_in = item.get('control-in')

        if znamel and im == znamel.group(0):
            zzn.append(i)

            if istartp is not None:
                istartpval = item.get('startp')
                startp.append("\nfill\n")
                startpval.append(istartpval)
            else:
                startp.append("")
                startpval.append(0)

            if itype is not None:
                itypeval = item.get('type')
                type.append("type")
                typeval.append(itypeval)
            else:
                type.append("")
                typeval.append(0)

            if icontrol_out is not None:
                icontrol_outval = item.get('control-out')
                control_out.append('control-out')
                control_outval.append(icontrol_outval)
            else:
                control_out.append("")
                control_outval.append(0)

            if icontrol_in is not None:
                icontrol_inval = item.get('control-in')
                control_in.append('control-in')
                control_inval.append(icontrol_inval)
            else:
                control_in.append("")
                control_inval.append(0)

            i += 1

    semi = ";"

    mffunc = '{k} * ({A}u + {m} * ({B}u - {A}u))'

    for i in range(len(zzn)):
        zitem = i + 1

        ar = {'x': [], 'y': []}
        divider = 0

        for left, right in iterate(masters):
            leftpoint = left['glyphs'][glyphname]['points'][i]
            rightpoint = right['glyphs'][glyphname]['points'][i]
            koef = getcoefficient(left, right)
            metapolation = getmetapolation(left, right)
            divider += koef

            f = mffunc.format(k=koef, m=metapolation, A='%.2f' % (leftpoint['x'] / 100.),
                              B='%.2f' % (rightpoint['x'] / 100.))
            ar['x'].append(f)

            f = mffunc.format(k=koef, m=metapolation, A='%.2f' % (leftpoint['y'] / 100.),
                              B='%.2f' % (rightpoint['y'] / 100.))
            ar['y'].append(f)

        if not divider:
            divider = 1

        zeile = 'z{i} = ( (({fx}) / {d}), (({fy}) / {d}) );'
        zeile = zeile.format(fx='+'.join(ar['x']), fy='+'.join(ar['y']),
                             d=divider, i=zitem)

        fip.write("\n")
        fip.write(zeile)

    fip.write("\n")
    fip.write("""% penstrokes""")

    zeile = ""
    semi = ";"

    fip.write('\n')

    for i in range(len(zzn) - 1):
        zitem = zzn[i]
        zeile = str(startp[i]) + "z" + str(zitem)

        if startp[i + 1] == "":

            dash = " -- "

            if type[i + 1] != "":
                zeile += dash

            if control_out[i] != "":
                zeile = " .. controls z" + str(zitem) + " and "

            if control_in[i] != "":
                zeile = " z" + str(zitem) + " .. "
        else:
            if control_out[i] != "":
                zeile += " .. cycle" + semi + '\n'
            else:
                zeile += " .. cycle" + semi + '\n'

        fip.write(zeile)

        zitemb = zzn[i + 1]
        zeile = "z" + str(zitemb)
        i = i + 1

    if len(zzn) >= i:
        fip.write(zeile + " .. cycle" + semi)

    fip.write("\n")
    fip.write("% pen labels\n")
    fip.write("penlabels(range 1 thru 99);\n")
    fip.write("endchar;")

    # print time.time() - starttime

    return fip.getcontents()


GLYPHNAME = ['A', 'Agrave', 'Aacute', 'Acircumflex', 'Atilde', 'Adieresis',
             'Aring', 'Amacron', 'Abreve', 'Aogonek', 'B', 'uni1E02', 'C',
             'Ccedilla', 'Cacute', 'Ccircumflex', 'Cdotaccent', 'Ccaron',
             'D', 'Dcaron', 'uni1E0A', 'E', 'Egrave', 'Eacute',
             'Ecircumflex', 'Edieresis', 'Emacron', 'Edotaccent',
             'Eogonek', 'Ecaron', 'F', 'uni1E1E', 'G', 'Gcircumflex',
             'Gbreve', 'Gdotaccent', 'Gcommaaccent', 'H', 'Hcircumflex',
             'I', 'Igrave', 'Iacute', 'Icircumflex', 'Idieresis', 'Itilde',
             'Imacron', 'Iogonek', 'Idotaccent', 'J', 'Jcircumflex', 'K',
             'Kcommaaccent', 'L', 'Lacute', 'Lcommaaccent', 'Lcaron', 'M',
             'uni1E40', 'N', 'Ntilde', 'Nacute', 'Ncommaaccent', 'Ncaron',
             'O', 'Ograve', 'Oacute', 'Ocircumflex', 'Otilde', 'Odieresis',
             'Omacron', 'Ohungarumlaut', 'P', 'uni1E56', 'Q', 'R', 'Racute',
             'Rcommaaccent', 'Rcaron', 'S', 'Sacute', 'Scircumflex',
             'Scedilla', 'Scaron', 'uni1E60', 'T', 'Tcommaaccent',
             'Tcaron', 'uni1E6A', 'U', 'Ugrave', 'Uacute', 'Ucircumflex',
             'Udieresis', 'Utilde', 'Umacron', 'Ubreve', 'Uring',
             'Uhungarumlaut', 'Uogonek', 'V', 'W', 'Wcircumflex', 'Wgrave',
             'Wacute', 'Wdieresis', 'X', 'Y', 'Yacute', 'Ycircumflex',
             'Ydieresis', 'Ygrave', 'Z', 'Zacute', 'Zdotaccent', 'Zcaron',
             'AE', 'Eth', 'Oslash', 'Thorn', 'Dcroat', 'Hbar', 'Lslash',
             'Eng', 'OE', 'Tbar', 'M.salt', 'uni1E40.salt', 'N.salt',
             'Ntilde.salt', 'Nacute.salt', 'Ncommaaccent.salt',
             'Ncaron.salt', 'X.salt', 'Idotaccent.smcp', 'uni03A9', 'mu',
             'afii61289', 'a', 'agrave', 'aacute', 'acircumflex', 'atilde',
             'adieresis', 'aring', 'amacron', 'abreve', 'aogonek', 'b',
             'uni1E03', 'c', 'ccedilla', 'cacute', 'ccircumflex',
             'cdotaccent', 'ccaron', 'c_h', 'c_k', 'c_t', 'd', 'dcaron',
             'uni1E0B', 'e', 'egrave', 'eacute', 'ecircumflex',
             'edieresis', 'emacron', 'edotaccent', 'eogonek', 'ecaron',
             'f', 'uni1E1F', 'f_t', 'f_y', 'g', 'gcircumflex', 'gbreve',
             'gdotaccent', 'gcommaaccent', 'h', 'hcircumflex', 'i',
             'igrave', 'iacute', 'icircumflex', 'idieresis', 'itilde',
             'imacron', 'iogonek', 'j', 'jcircumflex', 'k', 'kcommaaccent',
             'l', 'lacute', 'lcommaaccent', 'lcaron', 'm', 'uni1E41', 'n',
             'ntilde', 'nacute', 'ncommaaccent', 'ncaron', 'o', 'ograve',
             'oacute', 'ocircumflex', 'otilde', 'odieresis', 'omacron',
             'ohungarumlaut', 'p', 'uni1E57', 'q', 'r', 'racute',
             'rcommaaccent', 'rcaron', 's', 'sacute', 'scircumflex',
             'scedilla', 'scaron', 'uni1E61', 't', 'tcommaaccent',
             'tcaron', 'uni1E6B', 't_t', 't_y', 'u', 'ugrave', 'uacute',
             'ucircumflex', 'udieresis', 'utilde', 'umacron', 'ubreve',
             'uring', 'uhungarumlaut', 'uogonek', 'v', 'w', 'wcircumflex',
             'wgrave', 'wacute', 'wdieresis', 'x', 'y', 'yacute',
             'ydieresis', 'ycircumflex', 'ygrave', 'z', 'zacute',
             'zdotaccent', 'zcaron', 'ordfeminine', 'ordmasculine',
             'germandbls', 'ae', 'eth', 'oslash', 'thorn', 'dcroat',
             'hbar', 'dotlessi', 'kgreenlandic', 'lslash', 'eng', 'oe',
             'tbar', 'florin', 'uniFB00', 'uniFB01', 'uniFB02', 'uniFB03',
             'uniFB04', 'uniFB06', 'a.salt', 'agrave.salt', 'aacute.salt',
             'acircumflex.salt', 'atilde.salt', 'adieresis.salt',
             'aring.salt', 'amacron.salt', 'abreve.salt', 'aogonek.salt',
             'b.salt', 'uni1E03.salt', 'd.salt', 'dcaron.salt',
             'uni1E0B.salt', 'f.salt', 'uni1E1F.salt', 'g.salt',
             'gcircumflex.salt', 'gbreve.salt', 'gdotaccent.salt',
             'gcommaaccent.salt', 'm.salt', 'uni1E41.salt', 'n.salt',
             'ntilde.salt', 'nacute.salt', 'ncommaaccent.salt',
             'ncaron.salt', 'p.salt', 'uni1E57.salt', 'r.salt',
             'racute.salt', 'rcommaaccent.salt', 'rcaron.salt', 't.salt',
             'tcommaaccent.salt', 'tcaron.salt', 'u.salt', 'ugrave.salt',
             'uacute.salt', 'ucircumflex.salt', 'udieresis.salt',
             'utilde.salt', 'umacron.salt', 'ubreve.salt', 'uring.salt',
             'uhungarumlaut.salt', 'uogonek.salt', 'x.salt', 'dcroat.salt',
             'tbar.salt', 'a.smcp', 'agrave.smcp', 'aacute.smcp',
             'acircumflex.smcp', 'atilde.smcp', 'adieresis.smcp',
             'aring.smcp', 'amacron.smcp', 'abreve.smcp', 'aogonek.smcp',
             'b.smcp', 'uni1E03.smcp', 'c.smcp', 'ccedilla.smcp',
             'cacute.smcp', 'ccircumflex.smcp', 'cdotaccent.smcp',
             'ccaron.smcp', 'd.smcp', 'dcaron.smcp', 'uni1E0B.smcp',
             'e.smcp', 'egrave.smcp', 'eacute.smcp', 'ecircumflex.smcp',
             'edieresis.smcp', 'emacron.smcp', 'edotaccent.smcp',
             'eogonek.smcp', 'ecaron.smcp', 'f.smcp', 'uni1E1F.smcp',
             'g.smcp', 'gcircumflex.smcp', 'gbreve.smcp',
             'gdotaccent.smcp', 'gcommaaccent.smcp', 'h.smcp',
             'hcircumflex.smcp', 'i.smcp', 'igrave.smcp', 'iacute.smcp',
             'icircumflex.smcp', 'idieresis.smcp', 'itilde.smcp',
             'imacron.smcp', 'iogonek.smcp', 'j.smcp', 'jcircumflex.smcp',
             'k.smcp', 'kcommaaccent.smcp', 'l.smcp', 'lacute.smcp',
             'lcommaaccent.smcp', 'lcaron.smcp', 'm.smcp', 'uni1E41.smcp',
             'n.smcp', 'ntilde.smcp', 'nacute.smcp', 'ncommaaccent.smcp',
             'ncaron.smcp', 'o.smcp', 'ograve.smcp', 'oacute.smcp',
             'ocircumflex.smcp', 'otilde.smcp', 'odieresis.smcp',
             'omacron.smcp', 'ohungarumlaut.smcp', 'p.smcp',
             'uni1E57.smcp', 'q.smcp', 'r.smcp', 'racute.smcp',
             'rcommaaccent.smcp', 'rcaron.smcp', 's.smcp', 'sacute.smcp',
             'scircumflex.smcp', 'scedilla.smcp', 'scaron.smcp',
             'uni1E61.smcp', 't.smcp', 'tcommaaccent.smcp', 'tcaron.smcp',
             'uni1E6B.smcp', 'u.smcp', 'ugrave.smcp', 'uacute.smcp',
             'ucircumflex.smcp', 'udieresis.smcp', 'utilde.smcp',
             'umacron.smcp', 'ubreve.smcp', 'uring.smcp',
             'uhungarumlaut.smcp', 'uogonek.smcp', 'v.smcp', 'w.smcp',
             'wcircumflex.smcp', 'wgrave.smcp', 'wacute.smcp',
             'wdieresis.smcp', 'x.smcp', 'y.smcp', 'yacute.smcp',
             'ydieresis.smcp', 'ycircumflex.smcp', 'ygrave.smcp', 'z.smcp',
             'zacute.smcp', 'zdotaccent.smcp', 'zcaron.smcp',
             'ordfeminine.smcp', 'ordmasculine.smcp', 'germandbls.smcp',
             'ae.smcp', 'eth.smcp', 'oslash.smcp', 'thorn.smcp',
             'dcroat.smcp', 'hbar.smcp', 'lslash.smcp', 'eng.smcp',
             'oe.smcp', 'tbar.smcp', 'a.superior', 'b.superior',
             'c.superior', 'd.superior', 'e.superior', 'f.superior',
             'g.superior', 'h.superior', 'i.superior', 'j.superior',
             'k.superior', 'l.superior', 'm.superior', 'n.superior',
             'o.superior', 'p.superior', 'q.superior', 'r.superior',
             's.superior', 't.superior', 'u.superior', 'v.superior',
             'w.superior', 'x.superior', 'y.superior', 'z.superior', 'pi',
             'circumflex', 'caron', 'circumflex.smcp', 'caron.smcp',
             'uni0338', 'zero', 'one', 'two', 'three', 'four', 'five',
             'six', 'seven', 'eight', 'nine', 'zero.denominator',
             'one.denominator', 'two.denominator', 'three.denominator',
             'four.denominator', 'five.denominator', 'six.denominator',
             'seven.denominator', 'eight.denominator', 'nine.denominator',
             'zero.numerator', 'one.numerator', 'two.numerator',
             'three.numerator', 'four.numerator', 'five.numerator',
             'six.numerator', 'seven.numerator', 'eight.numerator',
             'nine.numerator', 'zero.oldstyle', 'one.oldstyle',
             'two.oldstyle', 'three.oldstyle', 'four.oldstyle',
             'five.oldstyle', 'six.oldstyle', 'seven.oldstyle',
             'eight.oldstyle', 'nine.oldstyle', 'zero.smcp', 'one.smcp',
             'two.smcp', 'three.smcp', 'four.smcp', 'five.smcp',
             'six.smcp', 'seven.smcp', 'eight.smcp', 'nine.smcp',
             'zero.tnum', 'one.tnum', 'two.tnum', 'three.tnum',
             'four.tnum', 'five.tnum', 'six.tnum', 'seven.tnum',
             'eight.tnum', 'nine.tnum', 'zero.tosf', 'one.tosf',
             'two.tosf', 'three.tosf', 'four.tosf', 'five.tosf',
             'six.tosf', 'seven.tosf', 'eight.tosf', 'nine.tosf',
             'uni00B2', 'uni00B3', 'uni00B9', 'onequarter', 'onehalf',
             'threequarters', 'uni2070', 'uni2074', 'uni2075', 'uni2076',
             'uni2077', 'uni2078', 'uni2079', 'uni2080', 'uni2081',
             'uni2082', 'uni2083', 'uni2084', 'uni2085', 'uni2086',
             'uni2087', 'uni2088', 'uni2089', 'underscore', 'hyphen',
             'endash', 'emdash', 'hyphen.alt', 'endash.alt', 'emdash.alt',
             'hyphen.smcp', 'endash.smcp', 'emdash.smcp', 'parenleft',
             'bracketleft', 'braceleft', 'quotesinglbase', 'quotedblbase',
             'parenleft.alt', 'parenleft.smcp', 'quotesinglbase.smcp',
             'quotedblbase.smcp', 'parenright', 'bracketright',
             'braceright', 'parenright.alt', 'parenright.smcp',
             'guillemotleft', 'quoteleft', 'quotedblleft', 'guilsinglleft',
             'quoteleft.smcp', 'quotedblleft.smcp', 'guillemotright',
             'quoteright', 'quotedblright', 'guilsinglright',
             'quoteright.smcp', 'quotedblright.smcp', 'exclam', 'quotedbl',
             'numbersign', 'percent', 'ampersand', 'quotesingle',
             'asterisk', 'comma', 'period', 'slash', 'colon', 'semicolon',
             'question', 'at', 'backslash', 'exclamdown', 'periodcentered',
             'questiondown', 'dagger', 'daggerdbl', 'bullet', 'ellipsis',
             'perthousand', 'at.alt', 'exclamdown.alt', 'questiondown.alt',
             'ampersand.salt', 'exclam.smcp', 'quotedbl.smcp',
             'numbersign.smcp', 'percent.smcp', 'ampersand.smcp',
             'quotesingle.smcp', 'asterisk.smcp', 'question.smcp',
             'at.smcp', 'exclamdown.smcp', 'periodcentered.smcp',
             'questiondown.smcp', 'bullet.smcp', 'perthousand.smcp',
             'plus', 'less', 'equal', 'greater', 'bar', 'asciitilde',
             'logicalnot', 'plusminus', 'multiply', 'divide', 'fraction',
             'partialdiff', 'Delta', 'product', 'summation', 'minus',
             'radical', 'infinity', 'integral', 'approxequal', 'notequal',
             'lessequal', 'greaterequal', 'dollar', 'cent', 'sterling',
             'currency', 'yen', 'Euro', 'dollar.smcp', 'sterling.smcp',
             'yen.smcp', 'Euro.smcp', 'asciicircum', 'grave', 'dieresis',
             'macron', 'acute', 'cedilla', 'breve', 'dotaccent', 'ring',
             'ogonek', 'tilde', 'hungarumlaut', 'grave.smcp',
             'dieresis.smcp', 'macron.smcp', 'acute.smcp', 'ring.smcp',
             'tilde.smcp', 'brokenbar', 'section', 'copyright',
             'registered', 'degree', 'paragraph', 'afii61352', 'trademark',
             'estimated', 'lozenge', 'degree.smcp', 'space', '.notdef',
             'uni000D', 'uni00AD', 'uni00AD.alt', 'uni00AD.smcp',
             'onesuperior', 'threesuperior', 'twosuperior']
