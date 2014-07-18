define([
    'metapolator/errors'
], function(
    errors
) {
    "use strict";
    
    var KeyError = errors.Key;
    
    /**
     * ReferenceDict is an interface to the items referenced by @dictionary
     * rules
     * 
     * This is returned by the getReferenceDictionary function of
     * metapolator/models/Controller.
     */
    function ReferenceDict(controller, rules, element) {
        this._rules = rules;
        this._element = element;
        this._controller = controller;
        this._cache = {};
    }
    
    var _p = ReferenceDict.prototype;
    _p.constructor = ReferenceDict;
    
    
    /**
     * Returns an instance of AtDictionaryReference; Throws a KeyError
     * if the name is not found.
     * 
     * The result is intentionally not cached, because this will need
     * invalidation when a lot of other things change. I'd start caching
     * when we can control invalidation better.
     */
    _p.getReference = function(name) {
        var cpsValue;
        cpsValue = this.getCPS(name);
        if(!cpsValue)
            return null;
        return cpsValue.factory(name, this._element);
    }
    
    /**
     * Returns the value referenced by the AtDictionaryReference which is
     * returned by getReference.
     * If the value can't be found, throws a KeyError
     * 
     * If the selector of the refernce selects more than one value,
     * the first element of that set is taken. This uses the query method
     * of selctor engine.
     */
    _p.get = function(name) {
        var reference = this.getReference(name)
          , properties = reference.properties
          , element
          , dict
          , val
          , i = 0
        element = this._controller.query(reference.selector);
        if(element === null)
            throw new KeyError('No element for reference "' + reference.selector
                +'" found.');
        var dict = this._controller.getComputedStyle(element);
        // will raise KeyError if properties[0] is no registered parameter
        // name
        val = dict.get(reference.parameter);
        for(;i<properties.length;i++)
            val = val[properties[i]];
        return val;
    }
    
    /**
     *  get a CPS @dictionary entry ParameterValue from the _rules
     */
    _p.getCPS = function(name) {
        var i=0, value;
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
        throw new KeyError('Not found CPS @dictionary reference "'+ name+'" for: '
            + this._element.particulars);
    }
    
    return ReferenceDict;
})
