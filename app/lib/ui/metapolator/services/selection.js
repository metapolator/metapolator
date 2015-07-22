define([
    './selectionModels/Selection'
], function(
    Selection
) {
    'use strict';
    var updateSelection
      , getSelectionElements
      , removeFromSelection
      , addToSelection
      , _destackOperators
      , _addStackedParameter
      , allLevels = ['master', 'glyph', 'penstroke', 'point']
      , baseParameters = [{
        name : 'Width'
      , cpsKey : 'WidthF'
      , unit : 'em'
      , step : 0.005
      , decimals : 4
      , effectiveLevel : 'glyph'
      , getInitial : function(MOMelement) {
            // temp hack untill #392 is fixed
            return MOMelement._advanceWidth;
        }
    }, {
        name : 'Weight'
      , cpsKey : 'WeightF'
      , unit : 'em'
      , step : 0.1
      , decimals : 2
      , effectiveLevel : 'point'
      , getInitial : function(MOMelement) {
            return MOMelement.right.getComputedStyle().get('onLength');
        }
      }]
      , baseOperators = [{
        order : 0
      , name : 'x'
      , standardValue : 1
      , type : 'stack'
      , usesUnit : false
      , effectiveLocal : true
    }, {
        order : 1
      , name : '÷'
      , standardValue : 1
      , type : 'stack'
      , usesUnit : false
      , effectiveLocal : true
    }, {
        order : 2
      , name : '+'
      , standardValue : 0
      , type : 'stack'
      , usesUnit : true
      , effectiveLocal : false
    }, {
        order : 3
      , name : '-'
      , standardValue : 0
      , type : 'stack'
      , usesUnit : true
      , effectiveLocal : false
    }, {
        order : 4
      , name : '='
      , standardValue : null
      , type : 'unique'
      , usesUnit : true
      , effectiveLocal : false
    }, {
        order : 5
      , name : 'min'
      , standardValue : 0
      , type : 'unique'
      , usesUnit : true
      , effectiveLocal : false
    }, {
        order : 6
      , name : 'max'
      , standardValue : 0
      , type : 'unique'
      , usesUnit : true
      , effectiveLocal : false
    }]
    , selection = {
        master : new Selection('master', baseParameters, baseOperators)
      , glyph : new Selection('glyph', baseParameters, baseOperators)
      , penstroke : new Selection('penstroke', baseParameters, baseOperators)
      , point : new Selection('point', baseParameters, baseOperators)
    };

    addToSelection = function(level, element) {
        var thisSelection = selection[level];
        if (thisSelection.elements.indexOf(element) === -1) {
            thisSelection.elements.push(element);
        }
    };

    removeFromSelection = function(level, element) {
        var thisSelection = selection[level];
        var index = getIndex(thisSelection.elements, element) ;
        if (index !== false) {
            thisSelection.elements.splice(index, 1);
        }

        function getIndex(elements, element) {
            for (var i = elements.length - 1; i >= 0; i--) {
                var thisElement = elements[i];
                if (thisElement === element) {
                    return i;
                }
            }
            return false;
        }
    };

    updateSelection = function(level) {
        selection[level].destackParameters();
        selection[level].updateParameters();
    };

    getSelectionElements = function(level) {
        return selection[level].elements;
    };

    /*
    setSelections = function(updatedLevel) {
        // SetSelections is called whenever a selection at this level is changed
        _destackOperators(updatedLevel);
        var parentEmpty = false;
        // and do this for all levels beyond
        var beyond = false;
        for (var i = 0, l = allLevels.length; i < l; i++) {
            var level = allLevels[i];
            if (level === updatedLevel) {
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
    */

    return {
        selection : selection
      , updateSelection : updateSelection
      , getSelectionElements : getSelectionElements
      , addToSelection : addToSelection
      , removeFromSelection : removeFromSelection
      , allLevels : allLevels
      , baseParameters : baseParameters // this one is public because measureGlyph needs it. todo: find another way to get them there
    };
});
