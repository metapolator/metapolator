define([
    'metapolator/errors'
  , './_Node'
  , './SelectorList'
  , './Rule'
  , './Comment'
], function(
    errors
  , Parent
  , SelectorList
  , Rule
  , Comment
) {
    "use strict";
    var CPSError = errors.CPS
      , ValueError = errors.Value
      ;
    /**
     * A list of Rule, ParameterCollection (also @namespace, @import) and
     * Comment Elements
     */
    function ParameterCollection(items, source, lineNo) {
        Parent.call(this, source, lineNo);
        this._items = items.slice();

        this._name = null;
        this._rules = null;
        this._rulesCacheSubscriptions = [];
        if(!this._allowNamespace) {
            // lock this.name
            this.name = undefined;
        }
    }
    var _p = ParameterCollection.prototype = Object.create(Parent.prototype);
    _p.constructor = ParameterCollection;

    // called in RuleController._set
    _p.reset = function(/* same as constructor ! */) {
        this._unsetRulesCache();

        // FIXME: without having other listeners on these items, we'll
        // probably won't need to call the destroy method
        // but maybe this becomes interesting when the ui displays this
        // data structure
        // uncomment calls to destroy everywhere???
        var items = this._items, i, l;
        this._items = null;
        for(i=0,l=items.length;i<l;i++)
            items[i].destroy();

        // reset all own, enumerable, configurable properties
        Object.keys(this).forEach(function(key) {
            if(Object.getOwnPropertyDescriptor(this, key).configurable)
                delete this[key];
        }, this);

        this.constructor.apply(this, arguments);
        // the collection changed most probably
        this._trigger('structural-change');
    };

    _p.toString = function() {
        return this._items.join('\n\n');
    };

    /**
     * subclasses of this will have to overide this definition
     */
    Object.defineProperty(_p, 'invalid', {
        value: false
    });

    function _filterRules(item) {
        return item instanceof Rule;
    }

    /**
     * for display in the ui
     */
    Object.defineProperty(_p, 'items', {
        get: function(){return this._items.slice();}
    });

    Object.defineProperty(_p, 'length', {
        get: function(){ return this._items.length;}
    });

    Object.defineProperty(_p, 'name', {
        enumerable: true
      , get: function() {
            return (this._name ? this._name : null);
        }
      , set: function(name) {
            if(this._name !== null)
                throw new CPSError('Name is already set: ' + this._name);
            if(name === undefined) {
                this._name = undefined;
                return;
            }
            else if(typeof name !== 'string')
                throw new CPSError('Name has the wrong type, expected '
                    + 'string but got: '
                    + (name.constructor
                        ? name.constructor.name
                        : name + ' typeof: ' + (typeof name)));
            this._name = name;
        }
    });

    /**
     * this returns all rules that are direct children of this collection
     * AND all rules of ParameterCollection instances that are
     * direct children of this collection, a "flattened" list in the form:
     * [
     *    [namespace Selectorlist, Rule]
     *  , [namespace Selectorlist, Rule]
     *  , ...
     * ]
     *
     */
    Object.defineProperty(_p, 'rules', {
        get: function() {
            if(!this._rules)
                this._rules = this._getRules();
            return this._rules;
        }
    });

    /**
     * invalidate the cache on the right occasions,
     * This are events that imply:
     *  -- That a child rule changed its SelectorList
     *  -- That this AtNamespaceCollection changed its SelectorList (right???)
     *  -- That this ParameterCollection changed its set of Rules
     *  -- That a child ParameterCollection changed its set of Rules
     *
     * We dont need invalidation of this cache if a Rule changed the contents
     * of its ParameterDict.
     */
    _p._unsetRulesCache = function() {
        var i,l, subscription;
        this._rules = null;
        this._unsubscribeAll();
    };

    _p._subscribe = function(item, channel, callback, data) {
        var subscriptionID = item.on(channel, callback, data);
        this._rulesCacheSubscriptions.push([item, subscriptionID]);
    };
    _p._unsubscribeAll = function() {
        var i, l, subscription;
        for(i=0,l=this._rulesCacheSubscriptions.length;i<l;i++) {
            subscription = this._rulesCacheSubscriptions[i];
            subscription[0].off(subscription[1]);
        }
        this._rulesCacheSubscriptions = [];
    };

    _p._structuralChangeHandler = function(data, channelName, eventData) {
        this._unsetRulesCache();
        this._trigger('structural-change');
    };

    _p._getRules = function () {
        var i, l, j, ll
          , rules = []
          , childRules
          , item, rule
          , selectorList
          , callback = [this, '_structuralChangeHandler']
          , ruleChannel = 'selector-change'
          , collectionChannel = 'structural-change'
          , copyRules
          ;
        for(i=0, l=this._items.length;i<l;i++) {
            item = this._items[i];
            if(item instanceof Rule) {
                this._subscribe(item, ruleChannel, callback);
                if(item.invalid) continue;
                // 0: array of namespaces, initially empty
                // 1: the instance of Rule
                // thus: [selectorList, rule, [_Collections where this rule is embeded]]
                rules.push([ item.getSelectorList(), item]);//, [this] ]);
            }
            else if(item instanceof ParameterCollection) {
                this._subscribe(item, collectionChannel, callback);
                if(item.invalid)
                    continue;
                childRules = item.rules;
                // rules of @import are copied, because they are reused
                // in other collections as well. @namespace changes the
                // rule array, for example, that changes all other instances
                // of that rule array as well. So, rule arrays that are reused
                // must be copied, this is currently only true for
                // @import
                // NOTE: this is also caused partly by the `this._rules`
                // cache. Thus a possible solution would be to not use
                // caches for some types of ParameterCollection. @import
                // could, instead of returning the proxied value, return
                // a copy of it's _reference rules.
                // @namespace, on the other hand, needs no cache in principle
                // becuase the important cache is the plain ParameterCollection
                // that contains the @namespace ...
                copyRules = (item.name === 'import');
                for(j=0,ll=childRules.length;j<ll;j++) {
                    rule = childRules[j];
                    // add `this` to the third entry to produce a history
                    // of nested ParameterCollections, this is to show
                    // in the the ui where this rule comes from
                    // rule[2].push(this);
                    rules.push(copyRules ? rule.slice() : rule);
                }
            }
        }
        return rules;
    };


    function _checkItem(item) {
        return (
                (item instanceof Rule && !item.invalid)
             || (item instanceof ParameterCollection && !item.invalid)
             || item instanceof Comment
        );
    }

    /**
     * FIXME: this is copy and pasted from models/ParameterDict but the
     *        implementation should be shared!
     *
     * Calculate the start index where Array.prototype.splice really starts.
     *
     * > start:
     * > Index at which to start changing the array. If greater than the
     * > length of the array, actual starting index will be set to the
     * > length of the array. If negative, will begin that many elements
     * > from the end.
     *
     * Not in that documentation, if negative after length-start: start = 0
     */
    _p._getCanonicalStartIndex = function(start, length) {
        if(start >= length)
            return length;
        if(start < 0)
            return Math.max(0, length - start);
        return start;
    };
    /**
     * One to rule them all:
     *
     * insert a Rule (which must have a valid SelectorList)
     * remove a Rule
     * replace a rule
     * Add/remove @namespace (with valid SelectorList) or @import
     * Add/remove comments
     * Remove invalid hunks of data. <= just don't allow inserting invalid hunks
     *
     * all is done with Array.prototype.splice
     * see: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/splice
     *
     * emits:
     *      "delete" if there where deletions
     *      "add" if there where insertion
     *      "structural-change" if there where insertion or deletions
     */
    _p.splice = function(startIndex, deleteCount, _insertions /* single item or array of items */) {
        var insertions = _insertions instanceof Array
            ? _insertions
            : [_insertions]
          , deleted
          , args
          , i, l
          , item
          , events = []
          , canonicalStartIndex = this._getCanonicalStartIndex(startIndex, this._items.length)
          ;
        for(i=0,l=insertions.length;i<l; i++) {
            item = insertions[i];
            if(!_checkItem(item))
                throw new ValueError('Trying to insert an invalid item: ' + item);
        }

        args = [startIndex, deleteCount];
        Array.prototype.push.apply(args, insertions);
        deleted = Array.prototype.splice.apply(this._items, args);
        for(i=0,l=deleted.length;i<l;i++)
            deleted[i].destroy();
        if(deleted.length)
            events.push('delete');
        if(insertions.length)
            events.push('add');
        if(!events.length)
            // nothing happened
            return;

        // prune the cache.
        this._rules = null;

        events.push('structural-change');
        // TODO: Add maybe information like three numbers:
        //      index, deletedCount, insertedCount
        // That could help to update the ui, however, usually a ui is not
        // that delicate!.
        // NOTE: index and deletedCount must be calculated see the
        // docs for Array.prototype.slice
        this._trigger(events);
        return [canonicalStartIndex, deleted.length, insertions.length];
    };

    _p.getItem = function(index) {
        return this.items[index];
    };

    return ParameterCollection;
});
