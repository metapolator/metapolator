app.controller("parametersController", function($scope, sharedScope) {
    $scope.data = sharedScope.data;

    $scope.parameters = [{
        name : "weight",
        displayName : "Weight",
        unit : "",
    }, {
        name : "width",
        displayName : "Width",
        unit : "",
    }, {
        name : "height",
        displayName : "Height",
        unit : "",
    }, {
        name : "sidebearingLeft",
        displayName : "Sidebearing Left",
        unit : "",
    }, {
        name : "sidebearingRight",
        displayName : "Sidebearing Right",
        unit : "",
    }];

    $scope.operators = [{
        name : "x",
        standardValue : 1,
    }, {
        name : "÷",
        standardValue : 1,
    }, {
        name : "+",
        standardValue : 0,
    }, {
        name : "-",
        standardValue : 0,
    }, {
        name : "=",
        standardValue : null,
    }];

    $scope.selectionParametersMasters = [];
    $scope.selectionParametersGlyphs = [];

    // responds on selection change in masters panel (for masters) or specimen panel (for glyphs)
    $scope.data.updateSelectionParameters = function() {
        $scope.selectionParametersMasters = [];
        $scope.selectionParametersGlyphs = [];
        angular.forEach($scope.data.sequences, function(sequence) {
            angular.forEach(sequence.masters, function(master) {
                if (master.type == "redpill" && master.edit) {
                    angular.forEach(master.parameters, function(masterParameter) {
                        $scope.selectionParametersMasters.push(masterParameter);
                    });
                    angular.forEach(master.glyphs, function(glyph) {
                        if (glyph.edit) {
                            angular.forEach(glyph.parameters, function(glyphParameter) {
                                $scope.selectionParametersGlyphs.push(glyphParameter);
                            });
                        }
                    });
                }
            });
        });
    };

    // do administration in model and make call to API
    $scope.data.setParameterMaster = function(parameterName, operatorName, value, hasRule) {
        if ($scope.data.pill != "blue") {
            var key = parameterName + "Factor";
            angular.forEach($scope.data.sequences, function(sequence) {
                angular.forEach(sequence.masters, function(master) {
                    if (master.type == "redpill" && master.edit) {
                        var parameterCollection = $scope.data.stateful.project.ruleController.getRule(false, master.cpsFile);
                        // the master properties are at rulenr 3
                        var cpsRule = parameterCollection.getItem(3);
                        var parameterDict = cpsRule.parameters;
                        var setParameter = $scope.data.stateless.cpsAPITools.setParameter;
                        setParameter(parameterDict, key, value);
                    }
                });
            });
        }
        $scope.optimizeOperators();
    };

    // do administration in model and make call to API
    $scope.data.setParameterGlyph = function(parameterName, operatorName, value, hasRule) {
        if ($scope.data.pill != "blue") {
            var key = parameterName + "Factor";
            if (parameterName == "sidebearingLeft" || parameterName == "sidebearingRight") {
               var key = parameterName + "Summand"; 
            }
            angular.forEach($scope.data.sequences, function(sequence) {
                angular.forEach(sequence.masters, function(master) {
                    if (master.type == "redpill" && master.edit) {
                        angular.forEach(master.glyphs, function(glyph) {
                            if (glyph.edit) {
                                var parameterCollection = $scope.data.stateful.project.ruleController.getRule(false, master.cpsFile);
                                // check if there is already a rule for this keyName in this glyph
                                if (!hasRule) {
                                    var l = parameterCollection.length;
                                    var selectorListString = "glyph#" + glyph.value;
                                    var ruleIndex = $scope.data.stateless.cpsAPITools.addNewRule(parameterCollection, l, selectorListString);
                                    // register rule position in model
                                    glyph.ruleIndex = ruleIndex;
                                } else {
                                    var ruleIndex = glyph.ruleIndex;
                                }
                                // edit parameter in model
                                var parameter = $scope.getParameterInRule(glyph, parameterName, operatorName);
                                parameter.value = value;
                                // edit via API
                                var cpsRule = parameterCollection.getItem(ruleIndex);
                                var parameterDict = cpsRule.parameters;
                                var setParameter = $scope.data.stateless.cpsAPITools.setParameter;
                                setParameter(parameterDict, key, value);
                            }
                        });
                    }
                });
            });
        }
        $scope.optimizeOperators();
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
                if (master.type == "redpill" && master.edit) {
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
                if (master.type == "redpill" && master.edit) {
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
        $scope.data.updateSelectionParameters();
        if ($scope.data.pill != "blue") {
            if (element.elementType == "master") {
                $scope.data.setParameterMaster(newParameter.name, newOperator.name, newOperator.standardValue, hasRule);
            } else if (element.elementType == "glyph") {
                $scope.data.setParameterGlyph(newParameter.name, newOperator.name, newOperator.standardValue, hasRule);
            }
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
                if (master.edit) {
                    if (master.parameters.length > 0) {
                        $scope.optimize(master.parameters);
                    }
                    angular.forEach(master.glyphs, function(glyph) {
                        if (glyph.edit && glyph.parameters.length > 0) {
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
                name: null,
                value: null
            };
            var newSetOperators = [];
            var newOperator;
            var changeOfOperator;
            angular.forEach(parameter.operators, function(operator, index) {
                if (operator.name == lastOperator.name) {
                    if (operator.name == "+" || operator.name == "-") {
                        newOperator.value = parseFloat(newOperator.value) + parseFloat(operator.value);
                    } else if (operator.name == "x" || operator.name == "÷")  {
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
                if (master.type == "redpill" && master.edit) {
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
                if (master.type == "redpill" && master.edit) {
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
                if (master.type == "redpill" && master.edit) {
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
                if (master.type == "redpill" && master.edit) {
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
                if (master.type == "redpill" && master.edit) {
                    selected = true;
                }
            });
        });
        return selected;
    };
});
