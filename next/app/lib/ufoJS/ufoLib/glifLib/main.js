/**
 * Copyright (c) 2012, Lasse Fister lasse@graphicore.de, http://graphicore.de
 * 
 * You should have received a copy of the MIT License along with this program.
 * If not, see http://www.opensource.org/licenses/mit-license.php
 * 
 * This is a port of glifLib defined in robofab/branches/ufo3k/Lib/ufoLib/gliflib.py
 *
 */ 
 
define(
    [
        'ufojs/errors',
        './Glyph',
        './GlyphSet',
        './misc',
        './readGlyph',
        './writeGlyph'
    ],
    function(
        errors,
        Glyph,
        GlyphSet,
        misc,
        readGlyph,
        writeGlyph
) {
    "use strict";
    return {
        GlyphSet: GlyphSet,
        GlifLibError: errors.GlifLib,
        readGlyphFromString: readGlyph.fromString,
        readGlyphFromDOM: readGlyph.fromDOM,
        writeGlyphToString: readGlyph.toString,
        writeGlyphToDOM: readGlyph.toDOM,
        glyphNameToFileName: misc.glyphNameToFileName
    }
});
