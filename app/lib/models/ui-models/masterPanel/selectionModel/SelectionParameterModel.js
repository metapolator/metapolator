define([
    '../../_BaseModel'
  , './SelectionOperatorModel'
], function(
    _BaseModel
   , SelectionOperatorModel
) {
    "use strict";
    function SelectionParameterModel(level, baseParameter, baseOperators, elements) {
        this.level = level;
        this.name = baseParameter.name;
        this.unit = baseParameter.unit;
        this.step = baseParameter.step;
        this.decimals = baseParameter.decimals;
        this.effectiveLevel = baseParameter.effectiveLevel;
        this.baseOperators = baseOperators;
        this.selectionOperators = [];
        this.elements = elements;
        this.effectiveValue = null;
        
        this.updateOperators(elements);
        this.updateEffectiveValue();
    }

    var _p = SelectionParameterModel.prototype = Object.create(_BaseModel.prototype);
    
    _p.updateEffectiveValue = function() {
        window.logCall("updateEffectiveValue");
        if (this.effectiveLevel == this.level) {
            var self = this
              , low = null
              , high = null;
              
            for (var i = this.elements.length - 1; i >= 0; i--) {
                var element = this.elements[i];
                for (var j = element.parameters.length - 1; j >= 0; j--) {
                    var elementParameter = element.parameters[j];
                    if (elementParameter.name == self.name) {
                        if (elementParameter.effectiveValue < low || low == null) {
                            low = elementParameter.effectiveValue;
                        }
                        if (elementParameter.effectiveValue > high || high == null) {
                            high = elementParameter.effectiveValue;
                        }
                    }
                }
            }
            if (high == low) {
                var range = false;
            } else {
                var range = true;
            }
            this.effectiveValue = {
                low: low,
                high: high,
                range: range
            };
        }
    };

    _p.updateOperators = function(elements) {
        // based upon a (new) selection operators are attached to the selection
        var self = this;
        this.selectionOperators = [];
        for (var baseOperatorIndex = 0, l = this.baseOperators.length; baseOperatorIndex < l; baseOperatorIndex++) {
            var baseOperator = this.baseOperators[baseOperatorIndex];
            var hasOperator = false
              , nrOfElements = 0
              , nrOfHasOperator = 0
              , low = null
              , high = null;
            for (var elementIndex = 0, m = elements.length; elementIndex < m; elementIndex++) {
                var element = elements[elementIndex];
                nrOfElements++;
                for (var i = 0, n = element.parameters.length; i < n; i++) {
                    var elementParameter = element.parameters[i];
                    if (elementParameter.name == self.name) {
                        for (var j = 0, o = elementParameter.operators.length; j < o; j++) {
                            var elementOperator = elementParameter.operators[j];
                            if (elementOperator.name == baseOperator.name) {
                                if (!elementOperator.id) {
                                    // an operator without id is a de-stacked operator
                                    hasOperator = true;
                                    nrOfHasOperator++;
                                    if (elementOperator.value < low || low == null) {
                                        low = elementOperator.value;
                                    }
                                    if (elementOperator.value > high || high == null) {
                                        high = elementOperator.value;
                                    }
                                } else {
                                    // an operator with an id is a stacked operator
                                    // added during the current selection process.
                                    // the id will be removed after deselecting + de-stacking
                                    // range is always false, because it is added after selecting
                                    // only at index == 0, because this counts for all elements the same
                                    if (elementIndex == 0) {
                                        self.selectionOperators.push(
                                            new SelectionOperatorModel(self.level, baseOperator.name, false, elementOperator.value, elementOperator.value, baseOperator.standardValue, elementOperator.id)
                                        );
                                    }
                                }
                            }
                        };
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
            if (high == low) {
                var range = false;
            } else {
                var range = true;
            }
            if (hasOperator) {
                self.selectionOperators.push(
                    new SelectionOperatorModel(self.level, baseOperator.name, range, low, high, baseOperator.standardValue, null)
                );
            }
        }
        this.updateEffectiveValue();
    };
    


    return SelectionParameterModel;
});
