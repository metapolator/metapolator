define([
   './_BaseModel'
 , './masters/MasterSequenceModel'
 , './designSpaces/DesignSpaceModel'
 , './instances/InstanceSequenceModel'
], function(
    Parent
  , MasterSequenceModel
  , DesignSpaceModel
  , InstanceSequenceModel
){
    'use strict';
    function AppModel(project) {
        this._project = project; // todo: get rid of this. find a way to get project to writeCPS method
        this.projectName = 'Canola';
        //
        this.masterSequences = [];
        this.sequenceId = 0;
        this.lastMasterSelected = null;
        //
        this.designSpaces = [];
        this.designSpaceCounter = 0;
        this.currentDesignSpace = null;
        this.currentDesignSpaceTrigger = 0;
        this.nrOfAxesTrigger = 0;
        //
        this.instanceSequences = [];
        this.currentInstance = null;
        this.currentInstanceTrigger = 0;
        //
        this.localMenu = null;
        this.viewState = 0;
     }
    var _p = AppModel.prototype = Object.create(Parent.prototype);

    // masters
    _p.addSequence = function(name) {
        var sequence = new MasterSequenceModel(name, this, this.sequenceId++);
        this.masterSequences.push(sequence);
        return sequence;
    };

    _p.areMastersSelected = function () {
        for (var i = this.masterSequences.length - 1; i >= 0; i--) {
            var sequence = this.masterSequences[i];
            for (var j = sequence.children.length - 1; j >= 0; j--) {
                var master = sequence.children[j];
                if (master.edit) {
                    return true;
                }
            }
        }
        return false;
    };

    // design spaces
    _p.createNewDesignSpace = function() {
        var id = this.designSpaceCounter
            , name = 'Space ' + id
            , type = 'Control'
            , axes = []
            , slack = 0
            , designSpace;
        designSpace = new DesignSpaceModel(id, name, type, axes, slack, this);
        this.addDesignSpace(designSpace);
    };

    _p.addDesignSpace = function(designSpace) {
        this.designSpaces.push(designSpace);
        designSpace.setCurrent();
        this.designSpaceCounter++;
    };

    // instances
    _p.addInstanceSequence = function(name) {
        this.instanceSequences.push(
            new InstanceSequenceModel(name, this)
        );
    };

    _p.getInstanceAxesWithMaster = function(master, designSpace) {
        var axes = [];
        for (var i = this.instanceSequences.length - 1; i >= 0; i--) {
            var sequence = this.instanceSequences[i];
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
        for (var i = this.instanceSequences.length - 1; i >= 0; i--) {
            var sequence = this.instanceSequences[i];
            for (var j = sequence.children.length - 1; j >= 0; j--) {
                var instance = sequence.children[j];
                if (instance.designSpace === designSpace) {
                    instances.push(instance);
                }
            }
        }
        return instances;
    };
    
    _p.removeMasterFromDesignSpaces = function(master) {   
        for (var i = 0, l = this.designSpaces.length; i < l; i++) {
            var designSpace = this.designSpaces[i];
            if (designSpace.hasMaster(master)) {
                designSpace.removeAxis(master);
            } 
        }
    };

    return AppModel;
});
