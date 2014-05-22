define([
    './_Node'
], function(
    Parent
) {
    "use strict";
    /**
     * A selector
     * 
     * TODO: we will need to extract the meaning of the elements
     */
    function Selector(elements, source, lineNo) {
        Parent.call(this, source, lineNo);
        this._elements = elements;
    }
    var _p = Selector.prototype = Object.create(Parent.prototype)
    _p.constructor = Selector;
    
    _p.toString = function() {
        return this._elements.join('');
    }
    
    return Selector;
})
