define([
    'metapolator/errors'
  , 'metapolator/models/CPS/parsing/parseSelectorList'
  , './elements/ParameterCollection'
  , './elements/Rule'
  , './elements/SelectorList'
  , './elements/ComplexSelector'
  , './elements/CompoundSelector'
  , './elements/SimpleSelector'
  , 'bloomfilter'
], function(
    errors
  , parseSelectorList
  , ParameterCollection
  , Rule
  , SelectorList
  , ComplexSelector
  , CompoundSelector
  , SimpleSelector
  , bloomfilter
) {

    "use strict";
    var CPSError = errors.CPS
      , selectorListFromString = parseSelectorList.fromString
      , stringify = JSON.stringify
      ;

    // start selector engine
    function SelectorEngine() {
        this._compoundSelectorCache = Object.create(null);
        this._compoundSelectorBloomLocationsCache = Object.create(null);
        this._complexSelectorsCache = Object.create(null);
        // This must be the same as in MOM/_Node getBloomFilter
        // FIXME: put this in a shared module, so that the
        // synchronization of this setup is explicit!
        // This instance is never used for filtering, it just calculates
        // locations in _getCompoundSelectorBloomLocations.
        this._bloomFilter = new bloomfilter.BloomFilter(512, 5);
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

        compoundSelector = compoundSelectors.pop();
        while(element) {
            if(compoundSelector.matches(element, this)) {
                //  we got a hit
                combinator = compoundSelectors.pop();
                if(combinator === undefined)
                    // that's it all compoundSelectors are consumed
                    return true;
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
                // this wouldn't match a selector like "body > div  p"
                // if there is actually another div between body > div and p
                // as in body div div p
                // Maybe a child combinator should match all elements
                // it's connected to (also with other child combinators)
                // and rollback to the previous descendant state if it fails.
                // HOWEVER: at the moment, the MOM doesn't have such a stucture
                // anyways!
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

            if(simpleSelector.invalid)
                throw new CPSError('simpleSelector "'+ simpleSelector +'" is invalid: ' + simpleSelector.message);

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
          , compiled = this._compoundSelectorCache[key]
          ;
        if(!compiled)
            this._compoundSelectorCache[key] = compiled = _compileCompoundSelector(compoundSelector);
        return compiled;
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
     * This is analogous to what happens in MOM/_Node
     */
    _p._getCompoundSelectorBloomLocations = function(compoundSelector) {
        var key = compoundSelector.normalizedName
          , bloomLocations = this._compoundSelectorBloomLocationsCache[key]
          , bf, types, items, i, l, item
          ;
        if(!bloomLocations) {
            bf = this._bloomFilter;
            types = {'type': true, 'class': true, 'id': true};
            bloomLocations = [];
            items = compoundSelector.value;
            for(i=0,l=items.length;i<l;i++) {
                item = items[i];
                if(!(item.type in types))
                    continue;
                bloomLocations.push(bf.getLocations(item.toString()));
            }
            this._compoundSelectorBloomLocationsCache[key] = bloomLocations;
        }
        return bloomLocations;
    };

    /**
     * Filter by using the bloomfilter of an element
     * the filter will have false positives but no false negatives
     * Thus when it returns false it is save to remove the
     * complexSelector from the list of possibly matching elements;
     */
    _p._bloomfilterComplexSelector = function (bloomfilter, complexSelector) {
        var compoundSelectors = complexSelector.value
          , compoundSelector
          , bloomLocations
          , i,l,j,jl
          ;
        for(i=0,l=compoundSelectors.length;i<l;i+=2) {
            compoundSelector = compoundSelectors[i];
            bloomLocations = this._getCompoundSelectorBloomLocations(compoundSelector);
            for(j=0,jl=bloomLocations.length;j<jl;j++) {
                if(!bloomfilter.testByLocations(bloomLocations[j])) {
                    return false;
                }
            }
        }
        return true;
    };

    /**
     * TODO: To save some memory probably all Selector related elements could
     * be created by SelectorEngine. We could then reuse instances with the
     * same value. Especially when it comes to these cached values a little
     * performance and some memory could be shared.
     * Selector related items are a good fit for this, because they
     * are all immutable.
     *
     * TODO: this adhoc class IDSelectorList could be integral to each
     * SelectorList item.
     */
    var IDSelectorList = (function() {
        // asserting that complexSelectors come in sorted by specificity
        // this is that the hash of this item stays the same for the same
        // value. Order is no in itself for SelectorLists
        // also assert that all complexSelectors are valid (!invalid)
        function IDSelectorList(complexSelectors) {
            var i, l;
            for(i=0,l=complexSelectors.length;i<l;i++)
                Object.defineProperty(this, i, { value: complexSelectors[i] });
            Object.defineProperty(this, 'length', {
                value: l
              , enumerable: true
            });
            Object.defineProperty(this, 'normalizedName', {
                value: Array.prototype.join.call(this, ',\n')
              , enumerable: true
            });
        }
        var _p = IDSelectorList.prototype;

        _p.toString = function() {
            return this.normalizedName;
        };

        return IDSelectorList;
    })();

    _p._multiplyComplexSelectorLists = function(selectorsA_, selectorsB_) {
        var x, y, l, ll
          , result = []
          , superKeyA
          , superCacheA
          , superKeyB
          , keyA, keyB
          , cacheA, product, sum
          , selectorsA = selectorsA_ instanceof IDSelectorList ? selectorsA_ : new IDSelectorList(selectorsA_)
          , selectorsB = selectorsB_ instanceof IDSelectorList ? selectorsB_ : new IDSelectorList(selectorsB_)
          ;

        superKeyA = '!' + selectorsA.normalizedName;
        superKeyB = '!' + selectorsB.normalizedName;
        superCacheA = this._complexSelectorsCache[superKeyA];
        if(!superCacheA)
            this._complexSelectorsCache[superKeyA] = superCacheA = Object.create(null);
        product = superCacheA[superKeyB];
        if(!product) {
            for(x=0,l=selectorsA.length;x<l;x++) {
                keyA = selectorsA[x].normalizedName;
                cacheA = this._complexSelectorsCache[keyA];
                if(!cacheA)
                    this._complexSelectorsCache[keyA] = cacheA = Object.create(null);
                for(y=0, ll=selectorsB.length;y<ll;y++) {
                    keyB = selectorsB[y].normalizedName;
                    sum = cacheA[keyB];
                    if(!sum)
                        sum = selectorsA[x].add(selectorsB[y]);
                    result.push(sum);
                }
            }
            product = new IDSelectorList(result);
            superCacheA[superKeyB] = product;
        }
        return product;
    };

    /**
     * Eliminate selectors rules as soon as possible, using the bloomfilter
     * before resolving all the namspaces and running _complexSelectorMatches.
     * This will reduce the number of selectors that we have to check
     * for each element a lot.
     * This is best when @namespaces are used, because then we can bulk
     * remove a lot of false candidates at once.
     * We could also  think about a way of clustering SelectorList items
     * into common virtual-namespaces. But that clustering would be costly
     * by itself and would also have to keep the original rule order in tact.
     * Maybe just some sort of greasy clustering could be used, that
     * clusters on the way if there is something compatible just in order.
     * (greasy could mean a lot here: take the longest common sequence of
     * compound selectors to increase the likelihood of not matching, or
     * take the longest possible subsequent complex selectors by just picking
     * the first compound selector for clustering to increase the likelihood
     * of discarding many items at once). Sounds not easy to do though.
     */
    _p._getNamespacedRules = function(parameterCollection, element) {
        var bloomfilter = this._bloomfilterComplexSelector.bind(this, element.getBloomFilter())
          , filterInvalid = function (item){ return !item.invalid; }
          , namespace = null
          , trace
          , namespacedRules = [] // result
          , stack = []
          , frame, items, item, selectors, i, l, j, n, sl, sli
          ;
        stack = [];
        frame = [0, parameterCollection.items, parameterCollection, null, [parameterCollection]];
        do {
            i=frame[0];
            items = frame[1];
            namespace = frame[3];
            trace = frame[4];
            l=items.length;
            // check all items
            while(i<l) {
                item = items[i];
                i++;
                if(item.invalid)
                    continue;
                selectors = null;
                if(typeof item.getSelectorList === 'function') {
                    selectors = [];
                    sl = item.getSelectorList().value;
                    for(j=0, n=sl.length;j<n;j++) {
                        sli = sl[j];
                        if(!sli.invalid && bloomfilter(sli))
                            selectors.push(sli);
                    }
                    if(!selectors.length)
                        // this @namespace or rule won't match
                        continue;

                    // Faster sorting would be good.
                    selectors.sort(compareSelectorSpecificity);
                    selectors = namespace
                        ? this._multiplyComplexSelectorLists(namespace, selectors)
                        : new IDSelectorList(selectors)
                        ;

                    if(item instanceof Rule) {
                        namespacedRules.push([selectors, item, trace]);
                        continue;
                    }
                }
                if(item instanceof ParameterCollection) {
                    if(i<l) {
                        // we are not finished yet with this scope
                        // save this frame
                        frame[0]=i;
                        stack.push(frame);
                    }
                    // setup the next frame
                    // depth first! next iteration work on this item
                    trace = trace.slice();
                    trace.push(item);
                    stack.push([0, item.items, item, selectors || namespace, trace]);
                    break;
                }
            }
        } while( (frame = stack.pop()) );
        return namespacedRules;
    };

    _p.getMatchingRules = function(parameterCollection, element) {
        var namespacedRules = this._getNamespacedRules(parameterCollection, element)
          , result
          ;
        result = this._getMatchingNamespacedRules(namespacedRules, element);
        return result;
    };


    /**
     * Returns a list of all of the rules currently applying to the element,
     * sorted from most specific to least.
     */
    _p._getMatchingNamespacedRules = function(namespacedRules, element) {
        var matchingRules = []
          , namespacedRule
          , complexSelectors
          , specificity
          , i, j, length, lengthCS
          ;
        for(i=0, length = namespacedRules.length;i<length;i++) {
            namespacedRule = namespacedRules[i];
            complexSelectors = namespacedRule[0];
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
                    matchingRules.push([specificity, namespacedRule]);
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
