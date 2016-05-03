define([
    '../_BaseModel'
  , './OperatorModel'
  , 'metapolator/ui/metapolator/ui-tools/selectionTools'
], function(
    Parent
  , OperatorModel
  , selection
){
    'use strict';
    function ParameterModel(baseParameter, element) {
        this.element = element;
        this.base = baseParameter;
        this.operators = [];

        // if the level corresponds with the effective level of the parameter
        // the effective value and the initial value are stored here
        if (element.level === baseParameter.effectiveLevel) {
            this.effectiveValue = null;
            this.initial = null;
            this.getInitial = baseParameter.getInitial;
        }
        this.stacked = false;
    }


    var _p = ParameterModel.prototype = Object.create(Parent.prototype);

    _p.setInitial = function(momElement) {
        var measuredValue = this.getInitial(momElement);
        this.initial = measuredValue;
        this.effectiveValue = measuredValue;
    };

    _p.changedOperator = function(operator) {
        var element = this.element
          , effectedElements = element.getEffectedElements(this.base.effectiveLevel)
          , localOperatorFactor
          , effectedElement;
        if (operator.base.effectiveLocal) {
            // If the operator is effective local (multiply and divide) then write the
            // value to the cps. We have to check the local operator factor again, because
            // there could be more local operators effective
            localOperatorFactor = this.getCPSFactor();
            element.writeValueInCPSfile(localOperatorFactor, this);
            for (var i = 0, l = effectedElements.length; i < l; i++) {
                effectedElement = effectedElements[i];
                // The effected elements are children down the tree of the element. Eg: if master
                // has a 'x 2' for 'width' (width is effective at glyph level), each glyph has
                // a doubled width value.
                // The last argument (false), means its only an update of the effective value
                // no cps has to be written in this element (because of the nature of this operator)
                effectedElement.updateEffectiveValue(this.base, false);
            }
        } else {
            // If the operator is not effective local, but down in the tree (like add, etc)
            // it only effects the children of this element at the effective level.
            for (var j = 0, jl = effectedElements.length; j < jl; j++) {
                effectedElement = effectedElements[j];
                // the last argument (true), means its an update of the effective value
                // AND cps has to be written in this element
                effectedElement.updateEffectiveValue(this.base, true);
            }
        }
    };

    // operator functions
    _p.checkIfHasOperator = function(changedOperator, level) {
        var id = changedOperator.id
          , operator = this.findOperator(changedOperator.base, changedOperator.id);
        if (operator) {
            return operator;
        } else {
            return this.addOperator(changedOperator.base, id, level);
        }
    };

    _p.checkIfHasNonLocalOperators = function() {
        for (var i = 0, l = this.operators.length; i < l; i++) {
            var operator = this.operators[i];
            if (!operator.base.effectiveLocal) {
                return true;
            }
        }
        return false;
    };

    _p.addOperator = function(baseOperator, id, level) {
        var operator = new OperatorModel(baseOperator, id, this);
        this.operators.push(operator);
        // keep a registration of stacked operators, to make the destacking process of everything faster
        //this.stacked = isStacked();
        //if (this.stacked) {
        // to prevent a bug with the system uncommented now
        // every parameter with operators added is considered a stacked parameter
        // and will be destacked
        // where the previous setup only considered parameters with multiple of
        // the same operatoras stacked (which is in itself more pure and faster)
        // but that prevented the id to be set null for added but not stacked
        // operators, which is necessary for the selection tool to work
        this.stacked = true;
        selection.selection[level].addStackedParameter(this);
        //}
        /*
        function isStacked() {
            var tempArray = [];
            for (var i = self.operators.length - 1; i >= 0; i--) {
                var thisOperator = self.operators[i].name;
                if (tempArray.indexOf(thisOperator) > -1) {
                    return true;
                }
                tempArray.push(thisOperator);
            }
            return false;
        }
        */
       return operator;
    };

    _p.changeOperator = function(currentOperator, newBaseOperator) {
        var operator = this.checkIfHasOperator(currentOperator, this.element.level);
        this._cleanUpOperatorEffects(operator);
        // asign new base and the standard value belonging to that base
        operator.base = newBaseOperator;
        operator.setValue(newBaseOperator.standardValue);
    };

    _p.removeOperator = function(currentOperator, element) {
        var operator = this.findOperator(currentOperator.base, currentOperator.id)
          , index;
        if (operator){
            this._cleanUpOperatorEffects(operator);
            index = this.operators.indexOf(operator);
            this.operators.splice(index, 1);
        }
    };

    _p.findOperator = function(operator, id) {
        for (var i = this.operators.length - 1; i >= 0; i--) {
            var thisOperator = this.operators[i];
            if (thisOperator.base.name === operator.name && thisOperator.id === id) {
                return thisOperator;
            }
        }
        return null;
    };

    _p.destackOperators = function() {
        if (this.stacked) {
            var lastOperator = {
                  base : {
                      name: null
                  }
             }
              , newSetOperators = []
              , newOperator = {};
            if (this.operators.length > 0) {
                for (var i = 0, l = this.operators.length; i < l; i++) {
                    var operator = this.operators[i];
                    // reset the id of the operator. So later we know that operators without id are destacked
                    operator.id = null;
                    // todo: check if operator type is 'stack'.
                    // This matters when non-stack operators (like =) are added
                    if (operator.base.name === lastOperator.base.name) {
                        if (operator.base.name === 'add' || operator.base.name === 'subtract') {
                            newOperator.value = parseFloat(newOperator.value) + parseFloat(operator.value);
                        } else if (operator.base.name === 'multiply' || operator.base.name === 'divide') {
                            newOperator.value = parseFloat(newOperator.value) * parseFloat(operator.value);
                        }
                    } else {
                        if (i !== 0) {
                            newSetOperators.push(newOperator);
                        }
                        newOperator = operator;
                    }
                    lastOperator = operator;

                }
                // push the last operator, this one isnt detected with a change
                newSetOperators.push(newOperator);
                this.operators = newSetOperators;
            }
            this.stacked = false;
        }
    };

    // cps functions
    _p._cleanUpOperatorEffects = function(operator) {
        // set the value temp to standard, so all the cps will be cleaned up
        operator.setValue(operator.base.standardValue);
        this.changedOperator(operator);
    };

    _p.removeCPS = function() {
        // todo: currently this is quite a rough method to reset the cps. We should just remove rules instead.
        for (var i = 0, l = this.operators.length; i < l; i++) {
            var operator = this.operators[i];
            this._cleanUpOperatorEffects(operator);
        }
    };

    _p.getCPSFactor = function() {
        var factor = 1;
        var hasLocalOperator = false;
        for (var i = this.operators.length - 1; i >= 0; i--) {
            var operator = this.operators[i];
            if (operator.base.effectiveLocal) {
                hasLocalOperator = true;
                if (operator.base.name === 'multiply') {
                    factor *= operator.value;
                } else if (operator.base.name === 'divide') {
                    factor /= operator.value;
                }
            }
        }
        if (hasLocalOperator) {
            return factor;
        } else {
            return false;
        }
    };

    _p.updateEffectiveValue = function(writeCPS) {
        var element = this.element
          , parameterName = this.base.name
          , min = null
          , max = null
          , is = null
          , effectiveValue = null
          , plus = []
          , multiply = []
          , levelCounter = 0
          , initial = null;

        while (element.level !== 'sequence') {
            var elementParameter = element.getParameterByName(parameterName);
            if (levelCounter === 0) {
                // this says we are at the effective level, so the initial values should be found here
                if (!this.initial) {
                    this.setInitial(element.momElement);
                }
                initial = this.initial;

            }
            if (elementParameter) {
                for (var i = 0, l = elementParameter.operators.length; i < l; i++) {
                    var operator = elementParameter.operators[i];
                    if (!plus[levelCounter]) {
                        plus[levelCounter] = [];
                    }
                    if (!multiply[levelCounter]) {
                        multiply[levelCounter] = [];
                    }
                    if (operator.base.name === 'min' && !min) { // the deepest level applies for these operators therefor the '&& !'
                        min = operator.value;
                    } else if (operator.base.name === 'max' && !max) { // idem
                        max = operator.value;
                    } else if (operator.base.name === 'is' && !is) { // idem
                        is = operator.value;
                    } else if (operator.base.name === 'add') {
                        plus[levelCounter].push(parseFloat(operator.value));
                    } else if (operator.base.name === 'subtract') {
                        plus[levelCounter].push(parseFloat(-operator.value));
                    } else if (operator.base.name === 'multiply') {
                        multiply[levelCounter].push(parseFloat(operator.value));
                    } else if (operator.base.name === 'divide') {
                        multiply[levelCounter].push(parseFloat(1 / operator.value));
                    }
                }
            }
            levelCounter++;
            element = element.parent;
        }
        // overruling order
        if (is) {
            // first check if there is a '=' operator, this is already the deepest '='
            effectiveValue = is;
        } else {
            // otherwise we start calculating from the initial value
            effectiveValue = initial;
        }
        for (var j = multiply.length - 1; j >= 0; j--) {
            // multiply that value with all found multipliers
            if (multiply[j]) {
                var multiplyLevelSet = multiply[j];
                for (var k = multiplyLevelSet.length - 1; k >= 0; k--) {
                    effectiveValue *= multiplyLevelSet[k];
                }
            }
        }
        for (var m = plus.length - 1; m >= 0; m--) {
            // add all 'plussers' to that value
            if (plus[m]) {
                var plusLevelSet = plus[m];
                for (var n = plusLevelSet.length - 1; n >= 0; n--) {
                    effectiveValue += plusLevelSet[n];
                }
            }
        }
        // check if that value crosses the deepest set max and mins
         if (max && effectiveValue > max) {
            effectiveValue = max;
        } else if (min && effectiveValue < min) {
            effectiveValue = min;
        }
        this.effectiveValue = effectiveValue;
        if (writeCPS) {
            this._setCorrectedCPSfactor();
        }
    };

    _p._setCorrectedCPSfactor = function() {
        var correctionValue
          , parentsFactor;
        parentsFactor = this.element.findParentsFactor(this.base);
        correctionValue = this.effectiveValue / parentsFactor / this.initial;
        this.element.writeValueInCPSfile(correctionValue, this);
    };

    // cloning
    _p.clone = function(master) {
        var clone = {};
        clone = new this.constructor();
        this._cloneProperties(clone);
        if (this.operators) {
            this._cloneOperators(clone);
        }
        clone.master = master;
        return clone;
    };

    _p._cloneProperties = function(clone) {
        for (var propertyName in this) {
            if (propertyName !== 'operators' && propertyName !== 'master' && propertyName !== '$$hashKey') {
                clone[propertyName] = this[propertyName];
            }
        }
    };

    _p._cloneOperators = function(clone) {
        clone.operators = [];
        for (var i = 0, l = this.operators.length; i < l; i++) {
            clone.operators.push(this.operators[i].clone());
        }
    };

    return ParameterModel;
});
