define([
    'metapolator/errors'
], function(
    errors
) {
    "use strict";
    
    var KeyError = errors.Key;
    
    /**
     * StyleDict is an interface to a List of CPS.Rule elements.
     * 
     * This is returned by the getComputedStyle function of 
     * metapolator/models/Controller
     */
    function StyleDict(controller, rules, element) {
        this._rules = rules;
        this._element = element;
        this._controller = controller;
        this._cache = {};
        this.CPSValueAPI = this.getCPSValue.bind(this)
    }
    
    var _p = StyleDict.prototype;
    _p.constructor = StyleDict;
    
    
    _p._get = function(name) {
        var cpsValue, factory, result;
        cpsValue = this.getCPS(name);
        factory = cpsValue === null
            // Note: An element default value, if needed, should be defined
            // in a very unspecific rule in a very unspecific style
            // (i.e.: global.css)
            // The global parameter default must always be available:
            ? this._controller.parameterRegistry.getDefaultFactory(name)
            : cpsValue.factory
            ;
        return factory(name, this._element, this.CPSValueAPI);
    }
    
    /**
     * get a value instance for the element
     * 
     * this method could be a good fit for the element directly
     * or for a 'document' like structure that keeps some of the
     * state data separatet from the MOM elements. The latter would
     * make it possible to change the CPS without having to create
     * a new instance of the mom!
     */
    _p.get = function(name) {
        // this is a caching mechanism, this might be harmful, because we
        // create a cache that needs invalidation from time to time.
        // Not caching the value means that we get a different instance
        // for each call to this function, not good either. Maybe the
        // position of the cache could change.
        if(!(name in this._cache))
            this._cache[name] = this._get(name);
        return this._cache[name];
    }
    
    _p.getCPSValue = function(name) {
        var value;
        if(this._controller.parameterRegistry.exists(name))
            // the name is a registered parameter, so it always has at
            // least a default value
            return this.get(name);
        
        
        // highly experimental!
        if(name[0]!=='_') {
            // now we can get for example parent via this api
            // but how can we get a value from it???
            // actually we can get anything from element ... 
            // when it shows that this is too much power, we might have
            // to define what's allowed here.
            value = this._element[name];
            if(!(typeof value in {'undefined': null, 'function': null})) {
                if(this._element.isMOMNode(value))
                    // when a value receives a function, it should call
                    // it with the next token
                    // if there is no next token, that value is invalid ...
                    return this._controller._getComputedStyle(value).CPSValueAPI
                // might be a lgitimate value or crap like a cosntructor, etc
                return value;
            }
        }
        value = undefined;
        // get the ReferenceDictionary for element
        try {
            value = this._controller
                            .getReferenceDictionary(this._element)
                            .get(name);
            return value;
        }
        catch(error) {
            if(error instanceof KeyError)
                throw new KeyError('Not found CPS Value "'+ name+'" for: '
                    + this._element.particulars + ' with message: '
                    + error, error.stack);
            throw error;
        }
    }
    
    /**
     *  get a cps ParameterValue from the _rules
     */
    _p.getCPS = function(name) {
        var i=0, value;
        if(!this._controller.parameterRegistry.exists(name))
            throw new KeyError('Name "'+ name + '" is no known parameter, '
                +'it must be registered before you can use it.');
        for(;i<this._rules.length;i++) {
            try {
                value = this._rules[i].parameters.get(name);
            }
            catch(error) {
                if(!(error instanceof KeyError))
                    throw error;
                // pass, the name is not in the rule
                continue;
            }
            if(!value.invalid)
                return value;
        }
        return null;
    }
    
    return StyleDict;
})
