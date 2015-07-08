define([
    '../_BaseModel'
], function(
    Parent
){
    "use strict";
    function AxisModel(master, axisValue, metapolationValue) {
        this.master = master;
        this.axisValue = axisValue;
        this.metapolationValue = metapolationValue;
    }
    
    var _p = AxisModel.prototype = Object.create(Parent.prototype);
    
    return AxisModel;
});
