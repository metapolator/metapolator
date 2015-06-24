define([
    '../_BaseModel'
  , '../Appmodel'
  , './SequenceModel'
  , './selectionModel/selectionModel'
], function(
    _BaseModel
  , Appmodel
  , SequenceModel
  , selectionModel
){
    "use strict";
    function MasterPanelModel() {
        this.sequences = [];
        this.lastMasterSelected = null;
        this.selection = {};
        this.stackedParameters = [];
        /*
         // until #392 is fixed, we work only with width and weight
    
         this.baseParameters = [{
         name : "Weight",
         cpsKey : "WeightF",
         unit : "em",
         step : 0.1,
         decimals : 2,
         effectiveLevel : 3
         }, {
         name : "Width",
         unit : "em",
         step : 0.005,
         decimals : 4,
         effectiveLevel : "glyph"
         }, {
         name : "Height",
         unit : "em",
         step : 0.02,
         decimals : 3,
         effectiveLevel : "glyph"
         }, {
         name : "Spacing",
         unit : "em",
         step : 1,
         decimals : 1,
         effectiveLevel : "glyph"
         }];
         */
        this.allLevels = ["master", "glyph", "penstroke", "point"];
        this.baseParameters = [{
            name : "Width",
            cpsKey : "WidthF",
            unit : "em",
            step : 0.005,
            decimals : 4,
            effectiveLevel : "glyph",
            getInitial : function(element) {
                // temp hack untill #392 is fixed
                //return element._advanceWidth;
            }
        }, {
            name : "Weight",
            cpsKey : "WeightF",
            unit : "em",
            step : 0.1,
            decimals : 2,
            effectiveLevel : "point",
            getInitial : function(element) {
                //return element.right.getComputedStyle().get("onLength");
            }
        }];
        this.baseOperators = [{
            order : 0,
            name : "x",
            standardValue : 1,
            type : "stack",
            usesUnit : false,
            effectiveLocal : true
        }, {
            order : 1,
            name : "÷",
            standardValue : 1,
            type : "stack",
            usesUnit : false,
            effectiveLocal : true
        }, {
            order : 2,
            name : "+",
            standardValue : 0,
            type : "stack",
            usesUnit : true,
            effectiveLocal : false
        }, {
            order : 3,
            name : "-",
            standardValue : 0,
            type : "stack",
            usesUnit : true,
            effectiveLocal : false
        }, {
            order : 4,
            name : "=",
            standardValue : null,
            type : "unique",
            usesUnit : true,
            effectiveLocal : false
        }];
    }
        
    var _p = MasterPanelModel.prototype = Object.create(_BaseModel.prototype);
    
    _p.addStackedParameter = function(parameter) {
        if (this.stackedParameters.indexOf(parameter) == -1) {
            this.stackedParameters.push(parameter);
        }
    };
    
    _p.updateSelections = function(updatedLevel) {
        window.logCall("updateSelections");
        this.destackOperators();
        var parentEmpty = false;
        // and do this for all levels beyond
        var beyond = false;
        for (var i = 0, l = this.allLevels.length; i < l; i++) {
            var level = this.allLevels[i];
            if (level == updatedLevel) {
                beyond = true;
            }   
            if (beyond) {
                this.selection[level].updateThisSelection(parentEmpty);
            }
            if (parentEmpty || this.selection[level].elements.length == 0) {
                // if this level is empty, then deeper levels are empty automatically
                parentEmpty = true;
            }
        }       
    };
    
    _p.destackOperators = function() {
        window.logCall("destackOperators");
        var elements = this.stackedParameters;
        for (var i = elements.length - 1; i >= 0; i--) {
            var element = elements[i];
            element.destackOperators();
        }
        // after destacking, empty the list
        this.stackedParameters = [];
    };
    
    _p.addSelectionLevel = function(level) {
        window.logCall("addSelectionLevel");
        this.selection[level] = new selectionModel(
            level, this.baseParameters, this.baseOperators, this.sequences, this.allLevels, this
        );
    };
    
    _p.addSequence = function(name) {
        window.logCall("addSequence");
        this.sequences.push(
            new SequenceModel(
                name, this.baseParameters, this.baseOperators, this
            )
        );
    };
    
    _p.areChildrenSelected = function () {
        for (var i = this.sequences.length - 1; i >= 0; i--) {
            var sequence = this.sequences[i];
            for (var j = sequence.children.length - 1; j >= 0; j--) {
                var master = sequence.children[j];
                if (master.edit[0]) {
                    return true;    
                }
            }
        }   
        return false;
    };
    
    return MasterPanelModel;
});
