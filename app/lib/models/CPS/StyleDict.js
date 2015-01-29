define([
    'metapolator/errors'
  , './_CPSDict'
  , './cpsGetters'
  , 'metapolator/memoize'
], function(
    errors
  , Parent
  , cpsGetters
  , memoize
) {
    "use strict";

    var KeyError = errors.Key
      , CPSKeyError = errors.CPSKey
      , CPSRecursionError = errors.CPSRecursion
      ;

    /**
     * StyleDict is an interface to a List of CPS.Rule elements.
     */
    function StyleDict(controller, rules, element) {
        Parent.apply(this, arguments);

        // FIXME: can we measure if bind or self plus closure is faster
        // this.get.bind(this);
        var self = this;
        this.getAPI = function(name){ return self.get(name);}

        this._getting = {};

        this._cache = Object.create(null);
    }

    var _p = StyleDict.prototype = Object.create(Parent.prototype);
    _p.constructor = StyleDict;

    /**
     * Get a cps ParameterValue from the _rules
     * This is needed to construct the instance of the Parameter Type.
     * Returns Null if the name is not defined.
     */
    _p._getCPSParameterValue = function(name) {
        if(!this._dict) this._buildIndex();
        return (name in this._dict) ? this._dict[name] : null;
    };

    /**
     * Return a new instance of ParameterValue or null if the name is not defined.
     */
    _p._getParameter = function(name) {
        var cpsParameterValue = this._getCPSParameterValue(name);
        if(cpsParameterValue === null)
            return null;
        return cpsParameterValue.factory(name, this._element, this.getAPI);
    };

    _p.__get = function(name, errors) {
        var param = this._getParameter(name);
        if(param)
           return param.getValue();
        errors.push(name + ' not found for ' + this._element.particulars);
        return cpsGetters.whitelist(this._element, name);
    }
    /**
     * Look up a parameter in this._element according to the following
     * rules:
     *
     * 1. If `name' is "this", return the MOM Element of this StyleDict
     * (this._element). We check "this" first so it can't be overridden by
     * a @dictionary rule.
     *
     * 2. If `name' is defiened in CPS its value is returned.
     *
     * 3. If name is available/whitelisted at this._element, return that value.
     *
     * 4. throw KeyError.
     *
     * If `name' is a registered parameter type, the return value's type is
     * the parameter type or an error will be thrown;
     * Otherwise, the return value may be anything that is accessible
     * or constructable from CPS formulae, or a white-listed value on
     * any reachable element.
     */
    _p._get = function(name) {
        var errors = [];
        if(name === 'this')
            return this._element;

        // Detect recursion on this._element
        if(name in this._getting)
            throw new CPSRecursionError('Looking up "' + name
                            + '" is causing recursion in the element: '
                            + this._element.particulars);
        this._getting[name] = true;
        try {
            return this.__get(name, errors);
        }
        catch(error) {
            if(!(error instanceof KeyError))
                throw error;
            errors.push(error.message);
            throw new KeyError(errors.join('\n----\n'));
        }
        finally {
            delete this._getting[name];
        }
    };
    // FIXME: memoize seems to be slower, can we fix it?
    //_p.get = memoize('get', _p._get);
    _p.get = function(name) {
        var val = this._cache[name];
        if(val === undefined)
            this._cache[name] = val = this._get(name);
        return val;
    }

    return StyleDict;
});
