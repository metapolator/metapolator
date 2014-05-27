var obtain = (function obtain () {
    function Expectation(name) {
        Object.defineProperty(this, 'name', {
            get: function() {return name;}
        });
        Error.apply(this, Array.prototype.slice.call(arguments))
    }
    Expectation.prototype = Object.create(Error.prototype)
    Expectation.prototype.toString = function expectationString() {
        return '<Expectation of ' + this.name +'>'
    }
    
    function Argument(value) {
        Object.defineProperty(this, 'value', {
            get: function() { return name; }
        });
        
    }
    
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
        if(typeof arg !== 'string')
            return arg instanceof Argument
                ? arg.value
                : arg;
        
        var key = arg;
        if(!(key in obtained))
            throw new Expectation(arg);
        return obtained[key]
    }
    /**
     * Return a callback to receive the value of an async getter.
     * Known types are: "united", "errback", "callback"
     * This is used to provide for different callback APIs used in
     * asynchronous javascript code. Adapters for other apis can be written
     * and used as getters, too, if this is not enough.
     * 
     * type "united" 
     * A single callback that expects two arguments. The first must be
     * either null or undefined or its interpreted as error. The seccond
     * must be the result value and is used when there is no error.
     * Works with some of the Node.js library APIs.
     * 
     * types "callback"/"errback"
     * The other model is to have two callbacks, one in case of success
     * and one in case of error. Both expect a single argument.
     * type "callback" returns the callback for success
     * type "errback" returns the callback for error
     * 
     */
    function _receiver(executionManager, errback, obtained, key, type) {
        if(type === 'united') {
            // united receiver for both callback and errback
            function unitedReceiver(error, result) {
                if(error !== null && error !== undefined){
                    errback(error)
                    return;
                }
                // set the value in the obtained
                obtained[key] = result
                executionManager()
            }
            return unitedReceiver;
        }
        // errback type receiver
        else if(type === 'errback') {
            return errback;
        }
        // receiver callback used when there is an errback receiver
        else if(type === 'callback') {
            function callbackReceiver(result) {
                // set the value in the obtained
                obtained[key] = result
                executionManager()
            }
            return callbackReceiver;
        }
        throw new Error('Unknown receiver type "'+type+'".')
    }
    
    /**
     * Set the callbacks to their position in the arguments list of an
     * asynchronous getter.
     * 
     * Special arguments are "_callback" and "_errback" which can be used to
     * set the position for a single "united" type callback (by not using)
     * "_errback" or to set the position of a callback and an errback by
     * using both. if "_callback" is not used, its appended automatically
     * as a last argument.
     * 
     */
    function _prepareAsyncGetterArgs(receiver, key, args) {
        var callback_index
          , errback_index
          , i=0
          ;
        // default is the united callback as last argument
        callback_index = args.length;
        for(; i<args.length; i++)
            // first '_errback' wins, the seccond will raise an error
            // probably
            if(errback_index !== undefined && args[i] === '_errback')
                errback_index = i;
            // the lowest '_callback' wins
            else if(i < callback_index && args[i] === '_callback')
                callback_index = i;
        
        if(errback_index === undefined)
            args[callback_index] = receiver(key, 'united');
        else {
            args[errback_index] = receiver(key, 'errback');
            args[callback_index] = receiver(key, 'callback');
        }
    }
    
    function _obtain(async, sync_getters, async_getters, receiver, getArg,
                     obtained, key) {
        var func
          , args
          , isAsync = false
          , callback_index
          , errback_index
          ;
        if(async && key in async_getters) {
            isAsync = true
            func = async_getters[key][0]
            args = async_getters[key].slice(1)
            _prepareAsyncGetterArgs(receiver, key, args)
        }
        else if (key in sync_getters) {
            func = sync_getters[key][0]
            args = sync_getters[key].slice(1)
        }
        else
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
    
    function _obtainAPI(missingExpectations, obtained, obtain, key) {
        var result;
        if (key in obtained)
            return obtained[key];
        else
            // this is a shortcut, _dependencyManager won't need to
            // execute job to find out that *key* is missing
            missingExpectations.push(key)
        result = obtain(key);
        // still here, so key is not missing
        missingExpectations.pop()
        return result;
    }
    
    
    /**
     * check for circular expectation dependencies
     */
    function _detectCircularDependencies(missingExpectations) {
        var last, i;
        if(missingExpectations.length > 1) {
            last = missingExpectations[missingExpectations.length -1];
            i = missingExpectations.length -2; // don't check last with itself
            for (; i>=0; i--)
                if(missingExpectations[i] === last)
                    throw new Error(['A circular dependency was detetcted: '
                        , '"', last, '" in "', missingExpectations.join(', ')
                        , '"'].join(''));
        }
    }
    
    /**
     * resolve missing Expectations and the run the job
     */
    function _dependencyManager(missingExpectations, obtained, obtain,
            job, args) {
        var key;
        // until all missing Expectations are resolved
        while(true) {
            try {
                // Resolve Expectations using while
                console.log('missingExpectations', missingExpectations)
                _detectCircularDependencies(missingExpectations)
                // obtain missing dependencies
                while(missingExpectations.length) {
                    key = missingExpectations[missingExpectations.length -1];
                    // don't pop the Expectation from the stack yet
                    if (!(key in obtained))
                        obtain(key);
                    // now remove the expectation
                    missingExpectations.pop()
                }
                return job.apply(this, args)
            }
            catch(e) {
                if (e instanceof Expectation) {
                    missingExpectations.push(e.name);
                }
                else {
                    throw e;
                }
            }
        }
    }
    
    /**
     * Control execution of the job: 
     */
    _executionManager = function(job, async, callback, errback) {
        try {
            result = job()
        }
        catch(e) {
            if(e instanceof AsyncExecutionException) {
                console.log('AsyncExecutionException')
                // the receiver will call this again
                return;
            } else if(!async)
                throw e;
            errback(e);
            return
        }
        if(!async)
            return result
        callback(result)
    }
    
    function createExecutionManager(sync_getters, async_getters, caller_arguments, job) {
        return function runner (async /* arguments , ... , calback, errback*/) {
            // in this closure the values that need to be new for each
            // execution are kept.
            var obtain = (function obtain(key) {
                    var r =  _obtain.call(this, async, sync_getters,
                        async_getters, receiver, getArg, obtained, key);
                    return r;
                }).bind(this)
              , obtained = {}
              , missingExpectations = []
              , args = Array.prototype.slice.call(arguments, 1)
              , errback = async ? args.pop() : undefined
              , callback = async ? args.pop() : undefined
              , receiver
              , getArg = _getArg.bind(this, obtained)
              , obtainAPI = _obtainAPI.bind(this, missingExpectations,
                        obtained, obtain)
              , dependencyManager = _dependencyManager.bind(this,
                        missingExpectations, obtained, obtain, job, args)
              , executionManager = _executionManager.bind(this,
                        dependencyManager, async, callback, errback)
              , receiver = async
                    ? _receiver.bind(this, executionManager, errback,
                                     obtained)
                    : undefined
              , i=0
              ;
            
            for(;i<caller_arguments.length; i++)
                obtained[caller_arguments[i]] = args[i];
            args.unshift(obtainAPI)
            // execute
            if(!async) {
                var r = executionManager()
                return r;
            }
            // ensure async execution
            // A developer might not expect stuff like an immediate
            // error when calling a async method.
            setTimeout(executionManager, 0)
        }
    }
    
    return {
        Argument: Argument
      , createExecutionManager: createExecutionManager
    }
})()
, Argument = obtain.Argument
, now = new Date()
, io = {
      getMtimeSync: function(path){ return now; }
    , pathExistsSync: function(path) { return true }
    , readFileSync: function(path){ return 'sync Contents of ' + path }
    , getMtime: function(path, callback){ setTimeout(function(){callback(undefined, now)}, 500) }
    , pathExists: function(path, callback){setTimeout(function(){ callback(undefined, true) }, 500); }
    , readFile: function(path, callback){ setTimeout(function(){callback(undefined, 'async Contents of ' + path)}, 500) }
}
;
function KeyError() {
    this.name = 'KeyError';
    this.message = arguments[0];
    Error.apply(this, Array.prototype.slice.call(arguments));
}
KeyError.prototype =  Object.create(Error.prototype);

