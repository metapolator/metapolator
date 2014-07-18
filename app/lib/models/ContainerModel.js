define([
    './_BaseModel'
  , './WidgetModel'
], function(
    _BaseModel
  , WidgetModel
){
    "use strict";
    // this is a stub, its likely that nothing of this file will persist
    function ContainerModel(name) {
        this.name = name;
        this.widgets = [];
    }
    ContainerModel.prototype = Object.create(_BaseModel.prototype)
    
    ContainerModel.prototype.more = function() {
        this.widgets.push(
            new WidgetModel('widget-model '+ this.widgets.length,
                            Math.floor(Math.random()*100))
            );
    }
    return ContainerModel;
})
