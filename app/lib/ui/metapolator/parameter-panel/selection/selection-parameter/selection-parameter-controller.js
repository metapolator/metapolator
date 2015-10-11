define([
      'metapolator/ui/metapolator/ui-tools/selectionTools'
    , 'metapolator/errors'
    , 'metapolator/math/simpleMathEngine'

], function(
      selection
    , errors
    , mathEngine
) {
    "use strict";
    var CPSError = errors.CPS,
        UIInputError = errors.UIInput;

    function SelectionParameterController($scope, metapolatorModel, project) {
        $scope.selection = selection;

        $scope.changeValue = function(parameter, operator, rangeExtreme, event) {
            var val = operator[rangeExtreme].current;
            event.target.classList.remove('error');  // TODO: This needs design
            if (typeof val === 'string' && (event.type === 'blur' || event.which === 13)) {
                // String and blur or enter event.
                val = evaluateMathExpression(val);
                if (val[0]) {
                    event.target.classList.add('error');  // TODO: This needs design
                    throw new UIInputError(val[0]);
                }
                else {
                    val = val[1];
                }
            }
            if (isNumeric(val) && isFinite(val)) {
                val = evaluateEvent(val, parameter, event);
                val = round(val, parameter.base.decimals);
                if (val !== operator[rangeExtreme].fallback) {
                    operator[rangeExtreme].current = val;
                    updateCPS(val, parameter, operator);
                    operator[rangeExtreme].fallback = val;
                }
            }
        };

        function updateCPS(value, parameter, operator) {
            for (var i = $scope.model.parent.elements.length - 1; i >= 0; i--) {
                // Write the value in all models of all elements within selection
                var element = $scope.model.parent.elements[i];
                // if there is a range, we have to find the value for this element within the range
                if (operator.range) {
                    value = getRangeValue(element, parameter, operator);
                }
                // set the value of each element in the selection
                // if there is not yet a parameter, we create it + cpsRule
                // if there is not yet a operator, we create it
                var thisParameter = element.checkIfHasParameter(parameter.base, $scope.model.parent.level)
                  , thisOperator = thisParameter.checkIfHasOperator(operator);
                thisOperator.setValue(value);
                // the changed operator method checks the effects for the effective value (whether it is
                // at the local level or down in the tree) and writes CPS if needed
                thisParameter.changedOperator(thisOperator);
                updateLevel(parameter.base.effectiveLevel, parameter);
            }
        }

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

        function getRangeValue(element, parameter, operator) {
            var scale
              , myPosition
              , oldLow = operator.low.fallback
              , oldHigh = operator.high.fallback
              , newLow = operator.low.current
              , newHigh = operator.high.current
              , currentValue
              , newValue
            // find current value of the specific element
              , elementParameter = element.getParameterByName(parameter.base.name);
            if (!elementParameter) {
                // not every element in the selection has necessarily already the parameter
               currentValue = operator.base.standardValue;
            } else {
                // same goes for the operator
                var elementOperator = elementParameter.findOperator(operator.base, operator.id);
                if (!elementOperator) {
                    currentValue = operator.base.standardValue;
                } else {
                    currentValue = elementOperator.value;
                }
            }
            if (oldLow === newLow && oldHigh === newHigh) {
                // nothing's changed
                newValue = currentValue;
            } else {
                scale = oldHigh - oldLow;
                myPosition = (currentValue - oldLow) / scale;
                newValue = round(((newHigh - newLow) * myPosition + newLow), parameter.base.decimals);
            }
            console.log(newValue);
            return newValue;
        }

        function evaluateMathExpression(input) {
            var result, message;
            try {
                result = mathEngine.parse(input.replace(/,/g, '.')).execute();
            } catch (e) {
                if(!(e instanceof CPSError)) {
                    throw e; // re-raise, so that we can fix it
                }
                // inform the user if this is possible via the ui
                // or do whatever you do when the input was bad
                message = e.message;
                // Temp. We should have proper feedback.
            }
            // NOTE: result can still be: `Infinity`, `-Infinity`, `NaN`  because that's reasonable for math
            // check with:
            if(message)
                return [message, null];
            if(!isFinite(result))
                return ['Math result is not finite.', null];
            return [null, result];
        }

        function evaluateEvent(value, parameter, event) {
            // Evaluate the key combinations that alter the current value.
            var step = parameter.base.step;
            // Shift is 'BIG' increments
            if (event.shiftKey) {
                step = step * 10;
            }
            // Ctrl and alt give 'control'. Small increments.
            if (event.ctrlKey || event.altKey) {
                step = step * 0.1;
            }
            // Arrow up or scroll up.
            if (event.keyCode === 38) {
                value = value + step;
            }
            // Arrow down or scroll down.
            if (event.keyCode === 40) {
                value = value - step;
            }
            return value;
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

