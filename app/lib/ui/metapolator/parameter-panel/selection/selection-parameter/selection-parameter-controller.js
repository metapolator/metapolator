define([
    'metapolator/ui/metapolator/cpsAPITools'
], function(
    cpsAPITools
) {
    "use strict";
    function SelectionParameterController($scope, metapolatorModel, project) {
        $scope.changeValue = function(parameter, operator, value, keyEvent) {
            if (keyEvent == "blur" || keyEvent.keyCode == 13 || keyEvent.keyCode == 38 || keyEvent.keyCode == 40) {
                var thisValue = null
                  , operatorId = operator.id;
                  
                for (var i = $scope.model.elements.length - 1; i >= 0; i--) {
                    var element = $scope.model.elements[i]
                      , effectiveLevel
                      , effectedElements
                      , selectionParameter;
                    // if there is a range, we have to find the value for this element within the range
                    if (operator.range) {
                        thisValue = getRangeValue(element, parameter, operator);
                    } else {
                        thisValue = managedInputValue(value, parameter, operator, keyEvent);
                    }
                    // set the value of each element in the selection
                    // if there is not yet a parameter, we create it + cpsRule
                    // if there is not yet a operator, we create it
                    checkIfHasRule(element);
                    var thisParameter = checkIfHasParameter(element, parameter)
                      , thisOperator = checkIfHasOperator(thisParameter, operator);
                    thisOperator.setValue(thisValue);
                    writeValueInCPSfile(element, thisValue, parameter);

                    // Elements down in the tree are effected by this, update their effectiveValue
                    // and handle corresponding CPS effects. This can cause new cps rules. Eg: when
                    // the width of a master is changed with a non-effectiveLocal operator (like '+'),
                    // all glyphs in it are affected by it, so they all need their own cps rule.
                    effectiveLevel = parameter.effectiveLevel;
                    effectedElements = getEffectedElements(effectiveLevel, element);
                    /*
                    for (var j = 0, jl = effectedElements.length; j < jl; j++) {
                        var effectedElement = effectedElements[j]
                          , elementParameter = effectedElement.getParameterByName(parameter.name)
                          , correctionValue
                          , parentsFactor = findParentsFactor();
                        elementParameter.updateEffectiveValue(effectedElement);
                        // update the cps values for each element
                        checkIfHasRule(effectedElement);
                        correctionValue = elementParameter.effectiveValue / parentsFactor / elementParameter.initial;
                        writeValueInCPSfile(element, correctionValue, parameter);
                    }
                    */

                    // update the selection of effective values
                    selectionParameter = metapolatorModel.masterPanel.selection[effectiveLevel].getParameterByName(parameter.name);
                    // only when that selection is visible (eg: if no glyphs are selected, no need to update that level)
                    if (selectionParameter) {
                        selectionParameter.updateEffectiveValue();
                    }
                }
                if (operator.range) {
                    // update the range boundaries after setting each element,
                    // so the new value of a (inbetween range) element
                    // gets the right myPosition relative to the new boundaries
                    operator.low.old = operator.low.current;
                    operator.high.old = operator.high.current;
                }
            }
        };

        function findParentsFactor(element, parameter) {
            // this function finds all the factors for this parameter in its parent or grandparents (etc)
            // this is because CPS uses factors (multiply and divide) So when we calculate the correctionVAlue
            // by (effectiveValue / initial), we need to divide it also by the parents factor
            // TODO

        }

        function checkIfHasRule(element) {
            if (!element.ruleIndex) {
                var parameterCollection = project.ruleController.getRule(false, element.master.cpsFile)
                  , l = parameterCollection.length;
                element.ruleIndex = cpsAPITools.addNewRule(parameterCollection, l, element.selector);
            }
        }

        function checkIfHasParameter(element, changedParameter) {
            // with editing in ranges, we can want to set a value of a
            // not yet existing parameter and/or operator
            // if it doens't exist yet, we create it.
            var parameter = element.findParameter(changedParameter);
            if (parameter) {
                return parameter;
            } else {
                element.addParameter(changedParameter);
                return element.parameters[element.parameters.length - 1];
            }
        }

        function checkIfHasOperator(elementParameter, changedOperator) {
            var id = changedOperator.id
              , operator = elementParameter.findOperator(changedOperator, changedOperator.id);
            if (operator) {
                return operator;
            } else {
                // it has the parameter, but it hasn't the operator yet
                elementParameter.addOperator(changedOperator, id);
                return elementParameter.operators[elementParameter.operators.length - 1];
            }
        }

        function writeValueInCPSfile(element, value, parameter) {
            var parameterCollection = project.ruleController.getRule(false, element.master.cpsFile)
                , cpsRule = parameterCollection.getItem(element.ruleIndex)
                , parameterDict = cpsRule.parameters
                , setParameter = cpsAPITools.setParameter;
            setParameter(parameterDict, parameter.cpsKey, value);
            console.log(parameterCollection.toString());
        }
        
        function getEffectedElements (effectiveLevel, changedElement) {
            // go down to the level where the change of this value has effect
            // and get the elements.

            var thisLevelElements = [changedElement]
              , tempArray = [];

            while (thisLevelElements[0].level != effectiveLevel) {
                for (var i = 0, il = thisLevelElements.length; i < il; i++) {
                    var thisLevelElement = thisLevelElements[i];
                    for (var j = 0, jl = thisLevelElement.children.length; j < jl; j++) {
                        var childElement = thisLevelElement.children[j];
                        tempArray.push(childElement);
                    }
                }
                thisLevelElements = tempArray;
                tempArray = [];
            }  
            return thisLevelElements; 
        }
        
        function getRangeValue (element, parameter, operator) {
            window.logCall("getRangeValue");
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
            window.logCall("managedInputValue");
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