define([
    'metapolator/errors'
  , 'ufojs/ufoLib/glifLib/GlyphSet'
  
], function(
    errors
  , GlyphSet
) {
    "use strict";

    function ProjectMaster(io, project, glyphSetDir, cpsLocalFile, cpsChain) {
        this._io = io;
        this._project = project;
        this._glyphSetDir = glyphSetDir;
        this._cpsLocalFile = cpsLocalFile;
        this._cpsChain = cpsChain.slice();
        
        this._glyphSet;
    }
    
    var _p = ProjectMaster.prototype;
    _p.constructor = ProjectMaster;
    
    Object.defineProperty(_p, 'glyphSet', {
        get: function() {
            if(!this._glyphSet)
                this._glyphSet = GlyphSet.factory(
                                    false, this._io, this._glyphSetDir)
            return this._glyphSet;
        }
    })
    
    return ProjectMaster;
});
