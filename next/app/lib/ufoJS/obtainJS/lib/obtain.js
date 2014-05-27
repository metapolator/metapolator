"use strict";
define(['./Promise'], function(Promise){
    function NotImplementedError(){}
    
    function Expectation(name) {
        Object.defineProperty(this, 'name', {
            get: function() {return name;}
        });
    }
    Expectation.prototype = Object.create(Error.prototype)
    Expectation.prototype.toString = function expectationString() {
        return '<Expectation ' + this.name +'>'
    }

    
    function Argument(value) {
        Object.defineProperty(this, 'value', {
            get: function() { return value; }
        });
    }
    Argument.prototype.toString = function argumentString() {
        return '<Argument ' + this.value +'>'
    }
    
    /**
     * 
     * args may be an empty list, if this is the definition of an callerArgument.
     * That is a dependency that gets injected when calling the method.
     * 
     */
    function Dependency(name, async,
                        args/* [argumentNames, ... , function getter] */) {
        var args = args.slice(0) // make a copy and so don't change the outer world
          , getter = args.pop()
          , dependencies = []
          , skip = async ? {_callback: null, _errback: null} : {}
          , i = 0
          ;
        
        // Dependencies of this Dependency (Expectations) are everything
        // where typeof x === 'string' e.G. strings created with the string
        // literal. To pass a string as string argument use: new String('value')
        // So typeof x will be 'object' or use the Argument constructor of
        // this package: new Argument('value')
        
        // Exclude all args that are no Expectations but the value to be
        // passed itself.
        
        
        // dependencies are cleaned args: no doubles, no specials,
        // no curried values. Specials are '_callback' and '_errback',
        // although this api may change soon!
        for(;i<args.length; i++) {
            // this is a "curried" argument, not an Expectation
            if(typeof args[i] !== 'string' || args[i] in skip)
                continue;
            skip[args[i]] = null
            dependencies.push(args[i])
        }
        
        Object.defineProperty(this, 'name', {
            get: function() { return name; }
        });
        
        Object.defineProperty(this, 'async', {
            get: function() { return !!async; }
        });
        
        Object.defineProperty(this, 'getter', {
            get: function() { return getter; }
        });
        
        Object.defineProperty(this, 'args', {
            get: function() { return args.slice(0); }
        });
        
        Object.defineProperty(this, 'hasDependencies', {
            get: function() { return !!dependencies.length; }
        });
        
        Object.defineProperty(this, 'dependencyCount', {
            get: function() { return dependencies.length; }
        });
        
        Object.defineProperty(this, 'dependencies', {
            get: function() { return dependencies.slice(0); }
        });
    }
    var _Dp = Dependency.prototype;
    
    _Dp.toString = function dependencyString() {
        return '<Dependency ' + this.name +'>'
    }
    
    _Dp._getArg = function(getValue, item) {
        if(typeof item === 'string')
            // may throw an Expectation
            return getValue(item);
        return item instanceof Argument ? item.value : item;
    }
    
    _Dp.getArgs = function(getValue/* a function*/,
            callback /* if this.async */, errback /* if this.async */) {
        
        // depending on the arguments and callback style of this method
        // we need to figure out how to call it:
        var i=0
          , args = this.args
          , values = []
          , specialIndexes = {_callback: [], _errback: []}
          , unified_callback
          ;
        
        if(!this.async) {
            for(;i<args.length;i++)
                values.push(this._getArg(getValue, args[i]))
        }
        else {
            
            for(;i<args.length;i++) {
                if(args[i] in specialIndexes) {
                    specialIndexes[args[i]].push(i)
                    values.push(null) // will be filled below
                }
                else
                    values.push(this._getArg(getValue, args[i]))
            }
            
            // figure out the callback style
            if(!specialIndexes._errback.length)
                // define
                unified_callback = function(error, result) {
                    if(error !== null && error !== undefined)
                        errback(error)
                    else
                        callback(result);
                };
            else
                for(i=0; i<specialIndexes._errback.length; i++)
                    values[specialIndexes._errback[i]] = errback;
            
            for(i=0; i<specialIndexes._callback.length; i++)
                values[specialIndexes._callback[i]] = unified_callback || callback;
            // if neither _callback nor _errback where defined it's still
            // possible for the method to return a promise
        }
        return values
    }
    

    function DependencyFrame(dependency) {
        this.name = dependency.name;
        this.visitDependencies = dependency.hasDependencies;
        this.dependency = dependency;
        this.dependencyCount = dependency.dependencyCount;
    }

    function AsyncExecutionException(){}
    
    function AssertionFailed(message) {
        this.message = message;
        this.name = "AssertionFailed";
        Error.captureStackTrace(this, AssertionFailed);
    }
    AssertionFailed.prototype = Object.create(Error.prototype)
    
    function assert(test, message) {
        if(!test)
            throw new AssertionFailed(message);
    }
    
    function DependencyGraphError(message) {
        this.message = message;
        this.name = "DependencyGraphError";
        Error.captureStackTrace(this, DependencyGraphError);
        
    }
    DependencyGraphError.prototype = Object.create(Error.prototype)
    
    function DependencyGraph(
            syncGetters, asyncGetters, callerArguments, job) {
        this.asyncGetters = asyncGetters;
        this.syncGetters = syncGetters;
        
        this._cache = {
          // caches the results of getDependency
            _asyncDependencies: {}
          , _syncDependencies: {}
          , _callerArgumentsDependencies: {}
          // caches the results of _getEvaluationOrder
          , asyncEvaluation: {}
          , syncEvaluation: {}
        }
        
        // list of argument names of the 'job'
        this.callerArguments = callerArguments instanceof Array
            ? callerArguments
            : [];
        
        this.job = job;
    }
    
    var _DGp = DependencyGraph.prototype;
    
    _DGp._nameIsCallerArg = function(name) {
        var i=0;
        for(;i<this.callerArguments.length;i++)
            if(this.callerArguments[i] === name)
                return true;
        return false;
    }
    
    /**
     * Get the Dependency instance for name.
     * If mayBeAsync is true and an asyncGetter for name is defined,
     * the Dependency will resolve asynchronous. Otherwise it will be
     * synchronous.
     * 
     * caches created Dependency instances, these are reuseable
     */
    _DGp.getDependency = function(mayBeAsync, name) {
        var isAsync = false
          , isArgument = false
          , cache
          , getterDef
          , nameIsCallerArg
          , i=0
          ;
        if(this._nameIsCallerArg(name)) {
            // caller arguments are sync, one could say
            isArgument = true
            cache = this._cache._callerArgumentsDependencies
        }
        else if(mayBeAsync && name in this.asyncGetters) {
            isAsync = true;
            cache = this._cache._asyncDependencies;
        }
        else if(!(name in this.syncGetters))
            throw new DependencyGraphError(['Name "',name, '" not found '
                                      +'in DependencyGraph.'].join(''));
        else
            cache = this._cache._syncDependencies;
        
        if(!(name in cache)) {
            getterDef = !isArgument
                // pick the right implementation
                ? (isAsync ? this.asyncGetters : this.syncGetters)[name]
                // an argument has no definition
                : [];
            
            cache[name] = new Dependency(name, isAsync, getterDef)
        }
        return cache[name];
    }
    
    /**
     * prepare evaluation
     */
    _DGp._getEvaluationOrder = function (async, startNode) {
        var stack = []
        , dependencyCount = {} // return value
        , dependents = {} // return value
        , visiting = {} // detect circles
        , visited = {} // detect circles
        , path = [] // only needed for good error reporting
        , frame, length, i, dependency, getFrame
        ;
        
        // factory and currying the async away
        getFrame = function(name) {
            return new DependencyFrame(this.getDependency(async, name));
        }.bind(this);
        
        stack.push(getFrame(startNode));
        dependents[startNode] = [];
        while(stack.length) {
            frame = stack[stack.length-1];
            
            if(frame.name in visited) {
                stack.pop(); // clear frame
                continue;
            }
            
            if(frame.visitDependencies && (frame.name in visiting))
                // I think a direct error is better here. However, we could
                // collect all found strongly connected components and return
                // these. That might ease debugging or make it harder.
                throw new DependencyGraphError(['Circle detected but the '
                            , 'graph must be acyclic!'
                            , 'Current frame.name:', frame.name
                            , 'Path:', path.join('->')
                            , 'strongly connected component:'
                            , path.slice(path.indexOf(frame.name)).concat([frame.name]).join('->')
                            ].join(' '));
            
            // path is only used for the error message above
            path.push(frame.name);
            
            dependencyCount[frame.name] = frame.dependencyCount;
            if(frame.visitDependencies) {
                // entering the frames dependencies
                visiting[frame.name] = null;
                frame.visitDependencies = false;
                
                for(i=0; i<frame.dependencyCount; i++) {
                    dependency = frame.dependency.dependencies[i];
                    
                    // create the transpose graph
                    if(!(dependency in dependents))
                        dependents[dependency] = [];
                    // frame.name is a dependent of dependency
                    dependents[dependency].push(frame.name);
                    
                    if(dependency in visited)
                        // shortcut: this will be detected at the beginning of
                        // the while loop anyways, so we save us from creating,
                        // pushing and then popping the frame
                        continue;
                    
                    // create a new frame
                    // Frame.visitDependencies is true when the dependency has any dependencies
                    stack.push(getFrame(dependency));
                }
            }
            else {
                // leaving the frame
                visited[frame.name] = null;
                path.pop();
                stack.pop();
            }
        }
        return [dependencyCount, dependents]
    }
    
    /**
     * Return the result of _getEvaluationOrder (with underscore).
     * The result will be cached for later possible executions.
     */
    _DGp.getEvaluationOrder = function(async, startNode) {
        var cache = async
            ? this._cache.asyncEvaluation
            : this._cache.syncEvaluation
          , cacheItem
          , copy = [{}, {}]
          , k
          ;
        if(!(startNode in cache))
            cache[startNode] = this._getEvaluationOrder(async, startNode)
        cacheItem = cache[startNode];
        for(k in cacheItem[0])
            copy[0][k] = cacheItem[0][k];
        for(k in cacheItem[1])
            copy[1][k] = cacheItem[1][k].slice();
        return copy;
    }
    
    function State(host, graph /* instanceof DependencyGraph */,
            args /* array: [async [, arguments ... ]] */) {
        var i=0;
                
        this._host = host;
        this._graph = graph;
        
        this._async = args[0];
        this._args = args.slice(1);
        
        if(!this._async) {
            this.promise = undefined;
            this._resolvePromise = undefined;
            this._rejectPromise = undefined;
        }
        else {
            // just store these methods, to resolve or reject later
            this.promise = new Promise(function(resolve, reject) {
                this._resolvePromise = resolve;
                this._rejectPromise = reject;
            }.bind(this))
            // The user can opt-in to use callback and errback or a unified callback
            if(typeof this._async === 'object') {
                // we allow unfied style and callback/errback style at the
                // same time, although it's not really useful
                if(this._async.unified)
                    // unified style: unified_callback(error, result)
                    // convert it to divided style
                    this.promise.then (
                        function(result){ this.unified(undefined, result)}.bind(this._async)
                      , function(error){ this.unified(error)}.bind(this._async)
                    )
                if(this._async.callback || this._async.errback)
                    this.promise.then(this._async.callback || undefined,
                                      this._async.errback || undefined)
            }
        }
        
        this._obtained = {};
        
        // callerArguments are already obtained
        for(;i<this._graph.callerArguments.length; i++)
            this._obtained[this._graph.callerArguments[i]] = this._args[i];
        this._args.unshift(this._obtainAPI.bind(this));
        
        this._waitingFor = {}
        this._waitingCount = 0
        
        this._dependencyCounters = null;
        this._dependents = null;
        
        this._isShutDown = false
    }
    
    // State.prototype = Object.create(null);
    var p = State.prototype;
    
    /**
     * keep track of tasks we are waiting for
     */
    p.addWaitingAsync = function(dependency) {
        assert(!(dependency in this._waitingFor), 'Already waiting for '
                                                  + dependency)
        // Useful? Add a time when waiting started, or a setTimeout for
        // timeout control or such?
        this._waitingFor[dependency] = null;
        this._waitingCount += 1;
        return this._waitingCount
    }
    
    /**
     * clean up when the task finishes
     */
    p.removeWaitingAsync = function(dependency) {
        assert(dependency in this._waitingFor, 'Not waiting for '
                                                  + dependency)
        delete this._waitingFor[dependency];
        this._waitingCount -= 1;
        return this._waitingCount;
    }
    
    Object.defineProperty(p, 'waitingAsyncCount', {
        get: function() { return this._waitingCount; }
    });
    
    p.getDependency = function(name) {
        return this._graph.getDependency(this._async, name);
    }
    
    p._removeDependency = function(dependency) {
        var dependents = this._dependents[dependency.name] || []
          , dependencyCounters = this._dependencyCounters
          , i=0
          , cleaned = []
          , dependent
          ;
        // substract 1 from each  dependencyCounters[dependent] (because
        // dependency is resolved)
        // if a dependencyCounter is 0 the dependent can be executed
        for(;i<dependents.length;i++) {
            dependent = this.getDependency(dependents[i])
            dependencyCounters[dependent.name] -= 1;
            if (dependencyCounters[dependent.name] === 0)
                cleaned.push(dependent)
        }
        return cleaned;
    }
    
    p.getValue = function(name) {
        if(!(name in this._obtained))
            throw new Expectation(name)
        return this._obtained[name]
    }
    
    /**
     * use: this._dependencyCallback.bind(this, dependency)
     */
    p._dependencyCallback = function(dependency, result) {
        var cleaned;
        if(this._isShutDown)
            // FIXME: start logging or provide a status otherwise
            return;
        this.removeWaitingAsync(dependency)
        this._obtained[dependency.name] = result
        cleaned = this._removeDependency(dependency)
        this._resolve.apply(this, cleaned)
        if(!this.waitingAsyncCount)
            // that's it, nothing to do anymore
            this.execute();
    }
    
    p._errorShutdown = function() {
        this._isShutDown = true;
        // TODO: log all dependencies that callback or errback after shutdown
        // TODO: .abort() all async dependencies we are waiting for
        // and don't execute()/_resolve() further!
        // see: https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest#abort%28%29
        // as an example abort API
    }
    
    /**
     * use: this._dependencyErrback.bind(this, dependency)
     */
    p._dependencyErrback = function(dependency, error) {
        if(this._isShutDown)
            // FIXME: start logging or provide a status otherwise
            return;
        this.removeWaitingAsync(dependency);
        this._errorShutdown()
        this._rejectPromise(error)
    }
    
    
    p._call = function(dependency) {
        var namedArgs = {}
          , i=0
          , args
          , getValue = this.getValue.bind(this)
          , callback, errback, promise
          ;
        if(dependency.async) {
            callback = this._dependencyCallback.bind(this, dependency);
            errback = this._dependencyErrback.bind(this, dependency);
            args = dependency.getArgs(getValue, callback, errback)
            
            this.addWaitingAsync(dependency)
            promise = dependency.getter.apply(this._host, args)
            // ducktyping
            if(promise && typeof promise.then === 'function')
                // from: https://developer.mozilla.org/en-US/docs/Mozilla/JavaScript_code_modules/Promise.jsm/Promise
                // Note: If the onFulfill callback throws an exception,
                // the onReject callback is not invoked. You can register
                // a rejection callback on the returned promise instead,
                // to process any exception occurred in either of the callbacks
                // registered on this promise.
                promise.then(callback).then(null, errback)
            
        }
        else {
            args = dependency.getArgs(getValue)
            return dependency.getter.apply(this._host, args)
        }
    }
    
    /**
     * Executes all dependencies given by the arguments.
     * First execute all asynchronous dependencies, as these probably
     * dispatch to a server or such and run nonblocking (hopefully,
     * where is the point otherwise?)
     */
    p._resolve = function(/* dependency, ... */) {
        var resolved = Array.prototype.slice.call(arguments)
          , sosd = [] // stack of synchconous dependencies
          , dependency
          , cleaned
          ;
        
        
        // IMPORTANT! The logical or || will execute dependency = sosd.pop()
        // only if the first expression returns something false.
        // so we first we _call all async dependencies and then the sync
        // ones. This is done, because we wan't to dispatch the async requests
        // ASAP.
        while((dependency = resolved.pop()) || (dependency = sosd.pop())) {
            if(dependency.name in this._obtained)
                continue
            else if(dependency.async)
                this._call(dependency)
            else if(resolved.length !== 0)
                // execute after all async dependencies have been called
                sosd.push(dependency)
            else {
                // execute the sync dependency
                this._obtained[dependency.name] = this._call(dependency);
                cleaned = this._removeDependency(dependency)
                resolved.push.apply(resolved, cleaned)
            }
        }
    }
    
    p._obtain =  function _obtain(key) {
        assert(!(key in this._obtained), 'Key "'+ key +'" must not be '
                                        + 'in this._obtained, but it is.')
        
        // order is a topological sorting as a starting point
        var order = this._graph.getEvaluationOrder(this._async, key)
          , resolved = []
          , k
          , dependencyCounters = this._dependencyCounters = order[0]
          , dependents = this._dependents = order[1]
        ;
        // Some values are already known, from callerArguments or previous
        // calls to _obtainAPI
        for(k in this._obtained)
            // Don't use the return value here, as the next step covers that.
            this._removeDependency(this.getDependency(k))
        // Every dependency with a count of 0 can be executed now
        for(k in dependencyCounters) {
            if (dependencyCounters[k] === 0)
                resolved.push(this.getDependency(k));
        }
        
        this._resolve.apply(this, resolved)
        if(this.waitingAsyncCount)
            // interrupt here, the callback will restart the thread
            throw new AsyncExecutionException()
        // if there wasn't any async dependency we should have a result
        // it has to be in this._obtained at this point
        
        assert(key in this._obtained, 'Key "'+ key +'" must be in '
                                    + 'this._obtained, but it isn\'t.')
    }
    
    p._obtainAPI = function _obtainAPI(key) {
        if (!(key in this._obtained))
            // will raise AsyncExecutionException when needed
            this._obtain(key);
        // This will only be executed when the value is already there.
        // If we have to wait AsyncExecutionException did interrupt already.
        return this._obtained[key];
    }
    
    p.execute = function execute () {
        var result;
        try {
            // job is expected to call _obtainAPI zero or more times
            result = this._graph.job.apply(this._host, this._args);
        }
        catch(e) {
            if(e instanceof AsyncExecutionException) {
                // the receiver will call execute again
                return;
            }
            
            if(!this._async){
                throw e;
            }
            this._errorShutdown();
            this._rejectPromise(e);
            return;
        }
        
        // got a result
        if(!this._async)
            return result;
        this._resolvePromise(result);
    }
    
    function executionEnvironmentFactory(syncGetters, asyncGetters,
            callerArguments, job) {
        var graph = new DependencyGraph(syncGetters, asyncGetters,
                                        callerArguments, job);
        return function runner( /* async, [ ... arguments, ]*/) {
            // 'this' is the host
            var state = new State(this, graph, Array.prototype.slice.call(arguments))
              , async = arguments[0]
              ;
            // There needs to be an assurance that an async job is
            // deferred (asynchronously) at least once! Theoretically,
            // since a developer might not expect stuff like an immediate
            // execution when calling an async method and since we have
            // side effects in javascript ASAP is just right.
            // Without side effects it would be better to wait and see
            // if an extra decoupling is needed (when there was no async
            // execution after resolving)
            // FIXME: Think about doing this smarter.
            if (!async)
                return state.execute();
            setTimeout(state.execute.bind(state), 0)
            return state.promise;
        }
    }
    return {
        factory: executionEnvironmentFactory
      , Argument: Argument
      , DependencyGraphError: DependencyGraphError
    }
});
