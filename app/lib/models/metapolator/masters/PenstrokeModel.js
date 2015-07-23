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
        this.parent = parent;
        this.children = [];

        // cps properties
        this.parameters = [];
        this.master = parent.master;
        this.MOMelement = MOMelement;
        this.ruleIndex = null;

        this.setInitialParameters();
    }
    
    var _p = PenstrokeModel.prototype = Object.create(Parent.prototype);

    _p.getSelector = function() {
        return "master#" + this.master.name + " " + "glyph#" + this.parent.name + " > " + this.name;

    };
    
    _p.addPoint = function(name, MOMelement) {
        this.children.push(
            new PointModel(name, this, MOMelement)
        );
    };

    return PenstrokeModel;
});
