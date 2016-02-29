define([
    './_ElementModel'
  , './PointModel'
], function(
    Parent
  , PointModel
){
    "use strict";
    function PenstrokeModel(name, parent, MOMelement) {
        this.level = "penstroke";
        this.name = name;
        this.edit = true;
        this.parent = parent;
        this.children = [];

        // cps properties
        this.parameters = [];
        this.master = parent.master;
        this.MOMelement = MOMelement;

        this.setInitialParameters();
    }
    
    var _p = PenstrokeModel.prototype = Object.create(Parent.prototype);
    
    _p.addPoint = function(name, MOMelement) {
        this.children.push(
            new PointModel(name, this, MOMelement)
        );
    };

    return PenstrokeModel;
});
