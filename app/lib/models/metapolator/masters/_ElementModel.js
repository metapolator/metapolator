define([
    './ParameterModel'
  , 'metapolator/ui/metapolator/ui-tools/selectionTools'
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
    
    _p.setInitialParameters = function() {
        // on the creation of an element, we check if there are effective parameters
        // at the level of the element
        for (var i = selection.baseParameters.length - 1; i >= 0; i--) {
            var baseParameter = selection.baseParameters[i];
            if (baseParameter.effectiveLevel === this.level) {
                this._addParameter(baseParameter);    
            }
        }
    };

    _p.writeValueInCPSfile = function(factor, parameter) {
        // todo if factor === 1 && no value set for this parameter yet: don't write (this means it is the initial meausring when loading the project
        // if factor === 1 && value already set: remove this out of the parameterCollection
        this._checkIfHasRule();
        var parameterCollection = this.master.parent.parent._project.ruleController.getRule(false, this.master.cpsFile)
          , cpsRule = parameterCollection.getItem(this.ruleIndex)
          , parameterDict = cpsRule.parameters
          , setParameter = cpsAPITools.setParameter;
        setParameter(parameterDict, parameter.base.cpsKey, factor);
        console.log(parameterCollection.toString());
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

    _p.getParameterByName = function(parameterName) {
        for (var i = this.parameters.length - 1; i >= 0; i--) {
            var thisParameter = this.parameters[i];
            if (thisParameter.base.name === parameterName) {
                return thisParameter;
            }
        }
        return null;
    };
    
    _p.addParameterOperator = function(baseParameter, baseOperator, id) {
        var parameter = this.checkIfHasParameter(baseParameter);
        parameter.addOperator(baseOperator, id, this.level);
    };
    
    _p.checkIfHasParameter = function(baseParameter) {
        // with editing in ranges, we can want to set a value of a
        // not yet existing parameter and/or operator
        // if it doens't exist yet, we create it.
        var parameter = this.getParameterByName(baseParameter.name);
        if (parameter) {
            return parameter;
        } else {
            return this._addParameter(baseParameter);
        }
    };
    
    _p._addParameter = function(baseParameter) {
        var parameter = new ParameterModel(baseParameter, this);
        this.parameters.push(parameter);
        return parameter;
    };
    
    _p.removeParameter = function(baseParameter) {
        var elementParameter = this.getParameterByName(baseParameter.name)
          , index;
        if (elementParameter) {
            elementParameter.removeCPS();
            index = this.parameters.indexOf(elementParameter);
            this.parameters.splice(index, 1);
        }
    };
    
    _p.changeParameter = function(currentParameter, newBaseParameter) {  
        // get the old one, or create one it it didn't have one
        var parameter = this.checkIfHasParameter(currentParameter.base);
        // because of the current solution of removing cps, we have to set the values
        // of the operators to a standard value. 
        // We could do something to store them and afterwards check the effects and apply cps
        parameter.removeCPS();
        parameter.base = newBaseParameter;         
    };
       
    // cps functions
    _p.updateEffectiveValue = function(baseParameter, writeCPS) {
        var elementParameter = this.getParameterByName(baseParameter.name);
        elementParameter.updateEffectiveValue(writeCPS);  
    };
    
    _p.findParentsFactor = function(baseParameter) {
        // this function finds all the factors for this parameter in its parent or grandparents (etc)
        // this is because CPS uses factors (multiply and divide) So when we calculate the correctionVAlue
        // by (effectiveValue / initial), we need to divide it also by the parents factor
        var levelElement = this
          , parentsFactor = 1;
        while(levelElement.level !== 'sequence') {
            var levelParameter = levelElement.getParameterByName(baseParameter.name)
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
    
    _p.getEffectedElements = function(effectiveLevel) {
        // go down to the level where the change of this value has effect
        // and get the elements.
        var thisLevelElements = [this]
          , tempArray = [];

        while (thisLevelElements[0].level !== effectiveLevel) {
            for (var i = 0, il = thisLevelElements.length; i < il; i++) {
                var thisLevelElement = thisLevelElements[i];
                for (var j = 0, jl = thisLevelElement.children.length; j < jl; j++) {
                    var childElement = thisLevelElement.children[j];
                    // skip the unmeasured glyphs
                    if (childElement.level !== 'glyph' || childElement.measured) {
                        tempArray.push(childElement);
                    }
                }
            }
            thisLevelElements = tempArray;
            tempArray = [];
        }  
        return thisLevelElements; 
    };

    
    // cloning
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
    
    // after cloning, we need to reset the master property
    _p.setMaster = function(master) {
        this.master = master;
        if (this.children) {
            for (var i = 0, l = this.children.length; i < l; i++) {
                var child = this.children[i];
                child.setMaster(master);
            }
        }
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

    return _ElementModel;
});