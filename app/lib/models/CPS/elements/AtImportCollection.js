define([
    'metapolator/errors'
  , './ParameterCollection'
  , './_Node'
  , 'obtain/obtain'
], function(
    errors
  , Parent
  , GrandParent
  , obtain
) {
    "use strict";
    var CPSError = errors.CPS;
    /**
     * Essentially a proxy for the ParameterCollection intance it references.
     *
     * The serialization results in an @import Rule, not in the actual
     * cps that the parameterCollection would produce, but we can still
     * use it as if it was the parameterCollection directly.
     *
     * Most importantly, the "rules" getter is proxied.
     *
     * Use `setResource` to initialize this object.
     *
     */
    function AtImportCollection(ruleController, source, lineNo) {
        GrandParent.call(this, source, lineNo);// setup the emitter
        this._selectorList = null;
        this._name = null;
        this.name = 'import';
        this._resourceName = null;
        this._reference = null;
        this._ruleController = ruleController;
    }
    var _p = AtImportCollection.prototype = Object.create(Parent.prototype);
    _p.constructor = AtImportCollection;

    function _makeProxyForProperty(name, description) {
        var proxy = {};
        proxy.enumerable = description.enumerable;
        proxy.configurable = description.configurable;
        if('value' in description) {
            if(typeof description === 'function') {
                // proxy call
                proxy.value = function() {
                    this._reference[0][name].apply(this._reference[0], arguments);
                };
            }
            else {
                // simple getter
                proxy.get = function() {
                    return this._reference[0][name];
                };
                // simple setter
                proxy.set = function(value) {
                    this._reference[0][name] = value;
                };
            }
        }
        else {
            if('get' in description) {
                // simple getter
                proxy.get = function() {
                    return this._reference[0][name];
                };
            }
            if('set' in description) {
                // proxy setter
                proxy.set = function(value) {
                    this._reference[0][name] = value;
                };
            }
        }
        if(!('set' in proxy))
            proxy.writable = description.writable;

        return proxy;
    }

    _p._proxyEventHandler = function(data, channelName, eventData) {
        this._trigger(channelName, eventData);
    }
    /**
     * Use the public method "setResource" rather than this.
     *
     * parameterCollection: the instance of the ParameterCollection that
     * is loaded for resourceName.
     *
     * parameterCollection is returned from this._ruleController.getRule
     */
    _p._setResource = function(resourceName, parameterCollection) {
        // assert(!parameterCollection.invalid); <= should be valid, it's from ruleController
        if(this._reference) {
            if(this._reference[0] === parameterCollection)
                return;
            this._reference[0].off(this._reference[1]);
        }

        // assert(this._resourceName !== resourceName) <= that would be a flaw in the logic somewhere
        this._resourceName = resourceName;

        // NOTE: We should subscribe on all this._reference events and
        // proxy them. At the moment, however, ParameterCollection will
        // only trigger 'structural-change', so this is it.
        this._reference = [
            parameterCollection
          , parameterCollection.on('structural-change', [this, '_proxyEventHandler'])
        ];
        this._trigger(['resource-change', 'structural-change']);
    };

    _p._getRule = function(async, resourceName) {
        return this._ruleController.getRule(async, resourceName);
    };
    /**
     * A lot of errors can happen here but we won't handle them!
     * As a last resort we can present the user what actually happened
     * but that is not happening here.
     *
     * async: the first argument, this is a obatainJS interface
     *
     * resourceName: the resource name of the @import rule
     * in `@import "bold.cps";` "bold.cps" is the resourceName
     */
    _p.setResource = obtain.factory(
        {
            parameterCollection:[false, 'resourceName', _p._getRule]
        }
      , {
            parameterCollection:[true, 'resourceName', _p._getRule]
        }
      , ['resourceName']
      , function(obtain, resourceName) {
            var parameterCollection = obtain('parameterCollection');
            this._setResource(resourceName, parameterCollection);
            return true;
        }
    );

    _p.toString = function() {
        return '@import "' + this.resourceName + '";';
    };

    Object.defineProperty(_p, 'invalid', {
        get: function() {
            return (!this._reference || this._reference[0].invalid);
        }
    });

    Object.defineProperty(_p, 'resourceName', {
        get: function(){ return this._resourceName; }
      , enumerable: true
    });

    // create some proxy properties
    (function(_p, parent) {
        var names = Object.getOwnPropertyNames(parent), i, l
          , name, description, proxyDescription
          ;
        for(i=0,l=names.length;i<l;i++) {
            name = names[i];
            // FIXME: a whitelist may be better
            // currently we make proxies for:
            // reset, items, length, rules, splice
            // reset should maybe throw an error
            if(     // only public interfaces
                    name[0] === '_'
                    // use the inherited name getter/setter
                    || name === 'name'
                    // only interfaces that are not ownProperties of this prototype
                    // so inherited stuff will be overidden
                    || _p.hasOwnProperty(name))
                continue;
            description = Object.getOwnPropertyDescriptor(parent, name);
            proxyDescription = _makeProxyForProperty(name, description);
            Object.defineProperty(_p, name, proxyDescription);
        }
    })(_p, Parent.prototype);

    return AtImportCollection;
});
