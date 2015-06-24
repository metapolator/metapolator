define([
    '../_BaseModel'
  , './PanelModel'
  , './DialogModel'
], function(
    Parent
  , PanelModel
  , DialogModel
){
    "use strict";
    function DisplayModel() {
        this.localMenu = null;
        this.panel = new PanelModel();
        this.dialog = new DialogModel();
    }
    
    var _p = DisplayModel.prototype = Object.create(Parent.prototype);
    
    return DisplayModel;
});
