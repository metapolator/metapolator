define([
    './SelectionParameter'
], function(
    SelectionParameter
){
    "use strict";
    function Selection(level, baseParameters, baseOperators) {
        this.level = level;
        this.parameters = [];
        this.elements = [];
        this.baseParameters = baseParameters;
        this.baseOperators = baseOperators;
    }
        
    var _p = Selection.prototype;

    _p.updateParameters = function() {
        this.parameters = [];
        for (var i = this.baseParameters.length - 1; i >= 0; i--) {
            var baseParameter = this.baseParameters[i];
            if (this._hasThisParameter(baseParameter)) {
                var newParameter = new SelectionParameter(this, baseParameter, this.baseOperators);
                this.parameters.push(newParameter);
                newParameter.updateOperators();
            }
        }
    };

    _p._hasThisParameter = function (baseParameter) {
        for (var i = this.elements.length - 1; i >= 0; i--) {
            var element = this.elements[i];
            for (var j = element.parameters.length - 1; j >= 0; j--) {
                if (element.parameters[j].base.name === baseParameter.name) {
                    return true;
                }
            }
        }
        return false;
    };

    _p.getParameterByName = function(parameterName) {
        for (var i = this.parameters.length - 1; i >= 0; i--) {
            var thisParameter = this.parameters[i];
            if(thisParameter.base.name === parameterName) {
                return thisParameter;
            }
        }
        return null;
    };


    /*

     _p.addStackedParameter = function(parameter) {
     if (this.stackedParameters.indexOf(parameter) == -1) {
     this.stackedParameters.push(parameter);
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
    */

    
    return Selection;
});
