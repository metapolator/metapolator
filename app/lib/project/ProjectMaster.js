define([
    'metapolator/errors'
  , 'metapolator/models/CPS/parsing/parseRules'
  , './parameters/registry'
  , 'metapolator/models/MOM/Master'
  , 'metapolator/models/MOM/Glyph'
  , './MOMPointPen'
], function(
    errors
  , parseRules
  , parameterRegistry
  , Master
  , Glyph
  , MOMPointPen
) {
    "use strict";

    function ProjectMaster(io, project, glyphSetDir
                                            , cpsLocalFile, cpsChain) {
        
        this._io = io;
        this._project = project;
        this._glyphSetDir = glyphSetDir;
        this._cpsLocalFile = cpsLocalFile;
        this._cpsChain = cpsChain.slice();
        
        this._glyphSet = undefined;
    }
    
    var _p = ProjectMaster.prototype;
    _p.constructor = ProjectMaster;
    
    Object.defineProperty(_p, 'glyphSet', {
        get: function() {
            if(!this._glyphSet)
                this._glyphSet = this._project.getNewGlyphSet(
                                            false, this._glyphSetDir);
            return this._glyphSet;
        }
    });
    
    _p.saveLocalCPS = function(cps) {
        this._io.writeFile(false, this._project.cpsDir+'/'
                                                +this._cpsLocalFile, cps);
    };
    
    _p.loadCPS = function() {
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
    };
    
    _p.loadMOM = function() {
        // create a MOM Master use this.glyphSet to create glyphs, penstrokes and points
        var master = new Master()
          , glyphNames = this.glyphSet.keys()
          , glyphName
          , ufoGlyph
          , glyph
          , i=0
          ;
        for(;i<glyphNames.length;i++) {
            glyphName = glyphNames[i];
            ufoGlyph = this.glyphSet.get(glyphName);
            glyph = new Glyph();
            glyph.id = glyphName;
            // fetch glyph data and draw the glyph to the mom
            ufoGlyph.drawPoints(false, new MOMPointPen(glyph));
            glyph.setUFOData(ufoGlyph);
            master.add(glyph);
        }
        return master;
    };
    
    return ProjectMaster;
});
