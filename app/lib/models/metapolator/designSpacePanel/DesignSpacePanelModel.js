define([
    '../_BaseModel'
  , './DesignSpaceModel'
], function(
    Parent
  , DesignSpaceModel
){
    "use strict";
    function DesignSpacePanelModel() {
        this.designSpaceCounter = 0;
        this.designSpaces = [];
        this.currentDesignSpace = null;
        this.currentDesignSpaceTrigger = 0;
        this.nrOfAxesTrigger = 0;
    }
    
    var _p = DesignSpacePanelModel.prototype = Object.create(Parent.prototype);
    
    _p.setCurrentDesignSpace = function(designSpace) {
        this.currentDesignSpace = designSpace;
        this.currentDesignSpaceTrigger++;
    };
    
    _p.addDesignSpace = function() {
        window.logCall("addDesignSpace");
        var id = this.designSpaceCounter
          , name = "Space " + id
          , type = "Control"
          , axes = []
          , slack = 0;
        this.designSpaces.push(
            new DesignSpaceModel(id, name, type, axes, slack, this)
        );      
        this.designSpaceCounter++;
        this.setCurrentDesignSpace(this.designSpaces[this.designSpaces.length - 1]);
    };
    
    _p.removeDesignSpace = function(designSpace) {
        window.logCall("removeDesignSpace");
        var self = this
          , index = findDesignSpace(designSpace) ;
        this.designSpaces.splice(index, 1);
        this.findNewCurrentDesignSpace(index);   
        
        function findDesignSpace(designSpace) {
            for (var i = self.designSpaces.length - 1; i >= 0; i--) {
                var thisDesignSpace = self.designSpaces[i];
                if (thisDesignSpace == designSpace) {
                    return i;
                }
            }
        }
    };
    
    _p.duplicateDesignSpace = function() {
        window.logCall("duplicateDesignSpace");
        var duplicate = this.currentDesignSpace
          , id = this.designSpaceCounter
          , name = "Space " + id
          , type = "Control"
          , axes = []
          , slack = duplicate.slack;
        for (var i = 0, l = duplicate.axes.length; i < l; i++) {
            axes.push(duplicate.axes[i]);
        }
        this.designSpaces.push(
            new DesignSpaceModel(id, name, type, axes, slack, this)
        );      
        this.designSpaceCounter++;
        this.setCurrentDesignSpace(this.designSpaces[this.designSpaces.length - 1]);
    };
    
    _p.findNewCurrentDesignSpace = function (index) {
        window.logCall("findNewCurrentDesignSpace");
        var l = this.designSpaces.length;   
        if (l > index) {
            this.setCurrentDesignSpace(this.designSpaces[index]);
        } else if (l == 0) {
            this.setCurrentDesignSpace(null);
        } else {
            this.setCurrentDesignSpace(this.designSpaces[l - 1]);
        }
    };
    
    return DesignSpacePanelModel;
});
