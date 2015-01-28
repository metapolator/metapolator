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
        this._name = null;
        this._selectorList = null;
        if(!this._allowNamespace) {
            // lock this.name and this.selectorList
            this.name = undefined;
            this.selectorList = undefined;
        }
    }
    var _p = ParameterCollection.prototype = Object.create(Parent.prototype)
    _p.constructor = ParameterCollection;

    _p.reset = function(/* same as constructor ! */) {
        // reset all 'own' properties
        Object.keys(this).forEach(function(key){ delete this[key];}, this);
        this.constructor.apply(this, Array.prototype.slice.call(arguments));
    }

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
            if(this._name !== null)
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
            if(this._selectorList !== null)
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

    function _addNamespacedRuleGetter(propertyName, baseType, baseName
                                                    , baseConstructor) {
        Object.defineProperty(_p, propertyName, {
            get: function() {
                var i=0
                  , namespacedRules = []
                  , namespace = this.selectorList
                  , childRules
                  , addNamespace = _addNamespace.bind(null, namespace)
                  ;
                for(;i<this._items.length;i++) {
                    if(_filterCollections(baseType, baseName, this._items[i]))
                        childRules = baseConstructor(namespace, this._items[i]);
                    else if(this._items[i] instanceof ParameterCollection) {
                        childRules = this._items[i][propertyName];
                        if (namespace)
                            childRules.forEach(addNamespace);
                    }
                    else
                        continue;
                    Array.prototype.push.apply(namespacedRules, childRules)
                }
                return namespacedRules;
            }
        });
    }

    function _addNamespace(namespace, namespacedRule) {
        namespacedRule[0].push(namespace);
    }

    function _createNamespacedRule(namespace, rule) {
        return [ (namespace ? [namespace] : []), rule];
    }

    /**
     * this returns all rules that are direct children of this collection
     * AND all rules of ParameterCollection instances that are
     * direct children of this collection
     */
    _addNamespacedRuleGetter('rules', Rule, undefined,
        function(namespace, rule) {
            return [_createNamespacedRule(namespace, rule)];
        }
    );

    /**
     * this returns all rules of dictionaries that are direct children of
     * this collection AND all rules of dictionaries that are children of
     * ParameterCollection instances that are direct children of this collection
     */
    _addNamespacedRuleGetter('dictionaryRules', AtRuleCollection, 'dictionary',
        // N.B. Here we invoke AtRuleCollection.rules, not ParameterCollection.rules
        // AtRuleCollection.rules returns [Rule, Rule, Rule, ... ]
        function(namespace, collection) {
            return collection.rules.map(_createNamespacedRule.bind(null, namespace))
        }
    );

    return ParameterCollection;
});
