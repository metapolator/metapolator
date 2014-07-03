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
    }
    var _p = ParameterName.prototype = Object.create(Parent.prototype)
    _p.constructor = ParameterName;
    
    return ParameterName;
})
