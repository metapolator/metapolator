define([
    'metapolator/errors'
  , './_Collection'
  , './AtRule'
], function(
    errors
  , Parent
  , AtRule
) {
    "use strict";
    var CPSError = errors.CPS;
    /**
     * A list of Rule-, AtRule- and Comment-Elements
     */
    function ParameterCollection(items, source, lineNo) {
        Parent.call(this, items, source, lineNo);
    }
    var _p = ParameterCollection.prototype = Object.create(Parent.prototype)
    _p.constructor = ParameterCollection;
    
    function _filterAtRules(name, item) {
        return (
            item instanceof AtRule
            && name !== undefined
                            ? item.name === name
                            : true
        );
    }
    _p.getAtRules = function(name) {
        return this._items.filter(_filterAtRules.bind(null, name));
    }
    
    return ParameterCollection;
})
