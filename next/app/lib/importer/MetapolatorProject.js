define([
    'metapolator/errors'
  , 'obtain/obtain'
  , 'ufojs/plistLib/main'
  , 'ufojs/plistLib/IntObject'
  , './ProjectMaster'
], function(
    errors
  , obtain
  , plistLib
  , IntObject
  , ProjectMaster
) {
    "use strict";

        // FIXME: ufoJS io must be able to do directory operations
    var fs = require.nodeRequire('fs')
        // FIXME: make this availabe for browsers, too
      , yaml = require.nodeRequire('js-yaml')
      , metainfo = {
            creator: 'org.ufojs.lib'
            // otherwise this ends as 'real' in the plist, I don't know
            // how strict robofab is on this, but unifiedfontobkect.org
            // says this is an int
          , formatVersion: new IntObject(3)
        }
      , ProjectError = errors.Project
      , KeyError = errors.Key
      ;
    
    function MetapolatorProject(io, dirName) {
        this._io = io;
        this._data = {
            masters: {}
        };
        this._masterCache = {}
        // here is a way to define a directory offset
        // this is used with _p.init after the dir was created for example
        this.dirName = dirName || '.';
    }
    
    MetapolatorProject.init = function(io, name) {
        var project = new MetapolatorProject(io)
          , dirName = name+'.ufo'
          ;
          
        // create dirName
        if(io.pathExists(false, dirName))
            throw new ProjectError('Dir exists already: '+ dirName);
        project.init(dirName);
    }
    
    var _p = MetapolatorProject.prototype;
    _p.constructor = MetapolatorProject;
    
    Object.defineProperty(_p, 'dataDir', {
        get: function(){ return this.dirName + '/data/com.metaploator'}
    });
    
    Object.defineProperty(_p, 'projectFile', {
        get: function(){ return this.dataDir + '/project.yaml' }
    });
    
    Object.defineProperty(_p, 'cpsDir', {
        get: function(){ return this.dataDir + '/cps' }
    });
    
    Object.defineProperty(_p, 'cpsDefaultFile', {
        get: function(){ return this.cpsDir + '/default.cps'; }
    });
    
    Object.defineProperty(_p, 'cpsGlobalFile', {
        get: function(){ return 'global.cps'; }
    });
    
    Object.defineProperty(_p, 'layercontentsFile', {
        get: function(){ return this.dirName+'/layercontents.plist'; }
    });
    
    
    
    _p.init = function(dirName) {
        // everything synchronously right now
        this.dirName = dirName;

        this._mkdir(false, this.dirName);
        
        // create dirName/metainfo.plist
        this._io.writeFile(false, this.dirName+'/metainfo.plist'
                                , plistLib.createPlistString(metainfo));
        
        // create dir dirName/data
        this._mkdir(false, this.dirName+'/data');
        // create dir dirName/data/com.metaploator
        this._mkdir(false, this.dataDir);
        
        // project file:
        // create     this.dataDir/project.yaml => yaml({})
        this._io.writeFile(false, this.projectFile, yaml.safeDump(this._data))
        
        // create dir this.dataDir/cps
        this._mkdir(false, this.cpsDir);;
        
        // create layercontents.plist
        this._io.writeFile(false, this.layercontentsFile,
                                        plistLib.createPlistString([]));
                            
        // the glyphs dir must be there, so the ufo is valid. but we don't
        // use it currently :-(
        // create dir dirName/glyphs
        this._createGlyphLayer('public.default',  this.dirName+'/glyphs');
        
        // create a default.cps
        // this is the standard wiring of cps compounds etc.
        // we need a  place where it is defined/generated
        // probably we don't have to save it on disk, because we can
        // generate it internally and because we don't want it to be changed
        // to override these parameters, the global.cps file is in place.
        this._io.writeFile(false, this.cpsDefaultFile, this.getDefaultCPS());
        
        // this can be empty, all masters will use this by default
        this._io.writeFile(false, [this.cpsDir, '/', this.cpsGlobalFile].join(''),
                            '/* all masters use this CPS file by default*/');
    }
    
    _p._mkdir = obtain.factory(
        { mkdir: ['dirname', fs.mkdirSync.bind(fs)]}
      , { mkdir: ['dirname', '_callback', fs.mkdir.bind(fs)]}
      , ['dirname']
      , function(obtain){ return obtain('mkdir'); }
    )
    
    _p.load = function() {
        // the files created in _p.init need to exist
        // however, we try to load only
        // this.dirName+'/data/com.metapolator/project.yaml' as an indicator
        var dataString = this._io.readFile(false, this.projectFile);
        this._data = yaml.safeLoad(dataString);
        
        console.log('loaded', dataString);
    }
    
    /**
     * return a ParameterCollection with the default CPS wireing, as the
     * importer expects it.
     */
    _p._getDefaultCPS: function() {
        throw new errors.notImplemented('getDefaultCPS is not implemented')
    }
    
    _p.hasMaster: function(masterName) {
        return masterName in this._data.masters;
    }
    
    _p._createGlyphLayer = function(name, layerDirName) {
        if(layerDirName === undefined)
            layerDirName = 'glyphs.' + name;
        
        var layerDir = [this.dirName,'/',layerDirName].join('');
        
        // read layercontents.plist
        var layercontents = plistLib.readPlistFromString(
                this._io.readFile(false, this.layerContentsFile));
        
        // see if there is a layer with this name
        for(var i=0;i<layercontents.length;i++)
            if(layercontents[i][0] === name)
                throw new ProjectError('A glyph layer with name "'+name
                                                +'" altready exists.')
        
        // see if there is a directory with the name layerDir already
        if(this._io.pathExists(false, layerDir))
            throw new ProjectError('Can\'t create glyph layer. A directory '
                                    +'with name "' + layerDir
                                    +'" altready exists.');
        // create new layer dir
        this._mkdir(false, layerDir);
        
        // store layer in layercontents
        layercontents.push([name, layerDirName]);
        this._io.writeFile(false, this.layercontentsFile,
                                    plistLib.createPlistString(layercontents));
        
        // create empty layerDir/contents.plist
        this._io.writeFile(false, layerDir + '/contents.plist',
                                        plistLib.createPlistString({}));
        
        
        
    }
    
    /**
     * Returns the path needed to instanciate a GlyphSet
     */
    _p._getLayerDir = function(name) {
        // read layercontents.plist
        var layercontents = plistLib.readPlistFromString(
                this._io.readFile(false, this.layerContentsFile))
          , layerdir
          ;
        
        for(var i=0;i<layercontents.length;i++)
            if(layercontents[i][0] === name) {
                layerdir = [this.dirName,'/',layercontents[i][1]].join('');
                break;
            }
        if(!layerdir)
            throw new KeyError('Layer named "' + name + '" not found.')
        if(!this._io.pathExists(false, layerDir))
            throw new KeyError('Layer directory "' + layerDir
                                + '" does not exist, but is linked in '
                                +'layercontents.plist.')
        return layerdir;
    }
    
    /**
     * create a master entry for this masterName
     * {
     *      cpsLocalFile: masterName.cps
     *    , cpsChain: [global.cps, masterName.cps]
     * }
     * 
     * and an entry in layercontents.plist:
     * skeleton.masterName, glyphs.skeleton.masterName
     * 
     */
    _p.createMaster: function(masterName) {
        // get the name for this master from the cli
        if(this.hasMaster(masterName))
            throw new ProjectError('Master "'+masterName+'" alredy exists.');
        var master = {};
        this._data.masters[masterName] = master;
        master.cpsLocalFile = masterName + '.cps';
        master.cpsChain = [/*default.cps,*/ this.cpsGlobalFile, master.cpsLocalFile];
        
        // create a skeleton layer for this master
        master.skeleton = 'skeleton.' + masterName;
        this._createGlyphLayer(master.skeleton);
        
        return this.getMaster(masterName);
    }
    _p._getMaster(masterName) {
        var master =  this._data.masters[masterName]
          , glyphSetDir = this._getLayerDirForMaster(master.skeleton)
          ;
        return new ProjectMaster(this._io, this, glyphSetDir
                                , master.cpsLocalFile, master.cpsChain);
    }
    
    _p.getMaster: function(masterName) {
        if(!this.hasMaster(masterName))
            throw new KeyError('Master "'+masterName+'" not in Projekt');
        if(!this._masterCache[masterName]) {
            this._masterCache[masterName] = thsi._getMaster(masterName);
        }
        return this._masterCache[masterName];
    }
    
    return MetapolatorProject;
});
