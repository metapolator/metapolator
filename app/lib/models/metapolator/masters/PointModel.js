define([
    './_ElementModel'
], function(
    Parent
){
    "use strict";
    function PointModel(name, parent, momElement) {
        this.level = "point";
        this.name = name;
        this.edit = true;
        this.parent = parent;

        // cps properties
        this.parameters = [];
        this.master = parent.master;
        this.momElement = momElement;

        this.setInitialParameters();
    }

    var _p = PointModel.prototype = Object.create(Parent.prototype);

    return PointModel;
});
