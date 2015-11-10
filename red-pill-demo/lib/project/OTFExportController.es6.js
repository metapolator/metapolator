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

    var NotImplementedError = errors.NotImplemented;

    var GlyphSet = (function(errors) {
        var KeyError = errors.Key;
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
        };

        return GlyphSet;
    })(errors);

    function OTFExportController(io, master, targetName, precision) {
        this._io = io;
        this._master = master;
        this._targetName = targetName;
        this._precision = precision;
    }
    var _p = OTFExportController.prototype;

    _p.exportGenerator = function*(){
        var master = this._master
          , glyphs = master.children
          , glyph
          , updatedUFOData
          , i, l, v, ki, kil, k, keys
          , style
          , time, one, total = 0
          , font
          , otf_glyphs = []
          , drawFunc = function(async, segmentPen) {
                /*jshint validthis:true*/
                // we are going to bind the MOM glyph to `this`
                var pen;
                if(async)
                    throw new NotImplementedError('Asynchronous execution is not implemented');
                pen = new PointToSegmentPen(segmentPen);
                return glyphBasics.drawPoints ( this, pen );
            }
          , glyphSet = new GlyphSet(master, drawFunc)
          ;

        console.warn('exporting OTF ...');
        for(i=0, l=glyphs.length; i<l; i++) {
            var otPen = new OpenTypePen(glyphSet)
              , bPen = new BoundsPen(glyphSet)
              , pen = new PointToSegmentPen(otPen)
              , bboxPen = new PointToSegmentPen(bPen)
              ;
            glyph = glyphs[i];
            style = glyph.getComputedStyle();
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

            glyphBasics.drawPoints ( glyph, pen );
            glyphBasics.drawPoints ( glyph, bboxPen );

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
            yield {'current_glyph':i, 'total_glyphs':l, 'glyph_id':glyph.id};
        }
        font = new opentype.Font({
            familyName: master.fontinfo.familyName || master.id,
            styleName: master.fontinfo.styleName,
            unitsPerEm: master.fontinfo.unitsPerEm || 1000,
            glyphs: otf_glyphs
        });

        console.warn('finished ', i, 'glyphs in', total
            , 'ms\n\tthat\'s', total/i, 'per glyph\n\t   and'
            , (1000 * i / total)  ,' glyphs per second.'
        );
        this._io.writeFile(false, this._targetName, font.toBuffer());
    };

    _p.doExport = function() {
        var gen = this.exportGenerator();
        while(!(gen.next().done));
    };

    return OTFExportController;
});
