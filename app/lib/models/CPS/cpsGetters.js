define([
    'metapolator/errors'
  , 'ufojs/main'
  , 'metapolator/models/MOM/_Node'
  , './whitelistProxies'
], function(
    errors
  , ufoJSUtils
  , _MOMNode
  , whitelistProxies
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
     *
     */
    function whitelistGetter(item, name) {
        if(item === undefined){}//pass
        else if(item.cps_proxy)
            return item.cps_proxy[name]
        else if(item instanceof Array)
            return whitelistProxies.array(item)[name];
        throw new KeyError('Item "'+item+'" doesn\'t specify a whitelist for cps, trying to read '+name);
    }

    return {
        generic: genericGetter
      , whitelist: whitelistGetter
    };
});
