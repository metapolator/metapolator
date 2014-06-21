define([
    './_Node'
], function(
    Parent
) {
    "use strict";
    /**
     * A selector.
     * 
     * In the terms of w3c this represents a ComplexSelector
     * 
     * TODO: we will need to extract the meaning of the elements
     * 
     * so far, we extract:
     * 
     * simple selectors:
     *          universal, type, id, class, id, pseudo-class
     * 
     * 
     * A selector may be invalid, which would mark its selectorList invalid
     * (and thus all selectors in that list)
     * 
     *  reasons for invalid selectors:
     *      it's empty
     *      a child of it is invalid
     *      it has two combinators followng after each other
     *          only possible for > at the moment
     *          invalid: master>>penstroke
     *          valid: master>*>penstroke
     * 
     * a compound selector is invalid if
     *      - it has more than one of universal or type selector
     *      - a universal or typeselector occurs not as first 
     * 
     * 
     * A selector may be alien, which means we ignore it, because we don't
     * understand it. an alien selector is not invalid, thus its selectorlist
     * is still valid.
     * 
     * 
     */
    function ComplexSelector(elements, source, lineNo) {
        Parent.call(this, source, lineNo);
        this._elements = elements;
    }
    var _p = ComplexSelector.prototype = Object.create(Parent.prototype)
    _p.constructor = ComplexSelector;
    
    _p.toString = function() {
        return this._elements.join('');
    }
    
    return ComplexSelector;
})
