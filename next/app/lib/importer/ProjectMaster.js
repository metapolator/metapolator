define([
    'metapolator/errors'
  , 'ufojs/ufoLib/glifLib/GlyphSet'
  , 'metapolator/models/CPS/parsing/parseRules'
  , './parameters.registry'
], function(
    errors
  , GlyphSet
  , parseRules
  , parameterRegistry
) {
    "use strict";

    function ProjectMaster(io, project, glyphSetDir
                                            , cpsLocalFile, cpsChain) {
        
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
    
    _p.saveLocalCPS = function(cps) {
        this._io.writeFile(false, this._project.cpsDir+'/'
                                                +this._cpsLocalFile, cps);
    }
    
    _p.loadAllCPS = function() {
        var i = 0
          , fileName
          , cpsString
          , rules = []
          ;
        for(;i<this._cpsChain.length;i++) {
            fileName = this._project.cpsDir+'/'+this._cpsChain[i];
            cpsString = this._io.readFile(false, fileName);
            rules.push(parseRules.fromString(cpsString, this._cpsChain[i],
                                                parameterRegistry));
        }
        return rules;
    }
    
    return ProjectMaster;
});
