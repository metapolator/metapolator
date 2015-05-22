/**
 * This can be distilled down to the non es6 file by running the following
 * from the root of the git repository
 *
 * pushd .; cd ./dev-scripts && ./es6to5 ../app/lib/project/UFOExportController.es6.js; popd
 *
 */
define([
    'metapolator/errors'
  , 'metapolator/math/hobby'
  , 'metapolator/math/Vector'
  , 'metapolator/rendering/glyphBasics'
  , 'metapolator/models/MOM/Glyph'
  , 'metapolator/timer'
], function(
    errors
  , hobby
  , Vector
  , glyphBasics
  , MOMGlyph
  , timer
) {
    "use strict";
    /*jshint esnext:true*/
    var KeyError = errors.Key
      , CPSKeyError = errors.CPSKey
    ;

    function UFOExportController(master, model, glyphSet, precision) {
        this._master = master;
        this._model = model;
        this._glyphSet = glyphSet;
        this._precision = precision;
    }
    var _p = UFOExportController.prototype;

    // FIXME: "export" is a future reserved keyword
    _p.export = function() {
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
            drawFunc = this.drawGlyphToPointPen.bind(
                this
              , {
                      penstroke: UFOExportController.renderPenstrokeOutline
                    , contour: UFOExportController.renderContour
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
                    if(!(error instanceof KeyError)) {
                        throw error;
                    }
                }
            }
            this._glyphSet.writeGlyph(false, glyph.id, updatedUFOData, drawFunc,
                                      undefined, {precision: this._precision});
            one = timer.now() - time;
            total += one;
            console.warn('exported', glyph.id, 'this took', one,'ms');
        }
        console.warn('finished ', i, 'glyphs in', total
            , 'ms\n\tthat\'s', total/i, 'per glyph\n\t   and'
            , (1000 * i / total)  ,' glyphs per second.'
        );
        this._glyphSet.writeContents(false);
    };

    UFOExportController.renderPenstrokeOutline = glyphBasics.renderPenstrokeOutline;
    UFOExportController.renderContour = glyphBasics.renderContour;
    UFOExportController.renderPenstrokeCenterline = glyphBasics.renderPenstrokeCenterline;

    function drawGlyphToPointPenGenerator ( renderer, model, glyph, pen) {
        function* generator() {
            var item, glyphName, transformation, i,l, children = glyph.children;
            for (i=0,l=children.length;i<l;i++) {
                item = children[i];
                if( item.type === 'component' ) {
                    glyphName = item.baseGlyphName;
                    transformation = model.getComputedStyle(item).get( 'transformation' );
                    pen.addComponent( glyphName, transformation );
                }
                else if(renderer.contour && item.type === 'contour' )
                    yield renderer.contour( pen, model, item );
                else if(renderer.penstroke && item.type === 'penstroke')
                    yield renderer.penstroke( pen, model, item );
            }
        }
        return generator();
    }
    UFOExportController.drawGlyphToPointPenGenerator = drawGlyphToPointPenGenerator;

    UFOExportController.drawGlyphToPointPen = function(renderer, model, glyph, pen ) {
        var gen = drawGlyphToPointPenGenerator(renderer, model, glyph, pen);
        while(!(gen.next().done));
    };

    _p.drawGlyphToPointPen = UFOExportController.drawGlyphToPointPen;

    return UFOExportController;
});
