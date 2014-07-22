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
    var CPSError = errors.CPS;
    
    function Controller(univers, paramterCollections, parameterRegistry) {
        this._collections = paramterCollections.slice();
        this._mergedRules = this._getMergedRules();
        this._mergedDictionaries = this._getMergedDictionaries();
        
        
        this._MOM = new Multivers(this);
        this._MOM.add(univers)
        this._parameterRegistry = parameterRegistry;
        
        this._caches = {
            styleDicts: {}
          , referenceDicts: {}
        }
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
