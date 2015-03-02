define([
    'metapolator/errors'
  , 'metapolator/models/emitterMixin'
  , './_Node'
  , './GenericCPSNode'
  , './Parameter'
], function(
    errors
  , emitterMixin
  , Parent
  , GenericCPSNode
  , Parameter
) {
    "use strict";

    var ValueError = errors.Value
      , KeyError = errors.Key
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
     * Channels named after the active key/property-names are available
     * via the onPropertyChange/offPropertyChange interface.
     * They fire on "add", "delete", "change" for the respective key.
     */

    function ParameterDict(items, source, lineNo) {
        Parent.call(this, source, lineNo);
        this._items = items.slice();
        this._dict = undefined;
        this._keys = undefined;
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

    function _filterParameters(item) {
        return (item instanceof Parameter && !item.invalid);
    }

    Object.defineProperty(_p, 'items', {
        get: function() {
            return this._items.slice();
        }
    });

    /**
     * dictionary of active items:
     * {
     *      key: itemValue
     * }
     */
    Object.defineProperty(_p, 'dict', {
        get: function() {
            if(!this._keys)
                this._buildIndex();
            var result = Object.create(null), k, dict = this._dict;
            for(k in dict)
                result[k] = this.getItemValue(dict[k]);
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
            key = item.name;

            if(!indexes[key]) indexes[key] = [];
            indexes[key].push(i);

            if(!_filterParameters(item))
                continue;
            if(!(key in dict)) {
                dict[key] = i;
                keys.push(key);
            }
        }
    };

    // FIXME: add a splice API
    // it's good for a more complex ui

    /**
     * replace or add
     * overide the active item or create new entry
     *
     * emits: "add", "change" or nothing
     */
    _p.setParameter = function(item) {
        var key = item.name
          , items = this._items
          , index
          , event
          , old
          ;
        if(!_filterParameters(item))
            throw new ValueError('Trying to set an invalid property: ' + item);
        if(!this.has(key)) {
            event = 'add';
            index = items.length;
            items.push(item);
            if(!this._indexes[key])
                this._indexes[key] = [];
            this._indexes[key].push(index);
            this._keys.push(key);
        }
        else {
            event = 'change';
            index = this._dict[key];
            old = items[index];
            items[index] = item;
        }
        this._dict[key] = index;
        // emit events
        if(old) old.destroy();
        this._trigger(event, key);
        this._triggerPropertyChange(key, event);
    };

    /**
     * Remove all items with key as name (valid, invalid, active, inactive)
     * return number of removed items
     *
     * emits: ["delete", "erase"], "erase" or nothing
     */
    _p.erase = function(key) {
        var count = 0, indexes, i
          , items = this._items
          , removed
          , event
          , deleteEvent = false
          ;
        if(!this._indexes)
            this._buildIndex();
        indexes = this._indexes[key];
        if(!indexes)
            return 0;
        removed = [];
        count = indexes.length;
        delete indexes[key];
        for(i=0;i<count;i++) {
            // returns an array with the deleted elements
            // since we delete always only one item [0].destroy(); is good
            removed.push(items[indexes[i]]);
            delete items[indexes[i]];
        }
        if(key in this._dict) {
            // if key was active, this is also a delete event.
            deleteEvent = true;
            delete this._dict[key];
            event = ['delete', 'erase'];
        }
        else
            event = 'erase';
        this._keys = Object.keys(this._dic);

        for(i=0;i<count;i++)
            removed[i].destroy();
        this._trigger(event, key);
        if(deleteEvent)
            this._triggerPropertyChange(key, 'delete');
        return count;
    };

    /**
     * Remove/delete the currently active item for key.
     * May make another valid parameter with the same name active,
     * if there is any.
     *
     * emits: "change" or "delete" or noting
     */
    _p.removeCurrentActiveParameter = function(key) {
        // return number of removed items
        var indexes, index, i
          , items = this._items
          , old
          , keys
          , event
          ;
        if(!this.has(key))
            return 0;
        // delete the currently active item for key
        index = this._dict[key];
        old = items[index];
        delete items[index];
        delete this._dict[key];
        indexes = this._indexes[key];
        indexes.sort();
        for(i=indexes.length;i>=0;i--) {
            if(indexes[i] === index) {
                // the old active key must come first in this iteration
                // because the highest valid index is the active item
                indexes.splice(i, 1);
            }
            else if(_filterParameters(items[indexes[i]])) {
                // this changed the active value
                this._dict[key] = indexes[i];
                break;
            }
        }
        old.destroy();
        if(!(key in this._dict)) {
            // no follow up was found
            // delete event!
            event = 'delete';
            this._keys = Object.keys(this._dict);
        }
        else
            // there is a successor, change event!
            event = 'change';
        this._trigger(event, key);
        this._triggerPropertyChange(key, event);
        return 1;
    };

    _p.keys = function() {
        if(!this._keys)
            this._buildIndex();
        return this._keys.slice();
    };

    _p.get = function(key) {
        if(!this._dict)
            this._buildIndex();
        if(!(key in this._dict))
            throw new KeyError('Key "'+key+'" not in ParameterDict.');
        return this.getItemValue(this._dict[key]);
    };

    _p.has = function(key) {
        if(!this._dict)
            this._buildIndex();
        return key in this._dict;
    };
    
    _p.find = function(key) {
        if(!this._dict)
            this._buildIndex();
        return this._indexes[key].slice() || [];
    };

    _p.getItemValue = function(index) {
        return this._items[index].value;
    };

    return ParameterDict;
});
