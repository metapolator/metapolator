/**
 * Copyright (c) 2012,2014 Lasse Fister lasse@graphicore.de, http://graphicore.de
 * 
 * You should have received a copy of the MIT License along with this program.
 * If not, see http://www.opensource.org/licenses/mit-license.php
 * 
 * This is a port of glifLib.Glyph defined in robofab/branches/ufo3k/Lib/ufoLib/gliflib.py
 * 
 * Modifications where done in order to use DOM Methods with the glifs.
 * Because there is no native Sax-Parser in the Browser. Thus we really
 * parse the glifs completely, not just partly on some operations as the
 * Python implementation does.
 * 
 * added a method:
 *     getGLIFDocumnet
 * 
 * The file reading/writing methods use the io module to abstract file writing.
 * TODO: use dependency injection to setup I/O on an per GlyphSet-instance 
 * base.
 * 
 * I implemented all otherwise blocking methods using obtainJS to provide
 * a switch beteween synchronous/asynchronous execution. See obtainJS for
 * details.
 * 
 */ 
 
 
 /**
  * GlyphSet manages a set of .glif files inside one directory.
  * 
  * GlyphSet's constructor takes a path to an existing directory as it's
  * first argument. Reading glyph data can either be done through the
  * readGlyph() method, or by using GlyphSet's dictionary interface, where
  * the keys are glyph names and the values are (very) simple glyph objects.
  * 
  * Use Glyphset.factory to create a ready to use instance! Or, invoke
  * glyphSet.rebuildContents after using the constructor directly. This
  * is a restriction to enable an asynchronous API.
  * 
  * To write a glyph to the glyph set, you use the writeGlyph() method.
  * The simple glyph objects returned through the dict interface do not
  * support writing, they are just a convenient way to get at the glyph data.
  */
