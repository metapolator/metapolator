    
    // original
    getGLIF: function(glyphName) {
        var needRead = false,
            , fileName = this.contents[glyphName],
            , path,
            , mtime
            , text
            ;
        if(fileName !== undefined)
            path = [this.dirName, fileName].join('/');
        if(!(glyphName in this._glifCache))
            needRead = true;
        else if(fileName !== undefined
            // freakshit in a browser context ...
            && (mtime = io.getMtimeSync(path)) != this._glifCache[glyphName][1])
            needRead = true;
        if(needRead) {
            if(!path || !io.pathExistsSync(path))
                throw new KeyError(glyphName);
            text = io.readFileSync(path);// and get mtime ...
            if(mtime === undefined) mtime = io.getMtimeSync(path);
            this._glifCache[glyphName] = [text, mtime];
        }
        return this._glifCache[glyphName][0];
    },
    
    // improoved
    getGLIF: function(glyphName) {
        var fileName = this.contents[glyphName]
          , path
          , mtime
          , text
          ;
        
        if(fileName === undefined)
            throw new KeyError(glyphName);
        
        if(glyphName in this._glifCache)
            mtime = io.getMtimeSync(path)
            if(mtime === this._glifCache[glyphName][1]))
                return this._glifCache[glyphName][0];
        // still here? need read!
        path = [this.dirName, fileName].join('/');
        
        if(!io.pathExistsSync(path))
            throw new KeyError(glyphName);
        
        text = io.readFileSync(path);// and get mtime ...
        if(mtime === undefined)
            mtime = io.getMtimeSync(path);
        this._glifCache[glyphName] = [text, mtime];
        return this._glifCache[glyphName][0];
    }
    
    // async and sync execution
    getGlif: function(async, glyphName, callback, errback) {
        var fileName
          , mtime
          , path
          , pathExists
          , text
          ;
        
        if(async)
            function receiver(key) {
                return function(result) {
                    if(result instanceof Error)
                        errback(result)
                    // set the value in the closure
                    if(key === 'mtime')
                        mtime = result;
                    else if (key === 'pathExists')
                        pathExists = result
                    else if (key === 'text')
                        text = result
                    executionManager()
                }
            }
        
        /** This is called over and over, until it has a result
         */
        function executionManager() {
            try {
                if(fileName === undefined) {
                    fileName = this.contents[glyphName]
                    if(fileName === undefined)
                        throw new KeyError(glyphName);
                }
                if(glyphName in this._glifCache) {
                    if(mtime === undefined) {
                        if(async)
                            io.getMtime(path, receiver('mtime'))
                            return;
                        else
                            mtime = io.getMtimeSync(path)
                    }
                    if(mtime === this._glifCache[glyphName][1]){
                        // cache is fresh
                        var result = this._glifCache[glyphName][0]
                        if(!async)
                            return result;
                        callback(result)
                        return;
                    }
                }
                // still here? need read!
                if(path === undefined)
                    path = [this.dirName, fileName].join('/');
                
                if(pathExists === undefined) {
                    if(async){
                        io.pathExists(path, receiver('pathExists'))
                        return;
                    }
                    else
                        pathExists = io.pathExistsSync(path)
                }
                if(!pathExists)
                    throw new KeyError(glyphName);
                
                if(text === undefined) {
                    if(async) {
                        io.readFile(path, receiver('text'))
                        return;
                    }
                    else
                        text = io.readFileSync(path);// and get mtime ...
                }
                if(mtime === undefined) {
                    if(async)
                        io.getMtime(path, receiver('mtime'))
                        return;
                    else
                        mtime = io.getMtimeSync(path)
                }
                this._glifCache[glyphName] = [text, mtime];
                var result = this._glifCache[glyphName][0];
            }
            catch(e) {
                if(!async)
                    throw e;
                errback(e);
            }
            if(!async)
                return result;
            callback(result);
        }.bind(this)
        return executionManager()
    }
    
    
    // async and sync execution, strating a DSL//framework
    /**
     * This makes the code a lot longer, but many of the code-lines are
     * utillity functions. The general model is interesting, though.
     * 
     * 
     */
    getGlif: function(async, glyphName, callback, errback) {
        var obtained = {}, async_getters = {}, sync_getters;
        

        
        
        sync_getters = {
            // synchronous, no extra arguments (glyphName and this are available when defined)
            fileName: [function() {
                var name = this.contents[glyphName];
                if(name === undefined)
                    throw new KeyError(glyphName);
                return name
            }.bind(this)]
            // synchronous, fileName is needed
          , path: [function(fileName) {
                return [this.dirName, fileName].join('/');
            }.bind(this), new Expectation('fileName')]
          , mtime: [io.getMtimeSync, new Expectation('path')]
          , pathExists: [io.pathExistsSync, new Expectation('path')]
          , text: [io.readFileSync, new Expectation('path')]
        }
        async_getters = {
            mtime: [io.getMtime, new Expectation('path')]
          , pathExists: [io.pathExists, new Expectation('path')]
          , text: [io.readFile, new Expectation('path')]
        }
        
        
        /**
         * Return an argument to be used in a call to a sync/async getter.
         * if arg is not an instance of Expectation it is just returned;
         * if arg is an instance of Expectation and arg.key is in obtained
         * obtained[arg.key] is returned
         * Otherwaise the Expectation is thrown as Error.
         * This doesn't try to resolve the Expectation (using obtain) because
         * that is the duty of executionManager and would raise other issues
         * here, especially circular dependencies.
         */
        function getArg(arg) {
            if(!(arg instanceof Expectation))
                return arg
            var key = Expectation.getName()
            if(!(key in obtained))
                throw Expectation;
            return obtained[key]
        }
        
        function obtain(key) {
            if (key in obtained)
                return obtained[key];
            
            var func
              , args
              , isAsync = false;
            if(async && key in async_getters) {
                isAsync = true
                func = async_getters[0]
                args = async_getters.slice(1)
                args.push(receiver('key'))
            } else if (key in sync_getters) {
                func = sync_getters[0]
                args = sync_getters.slice(1)
            } else
                throw new Error('Don\'t know how to obtain "'+key+'".')
            
            // May throw an Expectation
            args = args.map(getArg)
            
            if(!isAsync) {
                obtained[key] = func.apply(undefined, args)
                return obtained[key];
            }
            func.apply(undefined, args)
            throw new AsyncExecutionException()
        }
        
        function executionManager() {
            try {
                // with obtain resolving expectations itself this would
                // be a better read, see below
                obtain('fileName')
                obtain('path')
                if(glyphName in this._glifCache) {
                    if(obtain('mtime') === this._glifCache[glyphName][1]) {
                        // cache is fresh
                        throw new Result(this._glifCache[glyphName][0])
                    }
                }
                // still here? need read!
                if(!obtain('pathExists'))
                    throw new KeyError(glyphName);
                // refreshing the cache
                this._glifCache[glyphName] = [obtain('text'), obtain('mtime')];
                // cache is refreshed
                throw new Result(this._glifCache[glyphName][0])
            }
            catch(e) {
                if (e instanceof Result) {
                    if(!async)
                        return e.value;
                    callback(e.value);
                }
                else if(e instanceof AsyncExecutionException)
                    // the receiver will call this again
                    return;
                else if(e instanceof Expectation) {
                    /** 
                     * this is probably not the right place to invoke obtain
                     * on the expectation. Obtain should do this, or getArg
                     * however I first need to think about the circular
                     * reference problem.
                     */
                    throw e;
                } else if(!async)
                    throw e;
                else
                    errback(e);
                return
            }
            throw new Error('Did not find a solution')
        }.bind(this)
        if(!async)
            return executionManager()
        setTimeout(executionManager, 0)
    }
    
    
    
    //just a thought
    function Expectation(name){this.getName = function(){return name;}}
    
    function getExecutionManager(sync_getters, async_getters, caller_arguments, job) {
        function AsyncExecutionException(){}
        /**
         * Return an argument to be used in a call to a sync/async getter.
         * if arg is not an instance of Expectation it is just returned;
         * if arg is an instance of Expectation and arg.key is in obtained
         * obtained[arg.key] is returned
         * Otherwaise the Expectation is thrown as Error.
         * This doesn't try to resolve the Expectation (using obtain) because
         * that is the duty of executionManager and would raise other issues
         * here, especially circular dependencies.
         */
        function _getArg(obtained, arg) {
            if(!(arg instanceof Expectation))
                return arg
            var key = Expectation.getName()
            if(!(key in obtained))
                throw Expectation;// obtain ?
            return obtained[key]
        }
        /** this expects the async function to call the callback with error
         * as argument when something went wrong. Another, maybe cleaner
         * approach would be to have an error callback and an success
         * callback. However, the latter approach needs more writing and
         * has not so many advantages. So maybe I'll change it later.
         * I think nodeJS does this without special errback, so maybe
         * I'll keep it …
         */
        function _receiver(executionManager, errback, obtained, key) {
            return function(result) {
                if(result instanceof Error)
                    errback(result)
                // set the value in the obtained
                obtained[key] = result
                executionManager()
            }
        }
        //FIXME: resolve unmet Expectations and detect problems like
        // circular references
        function _obtain(async, receiver, getArg, obtained, key) {
            if (key in obtained)
                return obtained[key];
            
            var func
              , args
              , isAsync = false;
            if(async && key in async_getters) {
                isAsync = true
                func = async_getters[key][0]
                args = async_getters[key].slice(1)
                args.push(receiver(key))
            } else if (key in sync_getters) {
                func = sync_getters[key][0]
                args = sync_getters[key].slice(1)
            } else
                throw new Error('Don\'t know how to obtain "'+key+'".')
            
            // May throw an Expectation
            args = args.map(getArg)
            
            if(!isAsync) {
                obtained[key] = func.apply(this, args)
                return obtained[key];
            }
            func.apply(this, args)
            throw new AsyncExecutionException()
        }
        
        
        return function runner (async /* arguments , ... , calback, errback*/) {
            // in this closure the values that need to be new for each
            // execution are kept.
            var obtain = function(key){return _obtain.call(this, async,
                                       receiver, getArg, obtained, key);}
              , getArg = function(arg){return _getArg(obtained)}
              , obtained = {}
              , args = Array.prototype.slice.call(arguments, 1)
              , callback
              , errback
              , i=0
              ;
            if(async) {
                callback = args[args.length-2]
                errback = args[args.length-1]
                receiver = function(key){_receiver(executionManager, errback, obtained, key)}
                args = args.slice(0, -2);
                // ensure async execution
                // A developer might not expect stuff like an immediate
                // error when calling a async method.
            }
            for(;i<caller_arguments.length; i++)
                obtain[caller_arguments[i]] = args[i]
            function executionManager() {
                try {
                    var result = job.apply(this, args)
                }
                catch(e) {
                    if(e instanceof AsyncExecutionException)
                        // the receiver will call this again
                        return;
                    else if(!async)
                        throw e;
                    errback(e);
                    return
                }
                if(!async)
                    return result
                callback(result)
            }.bind(this)
            
            if(!async)
                return executionManager()
            setTimeout(executionManager, 0)
        }
    }
    
    getGlif = getExecutionManager(
        // sync getters
        {
            fileName: [// no extra arguments (glyphName needs to be made availabe!)
                function(glyphName) {
                    var name = this.contents[glyphName];
                    if(name === undefined)
                        throw new KeyError(glyphName);
                    return name
                }
              , new Expectation('glyphName')] // the expectation class is used, so other args can be curried here
            ],
          , glyphNameInCache: [
                function(glyphName){return glyphName in this._glifCache;}
              , new Expectation('glyphName')]
          ]
          , path: [
                function(fileName) {
                    return [this.dirName, fileName].join('/');
                }
              , new Expectation('fileName')
            ]
          , mtime: [io.getMtimeSync, new Expectation('path')]
          , pathExists: [io.pathExistsSync, new Expectation('path')]
          , text: [io.readFileSync, new Expectation('path')]
        }
        //async getters
      , {
            mtime: [io.getMtime, new Expectation('path')]
          , pathExists: [io.pathExists, new Expectation('path')]
          , text: [io.readFile, new Expectation('path')]
        }
        // caller arguments
      , ['glyphName']
        // job
        /* the job will probably called very often. until all async obtain
         * dependencies are met
         */
      , function(obtain) {
            // there was a obtain.set('key', value) API is that useful or 
            // dangerous? (it would do obtained[key] = value)
            // i don't like the idea that the getters could use the obtain
            // api via here obtain.set('obtain', obtain) and there obtain
            // as new Expectation('obtain'). That may make stuff more
            // complex. When there is time ill give it a shot to see what
            // happens.
            
            //FIXME: obtain is thought to resolve Expectations itself,
            // but it doesn't yet
            obtain('fileName')
            obtain('path')
            //basically 'glyphNameInCache' is just to cache the result
            // between async calls, it could be written jere
            if(obtain('glyphNameInCache')) {
                if(obtain('mtime') === this._glifCache[glyphName][1]) {
                    // cache is fresh
                    return this._glifCache[glyphName][0];
                }
            }
            // still here? need read!
            if(!obtain('pathExists'))
                throw new KeyError(glyphName);
            // refreshing the cache
            this._glifCache[glyphName] = [obtain('text'), obtain('mtime')];
            // cache is refreshed
            return this._glifCache[glyphName][0];
        }
    )
    getGlif(async, glyphName, /* if async: calbback, errback*/)
