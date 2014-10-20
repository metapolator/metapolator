define([
    'metapolator/errors'
  , 'ufojs/errors'
  , 'metapolator/models/MOM/Master'
  , 'metapolator/models/MOM/Glyph'
  , './MOMPointPen'
  , 'ufojs/plistLib/main'
], function(
    errors
  , ufoErrors
  , Master
  , Glyph
  , MOMPointPen
  , plistLib
) {
    "use strict";
    var readPlistFromString = plistLib.readPlistFromString
      , writePlistToString = plistLib.createPlistString
      , IONoEntryError = ufoErrors.IONoEntry;

    function ProjectMaster(io, project, masterName, glyphSetDir, cpsChain) {
        this._io = io;
        this._project = project;
        this._masterName = masterName;
        this._glyphSetDir = glyphSetDir;
        this._cpsChain = cpsChain.slice();

        this._glyphSet = undefined;
        this._fontinfo = undefined;
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
     * Where we can store custom data for the master (a master
     * specific subdir of data/com.metapolator)
     */
    Object.defineProperty(_p, '_customDataDir', {
        get: function() { 
            return this._project.dataDir + '/masters/' + this._masterName + '/';
        }
    });

    /**
     * Path of the fontinfo.plist file for an imported master
     */
    Object.defineProperty(_p, '_fontInfoFilePath', {
        get: function() { 
            return this._customDataDir + '/fontinfo.plist';
        }
    });

    /**
     * The information from the fontinfo.plist if there is any. Setting this property will
     * also save the new data to disk
     */
    Object.defineProperty(_p, 'fontinfo', {
        get: function() { 
            if(this._fontinfo === undefined) {
                this._fontinfo = this.readFontInfoFromFile();
            }
            return this._fontinfo; 
        }
        ,
        set: function(x) {
            if( x === undefined ) {
                throw new AssertionError('Can not set fontinfo.plist to undefined on Master "'+masterName+'"');
            }
            this._fontinfo = x;
        }
    });

    /**
     * Read a fontinfo.plist file for this master if it exists.
     */
    _p.readFontInfoFromFile = function() {
        var path = this._fontInfoFilePath;
        var fontInfoString = this._io.readFile(false, path);
        return plistLib.readPlistFromString(fontInfoString);
    }

    /**
     * Export the current fontinfo to a file at 'path'. If you do not
     * specify the path then save the fontinfo.plist to a default
     * location for this project master.
     */
    _p.writeFontInfoToFile = function( path ) {
        var theFontInfo;
        if( path === undefined ) {
            path = this._fontInfoFilePath;
        }
        try {
            theFontInfo = this.fontinfo;
        } catch(error) {
            if(error instanceof IONoEntryError) {
                throw new KeyError('Can not load fontinfo.plist for Master "'+masterName+'"');
            }
        }
        this._io.writeFile( false, path,
                            writePlistToString(theFontInfo));
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
