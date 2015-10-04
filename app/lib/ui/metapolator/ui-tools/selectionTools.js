define([
    './selection/Selection'
], function(
    Selection
) {
    'use strict';
    var updateSelection
      , sequences = []
      , injectSequences
      , getSelectionElements
      , _getParentElements
      , _getNextLevel
      , _getPreviousLevel
      , panel = {
            level : null
          , type : null
          , left : null
          , top : null
          , parameter : null
          , operator : null
      }
      , closePanel
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
          , name : 'multiply'
          , sign : '×'
          , standardValue : 1
          , type : 'stack'
          , usesUnit : false
          , effectiveLocal : true
        }, {
            order : 1
          , name : 'divide'
          , sign : '∕'
          , standardValue : 1
          , type : 'stack'
          , usesUnit : false
          , effectiveLocal : true
        }, {
            order : 2
          , name : 'add'
          , sign : '+'
          , standardValue : 0
          , type : 'stack'
          , usesUnit : true
          , effectiveLocal : false
        }, {
            order : 3
          , name : 'subtract'
          , sign : '−'
          , standardValue : 0
          , type : 'stack'
          , usesUnit : true
          , effectiveLocal : false
        }, {
            order : 4
          , name : 'is'
          , sign : '='
          , standardValue : null
          , type : 'unique'
          , usesUnit : true
          , effectiveLocal : false
        }, {
            order : 5
          , name : 'min'
          , sign : 'min'
          , standardValue : 0
          , type : 'unique'
          , usesUnit : true
          , effectiveLocal : false
        }, {
            order : 6
          , name : 'max'
          , sign : 'max'
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

    updateSelection = function(level) {
        var nextLevel = _getNextLevel(level)
          , previousLevel = _getPreviousLevel(level)
          , elements = []
          , parentElements;
        if (previousLevel !== false) {
            parentElements = _getParentElements(previousLevel);
        } else {
            // this means we are at the highest level, its parents are
            // the stored sequences
            parentElements = sequences;
        }

        for (var i = 0, l = parentElements.length; i < l; i++) {
            var parentElement = parentElements[i];
            for (var j = 0, jl = parentElement.children.length; j < jl; j++) {
                var thisElement = parentElement.children[j];
                if (thisElement.edit) {
                    elements.push(thisElement);
                }
            }
        }
        selection[level].elements = elements;
        selection[level].destackParameters();
        selection[level].updateParameters();
        if (nextLevel !== false) {
            updateSelection(nextLevel, selection[level].elements);
        }
    };

    _getParentElements = function(level) {
        return selection[level].elements;
    };

    _getNextLevel = function(level) {
        var thisIndex = allLevels.indexOf(level);
        if (thisIndex === -1 || thisIndex + 1 === allLevels.length) {
            return false;
        } else {
            return allLevels[thisIndex + 1];
        }
    };

    _getPreviousLevel = function(level) {
        var thisIndex = allLevels.indexOf(level);
        if (thisIndex === -1 || thisIndex - 1 < 0) {
            return false;
        } else {
            return allLevels[thisIndex - 1];
        }
    };

    getSelectionElements = function(level) {
        return selection[level].elements;
    };

    injectSequences = function(injected) {
        sequences = injected;
    };

    closePanel = function() {
        panel.level = null;
        panel.type = null;
        panel.left = null;
        panel.top = null;
        panel.parameter = null;
        panel.operator = null;
    };

    return {
        selection : selection
      , injectSequences : injectSequences
      , updateSelection : updateSelection
      , getSelectionElements : getSelectionElements
      , allLevels : allLevels
      , baseParameters : baseParameters
      , baseOperators : baseOperators
      , panel : panel
      , closePanel : closePanel
    };
});
