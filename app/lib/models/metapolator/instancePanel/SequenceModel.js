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
    
    _p.createInstance = function(axes, designSpace) {
        window.logCall("addInstance");
        var instance = new InstanceModel(this.instanceCounter, axes, designSpace, this.colors[this.instanceCounter / this.colors.length], this);
        this.instanceCounter++;
        return instance;
    };

    _p.addInstance = function(instance) {
        console.log(instance);
        this.children.push(instance);
        //set the newly created instance as current instance
        this.parent.setCurrentInstance(this.children[this.children.length - 1]);
    };

    
    return SequenceModel;
});
