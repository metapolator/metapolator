define([
    'metapolator/errors'
  , 'ufojs/ufoLib/glifLib/GlyphSet'
  , 'metapolator/models/Controller'
  , './parameterRegistry'
], function(
    errors
  , GlyphSet
  , ModelController
  , parameterRegistry
  
) {
    "use strict";
    
    function ImportController(io, project, sourceUFODir) {
        this._io = io;
        this._project = project;
        // open the source ufo glyphs layer as UFOv2
        this._sourceGlyphSet = GlyphSet.factory(
            false, io,
            [sourceUFODir, 'glyphs'].join('/'),
            undefined, 2
        )
    }
    var _p = ImportController.prototype;
    
    _p.import = function(masterName, glyphs) {
        console.log('importing', glyphs === undefined
            ? 'all glyphs'
            : 'the glyphs: ' + glyphs.join(', ')
            , '...'
        );
        
        var master;
        if(this._project.hasMaster(masterName));
            master = this._project.getMaster(masterName)
        else
            master = this._project.createMaster(masterName)
    }
    
    _p._readGlyphFromSource = function(glyphName) {
        var glyph = this._sourceGlyphSet.get(glyphName)
          , segmentPen = new SegmentPen()
          , pen = new ImportOutlinePen(segmentPen, true)
          ;
        
        glyph.drawPoints(false, pen);
        contours = segmentPen.flush();
        return {data:glyph, contours:contours};
    }
    
    _p.importGlyph = function(glyphName) {
        var glyph = this._readGlyphFromSource(glyphName);
        
        
    }
    
    
    return ImportController;
});
