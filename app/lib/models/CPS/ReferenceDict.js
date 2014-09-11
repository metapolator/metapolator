define([
    'metapolator/errors'
], function(
    errors
) {
    "use strict";

    var KeyError = errors.Key;

    /**
     * ReferenceDict is an interface to the items referenced by @dictionary
     * rules.
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
     * Get a CPS @dictionary ParameterValue from the _rules for name;
     * Raises KeyError if name was not found.
     */
    _p._getCPSParameterValue = function(name) {
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
    };

    /**
     * Returns a CPSDictionaryEntry instance or raises KeyError
     */
    _p._getParameter = function(name) {
        var cpsParameterValue = this._getCPSParameterValue(name);
        if(cpsParameterValue === null)
            throw new CPSKeyNotFoundError(name);
        return cpsParameterValue.factory(
            name, this._element,
            this._controller.getComputedStyle(this._element).getAPI
        );
    };

    /**
     * Returns the the value of an @dictionary parameter or raises KeyError
     *
     * This caches the result of this._getParameter which might become
     * problematic, because we'll have to invalidate the cached values.
     * If that proves to be hard, we should maybe skip the caching first
     * and see later how to make cache invalidation possible.
     * Styledict has a similar situation in its getParameter method.
     */
    _p.get = function(name) {
        if(!(name in this._cache))
            this._cache[name] = this._getParameter(name);
        return this._cache[name]
                // using get value to at least remind me why I had
                // the instance cached,not the result of the parameter
                // calculation
                .getValue();
    };

    return ReferenceDict;
});
