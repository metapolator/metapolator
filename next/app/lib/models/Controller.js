define([
    'metapolator/errors'
  , 'metapolator/models/CPS/selectorEngine'
  , 'metapolator/models/MOM/Multivers'
  , 'metapolator/models/CPS/StyleDict'
], function(
    errors
  , selectorEngine
  , Multivers
  , StyleDict
) {
    "use strict";
    var CPSError = errors.CPS;
    
    function Controller(univers, paramterCollections, parameterRegistry) {
        this._collections = paramterCollections.slice();
        this._mergedRules = this._getMergedRules();
        
        this._MOM = new Multivers(this);
        this._MOM.add(univers)
        this._parameterRegistry = parameterRegistry;
        
        this._caches = {
            styleDicts: {}
        }
    }
    
    var _p = Controller.prototype;
    
    /**
     * StyleDict constructor, can be changed by inheritance or
     * monkey patched on instances
     */
    _p.StyleDict = StyleDict;
    
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
        
        if(!this._caches.styleDicts[element.id])
            this._caches.styleDicts[element.id] = this._getComputedStyle(element);
        return this._caches.styleDicts[element.id]
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
                    +'part of the multivers is not supported' + scope);
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
                    +'part of the multivers is not supported' + scope);
        }
        else
            scope = [this._MOM];
        return selectorEngine.query(scope, selector);
    }
    
    return Controller;
})
