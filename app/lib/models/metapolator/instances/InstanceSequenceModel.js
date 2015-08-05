define([
    '../_BaseModel'
  , './InstanceModel'
], function(
    Parent,
    InstanceModel
){
    "use strict";
    function SequenceModel(name, parent) {
        this.name = name;
        this.instanceCounter = 0;        
        this.children = [];
        this.colors = ["#DC1F20", "#C95399", "#9E42F4", "#5939EC", "#5A86FE", "#A4E5FD", "#85C5A5", "#A9D323", "#F2E21D", "#D07f2C"];
        
        Object.defineProperty(this, 'parent', {
            value: parent,
            enumerable: false,
            writable: true,
            configurable: true
        });
    }
        
    var _p = SequenceModel.prototype = Object.create(Parent.prototype);
    
    _p.createNewInstance = function(axes, designSpace, project) {
        var instance = new InstanceModel(this.instanceCounter, axes, designSpace, this.colors[this.instanceCounter % this.colors.length], this, project);
        this.instanceCounter++;
        // the instance can not be added inmediately. It has to be registered (by the instance tools) first and then it should be added
        return instance;
    };

    _p.addInstance = function(instance) {
        this.children.push(instance);
        instance.setCurrent();
    };

    
    return SequenceModel;
});
