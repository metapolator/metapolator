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

    _p.createNewDesignSpace = function() {
        var id = this.designSpaceCounter
          , name = "Space " + id
          , type = "Control"
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


    

    
    return DesignSpacePanelModel;
});
