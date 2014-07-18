from lxml import etree

DEBUG = False


def fix(glifpath):
    with open(glifpath) as fp:
        glifcontent = fp.read()
    return fixglif(glifcontent).fixglif()


class fixglif:

    def __init__(self, glifcontent, debug=False):
        self.debug = debug
        self.glifcontent = glifcontent

    def fixglif(self):
        self.glifcontent = self.extra_cp_fix()
        self.glifcontent = self.auto_cp_fix()
        return self.glifcontent

    def auto_cp_fix(self):
        xmldoc = etree.fromstring(self.glifcontent)
        outline = xmldoc.find("outline")

        numout = 0
        inum = 0
        itype = 0
        itypes = 0
        zznam = 0

        for ioutline in outline:
            numout = numout + 1
            isp = 0
            itypes = itype
            inout = 0
            ns = 0
            yyy = []
            xxx = []
    # zero loop to build xxx and yyy set
            for s in ioutline:
                if s.get('x') is not None:
                    xk = s.get('x')
                    yk = s.get('y')
                    xxx.append(xk)
                    yyy.append(yk)
                else:
                    xk = '0'
                    yk = '0'
                    xxx.append(xk)
                    yyy.append(yk)

            try:
                xxx.append(xxx[0])
                yyy.append(yyy[0])
            except IndexError:
                continue

    # first loop
            for s in ioutline:
                ns = ns + 1
                inum = inum + 1
                if s.get('type') > 0:
                    itype = itype + 1
                    if isp == 0:
                        isp = isp + 1
                else:
                    if s.get('added') == "1":
                        s.attrib['x'] = xxx[ns - 2]
                        s.attrib['y'] = yyy[ns - 2]
                    if s.get('added') == "2":
                        s.attrib['x'] = xxx[ns]
                        s.attrib['y'] = yyy[ns]
                    inout = inout + 1
                    if inout % 2 == 1:
                        s.attrib['control_out'] = "1"
                    else:
                        s.attrib['control_in'] = "1"
    #  second loop
            inout = 0
            isp = 0
            itype = itypes
            for s in ioutline:
                if 'type' in s.attrib and s.attrib['type'] == 'move':
                    continue
                itype = itype + 1
                if isp == 0:
                    s.attrib['startp'] = '1'
                    isp = isp + 1
                if itype < itypes + 1:
                    zznam = zznam + 1
                    zzn = "z" + str(zznam) + "r"
                else:
                    zznam = zznam + 1
                    zzn = "z" + str(zznam) + "l"
                    s.attrib['name'] = zzn

        return etree.tostring(xmldoc, pretty_print=True)

    def extra_cp_fix(self):
        aa = self.glifcontent.split('\n')
        bb = [0] * len(aa)

        i = -1
        lt = -1
        it = -1

        for l in aa:
            i = i + 1
            if l.count("<contour>") > 0:
                lt = 0
            if l.count("<point") > 0 and l.count("type") > 0 and not (l.count('type="move"') or l.count("type='move'")):
                lt = lt + 1
                if lt == 1:
                    it = i
                if lt > 1 and (i - 1) == it:
         # insert extra controlpoints
                    bb[it] = 1
                    lt = 1
                    it = i
            else:
                if l.count("</contour>") > 0:
                    if lt == 1 and (i - 1) == it:
           # insert extra controlpoints
                        bb[it] = 1
                        it = 0
                        lt = 0

                it = 0
                lt = 0

        lines = []

        i = -1
        for a in aa:
            i = i + 1
            lines.append(a)
            if bb[i] > 0:
                lines.append('<point added="1" />')
                lines.append('<point added="2" />')

        return '\n'.join(lines)
