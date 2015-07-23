define([
    './_ElementModel'
], function(
    Parent
){
    "use strict";
    function PointModel(name, parent, MOMelement) {
        this.level = "point";
        this.name = name;
        this.edit = true;
        this.parent = parent;

        // cps properties
        this.parameters = [];
        this.master = parent.master;
        this.MOMelement = MOMelement;
        this.ruleIndex = null;

        this.setInitialParameters();
    }
    
    var _p = PointModel.prototype = Object.create(Parent.prototype);

    _p.getSelector = function() {
        return "master#" + this.master.name + " " + "glyph#" + this.parent.parent.name + " > " + this.parent.name + " > " + this.name + " > right" ;
    };

    return PointModel;
});
