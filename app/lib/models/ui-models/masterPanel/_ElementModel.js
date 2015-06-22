define([
    './ParameterModel'
],
function(
    ParameterModel
)
{
    "use strict";
    function _ElementModel() {
    }

    var _p = _ElementModel.prototype;
    
    _p.deselectAllChildren = function() {
        window.logCall("deselectAllChildren");
        for (var i = this.children.length -1; i >= 0; i--) {
            var child = this.children[i];
            child.edit = false;
        }
    };
    
    _p.setInitialParameters = function() {
        // on the creation of an element, we check if there are effective parameters
        // at the level of the element
        for (var i = this.baseParameters.length - 1; i >= 0; i--) {
            var baseParameter = this.baseParameters[i];
            if (baseParameter.effectiveLevel == this.level) {
                this.addParameter(baseParameter);    
            }
        }
    };
    
    _p.addBaseModels = function (baseParameters, baseOperators) {
        this.baseParameters = baseParameters;
        this.baseOperators = baseOperators;
        this.setInitialParameters();
    };
    
    _p.getParameterByName = function(parameterName) {
        window.logCall("getParameterByName");
        for (var i = this.parameters.length - 1; i >= 0; i--) {
            var thisParameter = this.parameters[i];
            if (thisParameter.name == parameterName) {
                return thisParameter;
            }
        }
        return null;
    };
    
    _p.setValue = function(changedParameter, changedOperator, value) {
        window.logCall("setValue");
        // with editing in ranges, we can want to set a value of a 
        // not yet existing parameter and/or operator
        // if it doens't exist yet, we create it.
        var parameter = this.findParameter(changedParameter)
          , id = changedOperator.id;
        if (parameter) {
            var operator = parameter.findOperator(changedOperator, id);
            if (operator) {
                // it has the parameter and the operator
                operator.setValue(value);
            } else {
                // it has the parameter, but it hasn't the operator yet
                parameter.addOperator(changedOperator, id);
                parameter.operators[parameter.operators.length - 1].setValue(value);
            }
        } else {
            // it hasn't the parameter (and thus the parameter) yet
            this.addParameter(changedParameter);
            var parameter = this.parameters[this.parameters.length - 1];
            parameter.addOperator(changedOperator, id);
            var operator = parameter.operators[parameter.operators.length - 1];
            operator.setValue(value);
        }
    };
    
    _p.addParameter = function(parameter) {
        window.logCall("addParameter");
        this.parameters.push(
            new ParameterModel(parameter, this.level, this.masterPanel)
        );
    };
    
    _p.addParameterOperator = function(addedParameter, operator, id) {
        window.logCall("addParameterOperator");
        var parameter = this.findParameter(addedParameter);
        if (parameter) {
            parameter.addOperator(operator, id);
        } else {
            this.addParameter(addedParameter);
            this.parameters[this.parameters.length - 1].addOperator(operator, id);
        }
    };
    
    _p.findParameter = function(parameter) {
        window.logCall("findParameter");
        for (var i = this.parameters.length - 1; i >= 0; i--) {
            var thisParameter = this.parameters[i];
            if (thisParameter.name == parameter.name) {
                return thisParameter;
            }
        }
        return null;
    };
    
    _p.findLevelOffspring = function(level) {
        window.logCall("findLevelOffspring");
        var levelOffspring = [this]
          , tempArray = [];
        while(levelOffspring[0].level != level) {
            for (var i = levelOffspring.length - 1; i >= 0; i--) {
                var element = levelOffspring[i];
                for (var j = element.children.length - 1; j >= 0; j--) {
                    var child = element.children[j];
                    tempArray.push(child);
                }
            }          
            levelOffspring = tempArray;
            tempArray = [];
        }
        return levelOffspring;
    };
    
    return _ElementModel;
});