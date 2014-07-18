define([
    './_Node'
], function(
    Parent
) {
    "use strict";
    /**
     * Any Combinator in the CPS is part of a ComplexSelector.
     */
    function Combinator(value, source, lineNo) {
        Parent.call(this, source, lineNo);
        this._value = value;
    }
    var _p = Combinator.prototype = Object.create(Parent.prototype)
    _p.constructor = Combinator;
    
    _p.toString = function() {
        if(this._value === ' ')
            return this._value;
        return ' ' + this._value + ' ';
    }
    
    _p._types = {
        '>': 'child'
      , ' ': 'descendant'
      , '+': 'next-sibling'
      , '~': 'following-sibling'
    }
    
    Object.defineProperty(_p, 'type', {
        get: function(){ return this._types[this._value] || 'unknown'; }
    })
    
    Object.defineProperty(_p, 'value', {
        get: function(){ return this._value; }
    })
    
    return Combinator;
})
