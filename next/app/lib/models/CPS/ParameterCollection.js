define([
    'metapolator/errors'
  , './_Node'
  , './Rule'
  , './ComplexSelector'
  , './CompoundSelector'
  , './SimpleSelector'
], function(
    errors
  , Parent
  , Rule
  , ComplexSelector
  , CompoundSelector
  , SimpleSelector
) {
    "use strict";
    var CPSError = errors.CPS;
    /**
     * A list of Rules and Comments
     */
    function ParameterCollection(items, source, lineNo) {
        Parent.call(this, source, lineNo);
        this._items = [];
        if(items.length)
            this.push.apply(this, items);
    }
    var _p = ParameterCollection.prototype = Object.create(Parent.prototype)
    _p.constructor = ParameterCollection;
    
    _p.toString = function() {
        return this._items.join('\n\n');
    }
    
    Object.defineProperty(_p, 'items', {
        get: function(){return this._items.slice(); }
    })
    
    Object.defineProperty(_p, 'length', {
        get: function(){ return this._items.length }
    })
    
    /**
     * Add items to this PropertyCollection.
     */
    _p.push = function(item /*, ... items */) {
        var newItems = Array.prototype.slice.call(arguments)
        return this._items.push.apply(this._items, newItems);
    }
    
    
    
    // start selector engine
    _p._pseudoClassSelectorMatches = function(simpleSelector, element, scopeElement) {
        switch(simpleSelector.name) {
            case 'scope':
                if(element === scopeElement)
                    return true;
                if(scopeElement !== undefined)
                    return false;
                // Don't break here, because if scopeElement is undefined
                // :scope equals :root.
            case 'root':
                return element.type === 'univers';
            case 'i':
                return (element.parent
                    && element.parent.find(element) === simpleSelector.value);
        }
    }
    
    /**
     * A simple selector is either a type selector, universal selector,
     * class selector, ID selector or pseudo-class. 
     * 
     * This method returns true if all of its arguments are simple selectors
     * and match this node. If one argument is no simple selector
     * this method raises a CPSError.
     */
    _p.simpleSelectorMatches = function(simpleSelector, element) {
        if(!(simpleSelector instanceof SimpleSelector))
            throw new CPSError('simpleSelector is not of type '
                                         + 'SimpleSelector');
        // no pseudoclass/pseudoelement checks at the moment
        return ( simpleSelector.type === 'universal'
              || simpleSelector.type === 'type' && element.type === simpleSelector.name
              || simpleSelector.type === 'id' && element.id === simpleSelector.name
              || simpleSelector.type === 'class' && element.hasClass(simpleSelector.name)
              || simpleSelector.type === 'pseudo-class'
                    && this._pseudoClassSelectorMatches(simpleSelector, element)
              || false
              );
    }
    
    /**
     * A compound selector is a chain (list) of simple selectors that
     * are not separated by a combinator.
     * 
     * It always begins with a type selector or a (possibly implied)
     * universal selector. No other type selector or universal
     * selector is allowed in the sequence.
     * 
     * If one item of the  simple selectors list is no simple selector
     * this method raises a CPSError.
     */
    _p.compoundSelectorMatches = function(compoundSelector, element) {
        if(!(compoundSelector instanceof CompoundSelector))
            throw new CPSError('compoundSelector is not of type '
                                         + 'CompoundSelector');
        var simpleSelectors = compoundSelector.value
          , i = 0
          ;
        for(;i<simpleSelectors.length;i++)
            if(!this.simpleSelectorMatches(simpleSelectors[i], element))
                return false;
        return true;
    }
    
    _p.complexSelectorMatches = function(complexSelector, element) {
        if(!(complexSelector instanceof ComplexSelector))
            throw new CPSError('complexSelector is not of type '
                                         + 'ComplexSelector');
        var compoundSelectors = complexSelector.value
          , compoundSelector
          , combinator
          , combinatorType
          ;
        // first round: fake a child combinator, so we don't go on
        // if the first selector doesn't match
        combinatorType = 'child'
        // this is a compound selector
        compoundSelector = compoundSelectors.pop();
        
        while(element) {
            if(this.compoundSelectorMatches(compoundSelector, element)) {
                //  we got a hit
                combinator = compoundSelectors.pop();
                if(combinator === undefined) {
                    // that's it all compoundSelectors are consumed
                    return true;
                }
                // there are selectors left, prepare the next round
                // combinatorType is 'child' or 'descendant'
                combinatorType = combinator.type;
                compoundSelector = compoundSelectors.pop();
                // may be undefined. if so it will halt the while loop
                element = element.parent;
            }
            // no match
            else if(combinatorType === 'child')
                // this will halt the while loop
                element = undefined;
            else if (combinatorType === 'descendant')
                // may be undefined. if so it will halt the while loop
                element = element.parent;
            else
                throw new CPSError('Combinator type "'+combinatorType
                                                    +'" is unsuported');
        }
        return false;
    }
    
    /**
     * A (complex) selector's specificity is calculated as follows:
     *     count the number of ID selectors in the selector (= a)
     *     count the number of class selectors, attributes selectors, and pseudo-classes in the selector (= b)
     *     count the number of type selectors and pseudo-elements in the selector (= c)
     *     ignore the universal selector 
     * 
     * Specificities are compared by comparing the three components in
     * order: the specificity with a larger A value is more specific;
     * if the two A values are tied, then the specificity with a larger
     * B value is more specific; if the two B values are also tied, then
     * the specificity with a larger c value is more specific;
     * if all the values are tied, the two specifities are equal.
     * 
     * Array.prototype.sort: "The sort is not necessarily stable."
     * https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Array/sort
     * https://en.wikipedia.org/wiki/Sorting_algorithm#Stability
     * 
     * To ensure stability it is possible to introduce more than the above
     * mentioned three elements of specificity. 
     */
    function compareSpecificity(sA, sB) {
        var i=0;

        for(;i<sA.length && i<sB.length;i++) {
            if(sA[i] !== sB[i])
                // id return value is < 0 selectorA will get a lower index
                // id return value is > 0 selectorB will get a lower index
                return sB[i]-sA[i];
        }
        return 0;
        
    }
    function _compareSpecificity (itemA, itemB) {
        return compareSpecificity(itemA[0], itemB[0]);
    }
    
    /**
     * Returns a list of all of the rules currently applying to the element,
     * sorted from most specific to least.
     * 
     * TODO: when there are more sources than one ParameterCollection,
     * we should be able to perform this action for all the collections.
     * therefore, it would be wise to move the selector engine methods to
     * another module. 
     * The signature of this method could be:
     *      function(target, parameterCollection[, ... parameterCollection])
     * with this approach we could keep the information of the specificity.
     * In other words, the order of the parameterCollection matters!
     * 
     * TODO: We should maybe add a last item with the default parameters
     * of the element. That Item would probably define which properties
     * are available for the Element, too ???
     */
    _p.rulesForElement = function(target) {
        var i=0, j
          , matchingRules = []
          , rule
          , complexSelectors
          , compoundSelectors
          , compoundSelector
          , combinator
          , selects
          , matchingSelectors
          , specificity
          ;
        for(;i<this._items.length;i++) {
            if(!(this._items[i] instanceof Rule))
                continue;
            rule = this._items[i];
            matchingSelectors = []
            // the complexSelectors are all selecting when obtained via
            // the value property of SelectorList
            complexSelectors = rule.selectorList.value;
            for(j=0;j<complexSelectors.length; j++) {
                if(this.complexSelectorMatches(complexSelectors[j], target))
                    // got a match
                    matchingSelectors.push([complexSelectors[j].specificity
                                           , complexSelectors[j]]);
            }
            if(matchingSelectors.length > 1)
                // we only use the matching selector with the higest
                // specificity. This sorts it at position 0
                matchingSelectors.sort(_compareSpecificity);
            if(matchingSelectors.length) {
                // augment the specifity with the index number, so we can
                // make sure, that the order of rules with otherwise
                // equal specifity is not mixed up. The later rules
                // are more specific/overide the previous one, so i
                // is a good match for the sorting function that we use
                // anyways
                specificity = matchingSelectors[0][0];
                specificity.push(i);
                matchingRules.push([specificity, rule]);
            }
        }
        matchingRules.sort(_compareSpecificity);
        return matchingRules.map(function(item){return item[1]});
    }
    
    /**
     * returns a single interface to read the final cascaded, computed
     * style for that element.
     * 
     * Note: this interface element could be based on the result of
     * rulesForElement and just search that rules up to the end
     */
    _p.getComputedStyle = function(element) {
        var rules = this.rulesForElement(element);
        
        throw new errors.NotImplemented('getComputedStyle is not implemented');
    }
    
    
    return ParameterCollection;
})
