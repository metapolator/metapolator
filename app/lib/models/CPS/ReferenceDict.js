define([
    'metapolator/errors'
  , './_CPSDict'
], function(
    errors
  , Parent
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
        Parent.apply(this, arguments);
    }

    var _p = ReferenceDict.prototype = Object.create(Parent.prototype);
    _p.constructor = ReferenceDict;

    _p._buildIndex = function() {
        var i=0, j, keys, key;
        this._dict = Object.create(null);
        for(;i<this._rules.length;i++) {
            keys = this._rules[i].parameters.keys();
            for(j=0; j<keys.length; j++) {
                key = keys[j];
                if(!(key in this._dict))
                    this._dict[key] = this._rules[i].parameters.get(key);
            }
        }
    };

    /**
     * Get a CPS @dictionary ParameterValue from the _rules for name;
     * Raises KeyError if name was not found.
     */
    _p._getCPSParameterValue = function(name) {
        if(!this._dict) this._buildIndex();
        if(name in this._dict)
            return this._dict[name];
        throw new KeyError('Not found CPS @dictionary reference "'+ name+'" for: '
            + this._element.particulars);
    };

    /**
     * Returns a CPSDictionaryEntry instance or raises KeyError
     */
    _p._getParameter = function(name) {
        var cpsParameterValue = this._getCPSParameterValue(name);
        return cpsParameterValue.factory(
            name, this._element,
            this._controller.getComputedStyle(this._element).getAPI
        );
    };

    /**
     * Returns the the value of an @dictionary parameter or raises KeyError
     */
    _p.get = function(name) {
        return this._getParameter(name).getValue();
    };

    return ReferenceDict;
});
