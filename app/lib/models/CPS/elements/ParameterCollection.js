define([
    'metapolator/errors'
  , './_Collection'
  , './AtRuleCollection'
  , './AtRuleName'
  , './SelectorList'
  , './Rule'
], function(
    errors
  , Parent
  , AtRuleCollection
  , AtRuleName
  , SelectorList
  , Rule
) {
    "use strict";
    var CPSError = errors.CPS;
    /**
     * A list of Rule, AtRuleCollection, ParameterCollection, and
     * Comment Elements
     */
    function ParameterCollection(items, source, lineNo) {
        Parent.call(this, items, source, lineNo);
        if(!this._allowNamespace) {
            // lock this.name and this.selectorList
            this.name = undefined;
            this.selectorList = undefined;
        }
    }
    var _p = ParameterCollection.prototype = Object.create(Parent.prototype)
    _p.constructor = ParameterCollection;

    _p.toString = function() {
        var result;
        if(!this._name)
            return this._items.join('\n\n');

        return ['@',this._name, '(', this.selectorList,')', ' {\n',
            this._items.join('\n\n') ,'\n}'].join('')
    }

    Object.defineProperty(_p, 'name', {
        enumerable: true
      , get: function() {
            return (this._name ? this._name.name : null);
        }
      , set: function(name) {
            if('_name' in this)
                throw new CPSError('Name is already set');
            if(name === undefined) {
                this._name = undefined;
                return;
            }
            else if(!(name instanceof AtRuleName))
                throw new CPSError('Name has the wrong type, expected '
                    + 'AtRuleName but got: '
                    + (name.constructor.name
                        ? name.constructor.name
                        : name.constructor));
            this._name = name;
        }
    })


    Object.defineProperty(_p, 'selectorList', {
        enumerable: true
      , set: function(selectorList) {
            if('_selectorList' in this)
                throw new CPSError('selectorList is already set');
            if(selectorList === undefined) {
                this._selectorList = undefined;
                return;
            }
            else if(!(selectorList instanceof SelectorList))
                throw new CPSError('selectorList has the wrong type, expected '
                    + 'SelectorList but got: '
                    + (selectorList.constructor.name
                        ? selectorList.constructor.name
                        : selectorList.constructor));
            this._selectorList = selectorList;
        }
      , get: function() {
            return this._selectorList || null;
        }
    })


    function _filterCollections(Type, name, item) {
        return (
            item instanceof Type
            && (name !== undefined
                            ? item.name === name
                            : true)
        );
    }
    _p.getAtRuleCollections = function(name) {
        return this._items.filter(_filterCollections
                                    .bind(null, AtRuleCollection, name));
    }

    _p.getNamespaceCollections = function() {
        return this._items.filter(_filterCollections
                        .bind(null, ParameterCollection, 'namespace'));
    }

    /**
     * This returns only rules that are direct children of this collection
     */
    Object.defineProperty(_p, 'ownRules', {
        get: function(){ return this._items.filter(function (rule) { return rule instanceof Rule; }); }
    })

    /**
     * this returns all rules that are direct children of this collection
     * AND all rules of ParameterCollection instances that are
     * direct children of this collection
     */
    Object.defineProperty(_p, 'rules', {
        get: function() {
            var i=0
              , namespacedRules = []
              , namespace = [this.selectorList]
              ;
            for(;i<this._items.length;i++) {
                if(this._items[i] instanceof Rule)
                    namespacedRules.push([namespace, this._items[i]]);
                else if(this._items[i] instanceof ParameterCollection)
                    Array.prototype.push.apply(namespacedRules, this._items[i].rules);
            }
            return namespacedRules;
        }
    })

    /**
     * this returns all rules of dictionaries that are direct children of
     * this collection AND all rules of dictionaries that are children of
     * ParameterCollection instances that are direct children of this collection
     */
    var _pairWith = function(item, array) {
        return array.map(function (element) { return [item, element]; });
    }
    Object.defineProperty(_p, 'dictionaryRules', {
        get: function() {
            var i=0
              , namespacedRules = []
              , namespace = [this.selectorList]
              , dictionaries
              ;
            for(;i<this._items.length;i++) {
                if(_filterCollections(AtRuleCollection, 'dictionary', this._items[i]))
                    Array.prototype.push.apply(namespacedRules, _pairWith(namespace, this._items[i].rules));
                else if(this._items[i] instanceof ParameterCollection)
                    Array.prototype.push.apply(namespacedRules, this._items[i].dictionaryRules);
            }
            return namespacedRules;
        }
    })

    return ParameterCollection;
})
