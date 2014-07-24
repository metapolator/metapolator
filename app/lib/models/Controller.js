define([
    'metapolator/errors'
  , 'metapolator/models/CPS/selectorEngine'
  , 'metapolator/models/MOM/Multivers'
  , 'metapolator/models/CPS/StyleDict'
  , 'metapolator/models/CPS/ReferenceDict'
], function(
    errors
  , selectorEngine
  , Multivers
  , StyleDict
  , ReferenceDict
) {
    "use strict";
    var CPSError = errors.CPS
      , KeyError = errors.Key
      ;
    
    function Controller(univers, paramterCollections, parameterRegistry) {
        this._collections = paramterCollections.slice();
        this._mergedRules = this._getMergedRules();
        this._mergedDictionaries = this._getMergedDictionaries();
        
        this._sourceIndex = undefined;
        this._rebuildSourceIndex();
        
        this._MOM = new Multivers(this);
        this._MOM.add(univers)
        this._parameterRegistry = parameterRegistry;
        
        this._caches = undefined;
        this._resetCaches();
    }
    
    var _p = Controller.prototype;
    
    /**
     * StyleDict constructor, can be changed by inheritance or
     * monkey patched on instances
     */
    _p.StyleDict = StyleDict;
    _p.ReferenceDict = ReferenceDict;
    
    /**
     * getComputedStyle returns the matching rules in the correct
     * order by specificity, so all rules should be included. The 
     * order of the rules is important, too, and used as last weighting
     * information, if all other specificity numbers equal.
     */
    _p._getMergedRules = function() {
        return Array.prototype.concat.apply([], this._collections
                            .map(function(item){return item.rules; }))
    }
    
    _p._getMergedDictionaries = function() {
        // get all @dictionary rules
        return Array.prototype.concat.apply([], this._collections
                            .map(function(item){return item.dictionaryRules; }))
        
    }
    
    _p._rebuildSourceIndex = function() {
        this._sourceIndex = {};
        var i=0
          , name
          ;
        for(;i<this._collections.length;i++) {
            name = this._collections[i].source.name;
            this._sourceIndex[name] = i;
        }
    }
    
    _p._resetCaches = function() {
        this._caches = {
            styleDicts: {}
          , referenceDicts: {}
        }
    };
    
    Object.defineProperty(_p, 'sources', {
        get: function() {
            return Object.keys(this._sourceIndex)
        }
    })
    
    _p.usesSource = function(source) {
        return source in this._sourceIndex;
    }
    
    _p.replaceSource = function(source, collection) {
        var index = this._sourceIndex[source];
        if(index === undefined)
            throw new KeyError('Can\'t replace source "'+ source
                                +'" because it\'s not in this controller');
        if(collection.source.name !== source)
            throw new KeyError ('collection.source.name must equal source, '
                + 'but "' + collection.source.name +'" !== "'+ source +'"');
        
        this._collections[index] = collection;
    }
    
    _p.getSourceStringByName = function(source) {
        var i=0;
        for(;i<this._collections.length;i++)
            if(this._collections[i].source.name === source)
                return this._collections[i].toString();
        throw new KeyError(['The Source with name "', source ,'" was not '
                        , 'found in: ',this.sources.join(', ')].join(''));
    }
    
    
    Object.defineProperty(_p, 'parameterRegistry', {
        get: function() {
            return this._parameterRegistry;
        }
    })
    
    /**
    * returns a single interface to read the final cascaded, computed
    * style for that element.
    * 
    * Note: this interface element could be based on the result of
    * rulesForElement and just search that rules up to the end
    */
    _p._getComputedStyle = function(element) {
        var rules = selectorEngine.getMatchingRules(this._mergedRules, element);
        return new this.StyleDict(this, rules, element);
    }
    
    _p.getComputedStyle = function(element) {
        if(element.multivers !== this._MOM)
            throw new CPSError('getComputedStyle with an element that is not '
                + 'part of the multivers is not supported' + element);
        if(!this._caches.styleDicts[element.nodeID])
            this._caches.styleDicts[element.nodeID] = this._getComputedStyle(element);
        return this._caches.styleDicts[element.nodeID];
    }
    
    _p._getReferenceDictionary = function(element) {
        var rules = selectorEngine.getMatchingRules(this._mergedDictionaries, element);
        return new this.ReferenceDict(this, rules, element);
    }
    
    /**
     * A reference dictionary is the interface to the values referenced
     * by the @dictionary CPS rules
     */
    _p.getReferenceDictionary = function(element) {
        if(element.multivers !== this._MOM)
            throw new CPSError('getReferenceDictionary with an element that is not '
                + 'part of the multivers is not supported' + element);
        
        if(!this._caches.referenceDicts[element.nodeID])
            this._caches.referenceDicts[element.nodeID] = this._getReferenceDictionary(element);
        return this._caches.referenceDicts[element.nodeID];
    }
    
    _p.queryAll = function(selector, scope) {
        var i=0
          , result
          ;
        if(scope) {
            if(!(scope instanceof Array))
                scope = [scope];
            for(;i<scope.length;i++)
                if(scope[i].multivers !== this._MOM)
                    throw new CPSError('Query with a scope that is not '
                    +'part of the multivers is not supported ' + scope[i].particulars);
        }
        else
            scope = this._MOM;
        result = selectorEngine.queryAll(scope, selector);
        // monkey patching the returned array.
        // it may become useful to invent an analogue to Web API NodeList
        result.query = selectorEngine.queryAll.bind(selectorEngine, result);
        return result;
    }
    
    _p.query = function(selector, scope) {
        var i=0
          , result
          ;
        if(scope) {
            if(!(scope instanceof Array))
                scope = [scope];
            for(;i<scope.length;i++)
                if(scope[i].multivers !== this._MOM)
                    throw new CPSError('Query with a scope that is not '
                    +'part of the multivers is not supported: ' + scope[i].pariculars);
        }
        else
            scope = [this._MOM];
        return selectorEngine.query(scope, selector);
    }
    
    return Controller;
})
