define([
    './_Node'
], function(
    Parent
) {
    "use strict";
    /**
     * Used as base of AtRuleName and ParameterName.
     */
    function _Name(name, comments ,source, lineNo) {
        /*jshint validthis:true*/
        Parent.call(this, source, lineNo);
        this._comments = comments;
        Object.defineProperty(this, 'name', {
            value: name
          , enumerable: true
        });
    }
    var _p = _Name.prototype = Object.create(Parent.prototype);
    _p.constructor = _Name;

    /**
     * Prints all comments after the name.
     */
    _p.toString = function() {
        return [this.name,
                this._comments.length ? ' ': '',
                this._comments.join('\n')].join('');
    };
    return _Name;
});
