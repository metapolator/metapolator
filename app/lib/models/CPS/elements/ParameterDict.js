define([
    'metapolator/errors'
  , 'metapolator/models/emitterMixin'
  , './_Node'
  , './GenericCPSNode'
  , './Parameter'
  , './Comment'
], function(
    errors
  , emitterMixin
  , Parent
  , GenericCPSNode
  , Parameter
  , Comment
) {
    "use strict";

    /*jshint sub:true*/

    var ValueError = errors.Value
      , KeyError = errors.Key
      , AssertionError = errors.Assertion
      , propertyChangeEmitterSetup
      ;

    // TODO:
    // Make this an ordered dict. Ordered to keep the comments where
    // they belong. Dict for access to the Parameters themselves!
    // There is the possibility to declare two parameters of the same
    // name. We merge multiply defined Parameter like so:
    // the last one wins, the other previous ones are not available via
    // keys, the index interface would work.
    // If this is not fancy enough we can still think of another approach.

    propertyChangeEmitterSetup = {
          stateProperty: '_propertyChannels'
        , onAPI: 'onPropertyChange'
        , offAPI: 'offPropertyChange'
        , triggerAPI: '_triggerPropertyChange'
    };

    /**
     * A dictionary of parameters and a list of parameters, comments and
     * GenericCPSNodes
     *
     * channels for the on/off interface:
     *
     * "add" data: key
     *      A new active property was added.
     * "change" data: key
     *      An active property was changed, there is a new value at key.
     * "delete" data: key
     *      There used to be an active property for key, but there is
     *      no active property for key anymore.
     * "erase" data:key
     *      All active, inactive and invalid properties for key have been
     *      removed. This is preceded by "delete" if there used to be
     *      an active property for key. See "delete"
     *
     * "update"
     *      This indicated that the data of this ParameterDict has changed.
     *      This is a very general event, that even covers insertions or
     *      removals of comments or shadowed or invalid parameters. The
     *      purpose is that a UI element that displays all parameterDict.items
     *      can be update its state.
     *
     * Channels named after the active key/property-names are available
     * via the onPropertyChange/offPropertyChange interface.
     * They fire on "add", "delete", "change" for the respective key.
     */

    function ParameterDict(items, source, lineNo) {
        Parent.call(this, source, lineNo);
        this._items = items.slice();
        this._dict = undefined;
        this._keys = null;
        this._indexes = undefined;
        emitterMixin.init(this, propertyChangeEmitterSetup);
    }

    var _p = ParameterDict.prototype = Object.create(Parent.prototype);
    _p.constructor = ParameterDict;

    emitterMixin(_p, propertyChangeEmitterSetup);

    _p.toString = function() {
        var prepared = this._items.map(function(item) {
            if(!item)
                return '';
            if(item instanceof GenericCPSNode)
                return ['    ', item, ';'].join('');
            return '    ' + item;
        });

        prepared.unshift('{');
        prepared.push('}');
        return prepared.join('\n');
    };

    function _isValidParameter(item) {
        return (item instanceof Parameter && !item.invalid);
    }

    Object.defineProperty(_p, 'items', {
        get: function() {
            return this._items.slice();
        }
    });

    _p._getItemValue = function(index) {
        // NOTE: index must be in this._dict, then it can be guaranteed
        // that this._items[index] has a value.
        return this._items[index].value;
    };

    /**
     * dictionary of active items:
     * {
     *      key: itemValue
     * }
     */
    Object.defineProperty(_p, 'dict', {
        get: function() {
            if(!this._dict)
                this._buildIndex();
            var result = Object.create(null), k, dict = this._dict;
            for(k in dict)
                result[k] = this._getItemValue(dict[k]);
            return result;
        }
    });

    Object.defineProperty(_p, 'length', {
        get: function(){ return this._items.length; }
    });

    _p._buildIndex = function() {
        var items = this._items
          , item
          , i, key, dict, keys, indexes
          ;
        this._dict = dict = Object.create(null);
        this._keys = keys = [];
        this._indexes = indexes = Object.create(null);
        // searching backwards, because the last item with key === name has
        // the highest precedence
        for(i=items.length-1;i>=0;i--) {
            item = items[i];
            if(!(item instanceof Parameter))
                // filter out unwanted stuff (and maybe other stuff if that happens)
                // comments, valid and invalid parameters are expected yet
                continue;
            key = item.name;

            // this._indexes contains invalid parameters, so we can erase them
            if(!indexes[key]) indexes[key] = [];
            // Keep the order so that the lowest index comes first
            // Thus the active index for will always be the last one!
            indexes[key].unshift(i);

            if(item.invalid)
                continue;
            if(!(key in dict)) {
                dict[key] = i;
                keys.push(key);
            }
        }
    };

    // START helpers for _p.splice
    _p._getInsertedDict = function (insertions, canonicalStartIndex) {
        var insertedDict = Object.create(null)
          , i, l, item, key, insertedIndexes
          ;

        for(i=0,l=insertions.length;i<l;i++) {
            item = insertions[i];
            if(!(item instanceof Parameter))
                continue;
            key = item.name;
            insertedIndexes = insertedDict[key];
            if(!insertedIndexes)
                insertedDict[key] = insertedIndexes = [];
            insertedIndexes.push(i + canonicalStartIndex);
        }
        return insertedDict;
    };

    _p._updateIndexes = function(indexes, canonicalStartIndex, removedRangeEnd, changeRate, insertedIndexes) {
        var start = null
          , removedCount = 0
          , insertedCount = insertedIndexes.length
          , i, length, index
          , erase = false
          , args
          ;
        length = indexes.length;

        // the last index must be bigger than canonicalStartIndex
        if(length && indexes[length-1] >= canonicalStartIndex) {
            for(i=0;i<length;i++) {
                index = indexes[i];
                if(index < canonicalStartIndex)
                    continue;
                // index >= canonicalStartIndex
                if(start === null)
                    // if there were removals and/or insertions
                    // this is the first affected item
                    start = i;

                if(index < removedRangeEnd)
                    removedCount += 1;
                else // index >= removedRangeEnd
                    indexes[i] = index + changeRate;
            }
        }

        if(start === null) {
            if(insertedCount)
                Array.prototype.push.apply(indexes, insertedIndexes);
            return false; // not erased
        }

        if(start === 0 && insertedCount === 0 && removedCount === indexes.length)
            return true; // erased

        args = [start, removedCount];
        Array.prototype.push.apply(args, insertedIndexes);
        Array.prototype.splice.apply(indexes, args);
        return false; // not erased
    };

    _p._getActiveIndex = function(key) {
        var indexes = this._indexes[key]
          , i, index;
        for(i=indexes.length-1;i>=0;i--) {
            index = indexes[i];
            if(!this._items[index].invalid)
                return index;
        }
        return -1;
    };

    _p._updateDict = function(key, canonicalStartIndex, removedRangeEnd, changeRate) {
        var index = this._dict[key]
          , active = this._getActiveIndex(key)
          ;

        if(active === -1)
            return 'delete';

        if(index >= canonicalStartIndex) {
            if(index < removedRangeEnd)
                // a delete for now, may become a change
                index = -1;
            else // index >= removedRangeEnd
                index += changeRate;
        }

        if(active !== index) {
            this._dict[key] = active;
            return 'change';
        }
        // No event: maybe an updated index number, but it's the same item
        this._dict[key] = index;
        return null;
    };

    /**
     * Calculate the start index where Array.prototype.splice really starts.
     *
     * > start:
     * > Index at which to start changing the array. If greater than the
     * > length of the array, actual starting index will be set to the
     * > length of the array. If negative, will begin that many elements
     * > from the end.
     *
     *  Not in that documentation, if negative after length-start: start = 0
     */
    _p._getCanonicalStartIndex = function(start, length) {
        if(start >= length)
            return length;
        if(start < 0)
            return Math.max(0, length - start);
        return start;
    };

    function _checkItem(item) {
        return (item instanceof Comment || _isValidParameter(item));
    }

    _p._triggerEvents = function(events) {
        var event, keys, i,l;
        for(event in events) {
            keys = events[event];

            // first trigger the propertyChange family, it's less confusing
            // for listeners when they don't get a propertyChange 'add' event
            // after having added the property already because of the normal on channel
            // FIXME: can there be a reasonable rule, like is it always better to
            // _triggerPropertyChange before _trigger or so?

            // Don't trigger PropertyChange for "erase"
            // because erase doesn't change property values. If that happens,
            // "delete" is also being triggered
            if(event !== 'erase')
                for(i=0,l=keys.length;i<l;i++)
                    this._triggerPropertyChange(keys[i], event);

            this._trigger(event, keys);
        }
    };

    _p._splice = function(startIndex, deleteCount, _insertions /* single item or array of items */) {
        var insertions = _insertions instanceof Array
            ? _insertions
            : [_insertions]
          , removals
          , args
          , i, l
          , item
          , events = Object.create(null)
          , oldLength = this._items.length
          , insertionsLength = insertions.length
          , removalsLength
          ;
        for(i=0,l=insertionsLength;i<l; i++)
            if(!_checkItem(insertions[i]))
                throw new ValueError('Trying to insert an invalid item: ' + insertions[i]);

        args = [startIndex, deleteCount];
        Array.prototype.push.apply(args, insertions);
        removals = Array.prototype.splice.apply(this._items, args);
        removalsLength = removals.length;

        if(insertionsLength === 0 && removalsLength === 0)
            return [null, 0, 0];

        for(i=0;i<removalsLength;i++)
            removals[i].destroy();

        // update the existing indexes: this._dict and this.__indexes
        // record the event's

        var changeRate = insertionsLength - removalsLength
          , canonicalStartIndex = this._getCanonicalStartIndex(startIndex, oldLength)
          , removedRangeEnd = canonicalStartIndex + removalsLength
          , insertedDict = this._getInsertedDict(insertions, canonicalStartIndex)
          , key, active, insertedIndexes, indexes
          , createdKeys = []
          , erase, event
          ;

        for(key in insertedDict) {
            if(!(key in this._indexes))
                createdKeys.push(key);
        }

        // update the existing entries in this._indexes
        for(key in this._indexes) {
            indexes = this._indexes[key];
            insertedIndexes = insertedDict[key] || [];
            erase = this._updateIndexes(indexes, canonicalStartIndex
                            , removedRangeEnd, changeRate, insertedIndexes);
            if(!erase) continue;

            delete this._indexes[key];
            if(!events['erase']) events['erase'] = [];
            events['erase'].push(key);
        }

        // update the existing entries in this._dict
        for(key in this._dict) {
            event = key in this._indexes
                ? this._updateDict(key, canonicalStartIndex, removedRangeEnd, changeRate)
                // it is no more in this._indexes so this is a delete
                : 'delete'
                ;
            if(!event) continue;

            if(event === 'delete')
                delete this._dict[key];

            if(!events[event]) events[event] = [];
            events[event].push(key);
        }

        // insert new entries into this._dict and this._indexes
        for(i=0,l=createdKeys.length;i<l;i++) {
            key = createdKeys[i];
            this._indexes[key] = insertedDict[key];
            active = this._getActiveIndex(key);

            if(active === -1) continue;

            this._dict[key] = active;
            if(!events['add']) events['add'] = [];
            events['add'].push(key);
        }

        if('add' in events || 'delete' in events)
            // mark for update
            this._keys = null;

        this._triggerEvents(events);
        return [startIndex, removalsLength, insertionsLength];
    };

    _p.splice = function(startIndex, deleteCount, _insertions /* single item or array of items */) {
        var result = this._splice(startIndex, deleteCount, _insertions);
        if(result[1] || result[2])
            this._trigger('update');
    };

    /**
     * replace or add
     * override the active item or create new entry
     *
     * emits: "add", "change" or nothing
     */
    _p.setParameter = function(item) {
        var key = item.name
          , items = this._items
          , index
          , eventName
          , event = Object.create(null)
          , old
          ;
        if(!_isValidParameter(item))
            throw new ValueError('Trying to set an invalid property: ' + item);
        if(!this.has(key)) {
            eventName = 'add';
            index = items.length;
            items.push(item);
            if(!this._indexes[key])
                this._indexes[key] = [index];
            else
                this._indexes[key].push(index);
            this._dict[key] = index;
            this._keys.push(key);
        }
        else {
            eventName = 'change';
            index = this._dict[key];
            old = items[index];
            items[index] = item;
        }
        // emit events
        if(old) old.destroy();

        event[eventName] = [key];
        this._triggerEvents(event);
        this._trigger('update');
    };

    /**
     * Remove all items with key as name (valid, invalid, active, inactive)
     * return number of removed items
     *
     * emits: ["delete", "erase"], "erase" or nothing
     */
    _p.erase = function(key) {
        var deleteCount, total, i, length, index, indexes;
        if(!this._indexes) this._buildIndex();

        deleteCount = 0;
        total = 0;
        while(key in this._indexes) {
            indexes = this._indexes[key];
            length = indexes.length;
            if(length === 0)
                throw new AssertionError('There MUST NOT be a key without any index');
            deleteCount = 1;
            index = indexes[0];
            // find all indexes that follow directly after index
            // because they can be removed with the same splice
            for(i=1;i<length;i++) {
                if(indexes[i] === index + deleteCount)
                    deleteCount++;
            }
            // NOTE: this uses _splice, because the update event should
            // be triggert only once at the end of an action (or as seldom as possible)
            this._splice(index, deleteCount);
            total += deleteCount;
        }
        if(total)
            this._trigger('update');
        return total;
    };

    /**
     * Remove/delete the currently active item for key.
     * May make another valid parameter with the same name active,
     * if there is any.
     *
     * emits: "change" or "delete" or noting
     */
    _p.removeCurrentActiveParameter = function(key) {
        if(!this.has(key))
            return 0;
        // delete the currently active item for key
        var index = this._dict[key];

        this.splice(index, 1);
        return 1;
    };

    /**
     * NOTE: In an async environment this will likely create a race condition.
     */
    _p.keys = function() {
        if(!this._dict)
            this._buildIndex();
        else if(!this._keys)
            this._keys = Object.keys(this._dict);
        return this._keys.slice();
    };

    _p.get = function(key) {
        if(!this._dict)
            this._buildIndex();
        if(!(key in this._dict))
            throw new KeyError('Key "'+key+'" not in ParameterDict.');
        return this._getItemValue(this._dict[key]);
    };

    /**
     * NOTE: In an async environment this will likely create a race condition.
     */
    _p.has = function(key) {
        if(!this._dict)
            this._buildIndex();
        return key in this._dict;
    };

    /**
     * NOTE: In an async environment this will likely create a race condition.
     */
    _p.find = function(key) {
        if(!this._dict)
            this._buildIndex();
        return this._indexes[key].slice() || [];
    };

    return ParameterDict;
});
