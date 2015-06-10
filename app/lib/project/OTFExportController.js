define([
    'metapolator/errors'
  , 'metapolator/rendering/glyphBasics'
  , 'metapolator/rendering/OpenTypePen'
  , 'ufojs/tools/pens/PointToSegmentPen'
  , 'ufojs/tools/pens/BoundsPen'
  , 'opentype'
  , 'metapolator/models/MOM/Glyph'
  , 'metapolator/timer'
], function(
    errors
  , glyphBasics
  , OpenTypePen
  , PointToSegmentPen
  , BoundsPen
  , opentype
  , MOMGlyph
  , timer
) {
    "use strict";

    var GlyphSet = (function(errors) {
        var KeyError = errors.Key
          , NotImplementedError = errors.NotImplemented
          ;
        /** a ducktyped GlyphSet for BasePen **/
        function GlyphSet(master, drawFunc) {
            this._master = master;
            this._drawFunc = drawFunc;
        }
        var _p = GlyphSet.prototype;
        _p.constructor = GlyphSet;

        _p.get = function(name) {
            var glyph = this._master.findGlyph(name)
              , result
              ;
            if(glyph === null)
                throw new KeyError('Glyph "'+name+'" not found');
            // the result is also a ducktyped "glyph" which needs a draw method in BasePen
            result = Object.create(null);
            result.draw = this._drawFunc.bind(glyph);
        }

        return GlyphSet;
    })(errors);

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
        // We need to get the name  model into the closure, because `this` will be used otherwise
        // NOTE: I believe we could get rid of the model argument by refactoring glyphBasics a bit
        // Would be a big deal as well ;-)
          , model = this._model
          , drawFunc = function(async, segmentPen) {
                /*jshint validthis:true*/
                // we are going to bind the MOM glyph to `this`
                var pen;
                if(async)
                    throw new NotImplementedError('Asynchronous execution is not implemented');
                pen = new PointToSegmentPen(segmentPen);
                return glyphBasics.drawGlyphToPointPen ( renderer, model, this, pen );
            }
          , glyphSet = new GlyphSet(this._master, drawFunc)
          ;

        console.warn('exporting OTF ...');
        for(i=0, l=glyphs.length; i<l; i++) {
            var otPen = new OpenTypePen(glyphSet)
              , bPen = new BoundsPen(glyphSet)
              , pen = new PointToSegmentPen(otPen)
              , bboxPen = new PointToSegmentPen(bPen)
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
            glyphBasics.drawGlyphToPointPen ( renderer, this._model, glyph, bboxPen );

            var bbox = bPen.getBounds();
            if (bbox == undefined)
                bbox = [0,0,0,0];

            otf_glyphs.push(new opentype.Glyph({
               name: glyph.id,
               unicode: glyph._ufoData.unicodes,
               xMin: bbox[0],
               yMin: bbox[1],
               xMax: bbox[2],
               yMax: bbox[3],
               advanceWidth: updatedUFOData['width'] || 0,
               path: otPen.getPath()
            }));

            one = timer.now() - time;
            total += one;
            console.warn('exported', glyph.id, 'this took', one,'ms');
        }
        font = new opentype.Font({
            familyName: this._master.fontinfo.familyName
                     || this._masterName || this._master.id,
            styleName: this._master.fontinfo.styleName,
            unitsPerEm: this._master.fontinfo.unitsPerEm || 1000,
            glyphs: otf_glyphs
        });

        console.warn('finished ', i, 'glyphs in', total
            , 'ms\n\tthat\'s', total/i, 'per glyph\n\t   and'
            , (1000 * i / total)  ,' glyphs per second.'
        );
        return font;
    };

    return OTFExportController;
});
