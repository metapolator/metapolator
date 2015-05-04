app.controller("parametersController", function($scope, sharedScope) {
    $scope.data = sharedScope.data;

    $scope.parameters = [{
        name : "weight",
        displayName : "Weight",
        unit : "",
        step : 0.1,
        decimals : 2
    }, {
        name : "width",
        displayName : "Width",
        unit : "",
        step : 0.005,
        decimals : 4
    }, {
        name : "height",
        displayName : "Height",
        unit : "",
        step : 0.02,
        decimals : 3
    }, {
        name : "spacing",
        displayName : "Spacing",
        unit : "",
        step : 1,
        decimals : 1
    }];

    $scope.operators = [{
        name : "x",
        standardValue : 1,
        type : "stack"
    }, {
        name : "÷",
        standardValue : 1,
        type : "stack"
    }, {
        name : "+",
        standardValue : 0,
        type : "stack"
    }, {
        name : "-",
        standardValue : 0,
        type : "stack"
    }];

    $scope.selectionParametersMasters = [];
    $scope.selectionParametersGlyphs = [];

    $scope.data.updateSelectionParameters = function() {
        $scope.selectionParametersMasters = $scope.updateSelectionParametersElements("master");
        $scope.selectionParametersGlyphs = $scope.updateSelectionParametersElements("glyph");
    };

    $scope.updateSelectionParametersElements = function(level) {
        var selectionParameters = [];
        angular.forEach($scope.parameters, function(theParameter) {
            var theOperators = [];
            var hasThisParameter = false;
            angular.forEach($scope.operators, function(theOperator) {
                var hasThisOperator = false;
                var nrOfElements = 0;
                var nrOfHasOperator = 0;
                var lowest = null;
                var highest = null;
                // get all the elements - depending on the level we are in - with edit == true
                var elements = $scope.findElements(level);
                angular.forEach(elements, function(element) {
                    nrOfElements++;
                    angular.forEach(element.element.parameters, function(elementParameter) {
                        if (elementParameter.name == theParameter.name) {
                            hasThisParameter = true;
                            angular.forEach(elementParameter.operators, function(operator) {
                                if (operator.name == theOperator.name) {
                                    hasThisOperator = true;
                                    nrOfHasOperator++;
                                    if (operator.value < lowest || lowest == null) {
                                        lowest = operator.value;
                                    }
                                    if (operator.value > highest || highest == null) {
                                        highest = operator.value;
                                    }
                                }
                            });
                        }
                    });
                });
                // when a multiple selection contains one object with a setting and another without
                // the standard value is used
                if (nrOfElements > nrOfHasOperator && nrOfHasOperator > 0) {
                    if (theOperator.standardValue < lowest) {
                        lowest = theOperator.standardValue;
                    }
                    if (theOperator.standardValue > highest) {
                        highest = theOperator.standardValue;
                    }
                }
                // if the values within a selection differ, we are having a range
                var range = true;
                if (lowest == highest) {
                    range = false;
                }

                if (hasThisOperator) {
                    theOperators.push({
                        name : theOperator.name,
                        range : range,
                        low : {
                            current : lowest,
                            fallback : lowest
                        },
                        high : {
                            current : highest,
                            fallback : highest
                        }
                    });
                }
            });
            if (hasThisParameter) {
                selectionParameters.push({
                    name : theParameter.name,
                    displayName : theParameter.displayName,
                    operators : theOperators
                });
            }
        });
        return selectionParameters;
    };

    $scope.findElements = function(level) {
        var elements = [];
        if (level == "master") {
            angular.forEach($scope.data.sequences, function(sequence) {
                angular.forEach(sequence.masters, function(master) {
                    if (master.edit[0]) {
                        var thisElement = {
                            element : master,
                            master : master
                        };
                        elements.push(thisElement);
                    }
                });
            });
        } else if (level == "glyph") {
            angular.forEach($scope.data.sequences, function(sequence) {
                angular.forEach(sequence.masters, function(master) {
                    if (master.edit[0]) {
                        angular.forEach(master.glyphs, function(glyph) {
                            if (glyph.edit) {
                                // changeParameter needs to know the master when editing on glyph level
                                var thisElement = {
                                    element : glyph,
                                    master : master
                                };
                                elements.push(thisElement);
                            }
                        });
                    }
                });
            });
        }
        return elements;
    };

    function round(value, decimals) {
        return Number(Math.round(value + 'e' + decimals) + 'e-' + decimals);
    }


    $scope.managedInputValue = function(value, parameterName, operatorName, keyEvent) {
        var currentValue = value.current;
        // Not a number: use the fallback value.
        if (isNaN(currentValue) || currentValue === "") {
            currentValue = value.fallback;
        }
        if ( typeof (currentValue) == "string") {
            currentValue = parseFloat(currentValue.replace(',', '.'));
        }
        // Step size
        var thisParameter = $scope.getParameterByName(parameterName);
        var step = thisParameter.step;
        var decimals = thisParameter.decimals;
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
    };

    $scope.changeParameter = function(parameterName, operator, value, elementType, range, keyEvent) {
        if (keyEvent == "blur" || keyEvent.keyCode == 13 || keyEvent.keyCode == 38 || keyEvent.keyCode == 40) {
            var operatorName = operator.name;
            var thisValue = $scope.managedInputValue(value, parameterName, operatorName, keyEvent);
            value.current = thisValue;
            value.fallback = thisValue;

            // temp hack untill #392 is fixed
            var key = parameterName + "F";
            if (parameterName == "spacing") {
                var key = parameterName + "S";
            }

            // find which elements (master(s) or glyph(s) - later also deeper levels - to edit with this value
            var elements = $scope.findElements(elementType);
            angular.forEach(elements, function(element) {
                if (element.element.ruleIndex) {
                    var ruleIndex = element.element.ruleIndex;
                } else {
                    var ruleIndex = $scope.addRullAPI(elementType, element.master, element.element.name);
                }
                // if there is a range, we have to find the value for this element within the range
                if (range) {
                    thisValue = $scope.getRangeValue(element.element, parameterName, operator, elementType);
                }
                // temp hack untill #392 is fixed
                // Untill the initial value issue is implemented. Then all the operators together produce a calculated value.
                // That value is passed to the setParameter(parameterDict, key, value)
                if (operator.name == "÷") {
                    thisValue = 1 / thisValue;
                } else if (operator.name == "-") {
                    thisValue = -thisValue;
                }
                $scope.setParameterModel(element.master, element.element, parameterName, operatorName, thisValue);
                $scope.setParameterAPI(element.master, ruleIndex, key, thisValue);
            });
            if (range) {
                // update the range boundaries after setting each element,
                // so the new value of a (inbetween range) element
                // gets the right myPosition relative to the new boundaries
                operator.low.old = operator.low.current;
                operator.high.old = operator.high.current;
            }
            //$scope.optimizeOperators();
        }
    };

    $scope.getRangeValue = function(element, parameterName, myOperator, elementType) {
        var scale, myPosition, newValue;
        var decimals = $scope.getParameterByName(parameterName).decimals;
        var operatorName = myOperator.name;
        var oldLow = myOperator.low.old;
        var oldHigh = myOperator.high.old;
        var newLow = myOperator.low.current;
        var newHigh = myOperator.high.current;
        var currentValue = null;
        // find current value of the specific element
        angular.forEach(element.parameters, function(parameter) {
            if (parameter.name == parameterName) {
                angular.forEach(parameter.operators, function(operator) {
                    if (operator.name == operatorName) {
                        currentValue = operator.value;
                    }
                });
            }
        });
        if (currentValue == null) {
            currentValue = getOperatorByName(operatorName).standardValue;
        }
        if (oldLow == newLow && oldHigh == newHigh) {
            newValue = currentValue;
        } else {
            scale = oldHigh - oldLow;
            myPosition = (currentValue - oldLow) / scale;
            newValue = round(((newHigh - newLow) * myPosition + newLow), decimals);
        }
        return newValue;
    };

    $scope.addRullAPI = function(elementType, master, elementName) {
        if ($scope.data.pill != "blue") {
            var parameterCollection = $scope.data.stateful.project.ruleController.getRule(false, master.cpsFile);
            var l = parameterCollection.length;
            var selectorListString = elementType + "#" + elementName;
            var ruleIndex = $scope.data.stateless.cpsAPITools.addNewRule(parameterCollection, l, selectorListString);
            return ruleIndex;
        }
    };

    $scope.setParameterAPI = function(master, ruleIndex, key, value) {
        if ($scope.data.pill != "blue") {
            var parameterCollection = $scope.data.stateful.project.ruleController.getRule(false, master.cpsFile);
            var cpsRule = parameterCollection.getItem(ruleIndex);
            var parameterDict = cpsRule.parameters;
            var setParameter = $scope.data.stateless.cpsAPITools.setParameter;
            setParameter(parameterDict, key, value);
        }
    };

    $scope.setParameterModel = function(master, element, parameterName, operatorName, value) {
        var theParameter = null;
        var theOperator = null;
        angular.forEach(element.parameters, function(parameter) {
            if (parameter.name == parameterName) {
                theParameter = parameter;
                angular.forEach(parameter.operators, function(operator) {
                    if (operator.name == operatorName) {
                        theOperator = operator;
                    }
                });
            }
        });
        // in ranges situation can appear where an element doesn't have the parameter or the operator already
        if (!theOperator) {
            // create operator
            var newOperator = $scope.getOperatorByName(operatorName);
            newOperator.value = parseFloat(value);
            if (!theParameter) {
                // create parameter
                var newParameter = $scope.getParameterByName(parameterName);
                newParameter.operators = [];
                newParameter.operators.push(newOperator);
                element.parameters.push(newParameter);
            } else {
                theParameter.operators.push(newOperator);
            }
        } else {
            theOperator.value = parseFloat(value);
        }
    };

    $scope.getParameterByName = function(parameterName) {
        var theParameter;
        angular.forEach($scope.parameters, function(parameter) {
            if (parameter.name == parameterName) {
                theParameter = parameter;
            }
        });
        return theParameter;
    };

    $scope.getOperatorByName = function(operatorName) {
        var theOperator;
        angular.forEach($scope.operators, function(operator) {
            if (operator.name == operatorName) {
                theOperator = operator;
            }
        });
        return theOperator;
    };

    // check in model if the glyph has this specific parameter
    $scope.getParameterInRule = function(glyph, parameterName, operatorName) {
        var theParameter;
        angular.forEach(glyph.parameters, function(parameter) {
            if (parameter.name == parameterName) {
                angular.forEach(parameter.operators, function(operator) {
                    if (operator.name == operatorName) {
                        theParameter = operator;
                    }
                });
            }
        });
        return theParameter;
    };

    $scope.hasParameter = function(glyph, key) {
        var hasParameter = false;
        angular.forEach(glyph.parameters, function(parameter) {
            if (parameter.name == key) {
                hasParameter = true;
            }
        });
        return hasParameter;
    };

    $scope.data.getParameter = function() {
        angular.forEach($scope.data.sequences, function(sequence) {
            angular.forEach(sequence.masters, function(master) {
                if (master.edit[0]) {
                    angular.forEach($scope.parameters, function(parameter, index) {
                        angular.forEach($scope.operators, function(operator) {
                            var key = parameter + operator.affix;
                            var masterMOMNode = $scope.data.stateful.controller.query("master#" + master.name);
                            var styleDict = masterMOMNode.getComputedStyle();
                            var value = styleDict.get(key);
                            if (value) {
                                console.log(key + ": " + value);
                            }
                        });
                    });
                }
            });
        });
    };

    /*** handling the parameter add panel ***/

    $scope.parameterLevel = null;
    $scope.panelParameter = null;
    $scope.panelOperator = null;

    $scope.addParameterToPanel = function(parameter) {
        $scope.panelParameter = parameter;
        if ($scope.panelParameter && $scope.panelOperator) {
            $scope.addParameterToElements($scope.panelParameter, $scope.panelOperator);
        }
    };

    $scope.addOperatorToPanel = function(operator) {
        $scope.panelOperator = operator;
        if ($scope.panelParameter && $scope.panelOperator) {
            $scope.addParameterToElements($scope.panelParameter, $scope.panelOperator);
        }
    };

    $scope.addParameterToElements = function(parameter, operator) {
        angular.forEach($scope.data.sequences, function(sequence) {
            angular.forEach(sequence.masters, function(master) {
                if (master.edit[0]) {
                    if ($scope.parameterLevel == "master") {
                        $scope.pushParameterToModel(master, parameter, operator);
                    } else if ($scope.parameterLevel == "glyph") {
                        angular.forEach(master.glyphs, function(glyph) {
                            if (glyph.edit) {
                                $scope.pushParameterToModel(glyph, parameter, operator);
                            }
                        });
                    }
                }
            });
        });
        $scope.data.parametersPanel = 0;
        $scope.data.updateSelectionParameters();
    };

    $scope.pushParameterToModel = function(element, newParameter, newOperator) {
        var hasRule = false;
        if (element.parameters.length > 0) {
            hasRule = true;
        }
        var hasParameter = false;
        angular.forEach(element.parameters, function(parameter) {
            if (parameter.name == newParameter.name) {
                hasParameter = true;
                parameter.operators.push({
                    name : newOperator.name,
                    value : newOperator.standardValue
                });
                parameter.operators = $scope.reorderOperators(parameter.operators);
            }
        });
        if (!hasParameter) {
            element.parameters.push({
                name : newParameter.name,
                displayName : newParameter.displayName,
                unit : newParameter.unit,
                operators : [{
                    name : newOperator.name,
                    value : newOperator.standardValue
                }]
            });
        }
    };

    $scope.reorderOperators = function(operators) {
        var multiply = [], divide = [], add = [], subtract = [], is = [], min = [], max = [];
        angular.forEach(operators, function(operator) {
            if (operator.name == "x") {
                multiply.push(operator);
            } else if (operator.name == "÷") {
                divide.push(operator);
            } else if (operator.name == "+") {
                add.push(operator);
            } else if (operator.name == "-") {
                subtract.push(operator);
            } else if (operator.name == "=") {
                is.push(operator);
            } else if (operator.name == "min") {
                min.push(operator);
            } else if (operator.name == "max") {
                max.push(operator);
            }
        });
        var newOperators = multiply.concat(divide, add, subtract, is, min, max);
        return newOperators;
    };

    $scope.optimizeOperators = function() {
        angular.forEach($scope.data.sequences, function(sequence) {
            angular.forEach(sequence.masters, function(master) {
                if (master.edit[0]) {
                    if (master.parameters.length > 0) {
                        $scope.optimize(master.parameters);
                    }
                    angular.forEach(master.glyphs, function(glyph) {
                        if (glyph.edit[0] && glyph.parameters.length > 0) {
                            $scope.optimize(glyph.parameters);
                        }
                    });
                }
            });
        });
    };

    $scope.optimize = function(parameters) {
        angular.forEach(parameters, function(parameter) {
            var lastOperator = {
                name : null,
                value : null
            };
            var newSetOperators = [];
            var newOperator;
            var changeOfOperator;
            angular.forEach(parameter.operators, function(operator, index) {
                if (operator.name == lastOperator.name) {
                    if (operator.name == "+" || operator.name == "-") {
                        newOperator.value = parseFloat(newOperator.value) + parseFloat(operator.value);
                    } else if (operator.name == "x" || operator.name == "÷") {
                        newOperator.value = parseFloat(newOperator.value) * parseFloat(operator.value);
                    }
                } else {
                    if (index != 0) {
                        newSetOperators.push(newOperator);
                    }
                    newOperator = operator;
                }
                lastOperator = operator;

            });
            newSetOperators.push(newOperator);
            parameter.operators = newSetOperators;

        });
    };

    /***** ranges *****/

    $scope.$watch("data.sequences | glyphsInEditFilter:parameters:operators", function(newVal) {
        $scope.filteredGlyphParameters = newVal;
    }, true);

    $scope.editParameter = function(editParameter, editOperator) {
        angular.forEach($scope.data.sequences, function(sequence) {
            angular.forEach(sequence.masters, function(master) {
                if (master.edit[0]) {
                    angular.forEach(master.glyphs, function(glyph) {
                        if (glyph.edit) {
                            angular.forEach(glyph.parameters, function(parameter) {
                                if (parameter.name == editParameter.name) {
                                    angular.forEach(parameter.operations, function(operation) {
                                        if (operation.operator == editOperator.operator) {
                                            if (!editOperator.range) {
                                                operation.value = parseFloat(editOperator.low);
                                            }
                                        }
                                    });
                                }
                            });
                        }
                    });
                }
            });
        });
    };

    $scope.parametersWindow = function(event, target, level) {
        $scope.parameterLevel = level;
        $scope.panelOperator = null;
        $scope.panelParameter = null;
        var top = $(event.target).offset().top + 20;
        var left = $(event.target).offset().left + 20;
        $scope.parameterPanelTop = top;
        $scope.parameterPanelLeft = left;
        if (target != $scope.data.parametersPanel) {
            $scope.data.parametersPanel = target;
        } else {
            $scope.data.parametersPanel = 0;
        }
    };

    $scope.hasInheritance = function(theParameter) {
        var inheritance = false;
        angular.forEach($scope.data.sequences, function(sequence) {
            angular.forEach(sequence.masters, function(master) {
                if (master.edit[0]) {
                    angular.forEach(master.parameters, function(parameter) {
                        if (parameter.name == theParameter.name) {
                            inheritance = true;
                        }
                    });
                }
            });
        });
        return inheritance;
    };

    $scope.calculatedValue = function(theParameter) {
        var operations = [];
        var masterFixed = null;
        var glyphFixed = null;
        angular.forEach($scope.data.sequences, function(sequence) {
            angular.forEach(sequence.masters, function(master) {
                if (master.edit[0]) {
                    angular.forEach(master.parameters, function(parameter) {
                        if (parameter.name == theParameter.name) {
                            angular.forEach(parameter.operations, function(operation) {
                                if (operation.operator == "=") {
                                    masterFixed = operation.value;
                                } else {
                                    operations.push({
                                        operator : operation.operator,
                                        value : operation.value
                                    });
                                }
                            });
                        }
                    });
                    angular.forEach(master.glyphs, function(glyph) {
                        if (glyph.edit) {
                            angular.forEach(glyph.parameters, function(parameter) {
                                if (parameter.name == theParameter.name) {
                                    angular.forEach(parameter.operations, function(operation) {
                                        if (operation.operator == "=") {
                                            glyphFixed = operation.value;
                                        } else {
                                            operations.push({
                                                operator : operation.operator,
                                                value : operation.value
                                            });
                                        }
                                    });
                                }
                            });
                        }
                    });
                }
            });
        });
        if (glyphFixed) {
            var calculatedValue = glyphFixed;
        } else if (masterFixed) {
            var calculatedValue = masterFixed;
        }
        angular.forEach(operations, function(operation) {
            if (operation.operator == "+") {
                calculatedValue += parseFloat(operation.value);
            } else if (operation.operator == "-") {
                calculatedValue -= parseFloat(operation.value);
            } else if (operation.operator == "x") {
                calculatedValue *= parseFloat(operation.value);
            } else if (operation.operator == "÷") {
                calculatedValue /= parseFloat(operation.value);
            }
        });
        return calculatedValue;
    };

    $scope.areGlyphsSelected = function() {
        var selected = false;
        angular.forEach($scope.data.sequences, function(sequence) {
            angular.forEach(sequence.masters, function(master) {
                if (master.edit[0]) {
                    angular.forEach(master.glyphs, function(glyph) {
                        if (glyph.edit) {
                            selected = true;
                        }
                    });
                }
            });
        });
        return selected;
    };

    $scope.areMastersSelected = function() {
        var selected = false;
        angular.forEach($scope.data.sequences, function(sequence) {
            angular.forEach(sequence.masters, function(master) {
                if (master.edit[0]) {
                    selected = true;
                }
            });
        });
        return selected;
    };
});
