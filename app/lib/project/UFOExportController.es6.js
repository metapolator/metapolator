define([
    'metapolator/errors'
  , 'metapolator/rendering/glyphBasics'
  , 'metapolator/models/MOM/Glyph'
  , 'metapolator/timer'
  , 'ufojs/ufoLib/glifLib/GlyphSet'
  , 'ufojs/plistLib/main'
  , 'ufojs/plistLib/IntObject'
], function(
    errors
  , glyphBasics
  , MOMGlyph
  , timer
  , GlyphSet
  , plistLib
  , IntObject
) {
    "use strict";

    // FIXME: make this available for browsers too
    // Specify formatVersion as an int, as required by
    // unifiedfontobject.org, otherwise it becomes a 'real' in the plist.
    var metainfoV3 = {
            creator: 'org.ufojs.lib'
          , formatVersion: new IntObject(3)
        }
      , metainfoV2 = {
            creator: 'org.ufojs.lib'
          , formatVersion: new IntObject(2)
        }
      , // fontforge requires a fontinfo.plist that defines unitsPerEm
        minimalFontinfo = {
            unitsPerEm: new IntObject(1000)
          , ascender: new IntObject(800)
          , descender: new IntObject(-200)
        }

    function UFOExportController(io, project, masterName, dirName, precision) {
        this._io = io;
        this._project = project;
        this._masterName = masterName;
        this._dirName = dirName;
        this._precision = precision;
    }
    var _p = UFOExportController.prototype;

    _p.exportGenerator = function*(){
        var model = this._project.open(this._masterName)
          , master = model.query('master#' + this._masterName)
          , glyphs = master.children
          , glyphSet
          , glyph
          , drawFunc
          , updatedUFOData
          , i, l, v, ki, kil, k, keys
          , style
          , time, one, total = 0
          ;

        console.warn('setting up UFO directory structure...');

        // create a bare ufoV2 directory
        this._io.mkDir(false, this._dirName);

        // create dirName/metainfo.plist
        this._io.writeFile(false, this._dirName+'/metainfo.plist'
                                , plistLib.createPlistString(metainfoV2));

        // fontforge requires a fontinfo.plist that defines unitsPerEm
        this._io.writeFile(false, this._dirName+'/fontinfo.plist'
                                , plistLib.createPlistString(minimalFontinfo));

        this._io.mkDir(false, this._dirName+'/glyphs');
        this._io.writeFile(false, this._dirName+'/glyphs/contents.plist', plistLib.createPlistString({}));

        glyphSet = GlyphSet.factory(false, this._io, this._dirName+'/glyphs', undefined, 2);

        console.warn('exporting glyphs...');
        for(i = 0,l=glyphs.length;i<l;i++) {
            glyph = glyphs[i];
            style = model.getComputedStyle(glyph);
            time = timer.now();
            drawFunc = glyphBasics.drawGlyphToPointPen.bind(
                this
              , {
                      penstroke: glyphBasics.renderPenstrokeOutline
                    , contour: glyphBasics.renderContour
                }
              , model, glyph);

            // Allow the glyph ufo data to be updated by the CPS.
            updatedUFOData = glyph.getUFOData();
            keys = Object.keys(updatedUFOData);
            for(ki=0,kil=keys.length;ki<kil;ki++) {
                try {
                    k = keys[ki];
                    v = style.get(MOMGlyph.convertUFOtoCPSKey(k));
                    updatedUFOData[k] = v;
                }
                catch( error ) {
                    if(!(error instanceof errors.Key)) {
                        throw error;
                    }
                }
            }
            glyphSet.writeGlyph(false, glyph.id, updatedUFOData, drawFunc,
                                      undefined, {precision: this._precision});
            one = timer.now() - time;
            total += one;
            console.warn('exported', glyph.id, 'this took', one,'ms');
            yield {'current_glyph':i, 'total_glyphs':l, 'glyph_id':glyph.id};
        }
        console.warn('finished ', i, 'glyphs in', total
            , 'ms\n\tthat\'s', total/i, 'per glyph\n\t   and'
            , (1000 * i / total)  ,' glyphs per second.'
        );
        glyphSet.writeContents(false);
    };

    _p.doExport = function() {
        var gen = this.exportGenerator();
        while(!(gen.next().done));
    };

    return UFOExportController;
});
