define([
    '../../_BaseModel'
  , './SelectionParameterModel'
], function(
    _BaseModel
  , SelectionParameterModel
){
    "use strict";
    function SelectionModel(level, parameters, operators, sequences, allLevels, parent) {
        this.parent = parent;
        this.level = level;
        this.allLevels = allLevels;
        this.selectionParameters = [];
        this.baseParameters = parameters;
        this.baseOperators = operators;
        this.elements = [];
        // should do this with inheritiance
        this.allElements = sequences;
    }
        
    var _p = SelectionModel.prototype = Object.create(_BaseModel.prototype);
    
    _p.updateThisSelection = function(parentEmpty) {
        window.logCall("updateThisSelection: " + this.level);
        if (parentEmpty) {
            this.elements = [];
            this.selectionParameters = [];
        } else {
            this.elements = this.findSelectedElements(this.level); 
            if (this.elements.length > 0) {
                this.updateParameters();
            }
        }
    };
    
    _p.updateParameters = function() {
        window.logCall("updateParameters");
        var self = this;
        this.selectionParameters = [];
        for (var i = this.baseParameters.length - 1; i >= 0; i--) {
            var baseParameter = this.baseParameters[i];
            if (hasThisParameter(baseParameter)) {
                this.selectionParameters.push(
                    new SelectionParameterModel(self.level, baseParameter, self.baseOperators, self.elements)
                );
            }
        }
        
        function hasThisParameter(baseParameter) {
            for (var i = self.elements.length - 1; i >= 0; i--) {
                var element = self.elements[i];
                for (var j = element.parameters.length - 1; j >= 0; j--) {
                    var elementParameter = element.parameters[j];
                    if (elementParameter.name == baseParameter.name) {
                        return true;
                    }
                }
            }
            return false;
        }
    };
    
    _p.getParameterByName = function(parameterName) {
        window.logCall("getParameterByName");
        for (var i = this.selectionParameters.length - 1; i >= 0; i--) {
            var thisParameter = this.selectionParameters[i];
            if(thisParameter.name == parameterName) {
                return thisParameter;
            }
        }
        return null;
    };
    
    _p.findSelectedElements = function (level) { 
        window.logCall("findSelectedElements");  
        var levelElements = this.allElements;
        var thisLevel = "sequences";
        while (thisLevel != level && levelElements.length > 0) {
            var tempArray = [];
            for (var i = levelElements.length - 1; i >= 0; i--) {
                var levelElement = levelElements[i];
                for (var j = levelElement.children.length - 1; j >= 0; j--) {
                    var child = levelElement.children[j];
                    if ((child.level == "master" && child.edit[0]) ||
                        (child.level == "glyph" && child.edit) ||
                        child.level == "penstroke"  ||
                        child.level == "point") {
                        tempArray.push(child);
                    }
                }
            }  
            levelElements = tempArray;
            if (levelElements.length > 0) {
                thisLevel = levelElements[0].level;
            }
        }
        return levelElements;
    };

    
    return SelectionModel;
});
