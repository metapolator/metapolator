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
        this._cache = {};
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
     * Returns a ParameterValue instance
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
     * This caches the result of this._getParameter which might become
     * problematic, because we'll have to invalidate the cached values.
     * If that proves to be hard, we should maybe skip the caching first
     * and see later how to make cache invalidation possible.
     * Not caching the value means that we get a different instance
     * for each call to this function, not perfect either.
     * ReferenceDict has a similar situation in its get method.
     */
    _p.getParameter = function(name) {
        // this is a caching mechanism, this might be harmful, because we
        // create a cache that needs invalidation from time to time.
        //  Maybe the
        // position of the cache could change?
        if(!(name in this._cache))
            this._cache[name] = this._getParameter(name);
        return this._cache[name]
                // using get value to at least remind me why I had
                // the instance cached,not the result of the parameter
                // calculation
                .getValue();
    };

    /**
     * Return a value for this._element if name is a registered parameter
     * type the return value type is checked according to the parameter
     * type.
     *
     * ALso, as an exception: "this" will always return the MOM Element
     * of this StyleDict (return this._element).
     *
     * If name is no registered parameter type the @dictionary rules for
     * this element is are queried.
     *
     * If name is not an @dictionary parameter, it is queried on element
     * itself.
     *
     * If name is no registered parameter type, the return value may be
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
     *          2. this._element[name] // needs propper whitelisting
     *
     * If name is a registered parameter name and it is not found
     * CPSKeyNotFoundError is thrown.
     * If name is not a registered parameter and it is not found,
     * KeyError is thrown.
     *
     * We can use the CPSKeyNotFoundError to search the next parameter
     * value source and the KeyError to inform the user that an unkown name
     * was used.
     */
    _p.get = function(name) {
        // "this" is not defined for cpsGetters.whiteList,
        // because I want "this" to be not overridable by @dictionary.
        // thus it's querried first. Also it would be possibe to define
        // this as a CPSParameter, so we could get it via this.getParameter.
        if(name === 'this')
            return this._element;

        if(this._controller.parameterRegistry.exists(name))
            // The name is a registered parameter, so we always know
            // it's type and purpose.
            // This raises CPSKeyNotFoundError to indicate that the next
            // layer of a parameter source may take over.
            // Default values are not part of the parameter definition
            // anymore we'll have to define our default values with CPS if
            // we need any.
            return this.getParameter(name);

        // @dictionary values can be used to overshadow in-element-lookups
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
