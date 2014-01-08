import os
import os.path as op
import subprocess

from metapolator.config import buildfname, working_dir
from metapolator.models import Glyph, LocalParam, Metapolation


class Metapost:
    """ Make operations after calling metapost utility with existed glyphs """

    def __init__(self, project):
        self.mfparser = project.mfparser
        self.project = project

    def write_glyph_list(self, master, glyphname=None):
        fontdirectory = master.get_fonts_directory()

        ifile = open(op.join(fontdirectory, "glyphlist.mf"), "w")
        dirnamep1 = op.join(fontdirectory, "glyphs")

        charlist1 = [f for f in os.listdir(dirnamep1)]
        if glyphname:
            charlist1 = filter(lambda f: f == '%s.mf' % glyphname, charlist1)

        for ch1 in charlist1:
            fnb, ext = buildfname(ch1)
            if ext in ["mf"]:
                ifile.write("input glyphs/" + ch1 + "\n")
        ifile.close()

    def _execute(self, master, interpolated=False):
        self.write_global_params()

        os.environ['MFINPUTS'] = master.get_fonts_directory()
        os.environ['MFMODE'] = self.mfparser

        if not interpolated:
            metafont = master.get_metafont('a')
        else:
            metafont = master.get_metafont()

        process = subprocess.Popen(
            ["sh", "makefont.sh", metafont],
            stdout=subprocess.PIPE, stderr=subprocess.PIPE, cwd=working_dir()
        )

        while True:
            line = process.stdout.readline()
            if not line or '<to be read again>' in line:
                process.kill()
                break

    def execute_interpolated_bulk(self):
        """ Run metapost for all glyphs with mf files containing points
            from all project masters.
        """
        masters = self.project.get_ordered_masters()

        idmasters = map(lambda x: x.id, masters)
        primary_master = masters[0]

        for glyph in primary_master.get_glyphs():
            _glyphs = Glyph.filter(name=glyph.name)
            _glyphs = _glyphs.filter(Glyph.master_id.in_(idmasters))

            self.interpolated_metafont_generate(masters, *_glyphs)

        self.write_glyph_list(primary_master)
        self._execute(primary_master, interpolated=True)

    def execute_bulk(self, master):
        """ Run metapost for all glyphs with mf files containing points
            from concrete master.
        """
        for glyph in master.get_glyphs():
            if self.mfparser == 'pen':
                import xmltomf
                xmltomf.xmltomf1(master, glyph)

            if self.mfparser == 'controlpoints':
                import xmltomf_new_2axes as xmltomf
            xmltomf.xmltomf1(master, glyph)

        self.write_glyph_list(master)
        self._execute(master)

    def execute_interpolated_single(self, glyph):
        masters = self.project.get_ordered_masters()

        idmasters = map(lambda x: x.id, masters)
        primary_master = masters[0]

        _glyphs = Glyph.filter(name=glyph.name)
        _glyphs = _glyphs.filter(Glyph.master_id.in_(idmasters))

        self.interpolated_metafont_generate(masters, *_glyphs)

        self.write_glyph_list(primary_master, glyph.name)
        self._execute(primary_master, interpolated=True)

    def execute_single(self, master, glyph):
        if self.mfparser == 'pen':
            import xmltomf
            xmltomf.xmltomf1(master, glyph)

        if self.mfparser == 'controlpoints':
            import xmltomf_new_2axes as xmltomf
            xmltomf.xmltomf1(master, glyph)

        self.write_glyph_list(master, glyph.name)
        self._execute(master)

    def interpolated_metafont_generate(self, masters, *args):
        """ Fill mf files related on project mfparser with coords and
            needed metapost rules.
        """
        glyphs = []
        for m in masters:
            for g in list(args):
                if g.master_id == m.id:
                    glyphs.append(g)
                    break

        primary_master = masters[0]
        if self.mfparser == 'controlpoints':
            import xmltomf_new_2axes as xmltomf
            xmltomf.xmltomf1(primary_master, *list(glyphs))
        else:
            import xmltomf
            xmltomf.xmltomf1(primary_master, *list(glyphs))

    def write_global_params(self):
        masters = self.project.get_ordered_masters()

        for i, m in enumerate(masters):
            if not i:
                writeParams(self.project, m.metafont_filepath(), masters)
            if i == 1:
                metapolation = 1
            else:
                metapolation = 0

            writeParams(self.project, m.metafont_filepath('a'), masters,
                        is_concrete_master=True, metapolation=metapolation)


GLOBAL_DEFAULTS = {
    'metapolation': 0,
    'unitwidth': 1,
    'fontsize': 10,
    'mean': 5,
    'cap': 6,
    'asc': 6.5,
    'desc': -2,
    'box': 10
}


