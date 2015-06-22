define([
    '../_BaseModel'
  , './SequenceModel'
], function(
    _BaseModel
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
    
    var _p = InstancePanelModel.prototype = Object.create(_BaseModel.prototype);
    
    _p.setCurrentInstance = function(instance) {
        this.currentInstance = instance;
        if (instance) {
            instance.designSpace.setLastInstance(instance);
        }
        this.currentInstanceTrigger++;
        this.parent.specimen2.updateSelectedMasters(this.sequences);
    };
    
    /*
    _p.updateSelectedMasters = function() {
        window.logCall("updateSelectedMasters");
        var selectedMasters = [];
        for (var i = 0, il = this.sequences.length; i < il; i++) {
            var sequence = this.sequences[i];
            for (var j = 0, jl = sequence.children.length; j < jl; j++) {
                var instance = sequence.children[j];
                console.log(instance);
                if (instance == this.currentInstance || instance.display) {
                    selectedMasters.push(instance);
                }
            }
        }
        this.selectedMasters = selectedMasters;
    };
    */
    
    _p.addSequence = function(name) {
        window.logCall("addSequence");
        this.sequences.push(
            new SequenceModel(name, this)
        );
    };
    
    _p.countInstancesWithMaster = function(master) {
        window.logCall("countInstancesWithMaster");
        var n = 0;
        for (var i = this.sequences.length - 1; i >= 0; i--) {
            var sequence = this.sequences[i];
            for (var j = sequence.children.length - 1; j >= 0; j--) {
                var instance = sequence.children[j];
                for (var k = instance.axes.length - 1; k >= 0; k--) {
                    var axis = instance.axes[k];
                    if (axis.master == master) {
                        n++;
                    } 
                }
            }
        }
        return n;
    };
    
    _p.countInstancesWithDesignSpace = function(designSpace) {
        window.logCall("countInstancesWithDesignSpace");
        var n = 0;
        for (var i = this.sequences.length - 1; i >= 0; i--) {
            var sequence = this.sequences[i];
            for (var j = sequence.children.length - 1; j >= 0; j--) {
                var instance = sequence.children[j];
                if (instance.designSpace == designSpace) {
                    n++;
                }  
            }
        }
        return n;
    };
    
    _p.deleteMasterFromInstances = function (designSpace, master) {
        window.logCall("deleteMasterFromInstances");
        for (var i = this.sequences.length - 1; i >= 0; i--) {
            var sequence = this.sequences[i];
            for (var j = sequence.children.length - 1; j >= 0; j--) {
                var instance = sequence.children[j];
                if (instance.designSpace == designSpace) {
                    var index = findMaster(instance, master);
                    if (index) {
                        instance.axes.splice(index, 1);
                        instance.updateMetapolationValues();
                    }
                }
            }
        }
        
        function findMaster(instance, master) {
            for (var i = instance.axes.length - 1; i >= 0; i--) {
                var axis = instance.axes[i];
                if (axis.master == master) {
                    return i;
                }  
            }
            return false;
        }
    };
    
    _p.removeInstanceOnDesignSpace = function (designSpace) {
        window.logCall("removeInstanceOnDesignSpace");
        var thisIndex
          , self = this;
          
        for (var i = this.sequences.length - 1; i >= 0; i--) {
            var sequence = this.sequences[i];
            var notDeleted = [];
            for (var j = sequence.children.length - 1; j >= 0; j--) {
                var instance = sequence.children[j];
                if (instance.designSpace != designSpace) {
                    notDeleted.push(instance);
                }
                if (instance == this.currentInstance) {
                    thisIndex = j;
                }
            }
            sequence.children = notDeleted;
        }
        this.findNewCurrentInstance(thisIndex);
    };
    
    _p.findNewCurrentInstance = function (index) {
        window.logCall("updateMetapolationValues");
        var l = this.sequences[0].children.length;   
        if (l > index) {
            this.setCurrentInstance(this.sequences[0].children[index]);
        } else if (l == 0) {
            this.setCurrentInstance(null);
        } else {
            this.setCurrentInstance(this.sequences[0].children[l - 1]);
        }
    };
    
    
    return InstancePanelModel;
});
