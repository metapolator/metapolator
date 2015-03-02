define([
    'metapolator/models/CPS/whitelistProxies'
], function(
    whitelistProxies
) {
    "use strict";

    /**
     * Used to set the skeleton point coordinates to MOM Point and OutlinePoint
     * elements.
     */
    function PointData(obj) {
        for(var k in obj) this[k] = obj[k];
        this.cps_proxy = whitelistProxies.generic(this, this._cps_whitelist);
    }

    PointData.prototype._cps_whitelist = {
        on: 'on'
      , in: 'in'
      , out: 'out'
    };

    // NOTE: when changing these values is implemented, the according
    // onPropertyChange/offPropertyChange methods nned to be implemented as well
    // see: models/emitterMixin.js for this

    return PointData;
});
