define([
    './_Node'
], function(
    Parent
) {
    "use strict";
    /**
     * The value of a Parameter.
     * 
     * TODO: the value needs to be examined, we need a canonical version
     * of it. Otherwise one effect is, that we add too much whitespace
     * when serializing with toString (because we don't remove whitespace
     * when extracting the comments)
     * This will probably happen when we start to really process the values.
     */
    function ParameterValue(value, comments ,source, lineNo){
        Parent.call(this, source, lineNo);
        
        this._value = value;
        this._comments = comments;
    }
    var _p = ParameterValue.prototype = Object.create(Parent.prototype)
    _p.constructor = ParameterValue;
    
    /**
     * Prints all comments before the value.
     */
    _p.toString = function() {
        return [this._comments.join('\n'),
                this._comments.length ? ' ': '',
                this._value.join('')].join('');
    }
    
    return ParameterValue;
})
