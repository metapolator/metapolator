define([
    'metapolator/errors'
  , './dataTypes/CPSReal'
  , './dataTypes/CPSVector'
  , './dataTypes/CPSTransformation'
  , './dataTypes/CPSGeneric'
], function(
    errors
  , CPSReal
  , CPSVector
  , CPSTransformation
  , CPSGeneric
) {
    "use strict";
    /**
     * global registry for all known parameter names
     */
    function Registry() {
        this._parameters = {};

        // FIXME: eventually data types should be registered dynamically,
        // too. So that we could load them as plugins if needed.
        // I'm not doing this yet, because I want to design the plugin
        // interface later
        this._dataTypes = {
            // types will have to parse CPS and return instances
            // types may recognize that the CPS is invalid, this could
            // happen way earlier than when creating the instance.
            // thus the idea of factories.
            real: CPSReal.factory
          , vector: CPSVector.factory
          , transformation: CPSTransformation.factory
          , generic: CPSGeneric.factory
        };
    }
    var _p = Registry.prototype;// = Object.create(Parent.prototype)
    _p.constructor = Registry;


    _p.exists = function(name) {
        return name in this._parameters;
    };

    _p.getFactory = function(name, fallbackType /* optional string, default: 'generic'*/) {
        var description, type
          , _fallbackType = fallbackType === undefined ? 'generic' : fallbackType
          ;
        if(this.exists(name))
            type = this._parameters[name].type;
        else if(_fallbackType) {
            if(!(_fallbackType in this._dataTypes))
                throw new errors.CPSRegistryKey('Name "' + name + '" is no registered '
                        + 'parameter and fallback-type "' + _fallbackType + '" is no known type');
            type = _fallbackType;
        }
        else
            throw new errors.CPSRegistryKey('Name "' + name + '" is no registered parameter');
         return this._dataTypes[type];
    };

    _p.register = function(name, parameterDescription) {
        if(this.exists(name))
            throw new errors.CPSRegistryKey('Name "'+name+'" already registered.');

        if(!(parameterDescription.type in this._dataTypes))
            throw new errors.CPSRegistryKey('Type "'
                +parameterDescription.type+'" for parameter "'+name
                +'" is unkown.');

        this._parameters[name] = parameterDescription;
    };

    return Registry;
});
