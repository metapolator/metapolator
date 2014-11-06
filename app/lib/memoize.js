define(['metapolator/errors'], function(errors) {
    "use strict";

    // _cache is a state variable of this module. It's a single WeakMap
    // to manage all caches on a per-instance basis.
    var  _cache = new WeakMap();

    /**
     * Set up a cache for a method of an instance. The cache is bound to
     * the instance that is used to call the method.
     *
     * namespace: A string to avoid conflicts between caches
     *            on the same instance.
     *
     * func: The function whose results are being cached.
     *
     * keyFunc: function or undefined; is called with all the arguments
     *          that are applied to "func" and returns a unique key for the
     *          combination of arguments. If func is undefined, the default
     *          behavior is: listOfArguments.join(',')
     *
     * Example:
     * // query will be cached on a per instance base.
     * Constructor = function(){}
     * Constructor.prototype.query = memoize('query', function(queryArg){...});
     * Constructor.prototype.search = memoize('search', function(searchArg){...});
     * Constructor.prototype.prune = memoize.prune;
     *
     * var instance = new Constructor();
     * instance.query('something');
     * instance.search('topic');
     *
     * // delete only the caches for the namespace 'search'
     * instance.prune('search');
     * // delete all caches for instance
     * instance.prune();
     * // if you delete all references to instance the cache will be gone to
     * delete instance;
     *
     */
    function memoize(namespace, func, keyFunc) {
        errors.assert(namespace !== undefined, 'Please set a namespace.');
        function cached() {
            /*jshint validthis:true */
            var instanceCache
              , namespaceCache
              , args = Array.prototype.slice.call(arguments)
              , key = keyFunc
                    ? keyFunc.apply(this, args)
                    : args.join(',')
              ;
            instanceCache = _cache.get(this);
            if(instanceCache === undefined) {
                instanceCache = Object.create(null);
                _cache.set(this, instanceCache);
            }

            namespaceCache = instanceCache[namespace];
            if(namespaceCache === undefined)
                namespaceCache = instanceCache[namespace] = Object.create(null);

            if(!(key in namespaceCache))
                namespaceCache[key] = func.apply(this, args);
            return namespaceCache[key];
        }
        return cached;
    }

    /**
     * Delete all cache entries for the cache at "namespace"
     * If "namespace" is `undefined` all caches for the instance are deleted.
     *
     * Call this method so that its "this" refers to the instance that
     * is associated with the cache:
     *     SO: memoize.prune.call(instance, 'queries');
     *  OR SO: instance.prune = memoize.prune;
     *         instance.prune('queries');
     *  OR SO: Constructor.prototype.prune = memoize.prune;
     *         instance = new Constructor();
     *         instance.prune('queries');
     */
    function prune(namespace) {
        /*jshint validthis:true */
        var cache;
        errors.assert(this !== memoize, 'You have to call this method '
                                    + 'from an apropriate host. Currently '
                                    + '"this" is the memoize module.');
        if(namespace === undefined)
            return _cache['delete'](this);
        cache = _cache.get(this);
        if(cache)
            delete cache[namespace];
    }
    memoize.prune = prune;

    return memoize;
});