LOCAL_DEFAULTS = {
    'px': 0,
    'width': 1,
    'space': 0,
    'xheight': 5,
    'capital': 6,
    'ascender': 6.5,
    'descender': -2,
    'skeleton': 0,
    'over': 0,
    'jut': 1,
    'slab': 1,
    'bracket': 1,
    'serif_darkness': 1,
    'slant': 0
}


def get_global_param(param, key):
    if not param:
        try:
            return GLOBAL_DEFAULTS[key]
        except KeyError:
            return 0
    return getattr(param, key, 0)


def get_local_param(param, key):
    if not param:
        try:
            return LOCAL_DEFAULTS[key]
        except KeyError:
            return 0
    return getattr(param, key, 0)


def writeParams(project, filename, masters, is_concrete_master=False, metapolation=0):

    # TODO: make global parameter to project related and not master
    globalparam = None

    unitwidth = get_global_param(globalparam, 'unitwidth')
    fontsize = get_global_param(globalparam, 'fontsize')
    mean = get_global_param(globalparam, 'mean')
    cap = get_global_param(globalparam, 'cap')
    asc = get_global_param(globalparam, 'asc')
    des = get_global_param(globalparam, 'des')
    box = get_global_param(globalparam, 'box')

    ifile = open(filename, "w")
    # global parameters
    ifile.write("% parameter file \n")
    if is_concrete_master:
        ifile.write("metapolation:=%.2f;\n" % metapolation)
    else:
        metap = Metapolation.get(label='AB', project_id=project.id) or 0
        if metap:
            metap = metap.value
        ifile.write("metapolation:=%.2f;\n" % metap)

    metap = Metapolation.get(label='CD', project_id=project.id)
    if metap:
        metap = metap.value
    else:
        metap = 0
    ifile.write("metapolationCD:=%.2f;\n" % metap)

    ifile.write("font_size:=%.3fpt#;\n" % fontsize)
    ifile.write("mean#:=%.3fpt#;\n" % mean)
    ifile.write("cap#:=%.3fpt#;\n" % cap)
    ifile.write("asc#:=%.3fpt#;\n" % asc)
    ifile.write("desc#:=%.3fpt#;\n" % des)
    ifile.write("box#:=%.3fpt#;\n" % box)
    ifile.write("u#:=%.3fpt#;\n" % unitwidth)

    lmast = masters[:]
    if len(lmast) < 4:
        lmast += [None] * (4 - len(masters))

    for i, master in enumerate(lmast):
        imlo = None
        if master:
            imlo = LocalParam.get(id=master.idlocala)
        uniqletter = chr(ord('A') + i)
        ifile.write("%s_px#:=%.2fpt#;\n" % (uniqletter, get_local_param(imlo, 'px')))
        ifile.write("%s_width:=%.2f;\n" % (uniqletter, get_local_param(imlo, 'width')))
        ifile.write("%s_space:=%.2f;\n" % (uniqletter, get_local_param(imlo, 'space')))
        ifile.write("%s_spacept:=%.2fpt;\n" % (uniqletter, get_local_param(imlo, 'space')))
        ifile.write("%s_xheight:=%.2f;\n" % (uniqletter, get_local_param(imlo, 'xheight')))
        ifile.write("%s_capital:=%.2f;\n" % (uniqletter, get_local_param(imlo, 'capital')))
        ifile.write("%s_ascender:=%.2f;\n" % (uniqletter, get_local_param(imlo, 'ascender')))
        ifile.write("%s_descender:=%.2f;\n" % (uniqletter, get_local_param(imlo, 'descender')))
        ifile.write("%s_skeleton#:=%.2fpt#;\n" % (uniqletter, get_local_param(imlo, 'skeleton')))
        ifile.write("%s_over:=%.2fpt;\n" % (uniqletter, get_local_param(imlo, 'over')))
        ifile.write("%s_jut:=%.2fpt;\n" % (uniqletter, get_local_param(imlo, 'jut')))
        ifile.write("%s_slab:=%.2fpt;\n" % (uniqletter, get_local_param(imlo, 'slab')))
        ifile.write("%s_bracket:=%.2fpt;\n" % (uniqletter, get_local_param(imlo, 'bracket')))
        ifile.write("%s_serif_darkness:=%.2f;\n" % (uniqletter, get_local_param(imlo, 'serif_darkness')))
        ifile.write("%s_slant:=%.2f;\n" % (uniqletter, get_local_param(imlo, 'slant')))

    ifile.write("\n")
    ifile.write("input glyphs\n")
    ifile.write("bye\n")
    ifile.close()
