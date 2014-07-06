define([
    'metapolator/errors'
  , 'ufojs/ufoLib/glifLib/GlyphSet'
  , 'metapolator/models/Controller'
  , './parameterRegistry'
  , './readOutlines/SegmentPen'
  , './readOutlines/ImportOutlinePen'
  
], function(
    errors
  , GlyphSet
  , ModelController
  , parameterRegistry
  , SegmentPen
  , ImportOutlinePen
) {
    "use strict";
    
    function ImportController(io, project, masterName, sourceUFODir) {
        this._io = io;
        this._project = project;
        
        if(this._project.hasMaster(masterName))
            this._master = this._project.getMaster(masterName);
        else
            this._master = this._project.createMaster(masterName);
        
        // open the source ufo glyphs layer as UFOv2
        this._sourceGlyphSet = GlyphSet.factory(
            false, io,
            [sourceUFODir, 'glyphs'].join('/'),
            undefined, 2
        )
    }
    var _p = ImportController.prototype;
    
    _p.import = function(glyphs) {
        var missing, i=0;
        
        if(!glyphs)
            glyphs = this._sourceGlyphSet.keys();
        else {
            missing = glyphs.filter(function(name) {
                        return !this._sourceGlyphSet.has_key(name);}, this)
            if(missing.length)
                throw new errors.Key('Some for import requested glyphs '
                                    +'are missing in the source GlyphSet: '
                                    +missing.join(', '));
        }
        console.log('importing: ...');
        for(;i<glyphs.length;i++)
            this.importGlyph(glyphs[i]);
        
        
    }
    
    _p._readGlyphFromSource = function(glyphName) {
        var glyph = this._sourceGlyphSet.get(glyphName)
          , segmentPen = new SegmentPen()
          , pen = new ImportOutlinePen(segmentPen, true)
          ;
        
        glyph.drawPoints(false, pen);
        return {data:glyph, contours:segmentPen.flush()};
    }
    
    _p.importGlyph = function(glyphName) {
        console.log('> import glyph:', glyphName);
        var glyph = this._readGlyphFromSource(glyphName);
    }
    
    return ImportController;
});
