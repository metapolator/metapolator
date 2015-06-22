define([
    '../_BaseModel'
], function(
    _BaseModel
){
    "use strict";
    function OperatorModel(operator, id) {
        this.order = operator.order;
        // the operator id connects the operator in the selection with the operator 
        // in the elements
        this.id = id;
        this.name = operator.name;
        this.value = operator.standardValue;
        this.standardValue = operator.standardValue;
        this.type = operator.type;
        this.usesUnit = operator.usesUnit;
        this.effectiveLocal = operator.effectiveLocal;
    }
        
    var _p = OperatorModel.prototype = Object.create(_BaseModel.prototype);
    
    _p.setValue = function(value) {
        this.value = value;
    };
    
    return OperatorModel;
});
