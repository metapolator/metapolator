define([
    './_Node'
], function(
    Parent
) {
    "use strict";
    /**
     * The name of a Parameter.
     */
    function ParameterName(name, comments ,source, lineNo) {
        Parent.call(this, source, lineNo);
        this._name = name;
        this._comments = comments;
    }
    var _p = ParameterName.prototype = Object.create(Parent.prototype)
    _p.constructor = ParameterName;
    
    Object.defineProperty(_p, 'name', {
        get: function(){ return this._name; }
    })
    
    /**
     * Prints all comments after the name.
     */
    _p.toString = function() {
        return [this._name,
                this._comments.length ? ' ': '',
                this._comments.join('\n')].join('');
    }
    return ParameterName;
})