define(
    [
        'ufojs',
      , 'ufojs/errors'
      , 'ufojs/tools/io/main'
      , 'ufojs/obtainJS/lib/obtain'
      , 'ufojs/xml/main'
      , 'ufojs/plistLib/main'
      , './constants'
      , './misc'
      , './Glyph'
      , './readGlyph'
      , './writeGlyph'
      , './rapidValueFetching'
        
    ],
    function(
        main
      , errors
      , io
      , obtain
      , xml
      , plistLib
      , constants
      , misc
      , Glyph
      , readGlyph
      , writeGlyph
      , rapidValueFetching
) {
    "use strict";
    var enhance = main.enhance,
        GlifLibError = errors.GlifLib,
        KeyError = errors.Key,
        IONoEntryError = errors.IONoEntry,
        glyphNameToFileName = misc.glyphNameToFileName,
        layerInfoVersion3ValueData = misc.layerInfoVersion3ValueData,
        validateLayerInfoVersion3Data = misc.validateLayerInfoVersion3Data,
        readPlistFromFile = plistLib.readPlistFromFile;
        writePlistToString = plistLib.createPlistString,
        fetchUnicodes = rapidValueFetching.fetchUnicodes,
        fetchImageFileName = rapidValueFetching.fetchImageFileName,
        fetchComponentBases = rapidValueFetching.fetchComponentBases;
    
    // ---------
    // Glyph Set
    // ---------
    
    /**
     * 'dirName' should be a path to an existing directory.
     * The optional 'glyphNameToFileNameFunc' argument must be a callback
     * function that takes two arguments: a glyph name and the GlyphSet
     * instance. It should return a file name (including the .glif
     * extension). The glyphNameToFileName function is called whenever
     * a file name is created for a given glyph name.
     */
    function GlyphSet(
        dirName,
        glyphNameToFileNameFunc /* undefined */,
        ufoFormatVersion /* 3 */
    ) {
        this.dirName = dirName;
        
        ufoFormatVersion = (ufoFormatVersion !== undefined)
                ? ufoFormatVersion
                : 3;
        if(!(ufoFormatVersion in constants.supportedUFOFormatVersions))
            throw new GlifLibError("Unsupported UFO format version: "
                                    + ufoFormatVersion);
        this.ufoFormatVersion = ufoFormatVersion;
        this.glyphNameToFileName = (glyphNameToFileNameFunc !== undefined)
                ? glyphNameToFileNameFunc
                : glyphNameToFileName;
        this._reverseContents = undefined;
        this._glifCache = {};
        
        
        // because of the async/sync switch we run this externally
        // use GlyphSet.factory for a one call solution
        // this.rebuildContents();
    }
    
    GlyphSet.factory = obtain.factory(
        {
            instance: ['dirName', 'glyphNameToFileNameFunc', 'ufoFormatVersion',
                function(d, g, u) { return new GlyphSet(d, g, u); }]
          , init: ['instance', function(instance) {
                                    instance.rebuildContents(false);}]
        }
      , {
            init: ['instance', function(instance) {
                                    // returns a promise
                                    return instance.rebuildContents(true);}]
      , }
      , ['dirName', 'glyphNameToFileNameFunc', 'ufoFormatVersion']
      , function(obtain) {
            obtain('init');
            return obtain('instance');
        }
    )
    
    
    enhance(GlyphSet, {
        glyphClass: Glyph
        /**
         * Rebuild the contents dict by loading contents.plist.
         */
         
      , rebuildContents: obtain.factory(
            {
                contentsPath: [function() {
                    return [this.dirName, 'contents.plist'].join('/');
                }]
              , contentsPlist: ['contentsPath', function(contentsPath) {
                    try {
                        return this._readPlist(false, contentsPath);
                    }
                    catch(error) {
                        if(error instanceof IONoEntryError)
                            // missing, consider the glyphset empty.
                            return {};
                        throw error;
                    }
                }]
              , filePaths: ['contentsPlist', function(contents) {
                    if( plistLib.getType(contents) !== 'dict' )
                        throw new GlifLibError('contents.plist is not properly '
                            + 'formatted');
                    var name
                      , fileName
                      , paths = []
                      ;
                    
                    for(name in contents) {
                        fileName = contents[name];
                        // name is always string
                        if(typeof fileName !== 'string')
                            throw new GlifLibError('contents.plist is not '
                                + 'properly formatted the value at "' + name
                                + '" is not string but:'+ typeof fileName);
                        paths.push([this.dirName, fileName].join('/'));
                    }
                    return paths;
                }]
              , validContents: ['contentsPlist', 'filePaths',
                function(contentsPlist, filePaths) {
                    var i=0;
                    for(;i<filePaths.length; i++)
                        if(!io.pathExistsSync(filePaths[i]))
                            throw new GlifLibError('contents.plist references a '
                            + 'file that does not exist: ' + filePaths[i]);
                    return contentsPlist;
                }]
            }
          , {
                contentsPlist: ['contentsPath', '_callback', '_errback',
                function(contentsPath, callback, errback) {
                    this._readPlist(true, contentsPath)
                        .then(callback, function(error) {
                            if(error instanceof IONoEntryError)
                                // missing, consider the glyphset empty.
                                callback({});
                            else
                                errback(error);
                        })
                    
                }] 
              , validContents: ['contentsPlist', 'filePaths', '_callback',
                                '_errback',
                function(contentsPlist, filePaths, callback, errback) {
                    var i = 0
                        // we'll use this to determine if the test passed
                      , requested = 0
                      , failed = false // ioCallback will change this
                      , ioCallback = function(path, exists) {
                            requested -= 1;
                            // if it failed once we won't have to use the
                            // callbacks anymore, although it may be an option 
                            // to write this to the logs in the future
                            if(failed)
                                return;
                            if(!exists) {
                                failed = true;
                                errback(new GlifLibError('contents.plist '
                                    + 'references a file that does not exist: '
                                    + path))
                                return;
                            }
                            if(requested === 0)
                                // all requested files where found
                                callback(contentsPlist);
                        }
                    ;
                    // if there was no filePath
                    if(filePaths.length === 0) {
                        setTimeout(function(){callback(contentsPlist)}, 0)
                        return;
                    }
                    // we just fire all now. the idea is that the io module
                    // will have to throttle stuff like this in the future
                    // (and should provide an api to cancel the already fired
                    // requests, when possible)
                    for(;i<filePaths.length; i++) {
                        requested += 1;
                        io.pathExists(path, ioCallback.bind(null, filePaths[i]))
                    }
                }]
            }
          , []
          , function(obtain) {
                this.contents = obtain('validContents');
                this._reverseContents = undefined;
            }
        )
        /**
         * Return a reversed dict of self.contents, mapping file names to
         * glyph names. This is primarily an aid for custom glyph name to file
         * name schemes that want to make sure they don't generate duplicate
         * file names. The file names are converted to lowercase so we can
         * reliably check for duplicates that only differ in case, which is
         * important for case-insensitive file systems.
         */
      , getReverseContents: function() {
            if(this._reverseContents === undefined){
                var d = {}, k;
                for(k in this.contents)
                    d[this.contents[k].toLowerCase()] = k;
                this._reverseContents = d;
            }
            return this._reverseContents;
        }
        /**
         * Write the contents.plist file out to disk. Call this method when
         * you're done writing glyphs.
         */
      , writeContents: obtain.factory(
            {
                path: [function(){return [this.dirName, 'contents.plist'].join('/')}]
              , data: [function(){return writePlistToString(this.contents)}]
              , write: ['path', 'data', io.writeFileSync]
            }
          , {
                write: ['path', 'data', '_callback', io.writeFile]
            }
          , []
          , function(obtain) { return obtain('write'); }
        )
        
        /**
         * layer info
         * read the layerinfo.plist and set its values to the info object
         * info object is the only argument of this method
         * 
         * This method uses synchronous IO
         */
      , readLayerInfo: obtain.factory(
            {
                path: [function() {
                    return [this.dirName, constants.LAYERINFO_FILENAME].join('/');
                }]
              , infoDict: ['path', function(path) {
                    var exists = true
                      , result
                      ;
                    try {
                        result = this._readPlist(false, path);
                    }
                    catch(error){
                        if(error instanceof IONoEntryError)
                            return [false, undefined];
                        throw error;
                    }
                    return [true, result];
                }]
                
            }
          , {
                infoDict: ['path', '_callback', '_errback',
                function(path, callback, errback) {
                    this._readPlist(true, path)
                    .then(
                        function(result){callback([true, result])}
                      , function(error) {
                            if(error instanceof IONoEntryError)
                                callback([false, undefined]);
                            else
                                errback(error);
                        }
                    )
                }]
              
            }
          , ['info']
          , function(obtain, info) {
                var infoDict = obtain('infoDict');
                if(infoDict[0] === false)
                    return;
                if(typeof infoDict[1] !== 'object')
                    throw new GlifLibError('layerinfo.plist is not properly formatted.');
                infoDict = validateLayerInfoVersion3Data(infoDict[1]);
                for (attr in infoDict)
                    info[attr] = infoDict[attr];
                // I can't imagine the equivalent exception in javaScript
                // and we do not have a setattribute function
                // maybe the caller should check the attributes of info
                // value = infoDict[attr];
                // try:
                //     setattr(info, attr, value)
                // except AttributeError:
                //     raise GlifLibError("The supplied layer info object does not support setting a necessary attribute (%s)." % attr)
                return info;
            }
        )
        /**
         * write the contents of the info argument to a string and return it
         */
      , writeLayerInfoToString: function(info) {
            if(this.ufoFormatVersion < 3)
                throw new GlifLibError('layerinfo.plist is not allowed in UFO '
                    + this.ufoFormatVersion + '.');
            // gather data
            var infoData = {}, attr;
            for (attr in layerInfoVersion3ValueData){
                if(!(attr in info) || info[attr] === undefined)
                    continue;
                infoData[attr] = info[attr];
            }
            
            // validate
            infoData = validateLayerInfoVersion3Data(infoData);
            return writePlistToString(infoData);
        }
        /**
         * write the contents of the info argument to LAYERINFO_FILENAME
         * writing to files is not implemented yet
         */
      , writeLayerInfo: obtain.factory(
            {
                data: ['info', this.writeLayerInfoToString]
              , path: [function()
                {
                    return [this.dirName, constants.LAYERINFO_FILENAME]
                            .join('/');
                }]
              , write: ['path', 'data', io.writeFileSync]
            }
          , {
                write: ['path', 'data', '_callback', io.writeFile]
            }
          , ['info']
          , function(obtain, info) { return obtain('write'); }
        )
        
        /**
         * Read the glif from I/O and cache it. Return a reference to the
         * cache object: [text, mtime, glifDocument(if alredy build by this.getGLIFDocument)]
         * 
         * Has the obtainJS sync/async api.
         * 
         * Does something with mtimes to check if the cache needs invalidation.
         * I'm not shure whether its a good idea to implement this with all
         * the calls to mtime, but its done.
         */
      , _getGLIFcache: obtain.factory(
            { //sync
                fileName: ['glyphName', function fileName(glyphName) {
                    var name = this.contents[glyphName];
                    if(!(glyphName in this.contents) || this.contents[glyphName] === undefined)
                        throw new KeyError(glyphName);
                    return this.contents[glyphName]
                }]
              , glyphNameInCache: ['glyphName', function(glyphName) {
                    return glyphName in this._glifCache;
                }]
              , path: ['fileName', function(fileName) {
                    return [this.dirName, fileName].join('/');
                }]
              , mtime: ['path', 'glyphName', function(path, glyphName) {
                    try {
                        return io.getMtimeSync(path);
                    }
                    catch(error) {
                        if(error instanceof IONoEntryError)
                            error = new KeyError(glyphName, error.stack);
                        throw error;
                    }
                }]
              , text: ['path', 'glyphName', function(path, glyphName) {
                    try {
                        return io.readFileSync(path);
                    }
                    catch(error) {
                        if(error instanceof IONoEntryError)
                            error = new KeyError(glyphName, error.stack);
                        throw error;
                    }
                }]
              , refreshedCache: ['text', 'mtime', function(text, mtime) {
                    return (this._glifCache[glyphName] = [text, mtime]);
                }]
            }
            //async getters
          , {
                mtime: ['path', 'glyphName', '_callback',
                function(path, glyphName, callback) {
                    var _callback = function(error, result){
                        if(error instanceof IONoEntryError)
                            error = new Keyerror(glyphName, error.stack);
                        callback(error, result)
                    }
                    io.getMtime(path, _callback);
                }]
              , text: ['path', 'glyphName', '_callback',
                function(path, glyphName, callback){
                    var _callback = function(error, result) {
                        if(error instanceof IONoEntryError)
                            error = new Keyerror(glyphName, error.stack);
                        callback(error, result)
                    }
                    io.readFile(path, _callback);
                }
              ]
            }
            , ['glyphName']
            , function job(obtain, glyphName) {
                if(obtain('glyphNameInCache')) {
                    if(obtain('mtime') === this._glifCache[glyphName][1]) {
                        // cache is fresh
                        return this._glifCache[glyphName];
                    }
                }
                // still here? need read!
                // refreshing the cache:
                obtain('refreshedCache')
                return this._glifCache[glyphName];
            }
        )
        
        /**
         * This uses synchronous and asynchronous IO
         * 
         * The python docstring reads:
         * Get the raw GLIF text for a given glyph name. This only works
         * for GLIF files that are already on disk.
         *
         * This method is useful in situations when the raw XML needs to be
         * read from a glyph set for a particular glyph before fully parsing
         * it into an object structure via the readGlyph method.
         *
         * Internally, this method will load a GLIF the first time it is
         * called and then cache it. The next time this method is called
         * the GLIF will be pulled from the cache if the file's modification
         * time has not changed since the GLIF was cached. For memory
         * efficiency, the cached GLIF will be purged by various other methods
         * such as readGlyph.
         */
      , getGLIF: obtain.factory(
            {cache:[false, 'glyphName', this._getGLIFcache]}
          , {cache:[false, 'glyphName', this._getGLIFcache]}
          , ['glyphName']
          , function(obtain) {
                return obtain('cache')[0]
            }
         )
       , getGLIFDocument: obtain.factory(
            {cache: [false, 'glyphName', this._getGLIFcache]}
          , {cache: [true, 'glyphName', this._getGLIFcache]}
          , ['glyphName']
          , function(glyphName) {
                var cache = obtain('cache')
                  , parser
                  , glifDoc
                  ;
                if(cache[2] === undefined)
                    cache[2] = xml.parseXMLString(cache[0]);
                return cache[2];
            }
        )
        /**
         * used for convinience with the getUnicodes etc. methods
         */
        , _getGLIFDocuments: obtain.factory(
            {
                glyphNames: ['requested', function(requested) {
                    if(requested !== undefined)
                        return setLike(requested);
                    return  this.contents;
                }]
              , docs: ['glyphNames', function(glyphNames) {
                    var name
                      , docs = {}
                      ;
                    for(name in glyphNames)
                        docs[name] = this.getGLIFDocument(false, name);
                    return docs;
                }]
            }
          , {
                docs: ['glyphNames', function(glyphNames) {
                    var name
                      , docs = {}
                      , failed = false
                      , requested = 0
                      , ioCallback = function(boundName, error, result) {
                            requested -= 1;
                            // if it failed once we won't have to use the
                            // callbacks anymore, although it may be an
                            // option to write this to the logs in the future
                            if(failed)
                                return;
                            if(error) {
                                failed = true;
                                errback(error)
                                return;
                            }
                            docs[boundName] = result;
                            if(requested === 0)
                                // all requested files where found
                                callback(docs);
                        }
                      ;
                    // we just fire all now. the idea is that the io module
                    // will have to throttle stuff like this in the future
                    // (and should provide an api to cancel the already fired
                    // requests, when possible)
                    for(name in glyphNames) {
                        requested += 1;
                        this.getGLIFDocument(
                            {unified:ioCallback.bind(null, name)}, name);
                    }
                    // if there was no glyphName
                    if(requested === 0)
                        setTimeout(function(){callback(docs)}, 0);
                }]
            }
          , ['requested']
          , function(obtain, requested){return obtain('docs');}
        )
        /**
         * Get the modification time (as reported by os.path.getmtime)
         * of the GLIF with glyphName.
         */
      , getGLIFModificationTime: obtain.factory(
            {cache: [false, 'glyphName', this._getGLIFcache]}
          , {cache: [true, 'glyphName', this._getGLIFcache]}
          , ['glyphName']
          , function(obtain, glyphName) {
                return obtain('cache')[1]
        })
      , _purgeCachedGLIF: function(glyphName) {
            if(glyphName in this._glifCache)
                delete this._glifCache[glyphName];
        }
        // reading/writing API
        /**
         * Read a .glif file for 'glyphName' from the glyph set. The
         * 'glyphObject' argument can be any kind of object (even None);
         * the readGlyph() method will attempt to set the following
         * attributes on it:
         *     "width"      the advance with of the glyph
         *     "height"     the advance height of the glyph
         *     "unicodes"   a list of unicode values for this glyph
         *     "note"       a string
         *     "lib"        a dictionary containing custom data
         *     "image"      a dictionary containing image data
         *     "guidelines" a list of guideline data dictionaries
         *
         * All attributes are optional, in two ways:
         *     1) An attribute *won't* be set if the .glif file doesn't
         *     contain data for it. 'glyphObject' will have to deal
         *     with default values itself.
         *     2) If setting the attribute fails with an AttributeError
         *     (for example if the 'glyphObject' attribute is read-
         *     only), readGlyph() will not propagate that exception,
         *     but ignore that attribute.
         *
         * To retrieve outline information, you need to pass an object
         * conforming to the PointPen protocol as the 'pointPen' argument.
         * This argument may be None if you don't need the outline data.
         *
         * readGlyph() will raise KeyError if the glyph is not present in
         * the glyph set.
         */
      , readGlyph: obtain.factory(
            {glifDoc:[false, glyphName, this.getGLIFDocument]}
          , {glifDoc:[true, glyphName, this.getGLIFDocument]}
          , ['glyphName', 'glyphObject', 'pointPen']
          , function(obtain, glyphName, glyphObject/* undefined */,
                     pointPen/* undefined */)
            {
                var glifDoc, formatVersions;
                glifDoc = obtain('glifDoc');
                this._purgeCachedGLIF(glyphName);
                formatVersions = this.ufoFormatVersion < 3
                        ? formatVersions = [1]
                        : formatVersions = [1, 2];
                readGlyph.fromDOM(glifDoc, glyphObject, pointPen, formatVersions)
                return glyphObject;
            }
        )
        /**
         * Write a .glif file for 'glyphName' to the glyph set. The
         * 'glyphObject' argument can be any kind of object (even None);
         * the writeGlyph() method will attempt to get the following
         * attributes from it:
         *     "width"      the advance with of the glyph
         *     "height"     the advance height of the glyph
         *     "unicodes"   a list of unicode values for this glyph
         *     "note"       a string
         *     "lib"        a dictionary containing custom data
         *     "image"      a dictionary containing image data
         *     "guidelines" a list of guideline data dictionaries
         *
         * All attributes are optional: if 'glyphObject' doesn't
         * have the attribute, it will simply be skipped.
         *
         * To write outline data to the .glif file, writeGlyph() needs
         * a function (any callable object actually) that will take one
         * argument: an object that conforms to the PointPen protocol.
         * The function will be called by writeGlyph(); it has to call the
         * proper PointPen methods to transfer the outline to the .glif file.
         *
         * The GLIF format version will be chosen based on the ufoFormatVersion
         * passed during the creation of this object. If a particular format
         * version is desired, it can be passed with the formatVersion argument.
         * 
         * Exposes an obtainJS sync/async API
         * 
         * @obtainAPI: sync/async switch
         * @glyphName: string
         * @glyphObject: object|undefined
         * @drawPointsFunc: function|undefined
         * @formatVersion: int|undefined
         */
      , writeGlyph: obtain.factory(
            {
                checkedFormatVersion: ['formatVersion',
                function(formatVersion) {
                    if(formatVersion === undefined)
                        if(this.ufoFormatVersion >= 3)
                            return 2;
                        return 1;
                    if(!(formatVersion in constants.supportedGLIFFormatVersions))
                        throw new GlifLibError('Unsupported GLIF format version: '
                            + formatVersion);
                    if(formatVersion == 2 && this.ufoFormatVersion < 3)
                        throw new GlifLibError('Unsupported GLIF format version ('
                            + formatVersion + ') for UFO format version '
                            + this.ufoFormatVersion + '.');
                    return formatVersion
                }]
              , data: ['glyphName', 'glyphObject', 'drawPointsFunc'
                     , undefined, 'checkedFormatVersion', writeGlyphToString]
              , filename: ['glyphName', function(glyphName){
                    var fileName = this.contents[glyphName];
                    if(fileName === undefined) {
                        fileName = this.glyphNameToFileName(glyphName, this);
                        this.contents[glyphName] = fileName;
                        if(this._reverseContents !== undefiend)
                            this._reverseContents[fileName.toLowerCase()] = glyphName;
                    }
                    return fileName;
                }]
              , path: ['fileName', function(fileName) {
                    return [this.dirName, fileName].join('/');
                }]
              , oldData: ['path', function(path) {
                    try {
                        return io.readFileSync(path);
                    }
                    catch(error) {
                        if(error instanceof IONoEntryError)
                            return null;
                        throw error;
                    }
                }]
              , dataHasChanged: ['data', 'oldData', function(data, oldData) {
                    return data !== oldData;
                }]
              , write: ['path', 'data', io.writeFileSync]
            }
          , {
                oldData: ['path', '_callback',
                function(path, callback) {
                    var _callback = function(error, result) {
                        if(error instanceof IONoEntryError){
                            error = undefined;
                            result = null;
                        }
                        callback(error, result);
                    }
                    io.readFile(path, _callback)
                }]
              , write: ['path', 'data', '_callback', io.writeFile]
            }
          , ['glyphName', 'glyphObject', 'drawPointsFunc', 'formatVersion']
          , function(obtain, glyphName, glyphObject/*undefined*/,
                drawPointsFunc/*undefined*/, formatVersion/*undefined*/)
            {
                this._purgeCachedGLIF(glyphName);
                // TOOD: Check if it's wise to load the old data here
                // it just fragments the process.
                if(!obtain('dataHasChanged'))
                    return;
                return obtain('write')
            }
        )
        /**
         * Exposes an obtainJS sync/async API
         * 
         * Permanently delete the glyph from the glyph set on disk. Will
         * raise KeyError if the glyph is not present in the glyph set.
         */
      , deleteGlyph: obtain.factory(
            {
                path: ['glyphName', function(glyphName){
                    var fileName = this.contents[glyphName];
                    return [this.dirName, fileName].join('/');
                }]
              , delete: ['path', ip.unlinkSync]
            }
          , {
                delete: ['path', '_callback',ip.unlink]
            }
          , ['glyphName']
          , function (obtain, glyphName) {
                this._purgeCachedGLIF(glyphName);
                obtain('delete');
                if(this._reverseContents !== undefined)
                    delete this._reverseContents[this.contents[glyphName].toLowerCase()];
                delete this.contents[glyphName];
            }
        )
        
        // dict-like support …
        // there is no magic happening like in python, but we do something
        // in the same mind hen possible.
        
        /**
         * def keys(self):
         *  return self.contents.keys()
         * u.se:
         * 
         * for(var k in glyphSet.contents);
         * 
         * in python the keys method is used like the following most of the time
         * 
         * for k in glyphSet.keys:
         *      pass
         */
        
        /**
         * silly thing, don't think one would use it in js
         */
      , has_key: function(glyphName) {
            return glyphName in this.contents;
        }
        
        //nope, won't do this, its magical
        //__contains__ = has_key
        
      , getLength: function() {
            var length = 0;
            for(var k in this.contents)
                length += 1;
            return length;
        }
      , get length () {
            return this.getLength();
        }
        /**
         * this is magic, too
         * but a getter here is not too bad
         * def __getitem__(self, glyphName)
         */
      , get: function(glyphName) {
            if(!(glyphName in this.contents))
                throw new KeyError(glyphName);
            return new this.glyphClass(glyphName, this);
        }
        /**
         * @mapper: function that takes a glyph document and returns a result
         * @glyphNames: a list of glyph names or undefined
         * 
         * Returns a dict with the glyphNames as key and the results of
         * mapper as values.
         * 
         * Exposes an obtainJS sync/async API
         */
      , _mapGLIFDocuments: obtain.factory(
            {docs: [false, 'glyphNames', this._getGLIFDocuments]}
          , {docs: [true, 'glyphNames', this._getGLIFDocuments]}
          , ['mapper', 'glyphNames']
          , function(obtain, glyphNames, mapper) {
                var result = {}
                  , glyphName
                  , docs
                  ;
                docs = obtain('docs');
                for(glyphName in docs)
                    result[glyphName] = mapper(docs[glyphName]);
                return result;
            }
        )
        // quickly fetch unicode values
        /**
         * Exposes an obtainJS sync/async API
         * 
         * not shure if this makes sense in our scenario ... parsing files
         * partially etc.
         *
         * Return a dictionary that maps glyph names to lists containing
         * the unicode value[s] for that glyph, if any. This parses the .glif
         * files partially, so it is a lot faster than parsing all files completely.
         * By default this checks all glyphs, but a subset can be passed with glyphNames.
         */
      , getUnicodes: function(obtainAsyncSwitch, glyphNames) {
            return this._mapGLIFDocuments(obtainAsyncSwitch, glyphNames,
                                                          fetchUnicodes)
        }

        /**
         * Exposes an obtainJS sync/async API
         * 
         * Return a dictionary that maps glyph names to lists containing the
         * base glyph name of components in the glyph. This parses the .glif
         * files partially, so it is a lot faster than parsing all files completely.
         * By default this checks all glyphs, but a subset can be passed with glyphNames.
         */
         
      , getComponentReferences: function(obtainAsyncSwitch, glyphNames) {
            return this._mapGLIFDocuments(obtainAsyncSwitch, glyphNames,
                                                    fetchComponentBases)
        }
        /**
         * Exposes an obtainJS sync/async API
         * 
         * Return a dictionary that maps glyph names to the file name of the image
         * referenced by the glyph. This parses the .glif files partially, so it is a
         * lot faster than parsing all files completely.
         * By default this checks all glyphs, but a subset can be passed with glyphNames.
         */
      , getImageReferences: function(obtainAsyncSwitch, glyphNames) {
            return this._mapGLIFDocuments(obtainAsyncSwitch, glyphNames,
                                                    fetchImageFileName)
        }
        
        // internal methods
        
        /**
         * reads a plist from path synchronously or asynchronously
         * using obtainJS for the switch.
         */
      , _readPlist: obtain.factory(
            {
                // a constructor for a lib of shared methods
                // this is a bit hackish, should maybe become formalized
                lib: [function() {
                    return {
                        makeError: function(error, path) {
                            if(error instanceof IONoEntryError)
                                return error;
                            return new GlifLibError(
                                ['The file "', path ,'" could not be read.('
                                , error.message,')'].join(''), error.stack);
                        }
                    }
                }]
              , plist: ['path', 'lib', function(path, lib) {
                    var data;
                    try {
                        data = readPlistFromFile(false, path)
                    } catch(e) {
                        throw lib.makeError(e, path)
                    }
                }]
            }
          , {
                plist: ['path', 'lib', '_callback', '_errback',
                                    function(path, lib, callback, errback)
                {
                    readPlistFromFile(false, path)
                    .then(callback, function(error) {
                        errback(lib.makeError(error, path))
                    })
                }]
            }
          , ['path']
          , function(obtain, path) {return obtain('plist');}
        )
    });
    return GlyphSet;
});
