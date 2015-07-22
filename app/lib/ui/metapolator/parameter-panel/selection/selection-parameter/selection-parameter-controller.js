define([
    'metapolator/ui/metapolator/services/selection'
], function(
    selection
) {
    "use strict";
    function SelectionParameterController($scope, metapolatorModel, project) {
        $scope.changeValue = function(parameter, operator, value, keyEvent) {
            if (keyEvent == "blur" || keyEvent.keyCode == 13 || keyEvent.keyCode == 38 || keyEvent.keyCode == 40) {
                var thisValue = null
                  , operatorId = operator.id
                  , changedLevels = [];
                  
                for (var i = $scope.model.parent.elements.length - 1; i >= 0; i--) {
                    var element = $scope.model.parent.elements[i]
                      , effectiveLevel
                      , effectedElements;
                    // if there is a range, we have to find the value for this element within the range
                    if (operator.range) {
                        thisValue = getRangeValue(element, parameter, operator);
                    } else {
                        thisValue = managedInputValue(value, parameter, operator, keyEvent);
                    }
                    // set the value of each element in the selection
                    // if there is not yet a parameter, we create it + cpsRule
                    // if there is not yet a operator, we create it
                    var thisParameter = checkIfHasParameter(element, parameter)
                      , thisOperator = checkIfHasOperator(thisParameter, operator)
                      , localOperatorFactor;
                    thisOperator.setValue(thisValue);
                    // check if this parameter has localOperators (like multiply and divide)
                    // the function returns the combined factor of these if it has any.
                    // if it has only non-local operators (add, subtract, etc) it returns false
                    localOperatorFactor = thisParameter.getCPSFactor();
                    if (localOperatorFactor !== false) {
                        element.writeValueInCPSfile(localOperatorFactor, parameter, project);
                    }

                    // Elements down in the tree are effected by this, update their effectiveValue
                    // and handle corresponding CPS effects. This can cause new cps rules. Eg: when
                    // the width of a master is changed with a non-effectiveLocal operator (like '+'),
                    // all glyphs in it are affected by it, so they all need their own cps rule.
                    effectiveLevel = parameter.base.effectiveLevel;
                    // if the effective level is already the level of this element, then no children
                    // elements can be effected
                    if (element.level !== effectiveLevel) {
                        effectedElements = getEffectedElements(effectiveLevel, element);
                        for (var j = 0, jl = effectedElements.length; j < jl; j++) {
                            var effectedElement = effectedElements[j];
                            updateEffectiveElement(effectedElement, parameter);
                            // keep score which levels have had changed values
                            if (changedLevels.indexOf(effectedElement.level) === -1) {
                                changedLevels.push(effectedElement.level);
                            }
                        }
                    } else {
                        // this means that the current element is at the effective level
                        // so we should check its inheritance and its effective value
                        updateEffectiveElement(element, parameter);
                        if (changedLevels.indexOf(element.level) === -1) {
                            changedLevels.push(element.level);
                        }
                    }

                }
                if (operator.range) {
                    // update the range boundaries after setting each element,
                    // so the new value of a (inbetween range) element
                    // gets the right myPosition relative to the new boundaries
                    operator.low.old = operator.low.current;
                    operator.high.old = operator.high.current;
                }
                // update the effectedValue selection for the changed levels
                for (var k = 0, kl = changedLevels.length; k < kl; k++) {
                    var changedLevel = changedLevels[k]
                      , selectionParameter = selection.selection[changedLevel].getParameterByName(parameter.base.name);
                    // only when that selection is visible (eg: if no glyphs are selected, no need to update that level)
                    if (selectionParameter) {
                        selectionParameter.updateEffectiveValue();
                    }
                }
            }
        };

        function updateEffectiveElement(element, parameter) {
            var elementParameter = element.getParameterByName(parameter.base.name);
            elementParameter.updateEffectiveValue();
        }

        function checkIfHasParameter(element, changedParameter) {
            // with editing in ranges, we can want to set a value of a
            // not yet existing parameter and/or operator
            // if it doens't exist yet, we create it.
            var parameter = element.getParameterByName(changedParameter.base.name);
            if (parameter) {
                return parameter;
            } else {
                element.addParameter(changedParameter.base);
                return element.parameters[element.parameters.length - 1];
            }
        }

        function checkIfHasOperator(elementParameter, changedOperator) {
            var id = changedOperator.id
              , operator = elementParameter.findOperator(changedOperator.base, changedOperator.id);
            if (operator) {
                return operator;
            } else {
                // it has the parameter, but it hasn't the operator yet
                elementParameter.addOperator(changedOperator.base, id);
                return elementParameter.operators[elementParameter.operators.length - 1];
            }
        }
        
        function getEffectedElements (effectiveLevel, changedElement) {
            // go down to the level where the change of this value has effect
            // and get the elements.

            var thisLevelElements = [changedElement]
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
        }
        
        function getRangeValue (element, parameter, operator) {
            var scale = null
              , myPosition = null
              , newValue = null
              , oldLow = parseFloat(operator.low.old)
              , oldHigh = parseFloat(operator.high.old)
              , newLow = parseFloat(operator.low.current)
              , newHigh = parseFloat(operator.high.current)
              , currentValue = null;
            // find current value of the specific element
            var elementParameter = element.getParameterByName(parameter.name); 
            if (!elementParameter) {
               currentValue = operator.standardValue; 
            } else {
                var elementOperator = elementParameter.getOperatorByName(operator.name);
                if (!elementOperator) {
                    currentValue = operator.standardValue; 
                } else {
                    currentValue = elementOperator.value;
                }
            }
            if (oldLow == newLow && oldHigh == newHigh) {
                newValue = currentValue;
            } else {
                scale = oldHigh - oldLow;
                myPosition = (currentValue - oldLow) / scale;
                newValue = round(((newHigh - newLow) * myPosition + newLow), parameter.decimals);
            }
            return newValue;
        }
        
        function managedInputValue (value, parameter, operator, keyEvent) {
            var currentValue = value.current
              , step
              , decimals;
            // Not a number: use the fallback value.
            if (isNaN(currentValue) || currentValue === "") {
                currentValue = value.fallback;
            }
            if ( typeof (currentValue) == "string") {
                currentValue = parseFloat(currentValue.replace(',', '.'));
            }
            step = parameter.step;
            decimals = parameter.decimals;
            if (keyEvent != "blur") {
                keyEvent.preventDefault();
                if (keyEvent.shiftKey) {
                    step = step * 10;
                }
                if (keyEvent.keyCode == 38) {
                    currentValue = round(parseFloat(currentValue) + step, decimals);
                } else if (keyEvent.keyCode == 40) {
                    currentValue = round(parseFloat(currentValue) - step, decimals);
                }
            }
            return currentValue;
        }
        
        function round(value, decimals) {
            return Number(Math.round(value + 'e' + decimals) + 'e-' + decimals);
        }
        
        
        $scope.changeParameter = function(parameter) {
            /*
             var oldParameterName = $scope.data.view.parameterPanel.selected;
             if (oldParameterName != parameter.name) {
             var elements = $scope.findElementsEdit($scope.data.view.parameterPanel.level);
             angular.forEach(elements, function(element) {
             angular.forEach(element.parameters, function(thisParameter) {
             if (thisParameter.name == oldParameterName) {
             thisParameter.name = parameter.name;
             }
             });
             });
             }
             $scope.data.updateSelectionParameters(false);
             $scope.data.closeParameterPanel();
             */
        };
    
        $scope.removeParameter = function() {
            /*
             var oldParameterName = $scope.data.view.parameterPanel.selected;
             var elements = $scope.findElementsEdit($scope.data.view.parameterPanel.level);
             angular.forEach(elements, function(element) {
             var parameters = element.parameters;
             angular.forEach(parameters, function(thisParameter) {
             if (thisParameter.name == oldParameterName) {
             parameters.splice(parameters.indexOf(thisParameter), 1);
             }
             if (parameters.length == 0) {
             // todo: remove rule in api and in model
             }
             });
             });
             $scope.data.updateSelectionParameters(false);
             $scope.data.closeParameterPanel();
             */
        };
    

        $scope.changeOperator = function(operator) {
            /*
             var oldParameterName = $scope.data.view.operatorPanel.selectedParameter;
             var oldOperatorName = $scope.data.view.operatorPanel.selected;
             if (oldOperatorName != operator.name) {
             var elements = $scope.findElementsEdit($scope.data.view.operatorPanel.level);
             angular.forEach(elements, function(element) {
             angular.forEach(element.parameters, function(thisParameter) {
             if (thisParameter.name == oldParameterName) {
             angular.forEach(thisParameter.operators, function(thisOperator) {
             if (thisOperator.name == oldOperatorName) {
             thisOperator.name = operator.name;
             }
             });
             }
             });
             });
             }
             $scope.data.updateSelectionParameters(false);
             $scope.data.closeOperatorPanel();
             */
        };
    
        $scope.removeOperator = function() {
            /*
             var oldParameterName = $scope.data.view.operatorPanel.selectedParameter;
             var oldOperatorName = $scope.data.view.operatorPanel.selected;
             var elements = $scope.findElementsEdit($scope.data.view.operatorPanel.level);
             angular.forEach(elements, function(element) {
             var parameters = element.parameters;
             angular.forEach(parameters, function(thisParameter) {
             if (thisParameter.name == oldParameterName) {
             angular.forEach(thisParameter.operators, function(thisOperator) {
             var thisOperators = thisParameter.operators;
             if (thisOperator.name == oldOperatorName) {
             // todo: change by API
             thisOperators.splice(thisOperators.indexOf(thisOperator), 1);
             }
             if (thisOperators.length == 0) {
             parameters.splice(parameters.indexOf(thisParameter), 1);
             // todo: remove rule in api and in model
             }
             });
             }
             });
             $scope.checkEffectiveValueEffects(element, element.level, oldParameterName, XXXOPERATOR);
             // todo check if we need the operator here
             });
             $scope.data.updateSelectionParameters(false);
             $scope.data.closeOperatorPanel();
             */
        };
    

    
        $scope.showOperator = function(thisOperator) {
            /*
            var display = true, hasThisOperator = false;
            var level = $scope.data.view.operatorPanel.level;
            var parameterName = $scope.data.view.operatorPanel.selectedParameter;
            angular.forEach($scope.parameterSelection[level], function(parameter) {
                if (parameter.name == parameterName) {
                    angular.forEach(parameter.operators, function(operator) {
                        if (operator.name == thisOperator.name) {
                            hasThisOperator = true;
                        }
                    });
                }
            });
            if (thisOperator.name != $scope.data.view.operatorPanel.selected && thisOperator.type == "unique" && hasThisOperator) {
                display = false;
            }
            return display;
            */
        };
        
    }

    SelectionParameterController.$inject = ['$scope', 'metapolatorModel', 'project'];
    var _p = SelectionParameterController.prototype;

    return SelectionParameterController;
}); 