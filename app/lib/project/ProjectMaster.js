define([
    'metapolator/errors'
  , 'metapolator/models/MOM/Master'
  , 'metapolator/models/MOM/Glyph'
  , './MOMPointPen'
  , 'yaml'
], function(
    errors
  , Master
  , Glyph
  , MOMPointPen
  , yaml
) {
    "use strict";

    function ProjectMaster(io, project, glyphSetDir, cpsChain) {

        this._io = io;
        this._project = project;
        this._glyphSetDir = glyphSetDir;
        this._cpsChain = cpsChain.slice();

        this._glyphSet = undefined;

        if( io.pathExists( false, this.metaDataFilePath )) {
            this.loadMetaData();
        } else {
            this._data = {
                type: 'ProjectMaster',
                masters: {},
                rememberedFailures: {}
            };
        }
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

    /**
     * For each type of failure, which is just a string like 'import'
     * etc, we can store the most recent failure for each glyph and
     * why that happened. This might be extended to record more than
     * just the latest failure, but knowing that an import failed 5
     * times in a row is likely not as interesting to the user as
     * knowing why it failed the last time it was tried.
     */
    _p.setRememberedFailure = function( type, glyphName, reason ) {
        if( this._data.rememberedFailures[glyphName] === undefined ) {
            this._data.rememberedFailures[glyphName] = {};
        }
        this._data.rememberedFailures[glyphName][ type ] =
            {
                name: glyphName,
                reason: reason,
                incidenttime: new Date(),
            };
    }
    _p.rememberThatImportFailedForGlyph = function( glyphName, reason ) {
        this.setRememberedFailure( 'import', glyphName, reason );
    }

    Object.defineProperty(_p, 'metaDataFilePath', {
        get: function(){ return this._project.dataDir+'/messages/'+this._glyphSetDir+'.yaml';}
    });

    _p.saveMetaData = function() {
        this._io.writeFile( false, this.metaDataFilePath, yaml.safeDump(this._data));
    }
    _p.loadMetaData = function() {
        var dataString = this._io.readFile(false, this.metaDataFilePath );
        this._data = yaml.safeLoad(dataString);
    }

    _p.saveCPS = function(filename, cps) {
        this._io.writeFile(false, this._project.cpsDir+'/'+filename, cps);
    };

    _p.loadCPS = function() {
        var i = 0
          , rules = []
          ;
        for(;i<this._cpsChain.length;i++)
            rules.push(this._project.getCPSRules(this._cpsChain[i]));
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
          , classes
          ;
        if(glyphNames.length)
            classes = this._project.getGlyphClassesReverseLookup();
        for(;i<glyphNames.length;i++) {
            glyphName = glyphNames[i];
            ufoGlyph = this.glyphSet.get(glyphName);
            glyph = new Glyph();
            glyph.id = glyphName;
            if(glyphName in classes)
                classes[glyphName].forEach(glyph.setClass, glyph);
            // fetch glyph data and draw the glyph to the MOM
            ufoGlyph.drawPoints(false, new MOMPointPen(glyph));
            glyph.setUFOData(ufoGlyph);
            master.add(glyph);
        }
        return master;
    };

    return ProjectMaster;
});