define([
    'metapolator/errors'
], function(
    errors
) {
    "use strict";
    
    /**
     * StyleDict a interface to a List of CPS.Rule elements.
     * This is returned by the getComputedStyle function of the
     * selector engine (currently located in ParameterCollection)
     */
     
    function StyleDict(parameterRegistry, rules, element) {
        this._rules = rules;
        this._element = element;
        // global registry for all known parameter names
        this._parameterRegistry = parameterRegistry;
    }
    
    var _p = StyleDict.prototype;
    _p.constructor = StyleDict;
    
    /**
     * get a value instance for the element
     */
    _p.get = function(name) {
        // this method could be a good fit for the element directly
        // or for a 'document' like structure that keeps some of the
        // state data separatet from the MOM elements. The latter would
        // make it possible to change the CPS without having to create
        // a new instance of the mom!
        
        var cpsValue, factory, result;
        cpsValue = this.getCPS(name);
        factory = cpsValue === undefined
            // Note: An element default value, if needed, should be defined
            // in a very unspecific rule in a very unspecific style
            // (i.e.: global.css)
            // The global parameter default must always be available:
            ? this._parameterRegistry.getDefaultFactory(name)
            : cpsValue.factory
            ;
        
        // this is a caching mechanism, this might be harmful, because we
        // create a cache that needs invalidation from time to time.
        // Not caching the value means that we get a different instance
        // for each call to this function, not good either. Maybe the
        // position of the cache could change.
        if(!(name in this._element._parameterInstances)) {
            result = factory(name, this._element, this.getCPSValueAPI.bind(this));
            this._element._parameterInstances[name] = result;
            return result;
        }
        
        return this._element._parameterInstances[name];
    }
    
    _p.getCPSValueAPI = function(name) {
        var result;
        if(this._parameterRegistry.exists(name))
            // the local value wins over any refernced entry from @dictionary
            result = this.get(name);
        
        return result;
    }
    
    
    /**
     *  get a cps ParameterValue from the _rules
     */
    _p.getCPS = function(name) {
        var i=0, value;
        if(!this._parameterRegistry.exists(name))
            throw new errors.Key('Name "'+ name + '" is no known parameter, '
                +'it must be registered before you can use it.');
        for(;i<this._rules.length;i++) {
            try {
                value = this._rules[i].parameters.get(name);
            }
            catch(error) {
                if(!(error instanceof errors.Key))
                    throw error;
                // pass, the name is not in the rule
                continue;
            }
            if(!value.invalid)
                return value;
        }
    }
    
    return StyleDict;
})
