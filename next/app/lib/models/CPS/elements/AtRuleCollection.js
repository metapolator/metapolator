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
    function AtRuleCollection(name, items, source, lineNo) {
        Parent.call(this, items, source, lineNo);
        this._name = name;
    }
    var _p = AtRuleCollection.prototype = Object.create(Parent.prototype)
    _p.constructor = AtRuleCollection;
    
    Object.defineProperty(_p, 'name', {
        get: function(){return this._name; }
    })
    
    return AtRuleCollection;
})
