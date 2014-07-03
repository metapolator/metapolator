define([
    './_Name'
], function(
    Parent
) {
    "use strict";
    /**
     * The name of an AtRule.
     */
    function AtRuleName(name, comments ,source, lineNo) {
        Parent.call(this, name, comments ,source, lineNo);
    }
    var _p = AtRuleName.prototype = Object.create(Parent.prototype)
    _p.constructor = AtRuleName;
    
    return AtRuleName;
})
