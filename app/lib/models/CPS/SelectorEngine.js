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
      , stringify = JSON.stringify
      ;

    // start selector engine
    function SelectorEngine() {
        this._compoundSelectorCache = Object.create(null);
    }
    var _p = SelectorEngine.prototype;

    _p._complexSelectorMatches = function(complexSelector, element, scopeElement) {
        if(!(complexSelector instanceof ComplexSelector))
            throw new CPSError('complexSelector is not of type '
                                         + 'ComplexSelector: ' + complexSelector);
        var compoundSelectors = complexSelector.value
          , compoundSelector
          , combinator
          , combinatorType
          ;
        // first round: fake a child combinator, so we don't go on
        // if the first selector doesn't match
        combinatorType = 'child';
        // this is a compound selector

        // a shortcut, in the best case this should be generated from
        // structure information of the MOM.
        var length = compoundSelectors.value
          , precheckElem
          , matches
          , type
          ;
        for(var i=0; i<length; i+=2) {
            compoundSelector = compoundSelectors[i];
            type = compoundSelector.type;
            if(type === 'master')
                precheckElem = element.master;
            else if(type === 'glyph')
                precheckElem = element.glyph;
            else
                continue;
            if(precheckElem && !compoundSelector.matches(precheckElem, this))
                return false;
        }
        // end of shortcut

        compoundSelector = compoundSelectors.pop();

        while(element) {
            if(compoundSelector.matches(element, this)) {
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
    };

    function _compileCompoundSelector(compoundSelector) {
        /*jshint evil:true*/
        var simpleSelectors = compoundSelector.normalizedValue
          , simpleSelector
          , body = ['"use strict";', 'return (true']
          , tests = []
          , i,l
          , val
          , varname
          , name
          ;
        for(i=0, l=simpleSelectors.length;i<l;i++) {
            simpleSelector = simpleSelectors[i];
            name = simpleSelector.name;
            switch(simpleSelector.type) {
                case 'type':
                    body.push(' && (element.type === ', stringify(name), ')');
                    break;
                case 'id':
                    body.push(' && (element.id === ', stringify(name), ')');
                    break;
                case 'class':
                    body.push(' && (element.hasClass(', stringify(name), '))');
                    break;
                case 'pseudo-class':
                    if(name === 'i') {
                        // must have a parent for this
                        body.push(' && (!!element.parent)');
                        val = simpleSelector.value;
                        if(val < 0)
                            body.push(' && (element.parent.children.length + ', val, ' === element.index)');
                        else
                            body.push(' && (', val, ' === element.index)');
                    }
                    else
                        // we know only :i right now
                        body.push('&& false');
                    break;
                case 'universal':
                    // this is always true
                    break;
                default:
                    throw new CPSError('simpleSelector.type "'+ simpleSelector.type +'" is not implemented.');
            }
        }
        body.push(');');
        return new Function(['element'], body.join(''));
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
    _p.compileCompoundSelector = function(compoundSelector) {
        var key = compoundSelector.normalizedName
          , _compoundSelectorCache = this._compoundSelectorCache
          ;
        if(!(key in _compoundSelectorCache))
            _compoundSelectorCache[key] = _compileCompoundSelector(compoundSelector);
        return _compoundSelectorCache[key];
    };


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
        for(var i=0, len = Math.min(sA.length, sB.length);i<len;i++) {
            if(sA[i] !== sB[i])
                // id return value is < 0 selectorA will get a lower index
                // id return value is > 0 selectorB will get a lower index
                return sB[i]-sA[i];
        }
        return 0;
    }
    function compareSelectorSpecificity (itemA, itemB) {
        return compareSpecificity(itemA.specificity, itemB.specificity);
    }
    // export static functions
    SelectorEngine.compareSpecificity = compareSpecificity;
    SelectorEngine.compareSelectorSpecificity = compareSelectorSpecificity;

    function _rulesCompareSpecificity (itemA, itemB) {
        return compareSpecificity(itemA[0], itemB[0]);
    }

    /**
     * Returns a list of all of the rules currently applying to the element,
     * sorted from most specific to least.
     *
     * the complexSelectors in namespacedRules[n][0] should be sorted, so that the
     * first complexSelector in namespacedRule has the highest specificity
     */
    _p.getMatchingRules = function(namespacedRules, element) {
        var matchingRules = []
          , namespacedRule
          , complexSelectors
          , specificity
          , i, j, length, lengthCS
          ;

        // FIXME: rules should actually be clustered by their namespaces
        // that would help to discard more rules at once and thus speed the
        // thing up alot!
        for(i=0, length = namespacedRules.length;i<length;i++) {
            namespacedRule = namespacedRules[i];
            complexSelectors = namespacedRule[0].value;
            for(j=0, lengthCS = complexSelectors.length;j<lengthCS;j++) {
                if(this._complexSelectorMatches(complexSelectors[j], element)) {
                    // got a match with the most specific selector
                    // augment the specifity with the index number, so we can
                    // make sure, that the order of rules with otherwise
                    // equal specifity is not mixed up. The later rules
                    // are more specific/overide the previous one, so it
                    // is a good match for the sorting function that we use
                    // anyways
                    specificity = complexSelectors[j].specificity.slice();
                    specificity.push(i);
                    matchingRules.push([specificity, namespacedRule[1]]);
                    break;
                }
            }
        }
        matchingRules.sort(_rulesCompareSpecificity);
        return matchingRules.map(function(item){return item[1];});
    };

    function _combinateAll(type, element, complexSelectorArray, seen, selectorEngine) {
        var compoundSelector = complexSelectorArray[0]
          , stack = []
          , frame
          , combinator = null
          , nextComplexSelectorArray
          , result
          , results = []
          , child
          , descendant = type === 'descendant'
          , i,l
          ;
        if(!descendant && type !== 'child')
            throw new CPSError('Combinator type "' + type +'" is unsuported');
        //initial frame setup
        frame = [element.children, 0, 0];
        frame[2] = frame[0].length;
        do {
            i=frame[1];
            l=frame[2];
            while(i<l) {
                child = frame[0][i];
                i++;
                if(compoundSelector.matches(child, selectorEngine)) {
                    // it matches
                    if(combinator === null) // do this lazy and only once
                        combinator = complexSelectorArray[1];
                    if(!combinator) {
                        // no more selectors. we got a hit
                        if(!(child.nodeID in seen)) {
                            results.push(child);
                            seen[child.nodeID] = null;
                        }
                        continue;
                    }
                    if(!nextComplexSelectorArray) // do this lazy and only once
                        nextComplexSelectorArray = complexSelectorArray.slice(2);
                    result = _combinateAll(combinator.type, child, nextComplexSelectorArray, seen, selectorEngine);
                    if(result.length)
                        Array.prototype.push.apply(results, result);
                }
                if(!descendant) continue;
                if(i<l) {
                    // save this frame
                    frame[1]=i;
                    frame[2]=l;
                    stack.push(frame);
                }
                // setup the next frame
                frame = [child.children, 0, 0];
                frame[2] = frame[0].length;
                i=frame[1];
                l=frame[2];
            }
        } while((frame = stack.pop()));
        return results;
    }

    /**
     * return only the first hit in depth first order
     * complexSelectorArray is an array of the form compoundSelectors
     * separated by combinator.
     * [compoundSelector, combinator, compoundSelector, combinator, compoundSelector]
     * min length is 1. length has to be odd always
     */
    function _combinateFirst(type, element, complexSelectorArray, selectorEngine) {
        var compoundSelector = complexSelectorArray[0]
          , stack = []
          , frame
          , combinator = null
          , nextComplexSelectorArray
          , result
          , child
          , descendant = type === 'descendant'
          , i,l
          ;
        if(!descendant && type !== 'child')
            throw new CPSError('Combinator type "' + type +'" is unsuported');
        //initial frame setup
        frame = [element.children, 0, 0];
        frame[2] = frame[0].length;
        do {
            i=frame[1];
            l=frame[2];
            while(i<l) {
                child = frame[0][i];
                i++;
                if(compoundSelector.matches(child, selectorEngine)) {
                    // it matches
                    if(combinator === null) // do this lazy and only once
                        combinator = complexSelectorArray[1];
                    if(!combinator)
                        // no more selectors. we got a hit
                        return child;
                    if(!nextComplexSelectorArray) // do this lazy and only once
                        nextComplexSelectorArray = complexSelectorArray.slice(2);
                    result = _combinateFirst(combinator.type, child, nextComplexSelectorArray, selectorEngine);
                    if(result)
                        return result;
                }
                if(!descendant) continue;
                if(i<l) {
                    // save this frame
                    frame[1]=i;
                    frame[2]=l;
                    stack.push(frame);
                }
                // setup the next frame
                frame = [child.children, 0, 0];
                frame[2] = frame[0].length;
                i=frame[1];
                l=frame[2];
            }
        } while((frame = stack.pop()));
        // nothing found
        return null;
    }

    /**
     * selector may be a string or a SelectorList
     * Returns a set of elements in scope matching at least one of
     * the selectors in selector.
     *
     * scope is an array of zero or more elements, we will search only
     * within the scope elements
     */
    _p.queryAll = function(scope, _selector) {
        var complexSelectors
          , complexSelectorArray
          , i,l, k, ll, j
          , seen = Object.create(null)
          , result = []
          , matches, node
          , selector
          ;
        if(typeof _selector === 'string')
            selector = selectorListFromString(_selector, undefined, this);
        else if(_selector instanceof SelectorList)
            selector = _selector;
        else
             throw new CPSError('SelectorList expected, but got a '
                            + _selector + ' typeof: '+ typeof _selector);
        if(!(scope instanceof Array))
            throw new CPSError('scope must be an Array');
        complexSelectors = selector.value;
        for(i=0,l=complexSelectors.length;i<l;i++) {
            complexSelectorArray = complexSelectors[i].value;
            for(k=0,ll=scope.length;k<ll;k++) {
                matches = _combinateAll('descendant', scope[k], complexSelectorArray, seen, this);
                Array.prototype.push.apply(result, matches);
            }
        }
        return result;
    };

    /**
     * Returns the first element within the scope that matches.
     *
     * Matching only one element could be better optimized, especially
     * further down: queryComplexSelector, doesn't know anything about
     * selecting only one element.
     */
    _p.query = function(scope, _selector) {
        var complexSelectors
          , complexSelectorArray
          , i,l, k, ll
          , match
          , selector
          ;
        if(typeof _selector === 'string')
            selector = selectorListFromString(_selector, undefined, this);
        else if(_selector instanceof SelectorList)
            selector = _selector;
        else
             throw new CPSError('SelectorList expected, but got a '
                            + _selector + ' typeof: '+ typeof _selector);
        if(!(scope instanceof Array))
            throw new CPSError('scope must be an Array');

        complexSelectors = selector.value;
        for(i=0,l=complexSelectors.length;i<l;i++) {
            complexSelectorArray = complexSelectors[i].value;
            for(k=0,ll=scope.length;k<ll;k++) {
                match = _combinateFirst('descendant', scope[k], complexSelectorArray, this);
                if(match) return match;
            }
        }
        return null;
    };

    return SelectorEngine;
});
