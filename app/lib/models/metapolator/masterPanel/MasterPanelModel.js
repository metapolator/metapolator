define([
    '../_BaseModel'
  , './SequenceModel'
  , './selectionModel/SelectionModel'
], function(
    Parent
  , SequenceModel
  , SelectionModel
){
    "use strict";
    function MasterPanelModel() {
        this.sequences = [];
        this.lastMasterSelected = null;
        this.selection = {};
        this.stackedParameters = [];
        this.sequenceId = 0;
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
            getInitial : function(MOMelement) {
                // temp hack untill #392 is fixed
                return MOMelement._advanceWidth;
            }
        }, {
            name : "Weight",
            cpsKey : "WeightF",
            unit : "em",
            step : 0.1,
            decimals : 2,
            effectiveLevel : "point",
            getInitial : function(MOMelement) {
                return MOMelement.right.getComputedStyle().get("onLength");
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
        }, {
            order : 5,
            name : "min",
            standardValue : 0,
            type : "unique",
            usesUnit : true,
            effectiveLocal : false
        }, {
            order : 6,
            name : "max",
            standardValue : 0,
            type : "unique",
            usesUnit : true,
            effectiveLocal : false
        }];
    }

    var _p = MasterPanelModel.prototype = Object.create(Parent.prototype);

    _p.addStackedParameter = function(parameter) {
        if (this.stackedParameters.indexOf(parameter) == -1) {
            this.stackedParameters.push(parameter);
        }
    };

    _p.updateSelections = function(updatedLevel) {
        // updateSelections is called whenever a selection at this level is changed
        this.destackOperators(updatedLevel);
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
            if (parentEmpty || this.selection[level].elements.length === 0) {
                // if this level is empty, then deeper levels are empty automatically
                parentEmpty = true;
            }
        }
    };

    _p.destackOperators = function(level) {
        // when a selection of a certain level changes, all the operators are destacked
        // this means also that operator id's are set to null
        var elements = this.stackedParameters;
        for (var i = elements.length - 1; i >= 0; i--) {
            var element = elements[i];
            if (element.level === level) {
                element.destackOperators();
            }
        }
        // after destacking, empty the list
        this.stackedParameters = [];
    };

    _p.addSelectionLevel = function(level) {
        this.selection[level] = new SelectionModel(
            level, this.baseParameters, this.baseOperators, this.sequences, this.allLevels, this
        );
    };

    _p.addSequence = function(name) {
        var sequence = new SequenceModel(name, this.baseParameters, this.baseOperators, this, this.sequenceId++);
        this.sequences.push(sequence);
        return sequence;
    };

    _p.areChildrenSelected = function () {
        for (var i = this.sequences.length - 1; i >= 0; i--) {
            var sequence = this.sequences[i];
            for (var j = sequence.children.length - 1; j >= 0; j--) {
                var master = sequence.children[j];
                if (master.edit) {
                    return true;
                }
            }
        }
        return false;
    };

    return MasterPanelModel;
});
