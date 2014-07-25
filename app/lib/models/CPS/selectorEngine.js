define([
    'metapolator/errors'
  , 'metapolator/models/CPS/parsing/parseSelectorList'
  , './elements/Rule'
  , './elements/SelectorList'
  , './elements/ComplexSelector'
  , './elements/CompoundSelector'
  , './elements/SimpleSelector'
], function(
    errors
  , parseSelectorList
  , Rule
  , SelectorList
  , ComplexSelector
  , CompoundSelector
  , SimpleSelector
) {
    "use strict";
    var CPSError = errors.CPS
      , selectorListFromString = parseSelectorList.fromString
      ;
    
    // start selector engine
    
    /**
     * this is a subroutine of simpleSelectorMatches
     */
    function _pseudoClassSelectorMatches(simpleSelector, element, scopeElement) {
        switch(simpleSelector.name) {
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
    function simpleSelectorMatches(simpleSelector, element, scopeElement) {
        if(!(simpleSelector instanceof SimpleSelector))
            throw new CPSError('simpleSelector is not of type '
                                         + 'SimpleSelector');
        // no pseudoclass/pseudoelement checks at the moment
        return ( simpleSelector.type === 'universal'
              || simpleSelector.type === 'type' && element.type === simpleSelector.name
              || simpleSelector.type === 'id' && element.id === simpleSelector.name
              || simpleSelector.type === 'class' && element.hasClass(simpleSelector.name)
              || simpleSelector.type === 'pseudo-class'
                    && _pseudoClassSelectorMatches(simpleSelector, element, scopeElement)
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
    function compoundSelectorMatches(compoundSelector, element, scopeElement) {
        if(!(compoundSelector instanceof CompoundSelector))
            throw new CPSError('compoundSelector is not of type '
                                         + 'CompoundSelector');
        var simpleSelectors = compoundSelector.value
          , i = 0
          ;
        for(;i<simpleSelectors.length;i++)
            if(!simpleSelectorMatches(simpleSelectors[i], element, scopeElement))
                return false;
        return true;
    }
    
    function complexSelectorMatches(complexSelector, element, scopeElement) {
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
            if(compoundSelectorMatches(compoundSelector, element, scopeElement)) {
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
                
                element = (scopeElement && scopeElement === element)
                        // do not search above scopeElement
                        ? undefined
                        // may be undefined. if so it will halt the while loop
                        : element.parent;
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
    function getMatchingRules(rules, element) {
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
        for(;i<rules.length;i++) {
            if(!(rules[i] instanceof Rule))
                throw new CPSError('Item at index ' + i + ' is not of type '
                                         + 'CPS Rule');
            rule = rules[i];
            matchingSelectors = []
            // the complexSelectors are all selecting when obtained via
            // the value property of SelectorList
            complexSelectors = rule.selectorList.value;
            for(j=0;j<complexSelectors.length; j++) {
                if(complexSelectorMatches(complexSelectors[j], element))
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
                // are more specific/overide the previous one, so it
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
    
    function _filterElementChildren(element, filter) {
        var i = 0
          , children = element.children
          , result = []
          ;
        for(;i<children.length;i++) {
            if(filter(children[i]))
                result.push(children[i]);
        }
        return result;
    }
    function _filterElementDescendants(element, filter) {
        var i = 0
          , children = element.children.slice().reverse()
          , child
          , result = []
          ;
        while(child = children.pop()) {
            if(filter(child))
                result.push(child);
            // add all children of this child
            // and reverse to keep the a clean depth first traversal order
            Array.prototype.push.apply(children, child.children.reverse());
        }
        return result;
    }
    
    /**
     * scope is an array of zero or more elements, we will search only
     * within the scope elements
     */
    function queryComplexSelector(scope, complexSelector) {
        if(!(scope instanceof Array))
            throw new CPSError('scope must be an Array');
        if(!(complexSelector instanceof ComplexSelector))
            throw new CPSError('complexSelector is not of type '
                                         + 'ComplexSelector');
        var compoundSelectors = complexSelector.value
          , compoundSelector
          , combinator
          , matches = []
          , currentScope
          // this filter depends on the fact that compoundSelector and
          // currentScope will change in this closure during the loops below
          , filter = function(element) {
                return compoundSelectorMatches(compoundSelector
                                             , element
                                             , currentScope);
            }
          , filterMethod
          ;
        
        // first round is descendants
        filterMethod = _filterElementDescendants;
        while(true) {
            compoundSelector = compoundSelectors.shift();
            // Here is a lot of room for optimization! I only made a very
            // general bruteforce approach, so we visit a big amount of
            // nodes!
            // One way to optimize would be to take the MOM structure
            // into account. I.e.: it's impossible to select this:
            //      point outline master
            // But on the other hand, we should rather optimize
            // meaningful queries, because these are the ones we are
            // most likely to encounter. Asking every node if its type
            // is 'univers' is however no good idea, with the knowledge
            // that there is only one 'univers', the root of the tree.
            matches = []
            while(currentScope = scope.pop())
                // get ALL elements inside of currentScope
                // and ask if the compound selector matches ...
                Array.prototype.push.apply(matches, filterMethod(currentScope, filter));
            scope = matches;
            
            combinator = compoundSelectors.shift();
            if(combinator === undefined)
                //that's it
                break;
            
            switch(combinator.type) {
                case 'descendant':
                    filterMethod = _filterElementDescendants;
                    break;
                case 'child':
                    filterMethod = _filterElementChildren;
                    break;
                default:
                    throw new CPSError('Combinator type "'+combinator.type
                                                    +'" is unsuported');
            }
        }
        return matches;
    }
    
    /**
     * selector may be a string or a SelectorList
     * Returns a set of elements in scope matching at least one of
     * the selectors in selector.
     * 
     * scope is an array of zero or more elements, we will search only
     * within the scope elements
     */
    function queryAll(scope, selector) {
        var complexSelectors
          , i=0
          , k
          , seen = {}
          , result = []
          , matches
          ;
        if(typeof selector === 'string')
            selector = selectorListFromString(selector);
        if(!(selector instanceof SelectorList))
             throw new CPSError('SelectorList expected, but got a '
                    + selector + ' typeof: '+ typeof selector);
        complexSelectors = selector.value;
        for(;i<complexSelectors.length;i++) {
            matches = queryComplexSelector(scope.slice(), complexSelectors[i]);
            k = 0;
            for(;k<matches.length;k++) {
                if(matches[k].nodeID in seen)
                    continue;
                seen[matches[k].nodeId] = null;
                result.push(matches[k]);
            }
        }
        return result;
    }
    
    /**
     * Returns the first element within the scope that matches.
     * 
     * Matching only one element could be better optimized, especially
     * further down: queryComplexSelector, doesn't know anything about
     * selecting only one element.
     */
    function query(scope, selector) {
        var complexSelectors
          , i=0
          , matches
          ;
        if(typeof selector === 'string')
            selector = selectorListFromString(selector);
        if(!(selector instanceof SelectorList))
             throw new CPSError('SelectorList expected, but got a '
                    + selector + ' typeof: '+ typeof selector);
        complexSelectors = selector.value;
        for(;i<complexSelectors.length;i++) {
            matches = queryComplexSelector(scope, complexSelectors[i]);
            if(matches.length)
                return matches[0];
        }
        return null;
    }
    
    return {
        getMatchingRules: getMatchingRules
      , query: query
      , queryAll: queryAll
    };
})
