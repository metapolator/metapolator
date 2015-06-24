define([
    '../../_BaseModel'
], function(
    _BaseModel
){
    "use strict";
    function SelectionOperatorModel(level, name, range, low, high, standardValue, id) {
        this.level = level;
        this.name = name;
        this.id = id;
        this.range = range;
        this.low = {
            current : low,
            fallback : low
        };
        this.high = {
            current : high,
            fallback : high
        };
        this.standardValue = standardValue;
    }
        
    var _p = SelectionOperatorModel.prototype = Object.create(_BaseModel.prototype);


    
    return SelectionOperatorModel;
});
