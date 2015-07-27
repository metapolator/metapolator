define([
    '../_BaseModel'
], function(
    Parent
){
    "use strict";
    function OperatorModel(baseOperator, id, parameter) {
        this.base = baseOperator;
        this.parameter = parameter;
        // the operator id connects the operator in the selection with the operator 
        // in the elements
        this.id = id;
        this.value = baseOperator.standardValue;
    }
        
    var _p = OperatorModel.prototype = Object.create(Parent.prototype);
    
    _p.setValue = function(value) {
        this.value = value;    
    };

    _p.clone = function() {
        var clone = {};
        for (var propertyName in this) {
            if (propertyName !== "$$hashKey") {
                clone[propertyName] = this[propertyName];
            }
        }
        return clone;
    };
    
    return OperatorModel;
});
