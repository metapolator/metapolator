define([
    '../_BaseModel'
  , './OperatorModel'
], function(
    _BaseModel
  , OperatorModel
){
    "use strict";
    function ParameterModel(parameter, level, masterPanel) {
        this.level = level;
        this.name = parameter.name;
        this.cpsKey = parameter.cspKey;
        this.unit = parameter.unit;
        this.step = parameter.step;
        this.decimals = parameter.decimals;
        this.operators = [];
        // if the level corresponds with the effective level of the parameter
        // the effective value and the initial value are stored here
        if (level == parameter.effectiveLevel) {
            this.effectiveValue = 100;
            this.initial = 100;
            this.getInitial = parameter.getInitial;
        }
        this.operatorCounter = 0;
        this.stacked = false;
        Object.defineProperty(this, 'masterPanel', {
            value: masterPanel,
            enumerable: false,
            writable: true,
            configurable: true
        });
    }
    
        
    var _p = ParameterModel.prototype = Object.create(_BaseModel.prototype);
    
    _p.setInitial = function() {
        this.initial = this.getInitial();
    };
    
    _p.addOperator = function(operator, id) {
        window.logCall("addOperator");
        var self = this;
        this.operators.push(
            new OperatorModel(operator, id)
        );
        // keep a registration of stacked operators, to make the destacking process of everything faster
        this.stacked = isStacked();
        if (this.stacked) {
            this.masterPanel.addStackedParameter(this);
        }
        
        function isStacked() {
            var tempArray = [];
            for (var i = self.operators.length - 1; i >= 0; i--) {
                var thisOperator = self.operators[i].name;
                if (tempArray.indexOf(thisOperator) > -1) {
                    console.log("!");
                    return true;
                }
                tempArray.push(thisOperator);
            }
            return false;
        }
    };
    
    _p.findOperator = function(operator, id) {
        window.logCall("findOperator");
        for (var i = this.operators.length - 1; i >= 0; i--) {
            var thisOperator = this.operators[i];
            if (thisOperator.name == operator.name && thisOperator.id == id) {
                return thisOperator;
            }
        }
        return null;
    };
    
    // you cannot always use this funtion, since there can be cases that there are multiple
    // operators with the same name in a parameter
    _p.getOperatorByName = function(operatorName) {
        window.logCall("getOperatorByName");
        for (var i = this.operators.length - 1; i >= 0; i--) {
            var thisOperator = this.operators[i];
            if(thisOperator.name == operatorName) {
                return thisOperator;
            }
        }
        return null;
    };
    
    _p.destackOperators = function() {
        if (this.stacked) {
            window.logCall("destackOperators");
            var self = this
              , lastOperator = {
                  name: null
              }
              , newSetOperators = []
              , newOperator;
            if (self.operators.length > 0) {
                for (var i = 0, l = this.operators.length; i < l; i++) {
                    var operator = this.operators[i];
                    // reset the id of the operator. So later we know that operators without id are destacked
                    operator.id = null;
                    // to do: check if operator type is 'stack'.
                    // This matters when non-stack operators (like =) are added
                    if (operator.name == lastOperator.name) {
                        if (operator.name == "+" || operator.name == "-") {
                            newOperator.value = parseFloat(newOperator.value) + parseFloat(operator.value);
                        } else if (operator.name == "x" || operator.name == "÷") {
                            newOperator.value = parseFloat(newOperator.value) * parseFloat(operator.value);
                        }
                    } else {
                        if (i != 0) {
                            newSetOperators.push(newOperator);
                        }
                        newOperator = operator;
                    }
                    lastOperator = operator;
    
                }
                // push the last operator, this one isnt detected with a change
                newSetOperators.push(newOperator);
                self.operators = newSetOperators;
            }
            this.stacked = false;
        }
    };
    
    _p.setCPSvalue = function() {
        //
    };
    
    _p.updateEffectiveValue = function(element) {
        window.logCall("updateEffectiveValue");
        var parameterName = this.name
          , min = null
          , max = null
          , is = null
          , effectiveValue = null
          , plus = []
          , multiply = []
          , levelCounter = 0
          , initial = null
          , self = this;
                    
        while (element.level != "sequence") {
            var elementParameter = element.getParameterByName(parameterName);
            if (levelCounter == 0) {
                // this says we are at the effective level, so the initial values should be found here
                if (!self.initial) {
                    self.setInitial();
                }
                initial = self.initial;
                
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
                    // the deepest level applies for these operators
                    if (operator.name == "min" && !min) {
                        min = operator.value;
                    } else if (operator.name == "max" && !max) {
                        max = operator.value;
                    } else if (operator.name == "=" && !is) {
                        is = operator.value;
                    } else if (operator.name == "+") {
                        plus[levelCounter].push(parseFloat(operator.value));
                    } else if (operator.name == "-") {
                        plus[levelCounter].push(parseFloat(-operator.value));
                    } else if (operator.name == "x") {
                        multiply[levelCounter].push(parseFloat(operator.value));
                    } else if (operator.name == "÷") {
                        multiply[levelCounter].push(parseFloat(1 / operator.value));
                    }
                }
            }
            levelCounter++;
            element = element.parent;
        }
        
        // overruling order
        if (is) {
            effectiveValue = is;
        } else {
            effectiveValue = initial;
        }
        for (var i = multiply.length - 1; i >= 0; i--) {
            if (multiply[i]) {
                var multiplyLevelSet = multiply[i];
                for (var j = multiplyLevelSet.length - 1; j >= 0; j--) {
                    var multiplier = multiplyLevelSet[j];
                    effectiveValue *= multiplier;
                }
            }
        }
        for (var i = plus.length - 1; i >= 0; i--) {
            if (plus[i]) {
                var plusLevelSet = plus[i];
                for (var j = plusLevelSet.length - 1; j >= 0; j--) {
                    var plusser = plusLevelSet[j];
                    effectiveValue += plusser;
                }
            }
        }
         if (max && effectiveValue > max) {
            effectiveValue = max;
        } else if (min && effectiveValue < min) {
            effectiveValue = min;
        }
        this.effectiveValue = effectiveValue;
    };
        
    
    return ParameterModel;
});
