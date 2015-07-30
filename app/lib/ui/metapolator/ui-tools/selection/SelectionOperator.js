define([], function(){
    "use strict";
    function SelectionOperator(parent, baseOperator, range, low, high, id) {
        this.parent = parent;
        this.base = baseOperator;
        this.range = range;
        this.low = {
            current : low,
            fallback : low
        };
        this.high = {
            current : high,
            fallback : high
        };
        this.id = id;
    }
        
    var _p = SelectionOperator.prototype;


    
    return SelectionOperator;
});
