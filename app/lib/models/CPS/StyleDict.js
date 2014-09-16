define([
    'metapolator/errors'
  , './cpsGetters'
], function(
    errors
  , cpsGetters
) {
    "use strict";

    var KeyError = errors.Key
      , CPSKeyNotFoundError = errors.CPSKeyNotFound
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
            throw new KeyError('Name "'+ name +'" is no known parameter, '
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
    };

    /**
     * Returns a new ParameterValue instance
     * Raises KeyError if name is not registered in the parameterRegistry
     * of the controller.
     * Raises CPSKeyNotFoundError if there is no entry for name in CPS.
     * The CPSKeyNotFoundError may be used to create a cascading system
     * of StyleDict interfaces.
     *
     */
    _p._getParameter = function(name) {
        var cpsParameterValue = this._getCPSParameterValue(name);
        if(cpsParameterValue === null)
            throw new CPSKeyNotFoundError(name);
        return cpsParameterValue.factory(name, this._element, this.getAPI);
    };

    /**
     * Return the value of a ParameterValue instance.
     * Raises KeyError and CPSKeyNotFoundError, see this._getParameter
     * for a description.
     *
     * This used to cache the result of this._getParameter but we decided
     * to drop that behavior. Now the instance of the ParameterValue
     * is rebuild every time (currently either a CPSVector or a CPSReal)
     */
    _p.getParameter = function(name) {
        return this._getParameter(name).getValue();
    };

    /**
     * Return a value for this._element if name is a registered parameter
     * type the return value type is checked according to the parameter
     * type.
     *
     * ALso, as an exception: "this" will always return the MOM Element
     * of this StyleDict (return this._element).
     *
     * If name is not a registered parameter type the @dictionary rules for
     * this element is are queried.
     *
     * If name is not an @dictionary parameter, it is queried on element
     * itself.
     *
     * If name is not a registered parameter type, the return value may be
     * anything that is accessible or constructable from CPSformulae and
     * also a white-listed value on any reachable element.
     *
     * This API tries three sources of data:
     *    if name is a registered Parameter name
     *          this.getParameter(name); // raises CPSKeyNotFoundError if not defined
     *    else
     *          1. ReferenceDictionary: this._controller
     *                                .getReferenceDictionary(this._element)
     *                                .get(name);
     *          2. this._element[name] // needs proper whitelisting
     *
     * If name is a registered parameter name and it is not found
     * CPSKeyNotFoundError is thrown.
     * If name is not a registered parameter and it is not found,
     * KeyError is thrown.
     *
     * We can use the CPSKeyNotFoundError to search for the next parameter
     * value source and the KeyError to inform the user that an unknown name
     * was used.
     */
    _p.get = function(name) {
        // "this" is not defined for cpsGetters.whiteList,
        // because I want "this" to be not overridable by @dictionary.
        // thus it's queried first. Also it would be possible to define
        // this as a CPSParameter, so we could get it via this.getParameter.
        if(name === 'this')
            return this._element;

        if(this._controller.parameterRegistry.exists(name))
            // The name is a registered parameter, so we always know
            // its type and purpose.
            // This raises CPSKeyNotFoundError to indicate that the next
            // layer of a parameter source may take over.
            // Default values are not part of the parameter definition
            // anymore we'll have to define our default values with CPS if
            // we need any.
            return this.getParameter(name);

        // @dictionary values can be used to override in-element-lookups
        // get the ReferenceDictionary for element
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
    };

    return StyleDict;
});
