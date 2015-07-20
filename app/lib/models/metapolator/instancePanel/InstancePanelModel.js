define([
    '../_BaseModel'
  , './SequenceModel'
], function(
    Parent
  , SequenceModel
){
    "use strict";
    function InstancePanelModel(parent) {
        this.sequences = [];
        this.currentInstance = null;
        this.currentInstanceTrigger = 0;
        Object.defineProperty(this, 'parent', {
            value: parent,
            enumerable: false,
            writable: true,
            configurable: true
        });
    }
    
    var _p = InstancePanelModel.prototype = Object.create(Parent.prototype);
    
    _p.addSequence = function(name) {
        this.sequences.push(
            new SequenceModel(name, this)
        );
    };

    _p.getInstanceAxesWithMaster = function(master, designSpace) {
        var axes = [];
        for (var i = this.sequences.length - 1; i >= 0; i--) {
            var sequence = this.sequences[i];
            for (var j = sequence.children.length - 1; j >= 0; j--) {
                var instance = sequence.children[j];
                if (instance.designSpace === designSpace) {
                    for (var k = instance.axes.length - 1; k >= 0; k--) {
                        var axis = instance.axes[k];
                        if (axis.master === master) {
                            axes.push(axis);
                        }
                    }
                }
            }
        }
        return axes;
    };

    _p.getInstancesInDesignSpace= function(designSpace) {
        var instances = [];
        for (var i = this.sequences.length - 1; i >= 0; i--) {
            var sequence = this.sequences[i];
            for (var j = sequence.children.length - 1; j >= 0; j--) {
                var instance = sequence.children[j];
                if (instance.designSpace === designSpace) {
                    instances.push(instance);
                }
            }
        }
        return instances;
    };
    
    
    return InstancePanelModel;
});
