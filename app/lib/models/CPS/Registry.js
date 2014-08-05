define([
    'metapolator/errors'
  , './dataTypes/simpleTypes'
  , './dataTypes/compoundRealCPSFactory'
  , './dataTypes/compoundVectorCPSFactory'
], function(
    errors
  , simpleTypes
  , compoundReal
  , compoundVector
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
            string: simpleTypes.string
          , real: simpleTypes.real
          , vector: simpleTypes.vector
          , compoundReal: compoundReal
          , compoundVector: compoundVector
        };
    }
    var _p = Registry.prototype;// = Object.create(Parent.prototype)
    _p.constructor = Registry;


    _p.exists = function(name) {
        return name in this._parameters;
    }

    _p.getTypeDefinition = function(name) {
        var description;
        if(!this.exists(name))
            throw new errors.CPSRegistryKey('Name "' + name + '" is no registered parameter');
        description = this._parameters[name];
        return this._dataTypes[description.type];
    }

    _p.getDefaultFactory = function(name) {
        var description;
        if(!this.exists(name))
            throw new errors.CPSRegistryKey('Name "' + name + '" is no registered parameter');
        description = this._parameters[name];
        return this._dataTypes[description.type].defaultFactory;
    }

    _p.register = function(name, parameterDescription) {
        if(this.exists(name))
            throw new errors.CPSRegistryKey('Name "'+name+'" already registered.');

        if(!(parameterDescription.type in this._dataTypes))
            throw new errors.CPSRegistryKey('Type "'
                +parameterDescription.type+'" for parameter "'+name
                +'" is unkown.');

        this._parameters[name] = parameterDescription;
    }

    return Registry;
})
