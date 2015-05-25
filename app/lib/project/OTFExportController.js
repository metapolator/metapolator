define([
    'metapolator/errors'
  , 'opentype'
  , 'metapolator/models/MOM/Glyph'
  , 'metapolator/timer'
], function(
    errors
  , opentype
  , MOMGlyph
  , timer
) {
    "use strict";

    function OTFExportController(master, model) {
        this._master = master;
        this._model = model;
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
          ;
        console.warn('exporting ...');
        for(i = 0,l=glyphs.length;i<l;i++) {
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

            var aPath = new opentype.Path();
            //TODO: here we must iterate over the glyph outline data structures
            //in order to render to render it's path using the pen API:
            aPath.moveTo(100, 0);
            aPath.lineTo(100, 700);

            otf_glyphs.push(new opentype.Glyph({
                name: updatedUFOData.id,
                unicode: 65,
                advanceWidth: updatedUFOData['width'] || 1024,
                path: aPath
            }); 

         one = timer.now() - time;
            total += one;
            console.warn('exported', glyph.id, 'this took', one,'ms');
        }
        font = new opentype.Font({familyName: master.displayName, styleName: 'Medium', unitsPerEm: 1000, glyphs: otf_glyphs});

        console.warn('finished ', i, 'glyphs in', total
            , 'ms\n\tthat\'s', total/i, 'per glyph\n\t   and'
            , (1000 * i / total)  ,' glyphs per second.'
        );
        return font;
    };

    return OTFExportController;
});
