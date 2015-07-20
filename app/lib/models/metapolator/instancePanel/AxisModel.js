define([
    '../_BaseModel'
], function(
    Parent
){
    "use strict";
    function AxisModel(master, axisValue, metapolationValue, parent) {
        this.parent = parent;
        this.master = master;
        this.axisValue = axisValue;
        this.metapolationValue = metapolationValue;
    }
    
    var _p = AxisModel.prototype = Object.create(Parent.prototype);

    _p.remove = function(slack, project) {
        var index = this._getIndex();
        this.parent.axes.splice(index, 1);
        this.parent.reDestributeAxes();
        this.parent.updateCPSFile();
        this.parent.setMetapolationValues();
    };

    _p._getIndex = function() {
        for (var i = this.parent.axes.length - 1; i >= 0; i--) {
            var axis = this.parent.axes[i];
            if (axis === this) {
                return i;
            }
        }
    };
    
    return AxisModel;
});
