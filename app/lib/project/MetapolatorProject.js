define([
    'metapolator/errors'
  , 'util-logging/util-logging'
  , 'logging/callbackhandler'
  , 'logging/yamlformatter'
  , 'logging/logger-patch'
  , 'ufojs/errors'
  , 'obtain/obtain'
  , 'ufojs/plistLib/main'
  , 'ufojs/plistLib/IntObject'
  , './ProjectMaster'
  , './parameters/registry'
  , './parameters/outputConverter'
  , 'metapolator/models/MOM/Univers'
  , 'metapolator/models/Controller'
  , 'ufojs/ufoLib/glifLib/GlyphSet'
  , './ImportController'
  , './ExportController'
  , 'yaml'
  , 'metapolator/models/CPS/parsing/parseRules'
], function(
    errors
  , log
  , CallbackHandler
  , YAMLFormatter
  , LoggerRelog
  , ufoErrors
  , obtain
  , plistLib
  , IntObject
  , ProjectMaster
  , parameterRegistry
  , defaultParameters
  , Univers
  , ModelController
  , GlyphSet
  , ImportController
  , ExportController
  , yaml
  , parseRules
) {
    "use strict";

        // FIXME: make this available for browsers too
    var metainfoV3 = {
            creator: 'org.ufojs.lib'
            // otherwise this ends as 'real' in the plist, I don't know
            // how strict robofab is on this, but unifiedfontobject.org
            // says this is an int
          , formatVersion: new IntObject(3)
        }
      , metainfoV2 = {
            creator: 'org.ufojs.lib'
            // otherwise this ends as 'real' in the plist, I don't know
            // how strict robofab is on this, but unifiedfontobject.org
            // says this is an int
          , formatVersion: new IntObject(2)
        }
      , // fontforge requires a fontinfo.plist that defines unitsPerEm
        minimalFontinfo = {unitsPerEm: new IntObject(1000)}
      , ProjectError = errors.Project
      , KeyError = errors.Key
      , IONoEntryError = ufoErrors.IONoEntry
      ;
    
    function MetapolatorProject(io, baseDir) {
        this._io = io;
        this._data = {
            masters: {}
        };
        this._cache = {
            masters: {}
          , rules: {}
          , glyphClasses:{}
        };
        
        this._controller = new ModelController(parameterRegistry);
        this.baseDir = baseDir || '.';
        this._log = new log.Logger().setLevel(log.Level.INFO);
        this._log.addHandler(new log.Handler());
    }
    
    var _p = MetapolatorProject.prototype;
    _p.constructor = MetapolatorProject;
    Object.defineProperty(_p, 'dataDir', {
        get: function(){ return this.baseDir + '/data/com.metapolator';}
    });
    
    Object.defineProperty(_p, 'projectFile', {
        get: function(){ return this.dataDir + '/project.yaml';}
    });
    
    Object.defineProperty(_p, 'cpsDir', {
        get: function(){ return this.dataDir + '/cps';}
    });
    
    Object.defineProperty(_p, 'cpsOutputConverterFile', {
        get: function(){ return 'centreline-skeleton-to-symmetric-outline.cps'; }
    });
    
    Object.defineProperty(_p, 'cpsGlobalFile', {
        get: function(){ return 'global.cps'; }
    });
    
    Object.defineProperty(_p, 'layerContentsFile', {
        get: function(){ return this.baseDir+'/layercontents.plist'; }
    });
    
    Object.defineProperty(_p, 'groupsFileName', {
        value: 'groups.plist'
    });

    Object.defineProperty(_p, 'groupsFile', {
        get: function(){ return this.baseDir+'/' + this.groupsFileName; }
    });
    
    Object.defineProperty(_p, 'logFile', {
        get: function(){ return this.dataDir + '/log.yaml';}
    });

    _p.getNewGlyphSet = function(async, baseDir, glyphNameFunc, UFOVersion) {
        return GlyphSet.factory(
                    async, this._io, baseDir, glyphNameFunc, UFOVersion);
    }
    
    _p.init = function() {
        // FIXME: all I/O is synchronous for now

        this._io.mkDir(false, this.baseDir);
        
        // create baseDir/metainfo.plist
        this._io.writeFile(false, this.baseDir+'/metainfo.plist'
                                , plistLib.createPlistString(metainfoV3));
        
        // create dir baseDir/data
        this._io.mkDir(false, this.baseDir+'/data');
        // create dir baseDir/data/com.metapolator
        this._io.mkDir(false, this.dataDir);
        
        // project file:
        // create this.dataDir/project.yaml => yaml({})
        this._io.writeFile(false, this.projectFile, yaml.safeDump(this._data));
        
        // create dir this.dataDir/cps
        this._io.mkDir(false, this.cpsDir);
        
        // create layercontents.plist
        this._io.writeFile(false, this.layerContentsFile,
                                        plistLib.createPlistString([]));
        
        // the glyphs dir must be there to make the UFO valid, but we don't
        // use it currently :-(
        // create dir baseDir/glyphs
        this._createGlyphLayer('public.default', 'glyphs');
        
        // create default CPS output stage
        // this is the standard wiring of cps compounds etc.
        // we include it, so it can be studied and if needed changed 
        this._io.writeFile(false, [this.cpsDir, '/', this.cpsOutputConverterFile].join(''),
                                        this.getDefaultCPS().toString());
        
        // this can be empty, all masters will use this by default
        this._io.writeFile(false, [this.cpsDir, '/', this.cpsGlobalFile].join(''),
                            '/* all masters use this CPS file by default*/');
    }
    
    _p.load = function() {
        // the files created in _p.init need to exist
        // however, we try to load only
        // this.baseDir+'/data/com.metapolator/project.yaml' as an indicator
        this._log.debug('loading ' + this.projectFile);
        var dataString = this._io.readFile(false, this.projectFile)
          , fh
          ;
        this._log.debug('loaded ' + dataString);
        this._data = yaml.safeLoad(dataString);

        // Add ConsoleHandler for debugging (also replays existing entries)
        this._log.addHandler(new log.ConsoleHandler());
        
        // Reload any saved log entries before adding CallbackHandler for new entries
        var logText, logRecords;
        try {
            logText = this._io.readFile(false, this.logFile);
        }
        catch (error) { // Ignore file not found
            if(!(error instanceof IONoEntryError))
                throw error;
            logText = ""; // Work around upstream bug https://github.com/nodeca/js-yaml/issues/149
        }
        try {
            logRecords = yaml.safeLoad(logText);
        }
        catch(e) { // Translate YAML errors
            throw new ProjectError('Invalid log file ' + e);
        }
        if(logRecords) {
            logRecords.forEach(function (obj) {
                this._log.relog(log.LogRecord.prototype.fromObject(obj));
            }, this);
        }

        // Add CallbackHandler to log to add new entries to the log file
        fh = new CallbackHandler(this._io.appendFile.bind(this._io, true, this._file));
        fh.setFormatter(new YAMLFormatter());
        this._log.addHandler(fh);
    }
    
    /**
     * return a ParameterCollection with the default CPS wiring, as the
     * importer expects it.
     */
    _p.getDefaultCPS = function() {
        return defaultParameters;
    }
    
    _p.hasMaster = function(masterName) {
        return masterName in this._data.masters;
    }
    
    Object.defineProperty(_p, 'masters', {
        get: function(){ return Object.keys(this._data.masters); } 
    });
    
    Object.defineProperty(_p, 'controller', {
        get: function(){ return this._controller; }
    });
    
    _p._createGlyphLayer = function(name, layerDirName) {
        if(layerDirName === undefined)
            layerDirName = 'glyphs.' + name;
        
        var layerDir = [this.baseDir,'/',layerDirName].join('');
        
        // read layercontents.plist
        var layercontents = plistLib.readPlistFromString(
                this._io.readFile(false, this.layerContentsFile));
        
        // see if there is a layer with this name
        for(var i=0;i<layercontents.length;i++)
            if(layercontents[i][0] === name)
                throw new ProjectError('A glyph layer with name "'+name
                                                +'" already exists.');
        
        // create new layer dir
        this._io.mkDir(false, layerDir);
        
        // store layer in layercontents
        layercontents.push([name, layerDirName]);
        this._io.writeFile(false, this.layerContentsFile,
                                    plistLib.createPlistString(layercontents));
        
        // create empty layerDir/contents.plist
        this._io.writeFile(false, layerDir + '/contents.plist',
                                        plistLib.createPlistString({}));
    }

    /**
     * Delete a glyph layer.
     *
     * FIXME: Currently, only works properly if no glyphs are defined:
     * simply removes the plist and then tries to delete the directory.
     * Also removes the glyph layer from layercontents.plist.
     *
     */
    _p._deleteGlyphLayer = function(name) {
        var layerDir = this._getLayerDir(name)
          , layerIndex;

        // Read layercontents.plist
        var layercontents = plistLib.readPlistFromString(
                this._io.readFile(false, this.layerContentsFile));

        // Find the layer with this name
        layerIndex = null;
        for(var i=0;i<layercontents.length;i++) {
            if(layercontents[i][0] === name) {
                layerIndex = i;
                break;
            }
        }
        if (layerIndex === null)
            throw new ProjectError('No such glyph layer "'+name+'".');
        layercontents.splice(layerIndex, 1);

        // Update layercontents
        this._io.writeFile(false, this.layerContentsFile,
                           plistLib.createPlistString(layercontents));

        // Remove layer dir and its contents
        this._io.rmDirRecursive(false, layerDir);
    }
    
    /**
     * Returns the path needed to instantiate a GlyphSet
     */
    _p._getLayerDir = function(name) {
        // read layercontents.plist
        var layercontents = plistLib.readPlistFromString(
                this._io.readFile(false, this.layerContentsFile))
          , layerDir
          ;
        
        for(var i=0;i<layercontents.length;i++)
            if(layercontents[i][0] === name) {
                layerDir = [this.baseDir,'/',layercontents[i][1]].join('');
                break;
            }
        if(!layerDir)
            throw new KeyError('Layer named "' + name + '" not found.');
        if(!this._io.pathExists(false, layerDir + '/'))
            throw new KeyError('Layer directory "' + layerDir
                                + '" does not exist, but is mentioned in '
                                +'layercontents.plist.');
        return layerDir;
    }
    
    /**
     * Create a master entry for this masterName, with the given cpsChain
     * and skeleton.
     *
     * Also creates an entry in layercontents.plist: `skeleton`,
     * glyphs.`skeleton`
     *
     * If any element does not exist, it is assumed the caller will create
     * it before attempting to use the font.
     * 
     */
    _p.createMaster = function(masterName, cpsChain, skeleton) {
        // get the name for this master from the CLI
        if(this.hasMaster(masterName))
            throw new ProjectError('Master "'+masterName+'" already exists.');
        var master = {};
        this._data.masters[masterName] = master;
        master.cpsChain = cpsChain;
        
        // create a skeleton layer for this master
        master.skeleton = skeleton;
        if (skeleton === 'skeleton.' + masterName)
            this._createGlyphLayer(master.skeleton);

        this._io.writeFile(false, this.projectFile, yaml.safeDump(this._data));
        
        return this.getMaster(masterName);
    }

    /**
     * delete a master entry for this masterName
     *
     * and remove entry in layercontents.plist:
     * skeleton.masterName, glyphs.skeleton.masterName
     *
     */
    _p.deleteMaster = function(masterName) {
        // get the name for this master from the cli
        if(!this.hasMaster(masterName))
            throw new ProjectError('No such Master "'+masterName+'".');
        var master = this._data.masters[masterName];

        // Remove CPS file
        this.getMaster(masterName).deleteCPS(masterName + '.cps');

        // Remove skeleton layer for this master
        if (master.skeleton === 'skeleton.' + masterName)
            this._deleteGlyphLayer(master.skeleton);

        // Remove project entry
        delete this._data.masters[masterName];

        // Update project file
        this._io.writeFile(false, this.projectFile, yaml.safeDump(this._data));

        // FIXME: Check we successfully deleted it
        return true;
    }

    _p._getMaster = function(masterName) {
        var master =  this._data.masters[masterName]
          , glyphSetDir = this._getLayerDir(master.skeleton)
          ;
        return new ProjectMaster(this._io, this, glyphSetDir, master.cpsChain);
    }
    
    _p.getMaster = function(masterName) {
        if(!this.hasMaster(masterName))
            throw new KeyError('Master "'+masterName+'" not in project');
        if(!this._cache.masters[masterName]) {
            this._cache.masters[masterName] = this._getMaster(masterName);
        }
        return this._cache.masters[masterName];
    }
    
    
    _p._getCPSRules = function getCPSRule(sourceName) {
        var fileName = [this.cpsDir, sourceName].join('/')
          , cpsString = this._io.readFile(false, fileName)
          ;
        return parseRules.fromString(cpsString, sourceName, parameterRegistry);
    }
    
    _p.getCPSRules = function(sourceName) {
        if(!this._cache.rules[sourceName])
            this._cache.rules[sourceName] = this._getCPSRules(sourceName);
        return this._cache.rules[sourceName];
    }
    
    /**
     * parse the doc content
     * if it parses, replace the old cps rule with the new cps rule
     * inform all *consumers* of these rules that there was an update
     * this might involve pruning some caches of ModelControllers.
     * 
     * If this doesn't parse, a CPSParserError is thrown
     */
    _p.updateCPSRule = function(sourceName, cpsString) {
        var source = parseRules.fromString(cpsString, sourceName, parameterRegistry);
        // if we are still here parsing was a success
        this._cache.rules[sourceName] = source;
        this._controller.replaceSource(source);
    }
    
    _p.open = function(masterName) {
        if(!this._controller.hasMaster(master)) {
            // this._log.warning('open', masterName)
            var master = this.getMaster(masterName)
            , parameterCollections = master.loadCPS()
            , momMaster = master.loadMOM()
            ;
            momMaster.id = masterName;
            this._controller.addMaster(momMaster, parameterCollections);
        }
        return this._controller;
    }
    
    _p.getMasterSources = function(master) {
        if(!this._controller.hasMaster(master))
            this.open(master);
        return this._controller.getMasterSources(master);
    }
    
    _p.import = function(masterName, sourceUFODir, glyphs) {
        var importer = new ImportController(
                                        this, masterName, sourceUFODir);
        importer.import(glyphs);
    
        this._importGroupsFile(sourceUFODir, true);
    };

    /**
     * If there is no groups.plist in the project but the import
     * has one, we do the import.
     * If there is a groups.plist in the project and overide is true
     * we overide by doing the import.
     * Otherwise, we skip importing the file.
     *
     * This rule may get changed in the future, but having the first
     * possible groupd file also imported into the project is better
     * than not having it to happen.
     * Also, ufoJS can't validate this file at the moment
     * however, we can try to parse it with plistlib and see if it works.
     */
    _p._importGroupsFile = function(sourceUFODir, override) {
        var filename = this.groupsFileName
          , sourceFile = [sourceUFODir, filename].join('/')
          , targetFile = this.groupsFile
          , targetExists
          , content
          ;

        targetExists = this._io.pathExists(false, targetFile);
        if(targetExists && !override) {
            this._log.warning(filename + ' exists in the project, skipping import.');
            return;
        }

        if(!this._io.pathExists(false, sourceFile)) {
            this._log.warning('No ' + filename + ' found for import.');
            return;
        }

        this._log.warning('Importing '+filename+' into the project.');
        if(targetExists)
            this._log.warning('The existing '+filename+' will be overridden.');

        content = this._io.readFile(false, sourceFile);
        try {
            // Just a rough look if we can parse it, we are not interested
            // in the result of parsing at the moment.
            // TODO: validation (this is a task for ufoJS)
            plistLib.readPlistFromString(content);
        }
        catch(error) {
            this._log.warning('Import of '+filename+' failed when trying to '
                                    +'parse it as a plist:\n'+ error);
        }
        this._io.writeFile(false, targetFile, content);
        this._log.warning('Import of '+filename+' OK.\n');
    };
    
    _p.exportInstance = function(masterName, instanceName, precision) {
        // returns a models/Controller
        var model = this.open(masterName)
          , master = model.query('master#' + masterName)
          , dirName = instanceName
          , glyphSet
          , exportController
          ;
        
        // create a bare ufoV2 directory
        this._io.mkDir(false, dirName);
        
        // create dirName/metainfo.plist
        this._io.writeFile(false, dirName+'/metainfo.plist'
                                , plistLib.createPlistString(metainfoV2));
        
        // fontforge requires a fontinfo.plist that defines unitsPerEm
        this._io.writeFile(false, dirName+'/fontinfo.plist'
                                , plistLib.createPlistString(minimalFontinfo));
        
        this._io.mkDir(false, dirName+'/glyphs');
        this._io.writeFile(false, dirName+'/glyphs/contents.plist', plistLib.createPlistString({}));
        
        glyphSet = this.getNewGlyphSet(
                                false, dirName +'/glyphs', undefined, 2);
        
        exportController = new ExportController(master, model, glyphSet, precision);
        exportController.export();
    }
    
    _p._getGlyphClassesReverseLookup = function() {
        var result = {}
          , data
          , groups
          , group, i, glyphName
          ;
        try {
            data = this._io.readFile(false,  this.groupsFile);
        }
        catch(error) {
            if(error instanceof IONoEntryError) {
                // this is legal, we simply have no groups file
                this._log.warning('No groups.plist file found, thus no glyph classes are defined.');
                return result;
            }
            throw error;
        }
        groups = plistLib.readPlistFromString(data);

        for(group in groups) {
            for(i=0;i<groups[group].length;i++) {
                glyphName = groups[group][i];
                if(!(glyphName in result))
                    result[glyphName] = [];
                result[glyphName].push(group);
            }
        }
        return result;
    };

    _p.getGlyphClassesReverseLookup = function() {
        if(!this._cache.glyphClasses.reverseLookup)
            this._cache.glyphClasses.reverseLookup = this._getGlyphClassesReverseLookup();

        return this._cache.glyphClasses.reverseLookup;
    };
    
    return MetapolatorProject;
});
