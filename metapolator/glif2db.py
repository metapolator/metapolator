from lxml import etree
import os
import os.path as op

from metapolator.base.config import buildfname
from metapolator.glif2points import get_pointsets, get_controlpmode_pointsets
from metapolator.models import Glyph, GlyphParam, GlyphOutline


def create_glyph(glif, master):
    itemlist = glif.find('advance')
    width = itemlist.get('width')

    glyph = glif.getroot()
    glyphname = glyph.get('name')

    if master.project.mfparser == 'pen':
        pointsets = get_pointsets(glif)
    else:
        pointsets = get_controlpmode_pointsets(glif)

    if Glyph.exists(name=glyphname, master_id=master.id):
        return

    glyph = Glyph.create(name=glyphname, width=width,
                         master_id=master.id,
                         project_id=master.project_id,
                         width_new=width)

    for pointset in pointsets:
        pointset.save_to_database(glyph)

    return glyph


def extract_gliflist_from_ufo(master, glyph=None, extract_first=False):
    fontpath = op.join(master.get_ufo_path(), 'glyphs')

    charlista = filter(lambda f: op.splitext(f)[1] == '.glif',
                       os.listdir(fontpath))

    if glyph:
        charlista = filter(lambda f: f == '%s.glif' % glyph, charlista)

    if extract_first and charlista:
        charlista = [charlista[0]]

    return charlista


def put_font_all_glyphs(master, glyph=None, preload=False, force_update=False):
    gliflist = extract_gliflist_from_ufo(master, glyph=glyph,
                                         extract_first=preload)
    fontpath = op.join(master.get_ufo_path(), 'glyphs')

    glyphs = []
    for ch1 in gliflist:
        glyphName, ext = buildfname(ch1)
        if not glyphName or glyphName.startswith('.') or ext not in ["glif"]:
            continue

        if force_update:
            glyph_obj = Glyph.get(name=glyphName, master_id=master.id)
            if glyph_obj:
                GlyphParam.filter(glyph_id=glyph_obj.id).delete()
                GlyphOutline.filter(glyph_id=glyph_obj.id).delete()
                Glyph.delete(glyph_obj)

        glif = etree.parse(op.join(fontpath, ch1))
        newglyph_obj = create_glyph(glif, master)
        if newglyph_obj:
            glyphs.append(newglyph_obj.name)

    try:
        return glyphs[0]
    except IndexError:
        return
