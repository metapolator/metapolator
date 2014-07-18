define([

], function(

) {
    "use strict";
    function AtDictionaryEntry(selector, parameter, properties) {
        Object.defineProperty(this, 'selector', {
            value: selector
          , enumerable: true
        })
        
        Object.defineProperty(this, 'parameter', {
            value: parameter
          , enumerable: true
        })
        
        Object.defineProperty(this, 'properties', {
            get: function(){ return properties.slice();}
          , enumerable: true
        })
    }
    
    var _p = AtDictionaryEntry.prototype;
    _p.constructor = AtDictionaryEntry;
    
    return AtDictionaryEntry;
});
