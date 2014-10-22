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

    function ProjectMaster(io, project, name, glyphSetDir, cpsChain) {

        this._io = io;
        this._project = project;
        this._name = name;
        this._glyphSetDir = glyphSetDir;
        this._cpsChain = cpsChain.slice();

        this._glyphSet = undefined;

        this._showRememberedErrorsToConsole = true;
        this._data = undefined;
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
    Object.defineProperty(_p, 'data', {
        get: function() {
            if(this._data === undefined) {
                if( io.pathExists( false, this.metaDataFilePath )) {
                    this.loadMetaData();
                } else {
                    this._data = {
                        type: 'ProjectMaster',
                        masters: {},
                        rememberedFailures: {}
                    };
                }
                return this._data;
            }
        }
    });

    /**
     * For each type of failure, which is just a string like 'import'
     * etc, we can store many failures for each glyph and why that
     * happened. If you are starting an operation again, like an
     * import, or hinting etc, then you might like to call
     * clearAllRememberedFailuresOfType to clear away past errors so
     * that only the errors from the current operation are recorded.
     */
    _p.appendRememberedFailure = function( type, glyphName, reason ) {
        if( this.data.rememberedFailures[glyphName] === undefined ) {
            this.data.rememberedFailures[glyphName] = {};
        }
        if( this.data.rememberedFailures[glyphName][ type ] === undefined ) {
            this.data.rememberedFailures[glyphName][ type ] = [];
        }
        this.data.rememberedFailures[glyphName][ type ].push(
            {
                name: glyphName,
                reason: reason,
                incidenttime: new Date(),
            });

        if( this._showRememberedErrorsToConsole ) {
            console.log("appendRememberedFailure() type:" + type 
                        + " glyphName:" + glyphName + " reason:" + reason );
        }
    }
    /**
     * If there can only be one interesting failure for the 'type'
     * then this method will ensure that only the last reported error
     * for the glyph is recorded.
     */
    _p.setRememberedFailure = function( type, glyphName, reason ) {
        this.clearRememberedFailure( type, glyphName );
        this.appendRememberedFailure( type, glyphName, reason );
    }

    /**
     * clear the remembered failures for the specified type.
     */
    _p.clearRememberedFailure = function( type, glyphName ) {
        if( this.data.rememberedFailures[glyphName] === undefined ) {
            this.data.rememberedFailures[glyphName] = {};
        }
        this.data.rememberedFailures[glyphName][ type ] = [];
    }
    /**
     * Clear any errors of 'type' for all glyphs
     */
    _p.clearAllRememberedFailuresOfType = function( type ) {
        var glyphName;
        for(glyphName in this.data.rememberedFailures) {
            this.clearRememberedFailure( type, glyphName );
        }
    }
    /**
     * Remember that an import failed for the given reason on the glyph.
     */
    _p.rememberThatImportFailedForGlyph = function( glyphName, reason ) {
        this.appendRememberedFailure( 'import', glyphName, reason );
    }

    Object.defineProperty(_p, 'metaDataFilePath', {
        get: function(){ return this._project.dataDir+'/messages/'+this._name+'.yaml';}
    });

    _p.saveMetaData = function() {
        this._io.writeFile( false, this.metaDataFilePath, yaml.safeDump(this.data));
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

    _p.deleteCPS = function(filename) {
        this._io.unlink(false, this._project.cpsDir+'/'+filename);
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
