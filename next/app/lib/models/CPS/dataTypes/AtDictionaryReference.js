define([

], function(

) {
    "use strict";
    function AtDictionaryEntry(selector, parameters) {
        Object.defineProperty(this, 'selector', {
            value: selector
          , enumerable: true
        })
        Object.defineProperty(this, 'parameters', {
            get: function(){ return parameters.slice();}
          , enumerable: true
        })
    }
    
    var _p = AtDictionaryEntry.prototype;
    _p.constructor = AtDictionaryEntry;
    
    return AtDictionaryEntry;
});
