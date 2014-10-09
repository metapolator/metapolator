define([
    'metapolator/errors'
  , 'metapolator/models/MOM/Master'
  , 'metapolator/models/MOM/Glyph'
  , './MOMPointPen'
  , 'ufojs/plistLib/main'
], function(
    errors
  , Master
  , Glyph
  , MOMPointPen
  , plistLib
) {
    "use strict";
    var readPlistFromString = plistLib.readPlistFromString
    , writePlistToString = plistLib.createPlistString;

    function ProjectMaster(io, project, glyphSetDir, cpsChain) {

        this._io = io;
        this._project = project;
        this._glyphSetDir = glyphSetDir;
        this._cpsChain = cpsChain.slice();

        this._glyphSet = undefined;
	    this._fontinfo = {};
        if( io.pathExists( false, this._fontInfoFilePath )) {
            this._fontinfo = plistLib.readPlistFromString(
                io.readFile(false, this._fontInfoFilePath));
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
     * Path of the fontinfo.plist file for an imported master
     */
    Object.defineProperty(_p, '_fontInfoFilePath', {
        get: function() { return this._project.baseDir+'/'+this._glyphSetDir+'/fontinfo.plist';}
    });

    /**
     * The information from the fontinfo.plist if there is any. Setting this property will
     * also save the new data to disk
     */
    Object.defineProperty(_p, 'fontinfo', {
        get: function() { return this._fontinfo; }
        ,
        set: function(x) {
            this._fontinfo = x;
            this.writeFontInfoToFile( this._fontInfoFilePath );
        }
    });

    /**
     * Export the current fontinfo to a file at 'path'.
     */
    _p.writeFontInfoToFile = function( path ) {
        console.log("writeFontInfoToFile() path:" + path );
        console.log("writeFontInfoToFile() fi:" + this._fontinfo );
        this._io.writeFile( false, path,
                            writePlistToString(this._fontinfo));
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
