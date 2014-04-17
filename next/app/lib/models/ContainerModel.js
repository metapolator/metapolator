define([
    './_BaseModel'
  , './ContainerModel'
], function(
    _BaseModel
  , ContainerModel
){
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
