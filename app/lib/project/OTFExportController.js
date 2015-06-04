define([
    'metapolator/errors'
  , 'metapolator/rendering/glyphBasics'
  , 'metapolator/rendering/OpenTypePen'
  , 'ufojs/tools/pens/PointToSegmentPen'
  , 'opentype'
  , 'metapolator/models/MOM/Glyph'
  , 'metapolator/timer'
], function(
    errors
  , glyphBasics
  , OpenTypePen
  , PointToSegmentPen
  , opentype
  , MOMGlyph
  , timer
) {
    "use strict";

    function OTFExportController(master, model, masterName) {
        this._master = master;
        this._model = model;
        this._masterName = masterName;
    }
    var _p = OTFExportController.prototype;

    _p.do_export = function() {
        var glyphs = this._master.children
          , glyph
          , updatedUFOData
          , i, l, v, ki, kil, k, keys
          , style
          , time, one, total = 0
          , font
          , otf_glyphs = []
          , renderer = {
                  penstroke: glyphBasics.renderPenstrokeOutline
                , contour: glyphBasics.renderContour
            }
          ;

        console.warn('exporting OTF ...');
        for(i = 0,l=glyphs.length;i<l;i++) {
            var otPen = new OpenTypePen()
              , pen = new PointToSegmentPen(otPen)
              ;

            glyph = glyphs[i];
            style = this._model.getComputedStyle(glyph);
            time = timer.now();

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

            glyphBasics.drawGlyphToPointPen ( renderer, this._model, glyph, pen );

            otf_glyphs.push(new opentype.Glyph({
               name: glyph.id,
               unicode: glyph._ufoData.unicodes,
               xMin: 0,
               xMax: updatedUFOData['width'],
               yMin: 0,
               yMax: updatedUFOData['height'],
               advanceWidth: updatedUFOData['width'] || 1000,
               path: otPen.get_glyph_path()
            }));

            one = timer.now() - time;
            total += one;
            console.warn('exported', glyph.id, 'this took', one,'ms');
        }
        font = new opentype.Font({familyName: this._master.displayName || this._master.name || this._masterName, styleName: 'Medium', unitsPerEm: 1000, glyphs: otf_glyphs});

        console.warn('finished ', i, 'glyphs in', total
            , 'ms\n\tthat\'s', total/i, 'per glyph\n\t   and'
            , (1000 * i / total)  ,' glyphs per second.'
        );
        return font;
    };

    return OTFExportController;
});
