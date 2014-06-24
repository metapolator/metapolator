define([
    'metapolator/errors'
], function(
    errors
) {
    "use strict";
    /**
     * global global registry for all known parameter names
     */
    function Registry() {
        this._parameters = {};
        
        // fixme: eventually data types should be registered dynamically,
        // too. So that we could load them as plugins if needed.
        // I'm not doing this yet, because I wan't to design the plugin
        // interface later
        this._dataTypes = {
            
            
            // types will have to parse cps and return instances
            
            // types may recognize that the cps is invalid, this could
            // hapen way earlier than when creating the instance.
            // thus the idea of factories.
            string: {
                init: function(parameterValue, setFactoryAPI, setInvalidAPI) {
                    console.log('string: checking parameterValue, returning a factory')
                    // parse here ... parameterValue
                    var invalidParamter = false;
                    // do this if the parameter is bad:
                    if(invalidParamter) {
                        setInvalidAPI('The Parameter does not look like a string');
                        return;
                    }
                    //else
                    setFactoryAPI(function(element) {
                        console.log('factory for the CPS String-Type');
                        return parameterValue.toString();
                    });
                }
              , defaultFactory: function() {
                    return function() { return '-- default string --'; }
                }
            }
        };
    }
    var _p = Registry.prototype;// = Object.create(Parent.prototype)
    _p.constructor = Registry;
    
    
    _p.exists = function(name) {
        console.log('Registry exists:', name);
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
        
        console.log('Registry register:', name, ' with type ', parameterDescription.type);
        this._parameters[name] = parameterDescription;
    }
    
    return Registry;
})
