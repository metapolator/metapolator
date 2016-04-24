define([
    '../_BaseModel'
], function(
    Parent
){
    "use strict";
    function DesignSpaceModel(id, name, type, axes, slack, parent) {
        this.id = id;
        this.name = name;
        this.type = type;
        this.axes = axes;
        this.slack = slack;
        this.lastInstance = null;
        Object.defineProperty(this, 'parent', {
            value: parent,
            enumerable: false,
            writable: true,
            configurable: true
        });
    }
    
    var _p = DesignSpaceModel.prototype = Object.create(Parent.prototype);

    _p.clone = function() {
        var id = this.parent.designSpaceCounter
          , name = "Space " + id
          , type = "Control"
          , axes = []
          , slack = this.slack
          , clone;
        for (var i = 0, l = this.axes.length; i < l; i++) {
            // keep the reference of the masters in it
            axes.push(this.axes[i]);
        }
        clone = new DesignSpaceModel(id, name, type, axes, slack, this.parent);
        this.parent.addDesignSpace(clone);
    };

    _p.remove = function() {
        var index = this._getIndex() ;
        this.parent.designSpaces.splice(index, 1);
        this._findNewCurrentDesignSpace(index);
    };

    _p.setCurrent = function() {
        this.parent.currentDesignSpace = this;
    };

    _p.isCurrent = function() {
        if (this.parent.currentDesignSpace === this) {
            return true;
        } else {
            return false;
        }
    };

    _p.addAxis = function(master) {
        this.axes.push(master);
        this.parent.nrOfAxesTrigger++;
    };

    _p.removeAxis = function(master) {
        var index = this._findMasterIndex(master)
          , axesWithMaster;
        this.axes.splice(index, 1);
        // setting the new slack if needed
        if (index < this.slack) {
            this.slack--;
        } else if (index === this.slack) {
            this.slack = 0;
        }
        if (this.axes.length < 3) {
            this.slack = 0;
        }
        // handle the effects on instances
        axesWithMaster = this.parent.getInstanceAxesWithMaster(master, this);
        if (this.axes.length === 0) {
           this._removeInstances(axesWithMaster); 
        } else {
            this._removeMasterFromInstances(axesWithMaster);
        }
        this.parent.nrOfAxesTrigger++;
    };
    
    _p._removeInstances = function(axesWithMaster) {
        for (var i = axesWithMaster.length - 1; i >= 0; i--) {
            var instance = axesWithMaster[i].parent;
            instance.remove();
        }
    };
    
    _p._removeMasterFromInstances = function(axesWithMaster) {
        for (var i = axesWithMaster.length - 1; i >= 0; i--) {
            var axis = axesWithMaster[i];
            axis.remove();
        }
    };
    
    _p.hasMaster = function(master) {
        for (var i = this.axes.length - 1; i >= 0; i--) {
            var axis = this.axes[i];
            if (axis === master) {
                return true;
            }
        }
        return false;
    };

    _p._getIndex = function() {
        for (var i = this.parent.designSpaces.length - 1; i >= 0; i--) {
            var designSpace = this.parent.designSpaces[i];
            if (designSpace === this) {
                return i;
            }
        }
    };

    _p._findNewCurrentDesignSpace = function (index) {
        var l = this.parent.designSpaces.length;
        if (l > index) {
            this.parent.designSpaces[index].setCurrent();
        } else if (l === 0) {
            this.parent.currentDesignSpace = null;
        } else {
            this.parent.designSpaces[l - 1].setCurrent();
        }
    };

    _p._findMasterIndex = function(master) {
        for (var i = this.axes.length - 1; i >= 0; i--) {
            var thisMaster = this.axes[i];
            if (thisMaster === master) {
                return i;
            }
        }
    };
    
    _p.setLastInstance = function(instance) {
        this.lastInstance = instance;
    };
    
    return DesignSpaceModel;
});
