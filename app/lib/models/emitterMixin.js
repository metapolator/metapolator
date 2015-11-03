define([
    'metapolator/errors'
], function(
    errors
) {
    "use strict";
    var EmitterError = errors.Emitter;
    /**
     * usage:
     *
     * ```
     * var emitterSetup = {
     *     stateProperty: '_channel'
     *   , onAPI: 'on'
     *   , offAPI: 'off'
     *   , triggerAPI: '_trigger'
     * };
     *
     * function Emitter() {
     *     // sets the this._channel property
     *     emitterMixin.init(this, emitterSetup);
     * }
     * var _p = Emitter.prototype;
     * emitterMixin(_p, emitterSetup);
     * ```
     * API:
     *
     * ```
     * var e = new Emitter();
     * ```
     *
     * *************
     * subscribe default name: on
     * on(channelName, callback, subscriberData {optional})
     * returns subscriptionID
     *
     * ```
     * var subscriberData = 'data the subscriber will get back ...';
     * // note 'hello' is the channel name
     * var subscriptionID = e.on('hello', callback, subscriberData);
     *```
     *
     * *************
     * a callback should have the following signature:
     * `function(subscriberData, channelName, eventData)`
     *
     * The `callback` argument of `on` may have one of two forms
     *   - a function
     *   - [instance, 'methodName']
     *
     * subscriberData is set by the subscriber when calling `e.on`
     * eventData can be sent by the caller of `e.trigger` but is optional.
     *           This is part of the contract that a subscriber makes with
     *           the sender.
     * *************
     *
     * trigger default name: trigger
     * trigger(channelName, eventData {optional} )
     * ```
     * eventData = {any: 'value'};
     * e.trigger('hello', eventData);
     *
     * // a callback will be called like this: callback(subscriberData, eventData);
     * // or, like this callback[0][callback[1]](subscriberData, eventData);
     *
     * ************
     * unsubscribe default name: off
     * off(subscriptionID);
     * ```
     * e.off(subscriptionID);
     * ```
     *
     * *************
     *
     * the state property that is created has the following structure and adress:
     *
     * this[stateProperty] = {}
     * this[stateProperty][ channelName ] = a subscribers object
     *
     *  the subscribers object is created in _getChannel:
     * ```
     *  {
     *      idCounter: number
     *      subscriberId: [
     *             callback // a function of an array of [object, 'string methodname']
     *           , data // <= anything, will the first argument for callback
     *      ]
     *    , subscriberId: [callback, data]
     *    , ...
     *  }
     * ```
     */
    function emitterMixin(host, _setup) {
        var setup = _setup || {}
          , stateProperty = setup && setup.stateProperty || '_channel'
          , onAPI = setup && setup.onAPI || 'on'
          , offAPI = setup && setup.offAPI || 'off'
          , triggerAPI = setup && setup.triggerAPI || '_trigger'
          ;
        if(host.hasOwnProperty(onAPI))
            throw new EmitterError('The property name "' + onAPI
                    + '" is already used by this host object (' + host.constructor.name + ').');
        host[onAPI] = _mixinOn(stateProperty);
        if(host.hasOwnProperty(offAPI))
            throw new EmitterError('The property name "' + offAPI
                    + '" is already used by this host object (' + host.constructor.name + ').');
        host[offAPI] = _mixinOff(stateProperty);
        if(host.hasOwnProperty(triggerAPI))
            throw new EmitterError('The property name "' + triggerAPI
                    + '" is already used by this host object (' + host.constructor.name + ').');
        host[triggerAPI] = _mixinTrigger(stateProperty);
    }

    function init(thisVal, _setup) {
        var setup = _setup || {}
          , stateProperty = setup.stateProperty || '_channel'
          ;
        if(thisVal.hasOwnProperty(stateProperty))
            throw new EmitterError('The property name "' + stateProperty
                    + '" is already used by this object (' + thisVal.constructor.name + ': ' + thisVal+').');
        Object.defineProperty(thisVal, stateProperty, {
            value: Object.create(null)
          , writable: false
          , enumerable: true
        });
    }
    emitterMixin.init = init;

    function _getChannel(state, channelKey) {
        var channel = state[channelKey];
        if(!channel) {
            channel = state[channelKey] = Object.create(null);
            Object.defineProperty(channel, 'idCounter', {
                value: 0
              , writable: true
              , enumerable: false
              , configurable: false
            });
            Object.defineProperty(channel, 'length', {
                value: 0
              , writable: true
              , enumerable: false
              , configurable: false
            });
        }
        return channel;
    }

    function __on(state, channelKey, subscription) {
        var channel = _getChannel(state, channelKey)
          , subscriberID = channel.idCounter++
          ;
        channel.length += 1;
        channel[subscriberID] = subscription;
        return subscriberID;
    }
    function __off(state, channelKey, subscriberID) {
        var channel = state[channelKey];
        if(!channel || !channel[subscriberID]){
            console.trace();
            throw new EmitterError('Unsubscription without subscription from channel: '
                    + '"' + channelKey + '" with subscriberID: "' + subscriberID + '".');
            }
        delete channel[subscriberID];
        channel.length -= 1;
        if(channel.length === 0)
            delete state[channelKey];
    }
    function __trigger(state, channelKey, eventData) {
        var channel = state[channelKey]
          , subscribers, subscriberID, i, l
          , callback, subscriberData
          ;
        if(!channel) return;
        subscribers = Object.keys(channel);
        for(i=0,l=subscribers.length;i<l;i++) {
            subscriberID = subscribers[i];
            // subscriber may be undefined because of an unsubscription
            // since we copied the subscribers
            if(!(subscriberID in channel)) continue;
            callback = channel[subscriberID][0];
            subscriberData = channel[subscriberID][1];
            if(callback instanceof Function)
                callback(subscriberData, channelKey, eventData);
            else if(callback instanceof Array)
                // callback = [object, 'methodName']
                // this is done to avoid to many new bound functions
                callback[0][callback[1]](subscriberData, channelKey, eventData);
            else
                throw new EmitterError('Unkown callback type: ' + callback);
        }
    }

    function _on(state, channelKey, callback, subscriberData) {
        var subscription = [callback, subscriberData]
          , i, l, results
          ;
        if(channelKey instanceof Array) {
            results = [];
            for(i=0,l=channelKey.length;i<l;i++)
                results.push([channelKey[i], __on(state, channelKey[i], subscription)]);
            return results;
        }
        return [channelKey, __on(state, channelKey, subscription)];
    }
    function _mixinOn(stateProperty) {
        return function on(channelKey, callback, subscriberData) {
            var state = this[stateProperty];
            if(state === undefined)
                throw new EmitterError('state "'+stateProperty+'" is undefined.');
            return _on(state, channelKey, callback, subscriberData);
        };
    }
    function _off(state, subscriberID) {
        var i, l;
        if(subscriberID[0] instanceof Array) {
            for(i=0,l=subscriberID.length;i<l;i++)
                __off(state, subscriberID[i][0], subscriberID[i][1]);
            return;
        }
        __off(state, subscriberID[0], subscriberID[1]);
    }
    function _mixinOff(stateProperty) {
        return function off(subscriberID) {
            var state = this[stateProperty];
            if(state === undefined)
                throw new EmitterError('state "'+stateProperty+'" is undefined.');
            return _off(state, subscriberID);
        };
    }
    function _trigger(host, stateProperty, channelKey, eventData) {
        var i,l, state = host[stateProperty];
        if(state === undefined)
            throw new EmitterError('state "'+stateProperty+'" is undefined.');
        if(channelKey instanceof Array) {
            for(i=0,l=channelKey.length;i<l;i++)
                __trigger(state, channelKey[i], eventData);
            return;
        }
        __trigger(state, channelKey, eventData);
    }
    function _mixinTrigger(stateProperty) {
        return function trigger(channelKey, data) {
            return _trigger(this, stateProperty, channelKey, data);
        };
    }

    return emitterMixin;
});
