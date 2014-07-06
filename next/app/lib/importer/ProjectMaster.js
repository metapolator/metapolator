define([
    'metapolator/errors'
  , 'obtain/obtain'
  , 'ufojs/plistLib/main'
  , 'ufojs/plistLib/IntObject'
], function(
    errors
  , obtain
  , plistLib
  , IntObject
) {
    "use strict";

    function ProjectMaster(io, project, glyphSetDir, cpsLocalFile, cpsChain) {
        this._io = io;
        this._project = project;
        this._glyphSetDir = glyphSetDir;
        this._cpsLocalFile = cpsLocalFile;
        this._cpsChain = cpsChain.slice();
    }
    
    var _p = ProjectMaster.prototype;
    _p.constructor = ProjectMaster;
    
    return ProjectMaster;
});
