define([
//    'metapolator/errors'
    'Atem-Logging/Logger'
  , 'Atem-Logging/Level'

], function(
//    errors
    Logger
  , Level
) {
    "use strict";

    function ImportProcess (project, blob, baseMasterPrefix, onMasterReady, logHandler) {
        this._project = project;
        this._baseMasterPrefix = baseMasterPrefix;
        this._resolve = null;
        this._reject = null;
        this._onMasterReady = onMasterReady;

        // the overall ImportProcess status
        // this will resolve when there's nothing more to import
        this._promise = new Promise(function (resolve, reject) {
            this._resolve = resolve;
            this._reject = reject;
        }.bind(this));

        this._io = null;
        this._current = null;
        this._items = [];

        // The logHandler can and should be used to create reporting/feedback.
        this._log = new Logger().setLevel(Level.DEBUG);
        this._log.addHandler(logHandler);

        // also a promise!
        // here insert log
        this.initialized = project.unpackImportBlob(blob, baseMasterPrefix)
            .then(function (data) {
                // -> we have io, and the ufo to names map, that's enough to init
                // the import display with endless spinning wheels
                this._io = data[0];
                this._items = data[1];
            }.bind(this)
            // TODO
            , this._initFailed.bind(this));
    }
    var _p = ImportProcess.prototype;

    Object.defineProperties(_p, {
        itemsLength: {
            get: function () { return this._items.length; }
        }
      , current: {
            get: function() {
                if(!this._current)
                    return undefined;
                return {
                    name: this._current.name
                  , file: this._current.file
                  , i: this._current.state && this._current.state.i
                  , total: this._current.state && this._current.state.total
                };
            }
        }
    });

    _p.after = function () {
        var i, l, args =  [];
        for(i=0,l=arguments.length;i<l;i++) args.push(arguments[i]);
        return this._promise.then.apply(this._promise, args);
    };

    // This will "resolve" the process and should make the parent scope
    // to remove the interface.
    // The ImportProcess instance will still be available to show
    // status reports/logs etc.
    // The reference to this._io is deleted, to free memory (if it is
    // inMemoryIO, which is expected).
    _p.end = function() {
        this._io = null;
        this._resolve(this);
    };

    _p.next = function(carryOn) {
        var item, file, name, glyphs, genItem, master, importer;

        if(this._current) {
            genItem = this._current.gen.next(carryOn /* must be strictly false to break */);
            if(!genItem.done) {
                // {i:i, total:l, 'glyphName':glyphName};
                this._current.state = genItem.value;
                return this.current;
            }

            // genItem.done === true
            // genItem.value is false if carryOn === false
            if(genItem.value !== false) {
                master = genItem.value;
                this._project.initializeImportedMaster(master, this._current.name);
                if(this._onMasterReady)
                    this._onMasterReady(master);
            }
            this._current = null;
        }

        // next:
        item = this._items.shift();
        if(!item) {
            // done!
            this.end();
            return;
        }

        // start next master
        file = item[0];
        name = item[1];
        glyphs = undefined;
        this._log.info('# File: ' + file);
        importer = this._project.ufoImporterFactory(false, file, this._io, this._log);
        if(importer)
            this._current = {
                file: item[0]
                , name: item[1]
                , importer: importer
                , gen: importer.importGenerator(false, glyphs)
            };
        // and run a first iteration on it (recursive call)
        return this.next();
    };

    _p._initFailed = function(error) {
        this._log.warning('ImportProcess init failed with ' + error, error);
        // shutdown
        this.end();
    };

    _p.cancelScheduled = function(fileName) {
        var i, l;
        for(i=0,l=this._items.length;i<l;i++)
            if(this._items[i][0] === fileName) {
                this._items.splice(i, 1);
                // fileName is unique
                break;
            }
    };

    _p.getItem = function (i) {
        var item = this._items[i];
        if(!item) return;
        return {
            file: item[0]
            // this name may change to be unique before the final master
            // is registered in the univers.
          , name: item[1]
        };
    };

    return ImportProcess;
});
