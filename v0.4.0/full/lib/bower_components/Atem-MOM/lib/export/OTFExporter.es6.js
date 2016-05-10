define([
    'Atem-MOM/errors'
  , 'Atem-MOM/rendering/basics'
  , 'Atem-Pen-Case/pens/OpenTypePen'
  , 'Atem-Pen-Case/pens/PointToSegmentPen'
  , 'Atem-Pen-Case/pens/BoundsPen'
  , 'opentype'
  , './MasterGlyphSet'
  , 'Atem-MOM/MOM/Glyph'
  , 'Atem-MOM/timer'
], function(
    errors
  , glyphBasics
  , OpenTypePen
  , PointToSegmentPen
  , BoundsPen
  , opentype
  , MasterGlyphSet
  , MOMGlyph
  , timer
) {
    "use strict";
    //jshint esnext:true
    var NotImplementedError = errors.NotImplemented
      , OTFont = opentype.Font
      , OTGlyph = opentype.Glyph
      , OTPath = opentype.Path
      ;

    // TOOD: add a real asynchronous execution path (obtain.js)
    // (only useful for the case when io is given, it may be easier
    // to remove the io argument fully.)

    /**
     *
     * In an earlier iteration io was a mandatory argument and the
     * single way of output. This is a bit odd here.
     * Obviously this was inspired by UFOExporter, where io as output
     * makes much more sense. Now, io is be optional and the default
     * return value is always be font.toBuffer().
     */
    // be so prominent. We could rather add an interface like
    // "exportToIO(async, io, targetName)"
    function OTFExporter(log, master, fontinfo, io, targetName) {
        this._master = master;
        this._log = log;
        // optional
        this._fontInfo = fontinfo || master.getAttachment('fontinfo', true) || {};
        this._io = io;
        this._targetName = targetName;
    }
    var _p = OTFExporter.prototype;

    _p._makeFont = function(master, otGlyphs) {
        var fontinfo = this._fontInfo;
        return new OTFont({
            familyName: fontinfo.familyName || master.id,
            styleName: fontinfo.styleName || 'Regular',
            unitsPerEm: fontinfo.unitsPerEm || 1000,
            ascender: fontinfo.ascender || 800,
            descender: fontinfo.descender || -200,
            glyphs: otGlyphs
        });
    };

    _p.exportGenerator = function*(glyphNames) {
        var master = this._master
          , glyphs
          , glyph
          , i, l
          , style
          , time, one, total = 0
          , font, result
          , otGlyphs = []
          , drawFunc = function(async, segmentPen) {
                /*jshint validthis:true*/
                // we are going to bind the MOM glyph to `this`
                var pen;
                if(async)
                    throw new NotImplementedError('Asynchronous execution is not implemented');
                pen = new PointToSegmentPen(segmentPen);
                return glyphBasics.drawPoints ( this, pen );
            }
          , glyphSet = new MasterGlyphSet(master, drawFunc)
          ;

        if(!glyphNames)
            glyphs = master.children;
        else {
            glyphs = [];
            for(i=0,l=glyphNames.length;i<l;i++) {
                glyph = master.getById(glyphNames[i]);
                if(!glyph)
                    this._log.warning('requested glyph #'+glyphNames[i]
                                    +' not found in master, skipping.');
                else
                    glyphs.push(glyph);
            }
        }

        this._log.debug('exporting OTF ...');
        for(i=0, l=glyphs.length; i<l; i++) {
            var otPen = new OpenTypePen(new OTPath(), glyphSet)
              , bPen = new BoundsPen(glyphSet)
              , pen = new PointToSegmentPen(otPen)
              , bboxPen = new PointToSegmentPen(bPen)
              ;
            glyph = glyphs[i];
            style = glyph.getComputedStyle();
            time = timer.now();

            glyphBasics.drawPoints ( glyph, pen );
            glyphBasics.drawPoints ( glyph, bboxPen );

            var bbox = bPen.getBounds();
            if (bbox === undefined)
                bbox = [0,0,0,0];

            otGlyphs.push(new OTGlyph({
               name: glyph.id,
               unicode: glyph.getAttachment('unicodes', true) || [],
               xMin: bbox[0],
               yMin: bbox[1],
               xMax: bbox[2],
               yMax: bbox[3],
               advanceWidth: style.get('width', 0),
               path: otPen.getPath()
            }));

            one = timer.now() - time;
            total += one;
            this._log.debug('exported', glyph.id, 'this took', one,'ms');
            yield {'current_glyph':i, 'total_glyphs':l, 'glyph_id':glyph.id};
        }

        this._log.debug('finished ', i, 'glyphs in', total
            , 'ms\n\tthat\'s', total/i, 'per glyph\n\t   and'
            , (1000 * i / total)  ,' glyphs per second.'
        );

        font = this._makeFont(master, otGlyphs);
        result = font.toArrayBuffer();
        if(this._io)
            this._io.writeFile(false, this._targetName || master.id + '.otf', result);
        return result;
    };

    _p.doExport = function(glyphNames) {
        var gen = this.exportGenerator(glyphNames)
         , retVal
         ;
        while(!((retVal = gen.next()).done));
        return retVal.value;
    };

    return OTFExporter;
});
