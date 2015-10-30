define([
    'metapolator/errors'
  , 'metapolator/models/emitterMixin'
], function(
    errors
  , emitterMixin
) {
    "use strict";

    var NotImplementedError = errors.NotImplemented
      , KeyError = errors.Key
      , emitterMixinSetup = {
            stateProperty: '_channel'
          , onAPI: '_on'
          , offAPI: '_off'
          , triggerAPI: '_trigger'
        }
      ;

    /**
     * ReturnValue
     *
     * This contains the value and the API to remove the reference
     * to value again
     *
     * var item = myMOMTransformationCache.get(momNode [, callback, subscriberData])
     *
     * // use, e.g.
     * someElement.appendChild(item.value);
     *
     * // when not used anymore:
     * someElement.removeChild(item.value);
     * item.destroy();
     *
     */
    var ReturnValue = (function() {
        function ReturnValue(value, destroy) {
            Object.defineProperties(this, {
                value: {
                    value: value
                  , enumerable: true
                }
              , destroy: {
                    value: destroy
                  , enumerable: true
                }
            });
        }
        return ReturnValue;
    })();

    /**
     * This is a base class to implement data transformations from the MOM
     * to other formats e.g. the pen protocol.
     *
     * Sometimes Subclasses of this will depend on other subclasses of this.
     *
     * This also implements a caching mechanism between the MOM and its
     * transformed data. The basic assumption is that it is slower to read
     * from the MOM and it's StyleDicts repeatedly the same data than
     * to cache the result once and replay it in a faster way.
     * So, when we need the outline of a glyph multiple times, to render
     * several layers of an editing window, we create it once from the
     * MOM and then use it multiple times from here.
     *
     * You would not `subscribeToMOM` as an implementor of a subclass who
     * will take care of that yourself.
     */
    function _MOMDataTransformationCache(subscribeToMOM /* default true */) {
        /*jshint validthis:true*/
        this._items = Object.create(null);
        this.__update = this._update.bind(this);

        this._subscribeToMOM = subscribeToMOM === undefined ? true : !!subscribeToMOM;

        // A small number in ms, to allow pending changes to come in.
        // However, we don't want to wait `long`, because this will be
        // perceived as pure waiting time and new events will reset the
        // timer.
        // Change this value via subclasses.
        this._schedulingTimeout = 0;
        emitterMixin.init(this, emitterMixinSetup);
    }

    var _p = _MOMDataTransformationCache.prototype;
    _p.constructor = _MOMDataTransformationCache;
    _MOMDataTransformationCache.ReturnValue  = ReturnValue;

    emitterMixin(_p, emitterMixinSetup);

    /**
     * Return an object with one public method `update` which is called
     * when the momNode triggers its "CPS-change" event.
     *
     * If the update returns a value that is not `undefined` the change
     * handlers of the users are called (if they gave any) with the return
     * value as eventData.
     * see _p.get
     */
    _p._itemFactory = function (momNode) {
        throw new NotImplementedError('_itemFactory needs to implemented by a subclass!');
    };

    /**
     * Clean up all the state that _itemFactory or the operation of the item created.
     * The item will be deleted and not be called again;
     */
    _p._destroyItem = function (item) {
        throw new NotImplementedError('_destroyItem needs to implemented by a subclass!');
    };

    /**
     * Return an object upon which a user of this service will base it's operation;
     * see _p.get
     */
    _p._getUserItem = function(item) {
        throw new NotImplementedError('_getUserItem needs to implemented by a subclass!');
    };

    _p._makeItem = function(momNode) {
        var data = {
                timeoutId: null
              , referenceCount: 0
              , mom: momNode
              , item: this._itemFactory(momNode)
              , subscriptionId: null
              , channel: momNode.nodeID
              , userSubscriptions: []
            };

        if(this._subscribeToMOM)
            data.subscriptionId = data.mom.on('CPS-change', [this, '_onItemChangeHandler'], data);
        return data;
    };

    /**
     * schedule an update
     */
    _p._onItemChangeHandler = function(data, _channelKey, _eventData) {
        /*global clearTimeout, setTimeout*/
        if(data.timeoutId)
            clearTimeout(data.timeoutId);
        data.timeoutId = setTimeout(this.__update, this._schedulingTimeout, data);
    };

    /**
     * To be used from Subclasses when triggering an update becomes necessary
     */
    _p._requestUpdate = function(momItem) {
        var data = this._items[momItem.nodeID];
        if(!data) {
            throw new KeyError('momItem ' + momItem + ' (' + momItem.nodeID
                    + ' '+ momItem.particulars + ') is not registered! [in '
                    + this.constructor.name +'].');
        }

        this._onItemChangeHandler(data);
    };

    _p._update = function(data) {
        /* global clearTimeout */
        if(data.timeoutId) {
            clearTimeout(data.timeoutId);
            data.timeoutId = null;
        }

        var eventData = data.item.update();
        if(eventData !== undefined)
            this._trigger(data.channel, eventData);
    };

    _p._revoke = function(momItem) {
        var data = this._items[momItem.nodeID]
          , components
          , i, l, subscriptions
          ;
        if(!data)
            return 0;

        data.referenceCount -= 1;
        if(data.referenceCount > 0)
            return data.referenceCount;

        // this was the last reference, clean up:
        delete this._items[momItem.nodeID];
        if(data.timeoutId)
            clearTimeout(data.timeoutId);

        if(data.subscriptionId)
            data.mom.off(data.subscriptionId);

        subscriptions=data.userSubscriptions;
        for(i=0,l=subscriptions.length;i<l;i++)
            this._off(subscriptions[i]);

        this._destroyItem(data.item);
        return 0;
    };

    // AKA _unsubscribeOne
    _p._userItemOff = function(data, subscriptionId) {
        var i,l,subscriptions=data.userSubscriptions;
        for(i=subscriptions.length-1;i>=0;i--) {
            if(subscriptions[i] === subscriptionId) {
                subscriptions.splice(i, 1);
                this._off(subscriptionId);
                break;
            }
        }
    };

    _p._userItemOn = function(data, callback, subscriberData) {
        var subscriptionId = this._on(data.channel, callback, subscriberData);
        data.userSubscriptions.push(subscriptionId);
        return subscriptionId;
    };

    _p._userItemDestroy = function(data, state) {
        if(state.destroyed)
            throw new Error('The instance was already destroyed.');
        state.destroyed = true;
        if(state.subscriptionID)
            this._userItemOff(data, state.subscriptionID);
        return this._revoke(data.mom);
    };

    _p._getItem = function(momItem) {
        var data = this._items[momItem.nodeID];
        if(!data) {
            data = this._items[momItem.nodeID] = this._makeItem(momItem);
            this._onItemChangeHandler(data);
        }
        return data;
    };

    /**
     * Returns an "instance" of the requested data. That instance is
     * an object of ReturnValue, with the API:
     *
     * item.value // Whatever the service provides
     * item.destroy // decrease the reference count and unsubscribe if subscribe via get
     *
     * Callback will be fired whenever an update to the (returned)
     * value happened. I.e. When the value represented by the returned item
     * changed. It may be that the glyph/node changed, but the data that is
     * represented here did not change, then no callback may be triggered.
     * It also may be that the callback is called even though the value
     * has not changed; in some cases it may be cheaper (computation time
     * or much rather developer time) to run the callbacks than to check
     * if there was change.
     *
     */
    _p.get = function(momNode, callback, subscriberData) {
        var data = this._getItem(momNode)
          , subscription
          , value
          , item, subscriptionID
          , instanceState = {
                destroyed: false
              , subscriptionID: null
            }
          , destroyFunc
          ;
        data.referenceCount += 1;
        value = this._getUserItem(data.item);
        destroyFunc = this._userItemDestroy.bind(this, data, instanceState);
        if(callback)
            instanceState.subscriptionID = this._userItemOn(data, callback, subscriberData);
        return new ReturnValue(value, destroyFunc);
    };

    return _MOMDataTransformationCache;
});
