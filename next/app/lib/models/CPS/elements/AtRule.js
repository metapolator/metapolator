define([
    'metapolator/errors'
  , './_Collection'
], function(
    errors
  , Parent
) {
    console.log('hi', Parent)
    "use strict";
    var CPSError = errors.CPS;
    /**
     * A Collection of Rules and Comments
     */
    function AtRule(name, items, source, lineNo) {
        Parent.call(this, items, source, lineNo);
        this._name = name;
    }
    var _p = AtRule.prototype = Object.create(Parent.prototype)
    _p.constructor = AtRule;
    
    Object.defineProperty(_p, 'name', {
        get: function(){return this._name; }
    })
    
    return AtRule;
})
