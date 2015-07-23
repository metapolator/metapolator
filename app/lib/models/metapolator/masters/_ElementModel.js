define([
    './ParameterModel'
  , 'metapolator/ui/metapolator/services/selection' // todo: Get rid of this module here.
  , 'metapolator/ui/metapolator/cpsAPITools'
],
function(
    ParameterModel
  , selection
  , cpsAPITools
)
{
    "use strict";
    function _ElementModel() {
        // todo: get rid of this.master.parent.parent._project which is now an argument of the AppModel
    }

    var _p = _ElementModel.prototype;

    _p.writeValueInCPSfile = function(factor, parameter) {
        // todo if factor === 1 && no value set for this parameter yet: don't write (this means it is the initial meausring when loading the project
        // if factor === 1 && value already set: remove this out of the parameterCollection
        this._checkIfHasRule();
        var parameterCollection = this.master.parent.parent._project.ruleController.getRule(false, this.master.cpsFile)
          , cpsRule = parameterCollection.getItem(this.ruleIndex)
          , parameterDict = cpsRule.parameters
          , setParameter = cpsAPITools.setParameter;
        setParameter(parameterDict, parameter.base.cpsKey, factor);
        //console.log(parameterCollection.toString());
    };

    _p._checkIfHasRule = function() {
        if (!this.ruleIndex) {
            var parameterCollection = this.master.parent.parent._project.ruleController.getRule(false, this.master.cpsFile)
                , l = parameterCollection.length;
            this.ruleIndex = cpsAPITools.addNewRule(parameterCollection, l, this.getSelector());
        }
    };
    
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
            parameter.addOperator(baseOperator, id, this.level);
        } else {
            this.addParameter(baseParameter);
            this.parameters[this.parameters.length - 1].addOperator(baseOperator, id, this.level);
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
            var levelParameter = levelElement.findParameter(baseParameter)
              , levelFactor;
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