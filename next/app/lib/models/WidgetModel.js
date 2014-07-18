define([
    './_BaseModel'
  , './ContainerModel'
], function(
    _BaseModel
  , ContainerModel
){
    "use strict";
    // this is a stub, its likely that nothing of this file will persist
    function WidgetModel(name, value) {
        this.name = name;
        this.value = value;
    }
    WidgetModel.prototype = Object.create(_BaseModel.prototype)
    
    WidgetModel.prototype.stub = function() {
        this.value +=1;
        console.log(this.name, 'was stubbed.')
    }
    return WidgetModel;
})
