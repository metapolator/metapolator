define([
    'metapolator/errors'
  , './ParameterCollection'
  , 'es6/Proxy'
], function(
    errors
  , Parent
  , Proxy
) {
    "use strict";
    var CPSError = errors.CPS;
    /**
     * Essentially a proxy for the parameterCollection argument. But
     * we can define new properties or override existing ones. And we have
     * a new type.
     *
     * Even though the Constructor returns not it's own `this` value,
     * instead a Proxy of it, we can still test its type:
     *         instanceof ParameterCollection === true
     *         instanceof AtImportCollection === true
     *
     * The serialization results in an @import Rule, not in the actual
     * cps that the parameterCollection would produce, but we can still
     * use it as if it was the parameterCollection directly.
     *
     * ResourceName: the resource name of the @import rule
     * in `@import "bold.cps";` "bold.cps" is the resourceName
     *
     * parameterCollection: the instance of the ParameterCollection that
     * is loaded for resourceName.
     */
    function AtImportCollection(resourceName, parameterCollection) {
        this._resourceName = resourceName;
        var proxy = new Proxy(this, new ProxyHandler(parameterCollection));
        return proxy;
    }
    var _p = AtImportCollection.prototype = Object.create(Parent.prototype);
    AtImportCollection.prototype.constructor = AtImportCollection;

    function ProxyHandler(reference) {
        this._reference = reference;
        this.get = _get;
    }

    function _get(target, name, receiver) {
        if(_p.hasOwnProperty(name) || target.hasOwnProperty(name))
            return target[name];
        return this._reference[name];
    }

    _p.toString = function() {
        return '@import "' + this.resourceName + '";';
    };

    Object.defineProperty(_p, 'resourceName', {
        get: function(){ return this._resourceName; }
      , enumerable: true
    });

    return AtImportCollection;
});
