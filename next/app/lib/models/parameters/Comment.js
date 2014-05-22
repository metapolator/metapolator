define([
    './_Node'
], function(
    Parent
) {
    "use strict";
    /**
     * Any comment in the CPS.
     */
    function Comment(comment, source, lineNo) {
        Parent.call(this, source, lineNo);
        this._comment = comment;
    }
    var _p = Comment.prototype = Object.create(Parent.prototype)
    _p.constructor = Comment;
    
    _p.toString = function() {
        return ['/*', this._comment, '*/'].join('');
    }
    
    Object.defineProperty(_p, 'comment', {
        get: function(){ return this._comment; }
    })
    
    return Comment;
})
