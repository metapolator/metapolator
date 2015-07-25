define([
    'metapolator/ui/metapolator/services/selection'
], function(
    selection
) {
    "use strict";
    function SelectionParameterController($scope, metapolatorModel, project) {
        $scope.selection = selection;

        $scope.changeValue = function(parameter, operator, value, keyEvent) {
            if (keyEvent == "blur" || keyEvent.keyCode == 13 || keyEvent.keyCode == 38 || keyEvent.keyCode == 40) {
                var thisValue = null
                  , operatorId = operator.id;
                  
                for (var i = $scope.model.parent.elements.length - 1; i >= 0; i--) {
                    // 1) Write the value in all models of all elements within selection
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
                      , localOperatorFactor
                      , effectedElement;
                    thisOperator.setValue(thisValue);

                    effectiveLevel = parameter.base.effectiveLevel;
                    effectedElements = getEffectedElements(effectiveLevel, element);
                    // push the levels that need an update at the end
                    if (operator.base.effectiveLocal) {
                        // 2) If the operator is effective local (multiply and divide) then write the
                        // value to the cps. We have to check the local operator factor again, because
                        // there could be more local operators effective
                        localOperatorFactor = thisParameter.getCPSFactor();
                        element.writeValueInCPSfile(localOperatorFactor, parameter);
                        for (var j = 0, jl = effectedElements.length; j < jl; j++) {
                            effectedElement = effectedElements[j];
                            // The effected elements are children down the tree of the element. Eg: if master
                            // has a 'x 2' for 'width' (width is effective at glyph level), each glyph has
                            // a doubled width value.
                            // The last argument (false), means its only an update of the effective value
                            // no cps has to be written in this element (because of the nature of this operator)
                            updateEffectiveElement(effectedElement, parameter, false);
                        }
                    } else {
                        // 3) If the operator is not effective local, but down in the tree (like add, etc)
                        // it effects the children of this element at the effective level.
                        for (var k = 0, kl = effectedElements.length; k < kl; k++) {
                            effectedElement = effectedElements[k];
                            // the last argument (true), means its an update of the effective value
                            // AND cps has to be written in this element
                            updateEffectiveElement(effectedElement, parameter, true);
                        }
                    }
                    updateLevel(effectiveLevel, parameter);
                }
                resetRange(operator);
            }
        };

        function updateLevel(changedLevel, parameter) {
            // update the effectedValue selection for the changed level
            var selectionParameter = selection.selection[changedLevel].getParameterByName(parameter.base.name);
            // only when that selection is visible (eg: if no glyphs are selected, no need to update that level)
            if (selectionParameter) {
                selectionParameter.updateEffectiveValue();
            }
        }

        function resetRange(operator) {
            if (operator.range) {
                // update the range boundaries after setting each element,
                // so the new value of a (inbetween range) element
                // gets the right myPosition relative to the new boundaries
                operator.low.old = operator.low.current;
                operator.high.old = operator.high.current;
            }
        }

        function updateEffectiveElement(element, parameter, writeCPS) {
            var elementParameter = element.getParameterByName(parameter.base.name);
            elementParameter.updateEffectiveValue(writeCPS);
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


        $scope.toggleParameterPanel = function(parameter, event) {
            if(selection.panel.level === $scope.model.parent.level && selection.panel.type === 'parameter') {
                selection.closePanel();
            } else {
                openParameterPanel(parameter, event);
            }
        };

        $scope.toggleOperatorPanel = function(parameter, operator, event) {
            if(selection.panel.level === $scope.model.parent.level && selection.panel.type === 'operator') {
                selection.closePanel();
            } else {
                openOperatorPanel(parameter, operator, event);
            }
        };

        function openParameterPanel(parameter, event) {
            selection.panel.level = $scope.model.parent.level;
            selection.panel.type = 'parameter';           
            selection.panel.left = $(event.target).offset().left + 20;
            selection.panel.top = $(event.target).offset().top + 20;
            selection.panel.parameter = parameter;
        }

        function openOperatorPanel(parameter, operator, event) {
            selection.panel.level = $scope.model.parent.level;
            selection.panel.type = 'operator';
            selection.panel.left = $(event.target).offset().left + 20;
            selection.panel.top = $(event.target).offset().top + 20;
            selection.panel.operator = operator;
        }
        
        $scope.changeParameter = function(baseParameter) {
            $scope.model.parent.changeParameter($scope.model, baseParameter);
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
    

        $scope.changeOperator = function(baseOperator) {
            $scope.model.parent.changeOperator($scope.model, selection.panel.operator, baseOperator);
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