function TestGlifList() {
    this.dirName = 'a/dir/name'
    this.contents = {
        'a': 'a.glif'
    }
    this._glifCache = {}
    
}
    
TestGlifList.prototype.getGlif = obtain.createExecutionManager(
    // sync getters
    {
        fileName: [// no extra arguments (glyphName needs to be made availabe!)
            function fileName(glyphName) {
                var name = this.contents[glyphName];
                if(name === undefined)
                    throw new KeyError(glyphName);
                return name
            }
             // the Argument class is to be used to "curry" here non Expectations
             // e.g. Arguments whose value is known already.
             // Currently only strings like in (typeof val === 'string')
             // are interpreted as Expectation. Anything else would be used 
             // as an argument, so if you want to pass a string to the getter
             // or when you are unsure about the type use new Argument('my string')
            , 'glyphName'
        ]
      , glyphNameInCache: [
            function(glyphName) {return glyphName in this._glifCache;}
            , 'glyphName'
        ]
      , path: [
            function(fileName) {
                return [this.dirName, fileName].join('/');
            }
            , 'fileName'
        ]
      , mtime: [io.getMtimeSync, 'path']
      , pathExists: [io.pathExistsSync, 'path']
      , text: [io.readFileSync, 'path']
    }
    //async getters
    , {
        // Special arguments are "_callback" and "_errback" which can be used to
        // set the position for a single "united" type callback (by not using)
        // "_errback" or to set the position of a callback and an errback by
        // using both. if "_callback" is not used, its appended automatically
        // as a last argument.
        mtime: [io.getMtime, 'path']
      , pathExists: [io.pathExists, 'path']
      , text: [io.readFile, 'path']
    }
    // caller arguments
    // list the names in the right order here, so they can be used as 
    // Expectation and obtain knows them
    , ['glyphName']
    // job
    /* the job will probably be called very often. until all async obtain
        * dependencies are met
        */
    , function job(obtain, glyphName /*optional here, can be received via obtain, too*/) {
        console.log('!!! JOB')
        
        //obtain('circle');
        
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

var glifList = new TestGlifList()
//getGlif(async, glyphName, /* if async: calbback, errback*/)

console.log('async ...', glifList)
var errback = function(){console.log.apply(console, ['errback>'].concat(Array.prototype.slice.call(arguments).map(String)));}
glifList.getGlif(true, 'b', console.log.bind(console,'callback', glifList), errback)
glifList.getGlif(true, 'a', console.log.bind(console,'callback', glifList), errback)
console.log('----------------------------------')
console.log('sync result', glifList.getGlif(false, 'a'), '++++++++++++++++++++++++++++++')
console.log('sync result', glifList.getGlif(false, 'a'))

// using a switch statement could reduce the cost of
// calling job multiple times. however having that 'state' attached 
// to the obtain method is maybe too implicit.
// maybe a obtain('_state') returning an object could be used for that
// this would do almost the same as yield and be optimization taht could
// happen occasionally.
function job(obtain, glyphName /*optional here, can be received via obtain, too*/) {
        console.log('!!! JOB')
        
        //obtain('circle');
        switch (obtain.goto) {
            default:
            case 1:
                obtain.goto = 1;
                if(obtain('glyphNameInCache')) {
                    if(obtain('mtime') === this._glifCache[glyphName][1]) {
                        // cache is fresh
                        return this._glifCache[glyphName][0];
                    }
                }
            case 2:
                obtain.goto = 2;
                // still here? need read!
                if(!obtain('pathExists'))
                    throw new KeyError(glyphName);
            case 3:
                obtain.goto = 3;
                // refreshing the cache
                this._glifCache[glyphName] = [obtain('text'), obtain('mtime')];
                // cache is refreshed
        }
        delete obtain.goto;
        return this._glifCache[glyphName][0];
    }
