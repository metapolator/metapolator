define([
    '../_BaseModel'
  , './InstanceModel'
], function(
    _BaseModel,
    InstanceModel
){
    "use strict";
    function SequenceModel(name, parent) {
        this.name = name;
        this.instanceCounter = 0;        
        this.children = [];
        this.colorCounter = 0;
        this.colors = ["#DC1F20", "#C95399", "#9E42F4", "#5939EC", "#5A86FE", "#A4E5FD", "#85C5A5", "#A9D323", "#F2E21D", "#D07f2C"];
        
        Object.defineProperty(this, 'parent', {
            value: parent,
            enumerable: false,
            writable: true,
            configurable: true
        });
    }
        
    var _p = SequenceModel.prototype = Object.create(_BaseModel.prototype);
    
    _p.addInstance = function(axes, designSpace) {
        window.logCall("addInstance");
        var id = this.instanceCounter;
        var color = this.colors[this.colorCounter];
        this.children.push(
            new InstanceModel(id, "instance" + id, "Instance " + id, axes, designSpace, color, this)
        );   
        this.instanceCounter++;
        this.colorCounter++;
        if (this.colorCounter >= this.colors.length) {
            this.colorCounter = 0;
        }  
        //set the newly created instance as current instance
        this.parent.setCurrentInstance(this.children[this.children.length - 1]);
    };

    
    return SequenceModel;
});
