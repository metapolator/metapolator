define([
    'metapolator/ui/metapolator/ui-tools/selectionTools'
], function(
    selection
) {
    "use strict";
    function SelectionParameterController($scope, metapolatorModel, project) {
        $scope.selection = selection;

        $scope.changeValue = function(parameter, operator, value, event) {
            var thisValue = manageInputValue(value, parameter, operator, event);
            // Update the input
            operator.low.current = thisValue;
            for (var i = $scope.model.parent.elements.length - 1; i >= 0; i--) {
                // Write the value in all models of all elements within selection
                var element = $scope.model.parent.elements[i];
                // if there is a range, we have to find the value for this element within the range
                if (operator.range) {
                    // TODO: pass in the high value.
                    // operator.high.current = manageInputValue(value, parameter, operator, event);
                }
                // set the value of each element in the selection
                // if there is not yet a parameter, we create it + cpsRule
                // if there is not yet a operator, we create it
                var thisParameter = element.checkIfHasParameter(parameter.base, $scope.model.parent.level)
                  , thisOperator = thisParameter.checkIfHasOperator(operator);
                thisOperator.setValue(thisValue);
                // the changed operator method checks the effects for the effective value (whether it is
                // at the local level or down in the tree) and writes CPS if needed
                thisParameter.changedOperator(thisOperator);
                updateLevel(parameter.base.effectiveLevel, parameter);
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
                // so the new value of a (in between range) element
                // gets the right myPosition relative to the new boundaries
                operator.low.old = operator.low.current;
                operator.high.old = operator.high.current;
            }
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

        function manageInputValue(value, parameter, operator, event) {
            // Adjust the value based increment `step` and `event` key
            var currentValue = value.current
              , step = parameter.base.step;
            if (typeof (currentValue) === "string") {
                // Try to make a number out of the string.
                currentValue = parseFloat(currentValue.replace(',', '.'));
            }
            if (!isNumeric(currentValue)) {
                return value.fallback;
            }
            // Shift is 'BIG' Big increments
            if (event.shiftKey) {
                step = step * 10;
            }
            // Ctrl is 'control'. Small increments
            if (event.ctrlKey) {
                step = step * 0.1;
            }
            // Arrow up or scroll up.
            if (event.keyCode === 38) {
                currentValue = currentValue + step;
            }
            // Arrow down or scroll down.
            if (event.keyCode === 40) {
                currentValue = currentValue - step;
            }
            return currentValue;
        }

        function isNumeric(n) {
            // Returns true if n is a number.
            return !isNaN(parseFloat(n)) && isFinite(n);
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
            selection.panel.parameter = $scope.model;
            selection.panel.operator = operator;
        }
        
        $scope.changeParameter = function(baseParameter) {
            for (var i = $scope.model.parent.elements.length - 1; i >= 0; i--) {
                var element = $scope.model.parent.elements[i];
                element.changeParameter($scope.model, baseParameter);
            }
            $scope.model.parent.updateParameters(); 
        };
    
        $scope.removeParameter = function() {
            for (var i = $scope.model.parent.elements.length - 1; i >= 0; i--) {
                var element = $scope.model.parent.elements[i];
                element.removeParameter(selection.panel.parameter.base);          
            } 
            $scope.model.parent.updateParameters();
        };   

        $scope.changeOperator = function(baseOperator) {
            for (var i = $scope.model.parent.elements.length - 1; i >= 0; i--) {
                var element = $scope.model.parent.elements[i]
                  , parameter = element.checkIfHasParameter(selection.panel.parameter.base);
                parameter.changeOperator(selection.panel.operator, baseOperator);
            } 
            $scope.model.parent.updateParameters();          
        };
    
        $scope.removeOperator = function() {
            for (var i = $scope.model.parent.elements.length - 1; i >= 0; i--) {
                var element = $scope.model.parent.elements[i]
                  , elementParameter = element.getParameterByName(selection.panel.parameter.base.name);
                elementParameter.removeOperator(selection.panel.operator, element);          
            } 
            $scope.model.parent.updateParameters();
        };

    }

    SelectionParameterController.$inject = ['$scope', 'metapolatorModel', 'project'];
    var _p = SelectionParameterController.prototype;

    return SelectionParameterController;
}); 