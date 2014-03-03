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


def metrics(*masters):
    result = {}

    def func(k, m, A, B):
        return k * (A + m * (B - A))

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

    primarymaster = masters[0]

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

    glyph = primarymaster['glyphs'][glyphname]

    # fip.write("beginfontchar({0}, (3.88)*pt#, 0, 0 )".format(int(glyph['name']) + 1))

    str_ = 'beginfontchar({glyph}, (({p}) / {divider}), 0, 0)'
    fip.write(str_.format(glyph=int(glyph['name']) + 1,
                          p='+'.join(ar), divider=divider))
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
        znamel = re.match('z(\d+)l', item['preset'].get('pointname'))

        im = item['preset'].get('pointname')
        istartp = item['preset'].get('startp')
        itype = item['preset'].get('type')
        icontrol_out = item['preset'].get('control_out')
        icontrol_in = item['preset'].get('control_in')

        if znamel and im == znamel.group(0):
            zzn.append(i)

            if istartp is not None:
                istartpval = item['preset'].get('startp')
                startp.append("\nfill\n")
                startpval.append(istartpval)
            else:
                startp.append("")
                startpval.append(0)

            if itype is not None:
                itypeval = item['preset'].get('type')
                type.append("type")
                typeval.append(itypeval)
            else:
                type.append("")
                typeval.append(0)

            if icontrol_out is not None:
                icontrol_outval = item['preset'].get('control_out')
                control_out.append("control_out")
                control_outval.append(icontrol_outval)
            else:
                control_out.append("")
                control_outval.append(0)

            if icontrol_in is not None:
                icontrol_inval = item['preset'].get('control_in')
                control_in.append("control_in")
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
            leftpoint = left['glyphs'][glyphname]['points'][i]['coords']
            rightpoint = right['glyphs'][glyphname]['points'][i]['coords']
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

    print time.time() - starttime

    return fip.getcontents()
