define([
    './SelectionOperator'
], function(
    SelectionOperator
) {
    'use strict';
    function SelectionParameter(parent, baseParameter, baseOperators) {
        this.parent = parent;
        this.base = baseParameter;
        this.baseOperators = baseOperators;
        this.operators = [];
        this.effectiveValue = null;
    }

    var _p = SelectionParameter.prototype;
    
    _p.updateOperators = function(elements) {
        this.operators = [];
        for (var i = 0, l = this.baseOperators.length; i < l; i++) {
            var baseOperator = this.baseOperators[i]
              , hasOperator = false
              , nrOfElements = 0
              , nrOfHasOperator = 0
              , low = null
              , high = null
              , range
              , elementParameters = this._getElementParameters();
            for (var j = 0, jl = elementParameters.length; j < jl; j++) {
                var elementParameter = elementParameters[j]
                  , elementOperators = this._getElementOperators(elementParameter, baseOperator);
                for (var k = 0, kl = elementOperators.length; k < kl; k++) {
                    var elementOperator = elementOperators[k];
                    if (!elementOperator.id) {
                        // an operator without id is a de-stacked operator
                        hasOperator = true;
                        nrOfHasOperator++;
                        // getting the lowest and higest value for this operator in the set of elements
                        if (elementOperator.value < low || low === null) {
                            low = elementOperator.value;
                        }
                        if (elementOperator.value > high || high === null) {
                            high = elementOperator.value;
                        }
                    } else {
                        // an operator with an id is a stacked operator
                        // added during the current selection process.
                        // the id will be removed after deselecting + de-stacking
                        // range is always false, because it is added after selecting
                        // only at index == 0, because this counts for all elements the same
                        if (j === 0) {
                            this.operators.push(
                                new SelectionOperator(this, baseOperator, false, elementOperator.value, elementOperator.value, elementOperator.id)
                            );
                        }
                    }
                }
            }
            if (nrOfElements > nrOfHasOperator && nrOfHasOperator > 0) {
                if (baseOperator.standardValue < low) {
                    low = baseOperator.standardValue;
                }
                if (baseOperator.standardValue > high) {
                    high = baseOperator.standardValue;
                }
            }
            range = (high === low) ? false : true;
            if (hasOperator) {
                this.operators.push(
                    new SelectionOperator(this, baseOperator, range, low, high, null)
                );
            }
        }
        this.updateEffectiveValue();
    };

    _p.updateEffectiveValue = function() {
        // checking if the effective value is stored at this level
        // this is different for each parameter. eg: width is stored at glyph level
        if (this.base.effectiveLevel === this.parent.level) {
            var low = null
              , high = null
              , range
              , elementParameters = this._getElementParameters();
            for (var i = 0, l = elementParameters.length; i < l; i++) {
                var elementParameter = elementParameters[i];
                if (elementParameter.effectiveValue < low || low === null) {
                    low = elementParameter.effectiveValue;
                }
                if (elementParameter.effectiveValue > high || high === null) {
                    high = elementParameter.effectiveValue;
                }
            }
            range = (high === low) ? false : true;
            this.effectiveValue = {
                low : low,
                high : high,
                range : range
            };
        }
    };

    _p._getElementParameters = function() {
        var parameters = [];
        for (var i = this.parent.elements.length - 1; i >= 0; i--) {
            var element = this.parent.elements[i];
            for (var j = element.parameters.length - 1; j >= 0; j--) {
                var elementParameter = element.parameters[j];
                if (elementParameter.base.name === this.base.name) {
                    parameters.push(elementParameter);
                }
            }
        }
        return parameters;
    };

    _p._getElementOperators = function(parameter, baseOperator) {
        var operators = [];
        for (var i = 0, l = parameter.operators.length; i < l; i++) {
            var elementOperator = parameter.operators[i];
            // check if the element in the elements set has this operator
            if (elementOperator.base.name === baseOperator.name) {
                operators.push(elementOperator);
            }
        }
        return operators;
    };
    


    return SelectionParameter;
});
