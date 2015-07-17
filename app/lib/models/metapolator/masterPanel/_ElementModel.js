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

    /*
    _p.getAncestor = function(level) {
        var levelElement = this;
        while (levelElement.level !== level) {
            levelElement = levelElement.parent;
        }
        return levelElement;
    };
    */
    
    _p.deselectAllChildren = function() {
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
    
    _p.addBaseModels = function(baseParameters, baseOperators) {
        this.baseParameters = baseParameters;
        this.baseOperators = baseOperators;
        this.setInitialParameters();
    };
    
    _p.getParameterByName = function(parameterName) {
        for (var i = this.parameters.length - 1; i >= 0; i--) {
            var thisParameter = this.parameters[i];
            if (thisParameter.name == parameterName) {
                return thisParameter;
            }
        }
        return null;
    };
    
    _p.addParameter = function(parameter) {
        this.parameters.push(
            new ParameterModel(parameter, this.level, this.master)
        );
    };
    
    _p.addParameterOperator = function(addedParameter, operator, id) {
        var parameter = this.findParameter(addedParameter);
        if (parameter) {
            parameter.addOperator(operator, id);
        } else {
            this.addParameter(addedParameter);
            this.parameters[this.parameters.length - 1].addOperator(operator, id);
        }
    };
    
    _p.findParameter = function(parameter) {
        for (var i = this.parameters.length - 1; i >= 0; i--) {
            var thisParameter = this.parameters[i];
            if (thisParameter.name == parameter.name) {
                return thisParameter;
            }
        }
        return null;
    };
    
    _p.findLevelOffspring = function(level) {
        // this function starts to walk down the tree until it reaches the argument level
        // and returns all element of that specific level. Eg: If you ask for point level
        // of glyph "A", it returns all points of "A".
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

    _p.clone = function() {
        var clone = {};
        clone = new this.constructor();
        this._cloneProperties(clone);
        if(this.children) {
            this._cloneChildren(clone);
        }
        if(this.parameters) {
            this._cloneParameters(clone);
        }
        return clone;
    };

    _p._cloneProperties = function(clone) {
        for (var propertyName in this) {
            if (propertyName !== "children" && propertyName !== "parent" &&
                propertyName !== "$$hashKey" && propertyName !== "parameters") {
                clone[propertyName] = this[propertyName];
            }
        }
    };

    _p._cloneChildren = function(clone) {
        clone.children = [];
        for (var i = 0, l = this.children.length; i < l; i++) {
            clone.add(this.children[i].clone());
        }
    };

    _p._cloneParameters = function(clone) {
        clone.parameters = [];
        for (var i = 0, l = this.parameters.length; i < l; i++) {
            clone.parameters.push(this.parameters[i].clone(this.master));
        }
    };

    _p.add = function(item) {
        this.children.push(item);
        item.parent = this;
    };

    return _ElementModel;
});