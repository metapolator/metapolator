define([
    './_Name'
], function(
    Parent
) {
    "use strict";
    /**
     * The name of a Parameter.
     */
    function ParameterName(name, comments ,source, lineNo) {
        Parent.call(this, name, comments ,source, lineNo);
        // FIXME: detect invalid names!
        // Then set and use this.invalid and this message
        // For usage, modify Parameter to include the names status as well.
    }
    var _p = ParameterName.prototype = Object.create(Parent.prototype);
    _p.constructor = ParameterName;

    return ParameterName;
});
