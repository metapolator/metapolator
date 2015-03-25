define([
    'metapolator/errors'
  , 'metapolator/models/CPS/SelectorEngine'
  , 'metapolator/models/MOM/Multivers'
  , 'metapolator/models/MOM/Univers'
  , 'metapolator/models/CPS/elements/Rule'
  , 'metapolator/models/CPS/StyleDict'
  , 'metapolator/models/CPS/parsing/parseRules'
  , 'obtain/obtain'
  , 'metapolator/timer'
], function(
    errors
  , SelectorEngine
  , Multivers
  , Univers
  , Rule
  , StyleDict
  , parseRules
  , obtain
  , timer
) {
    "use strict";
    var CPSError = errors.CPS
      , KeyError = errors.Key
      ;

    function Controller(ruleController) {
        this._ruleController = ruleController;
        this.parameterRegistry = ruleController.parameterRegistry;
        // rule names of the masters
        this._masters = {};

        this._selectorEngine = new SelectorEngine();
        this._MOM = new Multivers(this);
        this._univers = new Univers();
        this._MOM.add(this._univers);

        // {element.nodeID: styleDict}
        this._styleDicts = Object.create(null);

        // {ruleName:[parameterCollection, subscriptionID, [element.nodeIDs, ...]]}
        this._rules = Object.create(null);
    }

    var _p = Controller.prototype;

    /**
     * StyleDict constructor, can be changed by inheritance or
     * monkey patched on instances
     */
    _p.StyleDict = StyleDict;

    _p.updateChangedRule = function(async, sourceName) {
        return this._ruleController.reloadRule(async, sourceName);
    };

    _p.addMaster = function(master, sourceName) {
        this._masters[master.id] = sourceName;
        this._univers.add(master);
    };

    _p.hasMaster = function (master) {
        return master in this._masters;
    };

    _p._getMasterRule = function (master) {
        if(!(master in this._masters))
            throw new KeyError('Master "'+ master +'" not found in '
                                + Object.keys(this._masters).join(', '));
        return this._masters[master];
    };

    _p.getMasterCPS = function(async, master) {
        var ruleName = this._getMasterRule(master);
        return this._ruleController.getRule(async, ruleName);
    };

    /**
     * Used from within _getComputedStyle and StyleDict, don't use it
     * anywhere else! This is not cached here and pretty expensive.
     * If needed we will add a rules property getter to StyleDict.
     */
    _p.getRulesForElement = function(element) {
        // FIXME: hard coding global.cps is not good here, can this
        // be done configurable?
        var ruleName = element.master
                    ? this._getMasterRule(element.master.id)
                    : 'global.cps'
          , parameterCollection
          , subscriptionID
          , rules, allRules
          ;
        if(!this._rules[ruleName]) {
            // subscribe only once, this saves calling us a lot of handlers
            // for each styledict
            // we are currently not unsubscribing, becuause we don't
            // unload parameterCollections ever.
            // TODO: unload parameterCollections if they are not used anymore.
            //       Probably add a reference counter for that. Maybe this
            //       is better done in _ruleController. The unsubscription
            //       here could happen on('destroy');
            parameterCollection = this._ruleController.getRule(false, ruleName);
            subscriptionID = parameterCollection.on('structural-change', [this, '_updateRule'], ruleName);
            this._rules[ruleName] = [parameterCollection, subscriptionID, []];
        }
        else
            parameterCollection = this._rules[ruleName][0];
        allRules = parameterCollection.rules;
        rules = this._selectorEngine.getMatchingRules(allRules, element);
        this._rules[ruleName][2].push(element.nodeID);
        return rules;
    };

    _p._getComputedStyle = function(element) {
        // rules will be pulled lazily from styleDict, when needed
        var rules = null // rules = this.getRulesForElement(element)
          , styleDict = new this.StyleDict(this, element, rules)
          ;
        this._styleDicts[element.nodeID] = styleDict;
        return styleDict;
    };

    /**
     * returns a single StyleDict to read the final cascaded, computed
     * style for that element.
     */
    _p.getComputedStyle = function(element) {
        if(element.multivers !== this._MOM)
            throw new CPSError('getComputedStyle with an element that is not '
                + 'part of the multivers is not supported' + element);
        // this._styleDicts cache set in _getComputedStyle
        return this._styleDicts[element.nodeID] || this._getComputedStyle(element);
    };

    /**
     * Update each styleDict that uses the rule called `ruleName`
     */
    _p._updateRule = function(ruleName) {
        var ids = this._rules[ruleName][2]
          , styleDict
          , i, l
          ;
        for(i=0,l=ids.length;i<l;i++) {
            styleDict = this._styleDicts[ ids[i] ];
            styleDict.invalidateRules();
        }
    };

    _p._checkScope = function(_scope) {
        var i, scope;
        if(!_scope)
            return [this._MOM];
        scope = _scope instanceof Array
            ? _scope
            : [_scope]
            ;
        for(i=0;i<scope.length;i++)
            if(scope[i].multivers !== this._MOM)
                throw new CPSError('Query with a scope that is not '
                    +'part of the multivers is not supported '
                    + scope[i].particulars);
        return scope;
    };

    _p.queryAll = function(selector, scope) {
        var result = this._selectorEngine.queryAll(this._checkScope(scope), selector);
        // monkey patching the returned array.
        // it may become useful to invent an analogue to Web API NodeList
        result.query = this._selectorEngine.queryAll.bind(this._selectorEngine, result);
        return result;
    };

    _p.query = function(selector, scope) {
        return this._selectorEngine.query(this._checkScope(scope), selector);
    };

    return Controller;
});
