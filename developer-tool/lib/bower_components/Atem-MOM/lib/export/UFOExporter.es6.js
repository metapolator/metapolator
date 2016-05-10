define([
    'Atem-MOM/rendering/basics'
  , 'Atem-MOM/MOM/Glyph'
  , 'Atem-MOM/timer'
], function(
    glyphBasics
  , MOMGlyph
  , timer
) {
    "use strict";
    // jshint esnext:true

    // TOOD: add a real asynchronous execution path (obtain.js)

    function UFOExporter(log, ufoWriter, master, layerName, defaultLayer, precision) {
        this._log = log;
        this._ufoWriter = ufoWriter;
        this._master = master;
        this._layerName = layerName;
        this._defaultLayer = defaultLayer;
        this._precision = precision;
        // TODO: OTFExporter also supports a fontinfo constructor argument.
        this._fontInfo = master.getAttachment('fontinfo', true) || null;
    }
    var _p = UFOExporter.prototype;

    _p._getGLIFData = function(glyph) {
        var glifData = Object.create(null)
          , style = glyph.getComputedStyle()
          , keys = ['unicodes', 'note', 'lib', 'image', 'guidelines']
          , i, l, k
          ;
        glifData.width = style.get('width', 0);
        glifData.height = style.get('height', 0);
        // Allow the glyph ufo data to be updated by the CPS.

        for(i=0,l=keys.length;i<l;i++) {
            k = keys[i];
            glifData[k] = style.get(k, glyph.getAttachment(k, true));
        }
        return glifData;
    };

    // TODO: generate groups.plist from glyph classes
    _p.exportGenerator = function*(glyphNames) {
        var master = this._master
          , glyphs
          , glyphSet
          , glyph
          , drawFunc
          , glifData
          , i, l
          , time, one, total = 0
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
        this._log.debug('setting up UFO directory structure...');

        glyphSet = this._ufoWriter.getGlyphSet(false, this._layerName, this._defaultLayer);


        this._log.debug('exporting glyphs...');
        for(i = 0,l=glyphs.length;i<l;i++) {
            glyph = glyphs[i];
            time = timer.now();
            drawFunc = glyphBasics.drawPoints.bind( this, glyph );
            glifData = this._getGLIFData(glyph);

            glyphSet.writeGlyph(false, glyph.id, glifData, drawFunc,
                                      undefined, {precision: this._precision});
            one = timer.now() - time;
            total += one;
            this._log.debug('exported', glyph.id, 'this took', one,'ms');
            yield {'current_glyph':i, 'total_glyphs':l, 'glyph_id':glyph.id};
        }
        this._log.debug('finished ', i, 'glyphs in', total
            , 'ms\n\tthat\'s', total/i, 'per glyph\n\t   and'
            , (1000 * i / total)  ,' glyphs per second.'
        );
        glyphSet.writeContents(false);
        this._ufoWriter.writeLayerContents(false);

        if(this._fontInfo)
            this._ufoWriter.writeInfo(false, this._fontInfo);
    };

    _p.doExport = function(glyphNames) {
        var gen = this.exportGenerator(glyphNames);
        while(!(gen.next().done));
    };

    return UFOExporter;
});
