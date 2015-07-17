define([
    './_ElementModel'
  , './MasterModel'
], function(
    Parent
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
        
    var _p = SequenceModel.prototype = Object.create(Parent.prototype);
    
    _p.addMaster = function(name, MOMelement, cpsFile) {
        window.logCall("addMaster");
        var master = new MasterModel(name, this.baseParameters, this.baseOperators, this, MOMelement, cpsFile);
        this.children.push(master);
        return master;
    };
    

    
    return SequenceModel;
});
