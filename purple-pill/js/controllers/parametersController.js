app.controller("parametersController", function($scope, sharedScope) {
    $scope.data = sharedScope.data;
    
    $scope.levels = ["master", "glyph"];

    /*
    // until #392 is fixed, we work only with width and weight

    $scope.parameters = [{
        name : "Weight",
        unit : "em",
        step : 0.1,
        decimals : 2,
        effectiveLevel : "point"
    }, {
        name : "Width",
        unit : "em",
        step : 0.005,
        decimals : 4,
        effectiveLevel : "glyph"
    }, {
        name : "Height",
        unit : "em",
        step : 0.02,
        decimals : 3,
        effectiveLevel : "glyph"
    }, {
        name : "Spacing",
        unit : "em",
        step : 1,
        decimals : 1,
        effectiveLevel : "glyph"
    }];
    */
   
    $scope.parameters = [{
        name : "Width",
        unit : "em",
        step : 0.005,
        decimals : 4,
        effectiveLevel : "glyph"
    }];


    $scope.operators = [{
        name : "x",
        standardValue : 1,
        type : "stack",
        usesUnit : false,
        effectiveLocal: true
    }, {
        name : "÷",
        standardValue : 1,
        type : "stack",
        usesUnit : false,
        effectiveLocal: true
    }, {
        name : "+",
        standardValue : 0,
        type : "stack",
        usesUnit : true,
        effectiveLocal: false
    }, {
        name : "-",
        standardValue : 0,
        type : "stack",
        usesUnit : true,
        effectiveLocal: false
    }, {
        name : "=",
        standardValue : null,
        type : "unique",
        usesUnit : true,
        effectiveLocal: false
    }];

    $scope.parameterSelection = {
        master: [],
        glyph: []
    };

    $scope.data.updateSelectionParameters = function(selectionChanged) {
        if (selectionChanged) {
            $scope.destackOperators();
        }
        $scope.parameterSelection.master = $scope.updateSelectionParametersElements("master");
        $scope.parameterSelection.glyph = $scope.updateSelectionParametersElements("glyph");
    };

    $scope.updateSelectionParametersElements = function(level) {
        var selectionParameters = [];
        angular.forEach($scope.parameters, function(theParameter) {
            var theOperators = [];
            var hasThisParameter = false;
            angular.forEach($scope.operators, function(theOperator, operatorIndex) {
                var hasThisOperator = false;
                var nrOfElements = 0;
                var nrOfHasOperator = 0;
                var lowest = null;
                var highest = null;
                // get all the elements - depending on the level we are in - with edit == true
                var elements = $scope.findElementsEdit(level);
                angular.forEach(elements, function(element, index) {
                    nrOfElements++;
                    angular.forEach(element.element.parameters, function(elementParameter) {
                        if (elementParameter.name == theParameter.name) {
                            hasThisParameter = true;
                            angular.forEach(elementParameter.operators, function(operator) {
                                if (operator.name == theOperator.name) {
                                    if (!operator.id) {
                                        // an operator without id is a de-stacked operator
                                        hasThisOperator = true;
                                        nrOfHasOperator++;
                                        if (operator.value < lowest || lowest == null) {
                                            lowest = operator.value;
                                        }
                                        if (operator.value > highest || highest == null) {
                                            highest = operator.value;
                                        }
                                    } else {
                                        // an operator with an id is a stacked operator
                                        // added during the current selection process.
                                        // the id will be removed after deselecting + de-stacking
                                        // range is always false, because it is added after selecting
                                        // only at index == 0, because this counts for all elements the same
                                        if (index == 0) {
                                            theOperators.push({
                                                name : operator.name,
                                                range : false,
                                                low : {
                                                    current : operator.value,
                                                    fallback : operator.value
                                                },
                                                id : operator.id
                                            });
                                        }
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
                    operators : theOperators
                });
            }
        });
        return selectionParameters;
    };


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

    $scope.changeValue = function(parameterName, operator, value, level, range, keyEvent) {
        if (keyEvent == "blur" || keyEvent.keyCode == 13 || keyEvent.keyCode == 38 || keyEvent.keyCode == 40) {
            var operatorName = operator.name;
            var thisValue = $scope.managedInputValue(value, parameterName, operatorName, keyEvent);
            var operatorId = operator.id;
            value.current = thisValue;
            value.fallback = thisValue;

            // temp hack untill #392 is fixed
            var key = parameterName + "F";
            if (parameterName == "spacing") {
                var key = parameterName + "S";
            }

            // find which elements (master(s) or glyph(s) - later also deeper levels - to edit with this value
            var elements = $scope.findElementsEdit(level);
            angular.forEach(elements, function(element) {
                if (element.element.ruleIndex) {
                    var ruleIndex = element.element.ruleIndex;
                } else {
                    var ruleIndex = $scope.addRullAPI(level, element.master, element.element.name);
                }
                // if there is a range, we have to find the value for this element within the range
                if (range) {
                    thisValue = $scope.getRangeValue(element.element, parameterName, operator, level);
                }
                // temp hack untill #392 is fixed
                // Untill the initial value issue is implemented. Then all the operators together produce a calculated value.
                // That value is passed to the setParameter(parameterDict, key, value)
                if (operator.name == "÷") {
                    thisValue = 1 / thisValue;
                } else if (operator.name == "-") {
                    thisValue = -thisValue;
                }
                $scope.setParameterModel(element.master, element.element, parameterName, operatorName, thisValue, operatorId);
                $scope.setParameterAPI(element.master, ruleIndex, key, thisValue);
            });
            if (range) {
                // update the range boundaries after setting each element,
                // so the new value of a (inbetween range) element
                // gets the right myPosition relative to the new boundaries
                operator.low.old = operator.low.current;
                operator.high.old = operator.high.current;
            }
        }
    };
    
    $scope.findElementWithEffectiveValue = function () {
        angular.forEach($scope.data.sequences, function(sequence) {
            angular.forEach(sequence.masters, function(master) {
                angular.forEach(master.glyphs, function(glyph) {

                });
            });
        });  
    };
    
    $scope.updateEffectiveValue = function(element, parameterName) {
        var min, max, is, effectiveValue, plusGlyph = [], plusMaster = [], multiplyGlyph = [], multiplyMaster = [];
        var parentElement = $scope.findParentElement(element.parent[0], element.parent[1]);
        
        angular.forEach(parentElement.parameters, function(parameter) {
            if (parameter.name == parameterName) {
                angular.forEach(parameter.operators, function(operator) {
                    if (operator.name == "min") {
                        min = operator.value;
                    } else if (operator.name == "max") {
                        max = operator.value;
                    } else if (operator.name == "=") {
                        is = operator.value;
                    } else if (operator.name == "+") {
                        plusMaster.push(parseFloat(operator.value));
                    } else if (operator.name == "-") {
                        plusMaster.push(parseFloat(-operator.value));
                    } else if (operator.name == "x") {
                        multiplyMaster.push(parseFloat(operator.value));
                    } else if (operator.name == "÷") {
                        multiplyMaster.push(parseFloat(1 / operator.value));
                    }
                });
            }
        });
        
        // glyph operators overrule the master operators
        angular.forEach(element.parameters, function(parameter) {
            if (parameter.name == parameterName) {
                angular.forEach(parameter.operators, function(operator) {
                    if (operator.name == "min") {
                        min = operator.value;
                    } else if (operator.name == "max") {
                        max = operator.value;
                    } else if (operator.name == "=") {
                        is = operator.value;
                    } else if (operator.name == "+") {
                        plusGlyph.push(parseFloat(operator.value));
                    } else if (operator.name == "-") {
                        plusGlyph.push(parseFloat(-operator.value));
                    } else if (operator.name == "x") {
                        multiplyGlyph.push(parseFloat(operator.value));
                    } else if (operator.name == "÷") {
                        multiplyGlyph.push(parseFloat(1 / operator.value));
                    }
                });
            }
        });
        effectiveValue = is;
        angular.forEach(multiplyGlyph, function(multiply) {
            effectiveValue *= multiply;
        });
        angular.forEach(plusGlyph, function(plus) {
            effectiveValue += plus;
        });
        angular.forEach(multiplyMaster, function(multiply) {
            effectiveValue *= multiply;
        });
        angular.forEach(plusMaster, function(plus) {
            effectiveValue += plus;
        });
        
        if (effectiveValue > max) {
            effectiveValue = max;
        } else if (effectiveValue < min) {
            effectiveValue = min;
        }
        return effectiveValue;
    };
    


    $scope.getRangeValue = function(element, parameterName, myOperator, level) {
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

    $scope.addRullAPI = function(level, master, elementName) {
        if ($scope.data.pill != "blue") {
            var parameterCollection = $scope.data.stateful.project.ruleController.getRule(false, master.cpsFile);
            var l = parameterCollection.length;
            var selectorListString = level + "#" + elementName;
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

    $scope.setParameterModel = function(master, element, parameterName, operatorName, value, operatorId) {
        var theParameter = null;
        var theOperator = null;
        angular.forEach(element.parameters, function(parameter) {
            if (parameter.name == parameterName) {
                theParameter = parameter;
                angular.forEach(parameter.operators, function(operator) {
                    if ((operator.name == operatorName) && ((operator.id == operatorId) || (!operator.id && !operatorId))) {
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


    /*** handling the parameter add panel ***/

    $scope.parameterLevel = null;
    $scope.panelParameter = null;
    $scope.panelOperator = null;
    // to keep track of an added operator, an id is added to it,
    // because an element could have multiple of the same parameter+instance
    // when te selection is lost, and de-stacking the operatorers, the id is removed.
    // prevent use of 0, because that will match undefined
    $scope.operatorId = 1;
    $scope.parameterId = 1;

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
        // get all the elements - depending on the level we are in - with edit == true
        var level = $scope.parameterLevel;
        var elements = $scope.findElementsEdit(level);
        angular.forEach(elements, function(thisElement) {
            var element = thisElement.element;
            var hasRule = false;
            if (element.parameters.length > 0) {
                hasRule = true;
            }
            var hasParameter = false;
            angular.forEach(element.parameters, function(thisParameter) {
                if (thisParameter.name == parameter.name) {
                    hasParameter = true;
                    thisParameter.operators.push({
                        name : operator.name,
                        value : operator.standardValue,
                        id : $scope.operatorId
                    });
                    thisParameter.operators = $scope.reorderOperators(thisParameter.operators);
                }
            });
            if (!hasParameter) {
                element.parameters.push({
                    name : parameter.name,
                    id : $scope.parameterId,
                    operators : [{
                        name : operator.name,
                        value : operator.standardValue,
                        id : $scope.operatorId
                    }]
                });
                $scope.parameterId++;
            }
        });
        $scope.operatorId++;
        $scope.data.view.parameterOperatorPanel = 0;
        $scope.data.updateSelectionParameters(false);
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

    $scope.destackOperators = function() {
        var elements = $scope.findAllElements();
        angular.forEach(elements, function(element) {
            angular.forEach(element.parameters, function(parameter) {
                var lastOperator = {
                    name : null,
                    value : null
                };
                var newSetOperators = [];
                var newOperator;
                var changeOfOperator;
                angular.forEach(parameter.operators, function(operator, index) {
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
        });
    };


    // panel handling
    
    $scope.parametersWindow = function(event, target, level) {
        $scope.parameterLevel = level;
        $scope.panelOperator = null;
        $scope.panelParameter = null;
        var top = $(event.target).offset().top + 20;
        var left = $(event.target).offset().left + 20;
        $scope.parameterPanelTop = top;
        $scope.parameterPanelLeft = left;
        if (target != $scope.data.view.parameterOperatorPanel) {
            $scope.data.view.parameterOperatorPanel = target;
        } else {
            $scope.data.view.parameterOperatorPanel = 0;
        }
    };

    $scope.areElementsSelected = function(level) {
        var selected = false;
        if (level == "master") {
            angular.forEach($scope.data.sequences, function(sequence) {
                angular.forEach(sequence.masters, function(master) {
                    if (master.edit[0]) {
                        selected = true;
                    }
                });
            });
        } else if (level == "glyph") {
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
        }
        return selected;
    };

    $scope.openParameterPanel = function(parameter, event, level) {
        $scope.data.closeParameterPanel();
        var target = event.currentTarget;
        $(target).addClass("selected-parameter");
        var targetLeft = event.clientX;
        var targetTop = event.clientY;
        $scope.data.view.parameterPanel.display = true;
        $scope.data.view.parameterPanel.left = targetLeft;
        $scope.data.view.parameterPanel.top = targetTop;
        $scope.data.view.parameterPanel.level = level;
        $scope.data.view.parameterPanel.selected = parameter.name;
    };

    $scope.changeParameter = function(parameter) {
        var oldParameterName = $scope.data.view.parameterPanel.selected;
        if (oldParameterName != parameter.name) {
            var elements = $scope.findElementsEdit($scope.data.view.parameterPanel.level);
            angular.forEach(elements, function(element) {
                angular.forEach(element.element.parameters, function(thisParameter) {
                    if (thisParameter.name == oldParameterName) {
                        // todo: change by API
                        thisParameter.name = parameter.name;
                    }
                });
            });
        }
        $scope.data.updateSelectionParameters(false);
        $scope.data.closeParameterPanel();
    };

    $scope.removeParameter = function() {
        var oldParameterName = $scope.data.view.parameterPanel.selected;
        var elements = $scope.findElementsEdit($scope.data.view.parameterPanel.level);
        angular.forEach(elements, function(element) {
            var parameters = element.element.parameters;
            angular.forEach(parameters, function(thisParameter) {
                if (thisParameter.name == oldParameterName) {
                    // todo: change by API
                    parameters.splice(parameters.indexOf(thisParameter), 1);
                }
                if (parameters.length == 0) {
                    // todo: remove rule in api and in model
                }
            });
        });
        $scope.data.updateSelectionParameters(false);
        $scope.data.closeParameterPanel();
    };
    
    $scope.data.closeParameterPanel = function () {
        $scope.data.view.parameterPanel.display = false;
        $scope.data.view.parameterPanel.selected = null;
        $scope.data.view.parameterPanel.level = null;
        $("parameters .parameter-key").each(function() {
           $(this).removeClass("selected-parameter"); 
        });
    };

    $scope.openOperatorPanel = function(parameter, operator, event, level) {
        $scope.data.closeOperatorPanel();
        var target = event.currentTarget;
        $(target).addClass("selected-parameter");
        var targetLeft = event.clientX;
        var targetTop = event.clientY;
        $scope.data.view.operatorPanel.display = true;
        $scope.data.view.operatorPanel.left = targetLeft;
        $scope.data.view.operatorPanel.top = targetTop;
        $scope.data.view.operatorPanel.level = level;
        $scope.data.view.operatorPanel.selectedParameter = parameter.name;
        $scope.data.view.operatorPanel.selected = operator.name;
    };

    $scope.changeOperator = function(operator) {
        var oldParameterName = $scope.data.view.operatorPanel.selectedParameter;
        var oldOperatorName = $scope.data.view.operatorPanel.selected;
        if (oldOperatorName != operator.name) {
            var elements = $scope.findElementsEdit($scope.data.view.operatorPanel.level);
            angular.forEach(elements, function(element) {
                angular.forEach(element.element.parameters, function(thisParameter) {
                    if (thisParameter.name == oldParameterName) {
                        angular.forEach(thisParameter.operators, function(thisOperator) {
                            if (thisOperator.name == oldOperatorName) {
                                // todo: change by API
                                thisOperator.name = operator.name;
                            }
                        });
                    }
                });
            });
        }
        $scope.data.updateSelectionParameters(false);
        $scope.data.closeOperatorPanel();
    };

    $scope.removeOperator = function() {
        var oldParameterName = $scope.data.view.operatorPanel.selectedParameter;
        var oldOperatorName = $scope.data.view.operatorPanel.selected;
        var elements = $scope.findElementsEdit($scope.data.view.operatorPanel.level);
        angular.forEach(elements, function(element) {
            var parameters = element.element.parameters;
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
        });
        $scope.data.updateSelectionParameters(false);
        $scope.data.closeOperatorPanel();
    };
    
    $scope.data.closeOperatorPanel = function () {
        $scope.data.view.operatorPanel.display = false;
        $scope.data.view.operatorPanel.selectedParameter = null;
        $scope.data.view.operatorPanel.selected = null;
        $scope.data.view.operatorPanel.level = null;
        $("parameters .parameter-operator").each(function() {
           $(this).removeClass("selected-parameter"); 
        });
    };
    
    
    // helper functions
    
    $scope.findElementsEdit = function(level) {
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

    $scope.findAllElements = function() {
        var elements = [];
        angular.forEach($scope.data.sequences, function(sequence) {
            angular.forEach(sequence.masters, function(master) {
                elements.push(master);
                angular.forEach(master.glyphs, function(glyph) {
                    elements.push(glyph);
                });
            });
        });
        return elements;
    };

    function round(value, decimals) {
        return Number(Math.round(value + 'e' + decimals) + 'e-' + decimals);
    }
    
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
    
    $scope.findParentElement = function (level, elementName) {
        var thisElement;
        if (level == "master") {
            angular.forEach($scope.data.sequences, function(sequence) {
                angular.forEach(sequence.masters, function(master) {
                    if (master.name == elementName) {
                        thisElement = master;
                    }
                });
            });  
        } else if (level =="glyph") {
            angular.forEach($scope.data.sequences, function(sequence) {
                angular.forEach(sequence.masters, function(master) {
                    angular.forEach(master.glyphs, function(glyph) {
                        if (glyph.name == elementName) {
                            thisElement = glyph;
                        }
                    });
                });
            });  
        }
        return thisElement;
    };
    
    

    /***** ranges *****/

    /*
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

    */

    // parameters panel settings



});
