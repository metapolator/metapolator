define([
    './_ElementModel'
  , './MasterModel'
], function(
    _ElementModel
  , MasterModel
){
    "use strict";
    function SequenceModel(name, baseParameters, baseOperators, parent) {
        this.name = name;
        this.level = "sequence";
        this.canEdit = true;
        this.children = [];
        this.addBaseModels(baseParameters, baseOperators);
        Object.defineProperty(this, 'parent', {
            value: parent,
            enumerable: false,
            writable: true,
            configurable: true
        });
    }
        
    var _p = SequenceModel.prototype = Object.create(_ElementModel.prototype);
    
    _p.addMaster = function(name) {
        window.logCall("addMaster");
        this.children.push(
            new MasterModel(name, this.baseParameters, this.baseOperators, this, this.parent)
        );
    };
    

    
    return SequenceModel;
});
