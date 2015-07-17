define([
    './_ElementModel'
], function(
    Parent
){
    "use strict";
    function PointModel(name, baseParameters, baseOperators, parent, MOMelement) {
        this.level = "point";
        this.name = name;

        // cps properties
        this.parameters = [];
        this.master = parent.master;
        this.MOMelement = MOMelement;
        this.ruleIndex = null;

        this.addBaseModels(baseParameters, baseOperators);
        
        Object.defineProperty(this, 'parent', {
            value: parent,
            enumerable: false,
            writable: true,
            configurable: true
        });
    }
    
    var _p = PointModel.prototype = Object.create(Parent.prototype);

    _p.getSelector = function() {
        return "master#" + this.master.name + " " + "glyph#" + this.parent.parent.name + " > " + this.parent.name + " > " + this.name + " > right" ;


    };

    return PointModel;
});
