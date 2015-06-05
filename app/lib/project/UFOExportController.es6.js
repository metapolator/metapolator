define([
    'metapolator/errors'
  , 'metapolator/rendering/glyphBasics'
  , 'metapolator/models/MOM/Glyph'
  , 'metapolator/timer'
], function(
    errors
  , glyphBasics
  , MOMGlyph
  , timer
) {
    "use strict";

    function UFOExportController(master, model, glyphSet, precision) {
        this._master = master;
        this._model = model;
        this._glyphSet = glyphSet;
        this._precision = precision;
    }
    var _p = UFOExportController.prototype;

    _p.exportGenerator = function*(){
        var glyphs = this._master.children
          , glyph
          , drawFunc
          , updatedUFOData
          , i, l, v, ki, kil, k, keys
          , style
          , time, one, total = 0
          ;
        console.warn('exporting ...');
        for(i = 0,l=glyphs.length;i<l;i++) {
            glyph = glyphs[i];
            style = this._model.getComputedStyle(glyph);
            time = timer.now();
            drawFunc = glyphBasics.drawGlyphToPointPen.bind(
                this
              , {
                      penstroke: glyphBasics.renderPenstrokeOutline
                    , contour: glyphBasics.renderContour
                }
              , this._model, glyph);

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
            this._glyphSet.writeGlyph(false, glyph.id, updatedUFOData, drawFunc,
                                      undefined, {precision: this._precision});
            one = timer.now() - time;
            total += one;
            console.warn('exported', glyph.id, 'this took', one,'ms');
            yield glyph.id;
        }
        console.warn('finished ', i, 'glyphs in', total
            , 'ms\n\tthat\'s', total/i, 'per glyph\n\t   and'
            , (1000 * i / total)  ,' glyphs per second.'
        );
        this._glyphSet.writeContents(false);
    };

    _p.run_export_iteration = function() {
        if (this.gen == undefined){
            this.gen = this.exportGenerator();
        }
        return this.gen.next().done;
    };

    return UFOExportController;
});
