define([
    './ParameterModel'
  , 'metapolator/ui/metapolator/services/selection' // todo: Get rid of this module here.
],
function(
    ParameterModel
  , selection
)
{
    "use strict";
    function _ElementModel() {
    }

    var _p = _ElementModel.prototype;
    
    _p.deselectAllChildren = function() {
        for (var i = this.children.length -1; i >= 0; i--) {
            var child = this.children[i];
            child.edit = false;
        }
    };
    
    _p.setInitialParameters = function() {
        // on the creation of an element, we check if there are effective parameters
        // at the level of the element
        for (var i = selection.baseParameters.length - 1; i >= 0; i--) {
            var baseParameter = selection.baseParameters[i];
            if (baseParameter.effectiveLevel === this.level) {
                this.addParameter(baseParameter);    
            }
        }
    };

    _p.getParameterByName = function(parameterName) {
        for (var i = this.parameters.length - 1; i >= 0; i--) {
            var thisParameter = this.parameters[i];
            if (thisParameter.base.name === parameterName) {
                return thisParameter;
            }
        }
        return null;
    };
    
    _p.addParameter = function(baseParameter) {
        this.parameters.push(
            new ParameterModel(baseParameter, this)
        );
    };
    
    _p.addParameterOperator = function(baseParameter, baseOperator, id) {
        var parameter = this.findParameter(baseParameter);
        if (parameter) {
            parameter.addOperator(baseOperator, id);
        } else {
            this.addParameter(baseParameter);
            this.parameters[this.parameters.length - 1].addOperator(baseOperator, id);
        }
    };
    
    _p.findParameter = function(parameter) {
        for (var i = this.parameters.length - 1; i >= 0; i--) {
            var thisParameter = this.parameters[i];
            if (thisParameter.base.name === parameter.name) {
                return thisParameter;
            }
        }
        return null;
    };
    
    _p.findLevelOffspring = function(level) {
        // this function starts to walk down the tree until it reaches the argument level
        // and returns all element of that specific level. Eg: If you ask for point level
        // of glyph 'A', it returns all points of 'A'.
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
            if (propertyName !== 'children' && propertyName !== 'parent' &&
                propertyName !== '$$hashKey' && propertyName !== 'parameters') {
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

    _p.findParentsFactor = function(baseParameter) {
        // this function finds all the factors for this parameter in its parent or grandparents (etc)
        // this is because CPS uses factors (multiply and divide) So when we calculate the correctionVAlue
        // by (effectiveValue / initial), we need to divide it also by the parents factor
        var levelElement = this
          , parentsFactor = 1;
        while(levelElement.level !== 'sequence') {
            var levelParameter = this.findParameter(baseParameter)
              , levelFactor
             if (levelParameter) {
                 levelFactor = levelParameter.getCPSFactor();
                 if (levelFactor !== false) {
                     parentsFactor *= levelFactor;
                 }
             }
            levelElement = levelElement.parent;
        }
        return parentsFactor;
    };

    return _ElementModel;
});