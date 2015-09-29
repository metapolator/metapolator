define([
    'metapolator/errors'
  , './whitelistProxies'
  , 'metapolator/memoize'
  , 'metapolator/models/emitterMixin'
  , 'metapolator/models/MOM/_Node'
  , 'metapolator/models/CPS/elements/SelectorList'
], function(
    errors
  , whitelistProxies
  , memoize
  , emitterMixin
  , _MOMNode
  , SelectorList
) {
    "use strict";

    var KeyError = errors.Key
      , ReceiverError = errors.Receiver
      , AssertionError = errors.Assertion
      , CPSKeyError = errors.CPSKey
      , CPSRecursionError = errors.CPSRecursion
      , assert = errors.assert
      , propertyChangeEmitterSetup
      ;

    propertyChangeEmitterSetup = {
          stateProperty: '_dependants'
        , onAPI: 'onPropertyChange'
        // TODO: Not deleting the channel will take a bit more memory but in turn
        // needs less garbadge collection
        // we could delete this when the key is removed from this._dict
        // and not added again, supposedly in _rebuildIndex and _parameterChangeHandler
        // delete this._dependants[key];
        // however, _rebuildIndex and updateDictEntry are not part of
        // the concept of emitter/channel thus the emitter should
        // provide a method: removeProperty(channel) which in turn can be called by
        // _rebuildIndex and updateDictEntry. Also, that would throw an error
        // if there are any subscriptions left. (we may add a on-delete event)
        // for that case!?
        , offAPI: 'offPropertyChange'
        , triggerAPI: '_triggerPropertyChange'
    };

    /**
     * StyleDict is an interface to a List of CPS.Rule elements.
     *
     * rules: StyleDict will pull the rules for element from controller
     *        when needed, it uses controller.getRulesForElement(element)
     *        controller, in turn will invalidate the rules via: StyleDict.prototype.invalidateRules
     */
    function StyleDict(controller, element, rules /* default: null */) {
        // I prefer: this.get.bind(this);
        // But this method is called a lot and thus the closure is faster.
        // see: http://jsperf.com/bind-vs-native-bind-run
        // that may change in the future
        var self = this;


        // new GetAPI(this); => would make a cleaner definition, but maybe slows things down???
        this.getAPI = {
            get: function(key) {
                var result = self.get(key);
                self._subscribeTo(self, key);
                return result;
            }
          , query: function(node, selector) {
                var result = node.query(selector);
                self._subscribeTo(node, selector);
                return result;
            }
          , genericGetter: function(item, key){
                return self._genericGetter(item, key);
            }
        };


        Object.defineProperty(this, 'element', {
            value: element
          , enumerable: true
        });
        this._controller = controller;
        this._getting = {
            recursionDetection: Object.create(null)
          , stack: []
          , current: null
        };

        this._rules = rules || null;
        this._dict = null;
        this._cache = Object.create(null);

        // subscriptions to the "add" channel of each parameterDict in this._rules
        this._dictSubscriptions = [];

        // subscriptions to the active key in a parameterDict
        //
        // triggered on "change" and "delete" (also on "add" but we subscribe later)
        //
        // cache_key refers to the same key here and in the parameterDict
        // {
        //    cache_key: [parameterDict, subscriptionUid] /* information needed to unsubscribe */
        // }
        this._propertySubscriptions = Object.create(null);

        // All current subscriptions to dependencies of the cache.
        // One subscription can be used by many _cache entries.
        // {
        //    subscriptionUid: [
        //        /* information needed to unsubscribe */
        //          item // the item/element/object subscribed to
        //        , subscriberId // needed to unsubscribe, returned when subscribing
        //
        //        /* information to control subscribing and unsubscribing */
        //        , object // set of _cache keys subscribed to this
        //        , 0 // counter, number of dependencies, same as previous Object.keys(object).length
        //    ];
        //}
        this._cacheSubscriptions = Object.create(null);

        // the subscriptionUids for each key in cache
        // {
        //    cache_key: [subscriptionUid, ...]
        // }
        this._cacheDependencies = Object.create(null);

        // emitter: PropertyChange
        // Adds this[propertyChangeEmitterSetup.stateProperty]
        // which is this._dependencies
        emitterMixin.init(this, propertyChangeEmitterSetup);

        // adds the default this._channel
        emitterMixin.init(this);

        this._subscriptionUidCounter = 0;
        this._subscriptionUids = new WeakMap();
        this._invalidating = 0;

        // we can prepare this callback once for all channels
        // see also _p._nextTrigger
        this._delayedTriggerData = Object.create(null);
        this.__delayedTrigger = this._delayedTrigger.bind(this);
    }

    var _p = StyleDict.prototype;
    _p.constructor = StyleDict;

    /**
     * adds the methods:
     *    onPropertyChange(propertyName, subscriberData) // returns subscriptionId
     *    offPropertyChange(subscriptionId)
     *    _triggerPropertyChange(propertyName, eventData)
     *
     * these are used mostly for inter-StyleDict communication / cache invalidation
     */
    emitterMixin(_p, propertyChangeEmitterSetup);

    /**
     * adds the methods:
     *    on(channel, subscriberData) // returns subscriptionId
     *    off(subscriptionId)
     *    _trigger(channel, eventData)
     */
    emitterMixin(_p);

    _p._getSubscriptionUid = function(item, key) {
        var uid;
        if(item instanceof _MOMNode) {
            if(key instanceof SelectorList)
                // TODO: currently all subtree changes are handled as one.
                // I think we may become finer grained here. Like for example
                // only fire if a change in a subtree affects the result
                // of item.query(key); then, the SubscriptionUid must be
                // different for different selectors. Until then all selectors
                // for a _MOMNode have the same SubscriptionUid:
                return item.nodeID + 'S:$';// + key
            else
                return item.nodeID + ':' + key;
        }
        else if(item instanceof StyleDict)
            return '!' + item.element.nodeID + ':' + key;
        // fallback, rare cases
        uid = this._subscriptionUids.get(item);
        if(!uid) {
            uid = '?' + (this._uidCounter++) + ':' + key;
            this._subscriptionUids.set(item, uid);
        }
        return uid;
    };

    _p._unsubscribeFromAll = function(key) {
        // we have probably collected dependencies for this cache, since
        // the cache is now invalidated, the dependencies can be unsubscribed
        var dependencies = this._cacheDependencies[key]
          , subscriptionUid
          , subscription
          , i, l
          ;
        if(!dependencies)
            return;
        for(i=0,l=dependencies.length;i<l;i++) {
            subscriptionUid = dependencies[i];
            subscription = this._cacheSubscriptions[subscriptionUid];
            // remove dependency key from subscription
            delete subscription[2][key];//index
            subscription[3]--;//counter
            if(subscription[3])
                continue;
            // no deps left
            subscription[0].offPropertyChange(subscription[1]);
            delete this._cacheSubscriptions[subscriptionUid];
        }
        delete this._cacheDependencies[key];
    };

    /**
     *  if key is in cache, invalidate the cache and inform all subscribers/dependants
     */
    _p._invalidateCache = function(key) {
        // FIXME:
        // This event should fire whenever the value of the dict
        // changed in a way, so that e.g. a redraw of a glyph is needed
        // _invalidateCache seems resonable at the moment, but it might be
        // a source of subtle bugs, when the event was not fired but should
        // have been. So keep an eye on this.
        this._nextTrigger('change', key);

        if(!(key in this._cache)) {
            // Because the key is not cached, there must not be any dependency or dependant
            assert(!this._cacheDependencies[key] || !this._cacheDependencies[key].length
                , 'Because the key is not cached, there must not be any dependency or dependant');
            // FIXME: this should be the concern of the channel: PropertyChange
            // it certainly is wrong in here... remove without replacement when everything works
            // fine.
            assert(!this._dependants[key] || !this._dependants[key].length
                , 'Because the key is not cached, there must not be any dependency or dependant');
            return;
        }
        // remove this this._invalidatingKeys when there are no errors
        if(!this._invalidatingKeys)
            this._invalidatingKeys = Object.create(null);
        assert(!(key in this._invalidatingKeys), 'Key ' + key + 'is beeing invalidated at the moment: '+ Object.keys(this._invalidatingKeys));
        this._invalidatingKeys[key] = true;


        this._invalidating +=1;
        delete this._cache[key];
        this._unsubscribeFromAll(key);
        this._triggerPropertyChange(key);
        this._invalidating -= 1;
        delete this._invalidatingKeys[key];
        assert(!(key in this._cache), '"'+key + '" was just deleted, '
                    + 'yet it is still there: ' + Object.keys(this._cache));
    };

    /**
     * Schedule an event to fire after all synchronous tasks are finished
     * using a simple setTimeout(,0); a subsequent call to this._nextTrigger
     * will delay the timeout again and add it's data to the scheduled data.
     *
     * For now this is enough debouncing, however, we may need better
     * mechanics in the future.
     */
    _p._nextTrigger = function(channelKey, data) {
        /*global setTimeout:true, clearTimeout:true*/
        // FIXME: use https://github.com/YuzuJS/setImmediate/blob/master/setImmediate.js
        //        instead of setTimeout, everywhere not just here!
        var channel = this._delayedTriggerData[channelKey];
        if(!channel)
            channel = this._delayedTriggerData[channelKey] = {
                timeoutID: null
              , data: []
            };
        if(arguments.length > 1)
            channel.data.push(data);
        if(channel.timeoutID)
            return;
            // all _nextTrigger calls will hapen during one synchronous process
            // so there's no need to clearTimeout
            // FIXME: TODO: in the future there may be asynchronisity introduced
            // via the renderer. Then we should switch to a promise that triggers
            // when it's done (using the "then" interface of the promise)
            // clearTimeout(channel.timeoutID);

        channel.timeoutID = setTimeout(this.__delayedTrigger, 0, channelKey);
    };

    /**
     * This is only ever called via _nextTrigger and the
     * this.__delayedTrigger bound method
     */
    _p._delayedTrigger = function(channelKey) {
        var channel = this._delayedTriggerData[channelKey];
        if(!channel)
            throw new AssertionError('The data for "'+ channelKey +'" is missing.');
        delete this._delayedTriggerData[channelKey];
        this._trigger(channelKey, (channel.data.length ? channel.data : undefined));
    };

    _p._invalidateCacheHandler = function(subscriptionUid) {
        assert(subscriptionUid in this._cacheSubscriptions, 'must be subscribed now');
        var dependencies = Object.keys(this._cacheSubscriptions[subscriptionUid][2])
          , i, l
          ;
        for(i=0,l=dependencies.length;i<l;i++)
            this._invalidateCache(dependencies[i]);
        assert(!(subscriptionUid in this._cacheSubscriptions), 'must NOT be subscribed anymore');
    };

    _p._subscribeTo = function(item, key) {
        var subscriberId
          , subscriptionUid = this._getSubscriptionUid(item, key)
          , current = this._getting.current
          , dependencies = this._cacheSubscriptions[subscriptionUid]
          ;
        // add dependency current to subscriptionUid
        if(!dependencies) {
            if(key instanceof SelectorList) {
                // TODO: this can be controlled finer. But at the moment
                // we don't do MOM tree changes anyways.
                assert(item instanceof _MOMNode, 'When "key" is a Selector '
                        +'"item" must be a MOM Element.');
//                subscriberId = item.onSubtreeChange(key, [this, '_invalidateCacheHandler'], subscriptionUid);
//                TODO: make _MOMNode.onSubtreeChange
//                      and any *.cps_proxy.onPropertyChange
                // FIXME: we don't do this currently
                return;
            }
            else if(typeof item.onPropertyChange !== 'function') {
                // NOTE, when the value at item[key] can change, that
                // onPropertyChange and offPropertyChange must be implemented
                // when item is "immutable", we don't need this
                return;
            }
            else {

                subscriberId = item.onPropertyChange(key, [this, '_invalidateCacheHandler'], subscriptionUid);
            }
            dependencies = this._cacheSubscriptions[subscriptionUid]
                         = [item, subscriberId, Object.create(null), 0];
        }
        else if(current in dependencies[2])
            // that cache already subscribed to item.key
            return;
        dependencies[2][current] = true;//index
        dependencies[3] += 1;// counter

        if(!this._cacheDependencies[current])
            this._cacheDependencies[current] = [];
        this._cacheDependencies[current].push(subscriptionUid);
    };

    _p._genericGetter = function (item, key) {
        var result;
        if(item === undefined) {
            // used to be a
            // pass
            // is this happening at ALL?
            // in which case?
            // is that case legit?
            // console.trace();
            throw new Error('trying to read "'+key+'" from an undefined item');
            // also see cpsGetters.whitelist for a similar case
        }
        else if(item instanceof _MOMNode) {
            var cs = item.getComputedStyle();
            result = cs.get(key);
            this._subscribeTo(cs, key);
        }
        else if(item.cps_proxy) {
            // FIXME:
            // do we need this case at all? probably when item is a
            // PenStrokePoint.skeleton and key is on/in/out
            // I don't know if there's another case
            // This means, however that everything that has a cps_proxy
            // will have to provide a `onPropertyChange` API (which makes totally sense)
            // arrays are obviously exceptions...
            // so, the do we need this subscription at all question arises again
            //
            // FIXME: can't we just not subscribe to this and do the same as with array
            // that is the original source of this item must be subscribed and =
            // fire if item changes...
            // it is probably happening in __get anyways, like this
            // cpsGetters.whitelist(this.element, key);
            // and then a this._subscribeTo(this.element, key)
            // REMEMBER: this code was extracted from a merge of
            // cpsGetters.generic plus cpsGetters.whitelist
            // so, in the best case, we wouldn't use this condition at all,
            // I think
            result = item.cps_proxy[key];
            this._subscribeTo(item, key);
        }
        else if(item instanceof Array)
            result = whitelistProxies.array(item)[key];
            // no subscription! the source of the Array should be subscribed
            // to and fire when the array changes
        else
            throw new KeyError('Item "'+item+'" doesn\'t specify a whitelist for cps, trying to read '+key);
        return result;
    };

    _p._loadRules = function(force) {
        if(this._rules === null || force)
            //this call is most expensive
            this._rules = this._controller.getRulesForElement(this.element);
    };

    _p.getRules = function(rules) {
        if(!this._dict) this._buildIndex();
        return this._rules.slice();
    };

    /**
     * Loads the rules if missing.
     * Initializes and indexes this._dict
     * Subscribes to propertyDict and property changes and updates
     */
    _p._buildIndex = function() {
        assert(this._dict === null, 'Index already initialized, run invalidateRules to purge it.');
        var i, l, j, ll, keys, key, parameters, subscriberID;
        this._loadRules();
        this._dict = Object.create(null);
        for(i=0,l=this._rules.length;i<l;i++) {
            parameters = this._rules[i][1].parameters;

            subscriberID = parameters.on('add', [this, '_parameterAddHandler'], i);
            this._dictSubscriptions.push([parameters, subscriberID]);
            subscriberID = parameters.on('update', [this, '_parameterUpdateHandler'], i);
            this._dictSubscriptions.push([parameters, subscriberID]);


            keys = parameters.keys();
            for(j=0, ll=keys.length; j<ll; j++) {
                key = keys[j];
                if(!(key in this._dict))
                    this._setDictValue(parameters, key, i);
            }
        }
    };

    _p._unsubscribeFromDicts = function(){
        var i, l, subscription;
        for(i=0,l=this._dictSubscriptions.length;i<l;i++) {
            subscription = this._dictSubscriptions[i];

            // Uncaught UnhandledError: EmitterError:
            // Unsubscription without subscription from channel:
            //                  "add" with subscriberID: "1"
            subscription[0].off(subscription[1]);
        }
        this._dictSubscriptions = [];
    };
   /**
     * This method is called when the ParameterCollection of this styleDict
     * changed so much that the this._rules (rules) list needs to be rebuild
     *
     * Changes in the ParameterCollection that are of this kind are:
     * added or removed Rules
     * SelectorList changes (it's always replacement) of Rules OR AtNamespaceCollections
     * A reset of the ParameterCollection (which does all of the above)
     *
     * The value of this StyleDict may not change in the end but we don't
     * know that before)
     *
     * This doesn't include add/remove events of parameters/parameterDicts,
     * we'll handle that on another level.
     *
     * not used at the moment
     */
    _p.setRules = function(rules) {
        this._rules = rules;
        this._unsubscribeFromDicts();
        this._rebuildIndex();
    };

    /**
     * invalidate the rules and let this._buildIndex get them lazily when
     * needed.
     *
     */
    _p.invalidateRules = function() {
        this._rules = null;
        this._unsubscribeFromDicts();
        // note: copypasta from _p._rebuildIndex
        // which is unused at the moment
        var key;
        for(key in this._dict) {
            this._unsetDictValue(key);
            this._invalidateCache(key);
        }
        // needed if this._dict had no keys previously
        // because then this._invalidateCache would not run
        // for example when the rules changed from not providing keys to
        // now providing keys.
        this._nextTrigger('change');
        this._dict = null;
    };

    _p._rebuildIndex = function() {
        var key;
        for(key in this._dict) {
            this._unsetDictValue(key);
            this._invalidateCache(key);
        }
        // needed if this._dict had no keys previously
        // because then this._invalidateCache would not run
        // for example when the rules changed from not providing keys to
        // now providing keys
        this._nextTrigger('change');
        this._buildIndex();
    };

    _p._parameterUpdateHandler = function(data, channelKey, keys) {
        // If any of the parameterDicts fired it's update event we pass it along here
        // update, in contrast to change is fired when the parameterDict
        // changed but did not change it's value.
        // This is used for rendering in the ui only.
        this._nextTrigger('update');
    };

    /**
     * parameters.onPropertyChange wont trigger on "add", because we won't
     * have subscribed to it by then.
     */
    _p._parameterAddHandler = function(data, channelKey, keys) {
        var i, l;
        for(i=0,l=keys.length;i<l;i++)
            this.__parameterAddHandler(data, channelKey, keys[i]);
    };

    _p.__parameterAddHandler = function(data, channelKey, key) {
        var newRuleIndex = data
          , currentRuleIndex = this._propertySubscriptions[key]
                    ? this._propertySubscriptions[key][2]
                    : undefined
          ;

        // Note: the lower index is more specific and must be used.
        // These are the indexes in this._rules of course. More specific
        // indexes come first.
        if(newRuleIndex > currentRuleIndex)
            return;
        else if(newRuleIndex < currentRuleIndex) {
            this._unsetDictValue(key);
            this._invalidateCache(key);
        }
        else if(currentRuleIndex === newRuleIndex)
            // When both are identical this means we don't have an "add"
            // event by definition! Something in the programming logic went
            // terribly wrong.
            throw new AssertionError('The old index must not be identical '
                        + 'to the new one, but it is.\n index: ' + newRuleIndex
                        + ' key: ' + key
                        + ' channel: ' + channelKey);
        this._setDictValue(this._rules[newRuleIndex][1].parameters, key, newRuleIndex);
    };

    _p._setDictValue = function(parameters, key, parametersIndex) {
        assert(!(key in this._propertySubscriptions), 'there may be no dependency yet!');
        var subscription = this._propertySubscriptions[key] = [];
        this._dict[key] = parameters.get(key);
        subscription[0] = parameters;
        subscription[1] = parameters.onPropertyChange(key, [this, '_parameterChangeHandler'], parameters);
        subscription[2] = parametersIndex;
    };

    _p._unsetDictValue = function(key) {
        var subscription = this._propertySubscriptions[key];
        subscription[0].offPropertyChange(subscription[1]);
        delete this._dict[key];
        delete this._propertySubscriptions[key];
    };

    /**
     *  remake the this._dict entry for key
     */
    _p._updateDictEntry = function(key) {
        var i, l, parameters;
        this._unsetDictValue(key);
        for(i=0,l=this._rules.length;i<l;i++) {
            parameters = this._rules[i][1].parameters;
            if(!parameters.has(key))
                continue;
            this._setDictValue(parameters, key, i);
            break;
        }
        this._invalidateCache(key);
    };

    _p._parameterChangeHandler = function(parameters, key, eventData) {
        switch(eventData) {
            case('change'):
                // The value is still active and available, but its definition changed
                this._dict[key] = parameters.get(key);
                this._invalidateCache(key);
                break;
            case('delete'):
                // the key of parameters was removed without replacement
                // remove the entry and look for a new one
                this._updateDictEntry(key);
                break;
            default:
                throw new ReceiverError('Expected an event of "change" or '
                                       + '"delete" but got "'+eventData+'" '
                                       + '(parameterChangeHandler for "'+key+'")');
        }
    };

    Object.defineProperty(_p, 'keys', {
        get: function() {
            if(!this._dict) this._buildIndex();
            return Object.keys(this._dict);
        }
    });

    /**
     * Get a cps ParameterValue from the _rules
     * This is needed to construct the instance of the Parameter Type.
     * Returns Null if the key is not defined.
     */
    _p._getCPSParameterValue = function(key) {
        if(!this._dict) this._buildIndex();
        return (key in this._dict) ? this._dict[key] : null;
    };

    /**
     * Return a new instance of ParameterValue or null if the key is not defined.
     */
    _p._getParameter = function(key) {
        var cpsParameterValue = this._getCPSParameterValue(key);
        if(cpsParameterValue === null)
            return null;
        return cpsParameterValue.factory(key, this.element, this.getAPI);
    };

    _p.__get = function(key, errors) {
        var param = this._getParameter(key)
          , result
          ;
        if(param)
           return param.getValue();
        errors.push(key + ' not found for ' + this.element.particulars);
        // FIXME: prefer the following, then the cpsGetters module can be removed!
        // if that is not possible, it's certainly interesting why
        result = this.element.cps_proxy[key];
        // old:
        // result = cpsGetters.whitelist(this.element, key);
        this._subscribeTo(this.element, key);
        return result;
    };
    /**
     * Look up a parameter in this.element according to the following
     * rules:
     *
     * 1. If `key' is "this", return the MOM Element of this StyleDict
     * (this.element). We check "this" first so it can't be overridden by
     * a @dictionary rule.
     *
     * 2. If `key' is defiened in CPS its value is returned.
     *
     * 3. If key is available/whitelisted at this.element, return that value.
     *
     * 4. throw KeyError.
     *
     * If `key' is a registered parameter type, the return value's type is
     * the parameter type or an error will be thrown;
     * Otherwise, the return value may be anything that is accessible
     * or constructable from CPS formulae, or a white-listed value on
     * any reachable element.
     */
    _p._get = function(key) {
        var errors = [], getting;
        if(key === 'this')
            return this.element;

        getting = this._getting;
        // Detect recursion on this.element
        if(key in getting.recursionDetection)
            throw new CPSRecursionError('Looking up "' + key
                            + '" is causing recursion in the element: '
                            + this.element.particulars);

        getting.recursionDetection[key] = true;
        getting.stack.push(getting.current);
        getting.current = key;
        try {
            return this.__get(key, errors);
        }
        catch(error) {
            if(!(error instanceof KeyError))
                throw error;
            errors.push(error.message);
            throw new KeyError(errors.join('\n----\n'));
        }
        finally {
            delete getting.recursionDetection[key];
            getting.current = getting.stack.pop();
        }
    };
    // FIXME: memoize seems to be slower, can we fix it?
    //_p.get = memoize('get', _p._get);
    _p.get = function(key) {
        if(this._invalidating)
            throw new AssertionError('This is invalidating, so get is illegal: ' + this.element.type + ' ' + this.element.nodeID);
        var val = this._cache[key];
        if(val === undefined)
            this._cache[key] = val = this._get(key);
        return val;
    };

    return StyleDict;
});
