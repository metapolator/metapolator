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
            value: {
                value: comment
              , enumerable: true
            }
          , invalid: {
                value: !this.isValid(comment)
              , enumerable: true
            }
        });
    }
    var _p = Comment.prototype = Object.create(Parent.prototype);
    _p.constructor = Comment;

    _p.toString = function() {
        // TODO: escape */ within this.comment, or remove it if escaping doesn't work.
        return ['/*', this.value, '*/'].join('');
    };

    _p.isValid = function(value) {
        return value.indexOf('*/') === -1;
    };

    Object.defineProperty(_p, 'unescaped', {
        get: function(){ return unescape(this.value);}
      , enumerable: true
    });

    // static functions:

    /**
     * '*​/' ends a comment, thus it is illegal inside a comment value
     * we replace it with "*" + "\u200B" + "/"
     * \u200B is ZERO WIDTH SPACE
     * so it will look right, this is a convenience for the ui.
     * for hand editing in a text editor it would be smarter to not write
     * "*​/" inside a comment, and people hardly do so.
     */
    function escape(string) {
        return string.replace(/\*\//g, '*\u200B/' );
    }
    Comment.escape = escape;

    /**
     * replace '*' + '\u200B' + '/' with "*​/"
     * see escape for more information
     */
    function unescape(string) {
        return string.replace(/\*\u200B\//g, '*/' );
    }
    Comment.unescape = unescape;

    return Comment;
});
