define([
    'metapolator/errors'
], function(
    errors
) {
    "use strict";
    
    /**
     * StyleDict a interface to a List of CPS.Rule elements.
     * This is returned by the getComputedStyle function of the
     * selector engine (currently located in ParameterCollection)
     */
     
    function StyleDict(parameterRegistry, rules, element) {
        this._rules = rules;
        this._MOMelement = element;
        // global registry for all known parameter names
        this._parameterRegistry = parameterRegistry;
    }
    
    var _p = StyleDict.prototype;
    _p.constructor = StyleDict;
    
    /**
     * get a value instance for the element
     */
    _p.get = function(name, element) {
        // this method would be a good fit for the element directly
        // or for a 'document' like structure that keeps some of the
        // state data separatet from the MOM elements. The latter would
        // make it possible to change the CPS without having to create
        // a new instance of the mom!
        
        var cpsValue, factory;
        console.log('getting parameter value instance for ' + name + ' of ' + element);
        // we need access to the element tree, because we might have to
        // query the tree for other elements.
        // There, the same thing could happen ... this might be a good
        // position to check for infinite recursion loops.
        // or! we could even try to build this in here in a while loop,
        // so everything is in the dame place.
        
        
        // ??? got to be stored somewhere with reference to the element
        // noo, lets recreate it every time until there is a place made
        // to do so! I'm not kidding
        // the value should be equivalent for this element, unless the
        // cps changes, so a cache is nice but means I'd have to manage
        // another structure.
        
        cpsValue = this.getCPS(name);
        factory = cpsValue
            ? cpsValue.factory
            // Note: An element default value, if needed, should be defined
            // in a very unspecific rule in a very unspecific style
            // (i.e.: global.css)
            // The global parameter default must always be available:
            : this._parameterRegistry.getDefaultFactory(name)
            ;
        // not caching the value means that we get a different instance
        // for each call to this function! this should change, I think,
        errors.warn('StyleDict.get: cache this somewhere');
        return factory(name, element);
        // let's build a cache here, although this might be harmful!
        // if(!(name in element._parameterInstances)) {
        //     
        //     valueInstance = 
        //     element._parameterInstances[name] = valueInstance;
        // }
        // return element._parameterInstances[name];
    }
    
    /**
     *  get a cps ParameterValue from the _rules
     */
    _p.getCPS = function(name) {
        var i=0, value;
        if(!this._parameterRegistry.exists(name))
            throw new errors.Key('Name "" '+ name + '" is no known parameter.');
        for(;i<this._rules.length;i++) {
            try {
                value = this._rules[i].parameters.get(name);
                if(!value.invalid)
                    return value;
                console.log('invalid: ', value.message)
            }
            catch(error) {
                if(!(error instanceof errors.Key))
                    throw error;
                // pass, the name is not in the rule
            }
        }
    }
    
    return StyleDict;
})
