define([
    'metapolator/errors'
  , './cpsGetters'
], function(
    errors
  , cpsGetters
) {
    "use strict";

    var KeyError = errors.Key
      , CPSKeyError = errors.CPSKey
      , CPSRecursionError = errors.CPSRecursion
      ;

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
        this.getAPI = this.get.bind(this);
        this._getting = {};
    }

    var _p = StyleDict.prototype;
    _p.constructor = StyleDict;

    /**
     * Get a cps ParameterValue from the _rules
     * This is needed to construct the instance of the Parameter Type.
     *
     * Raises KeyError if name is not in this._controller.parameterRegistry.
     */
    _p._getCPSParameterValue = function(name) {
        var i=0, value;
        if(!this._controller.parameterRegistry.exists(name))
            throw new KeyError('No such parameter "'+ name +'" '
                +'has been registered.');
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
    };

    /**
     * Returns a new ParameterValue instance
     * Raises KeyError if name is not registered in the parameterRegistry
     * of the controller.
     * Raises CPSKeyError if there is no entry for name in CPS.
     * The CPSKeyError may be used to create a cascading system
     * of StyleDict interfaces.
     *
     */
    _p._getParameter = function(name) {
        var cpsParameterValue = this._getCPSParameterValue(name);
        if(cpsParameterValue === null)
            throw new CPSKeyError(name);
        return cpsParameterValue.factory(name, this._element, this.getAPI);
    };

    /**
     * Look up a parameter in this._element according to the following
     * rules:
     *
     * 1. If `name' is "this", return the MOM Element of this StyleDict
     * (this._element). We check "this" first so it can't be overridden by
     * a @dictionary rule.
     *
     * 2. If `name' is a registered parameter name, look it up. If this
     * fails, throw CPSKeyError.
     *
     * 3. Look up `name' in the @dictionary rules for this element.
     *
     * 4. Look up `name' in the element itself. If this fails, throw
     * KeyError.
     *
     * If `name' is a registered parameter type, the return value's type is
     * the parameter type; otherwise, the return value may be anything that
     * is accessible or constructable from CPS formulae, or a white-listed
     * value on any reachable element.
     */
    _p.get = function(name) {
        if(name === 'this')
            return this._element;

        // Detect recursion on this._element
        if(name in this._getting)
            throw new CPSRecursionError('Looking up "' + name
                            + '" is causing recursion in the element: '
                            + this._element.particulars);
        this._getting[name] = true;
        try {
            if(this._controller.parameterRegistry.exists(name))
                // Will throw CPSKeyError if not found.
                return this._getParameter(name).getValue();

            try {
                return this._controller
                       .getReferenceDictionary(this._element)
                       .get(name);
            }
            catch(error) {
                if(!(error instanceof KeyError))
                    throw error;
            }
            // Will throw KeyError if not found
            return cpsGetters.whitelist(this._element, name);
        }
        finally {
            delete this._getting[name];
        }
    }

    return StyleDict;
});
