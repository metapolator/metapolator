define([
   './_BaseModel'
 , './specimenPanel/SpecimenModel'
 , './masterPanel/MasterPanelModel'
 , './designSpacePanel/DesignSpacePanelModel'
 , './instancePanel/InstancePanelModel'
 , './DisplayModel/DisplayModel'
], function(
    _BaseModel
  , SpecimenModel
  , MasterPanelModel
  , DesignSpacePanelModel
  , InstancePanelModel
  , DisplayModel
){
    "use strict";
    function AppModel() {
        this.projectName = "Canola";
        this.glyphs = ["A", "B", "C", "D", "E", "F", "G", "H", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z", "a", "b", "c", "d", "e", "f", "g", "h", "i", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z", "space"];
        this.specimen1 = new SpecimenModel(true, true, "masters", this);
        this.masterPanel = new MasterPanelModel();
        this.designSpacePanel = new DesignSpacePanelModel();
        this.specimen2 = new SpecimenModel(false, false, "instances", this);
        this.instancePanel = new InstancePanelModel(this);
        //
        this.display = new DisplayModel();
     }
    var _p = AppModel.prototype = Object.create(_BaseModel.prototype);
    
    _p.addSequence = function(name) {
        this.sequences.push(
            new SequenceModel(name)
        );
    };
    
    return AppModel;
});
