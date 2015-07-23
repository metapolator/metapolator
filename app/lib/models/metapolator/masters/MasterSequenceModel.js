define([
    './_ElementModel'
  , './MasterModel'
], function(
    Parent
  , MasterModel
){
    "use strict";
    function SequenceModel(name, parent, id) {
        this.id = id;
        this.name = name;
        this.level = "sequence";
        this.canEdit = true;
        this.parent = parent;
        this.children = [];

        this.masterId = 0;
    }
        
    var _p = SequenceModel.prototype = Object.create(Parent.prototype);
    
    _p.addMaster = function(name, MOMelement, cpsFile) {
        var master = new MasterModel(name, this, MOMelement, cpsFile, this.id, this.masterId++);
        this.children.push(master);
        return master;
    };

    _p.addToMasterId = function() {
        return this.masterId++;
    };
    

    
    return SequenceModel;
});
