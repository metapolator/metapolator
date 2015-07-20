define([
    '../_BaseModel'
  , './PanelModel'
], function(
    Parent
  , PanelModel
){
    "use strict";
    function DisplayModel() {
        this.panel = new PanelModel();
    }
    
    var _p = DisplayModel.prototype = Object.create(Parent.prototype);
    
    return DisplayModel;
});
