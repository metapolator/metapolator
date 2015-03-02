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
        Object.defineProperties(this, {
            comment: {
                value: comment
              , enumerable: true
            }
          , invalid: {
                value: false
              , enumerable: true
            }
        });
    }
    var _p = Comment.prototype = Object.create(Parent.prototype);
    _p.constructor = Comment;

    _p.toString = function() {
        // TODO: escape */ within this.comment, or remove it if escaping doesn't work.
        return ['/*', this.comment, '*/'].join('');
    };

    return Comment;
});
