define([
    './_ElementModel'
  , './MasterModel'
], function(
    Parent
  , MasterModel
){
    "use strict";
    function SequenceModel(name, baseParameters, baseOperators, parent, id) {
        this.id = id;
        this.name = name;
        this.level = "sequence";
        this.canEdit = true;
        this.children = [];
        this.masterId = 0;
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
        var master = new MasterModel(name, this.baseParameters, this.baseOperators, this, MOMelement, cpsFile, this.id, this.masterId++);
        this.children.push(master);
        return master;
    };

    _p.addToMasterId = function() {
        return this.masterId++;
    };
    

    
    return SequenceModel;
});
