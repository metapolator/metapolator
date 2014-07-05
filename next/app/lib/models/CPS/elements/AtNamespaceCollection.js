define([
    'metapolator/errors'
  , './ParameterCollection'
], function(
    errors
  , Parent
) {
    "use strict";
    var CPSError = errors.CPS
      ;
    /**
     * A list of Rule-, AtRuleCollection- ParameterCollection-, and
     * Comment-Elements
     */
    function AtNamespaceCollection(name, selectorList, items, source, lineNo) {
        // The _allowNamespace property of this prototype  tells the Parent
        // constructor to not lock up this.name and this.selectorList
        Parent.call(this, items, source, lineNo);
        if(name)
            this.name = name;
        if(selectorList)
            this.selectorList = selectorList;
    }
    
    var _p = AtNamespaceCollection.prototype = Object.create(Parent.prototype);
    _p.constructor = AtNamespaceCollection;
    
    _p._allowNamespace = true;
    
    return AtNamespaceCollection;
})
