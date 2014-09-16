define([
    'metapolator/errors'
  , 'ufojs/main'
  , 'metapolator/models/MOM/_Node'
], function(
    errors
  , ufoJSUtils
  , _MOMNode
) {
    "use strict";

    var CPSError = errors.CPS
      , KeyError = errors.Key
      , isInt = ufoJSUtils.isInt
      , isIntString = ufoJSUtils.isIntString;

    /**
    * This is method is used by CPS Operators or the stack, to read
    * a key from *anything*
    *
    * Throws a KeyError when it fails.
    * The difference to whitelistGetter is that this method will look in
    * the styleDict of MOM-Nodes if item is a MOM-Node. Otherwise it uses
    * whitewlistGetter itself.
    */
    function genericGetter(item, name) {
        if(item instanceof _MOMNode)
            return item.getComputedStyle().get(name);
        return whitelistGetter(item, name);
    }

    /**
    * Read a name from item. The key cps_whitelist must be defined for
    * item. If it is not defined or if name is not a key of cps_whitelist
    * This will raise an AccessError, indicating that this should not be read
    * from cps.
    *
    * cps_whitelist is a object structured as follows:
    * {
    *     value1: true // true means value1 can be read at item["value1"]
    *   , value1: "anMappedKey" //string means we are trying to read at item[cps_whitelist[name]]
    * }
    *
    */
    function whitelistGetter(item, name) {
        var getter, index, key;

        if(!(typeof name in {'string':null, 'number':null}))
            throw new CPSError('name must be string or number but it is: '
                                                        + typeof name);
        // we treat arrays as special cases
        // there is no whitelisting of the numeric indexes of an array yet
        // TODO: python has neat list index operations,that can
        // return slices etc. i.e: arr[2:3] and also negative
        // indexes are usable. we should have that as well, at
        // least when it shows to be useful to have some list
        // processing in here ...
        if(item instanceof Array && (isInt(name) || isIntString(name))) {
            index = typeof name === 'number' ? name : parseInt(name, 10);
            if(index >= item.length || index<0)
                throw new KeyError('The index "'+ index +'" '
                                + 'is not in the array: '+ item.join(', '));
            return item[index];
        }

        if(!('cps_whitelist' in item))
            throw new KeyError('Name "'+ name +'" is not whitelisted in item '
                                + '"'+ item +'" '
                                + 'because item doesn\'t specify a whitelist '
                                +' at cps_whitelist.');
        if(!(name in item.cps_whitelist) || item.cps_whitelist[name] === undefined
                || item.cps_whitelist[name] === false
                || item.cps_whitelist[name] === null)
            throw new KeyError('Name "'+ name +'" is not whitelisted in item '
                                + '"'+ item +'" '
                                + (function(){
                                        var r = [];
                                        for(var k in item.cps_whitelist) r.push(k);
                                        return r;})()
                                );

        getter = item.cps_whitelist[name];
        if(getter === true) {
            key = name;
        }
        else if(typeof getter === 'string')
            key = getter;
        else
            // this is a programming Error, a CPS author shouldn\t be
            // able to trigger it.
            throw new ValuetError('Values of cps_whitelist must be boolean true '
                        + 'or typeof string');
        if(!(key in item))
            throw new KeyError('key "'+key+'" not found in item: '+item);
        return item[key];
    }

    return {
        generic: genericGetter
      , whitelist: whitelistGetter
    };
});
