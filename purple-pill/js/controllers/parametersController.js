app.controller("parametersController", function($scope, sharedScope) {
    $scope.data = sharedScope.data;

    $scope.parameters = ["weight", "width", "height"];
    $scope.operators = [{
        display: "x",
        standardValue: 1,
        affix: "Factor"
    }];
    

    $scope.selectionParametersMasters = [];
    $scope.selectionParametersGlyphs = [];

    // responds on selection change in masters panel (for masters) or specimen panel (for glyphs)
    $scope.data.updateSelectionParameters = function() {
        $scope.selectionParametersMasters = [];
        $scope.selectionParametersGlyphs = [];
        angular.forEach($scope.data.sequences, function(sequence) {
            angular.forEach(sequence.masters, function(master) {
                if (master.type == "redpill" && master.edit[0]) {
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
        var key = parameterName + operatorName;
        if (key == "weightFactor") {
            ruleLine = 2;
        } else {
            ruleLine = 1;
        }
        angular.forEach($scope.data.sequences, function(sequence) {
            angular.forEach(sequence.masters, function(master) {
                if (master.type == "redpill" && master.edit[0]) {
                    var parameterCollection = $scope.data.stateful.project.ruleController.getRule(false, master.cpsFile);
                    var cpsRule = parameterCollection.getItem(ruleLine);
                    var parameterDict = cpsRule.parameters;
                    var setParameter = $scope.data.stateless.cpsAPITools.setParameter;
                    setParameter(parameterDict, key, value);
                }
            });
        });
    };

    // do administration in model and make call to API
    $scope.data.setParameterGlyph = function(parameterName, operatorName, value, hasRule) {
        var key = parameterName + operatorName;
        angular.forEach($scope.data.sequences, function(sequence) {
            angular.forEach(sequence.masters, function(master) {
                if (master.type == "redpill" && master.edit[0]) {
                    angular.forEach(master.glyphs, function(glyph) {
                        if (glyph.edit) {
                            var parameterCollection = $scope.data.stateful.project.ruleController.getRule(false, master.cpsFile);
                            // check if there is already a rule for this keyName in this glyph
                            if (!hasRule) {
                                var l = parameterCollection.length;
                                var selectorListString = "glyph#" + glyph.value + " *";
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
                if (master.type == "redpill" && master.edit[0]) {
                    angular.forEach($scope.parameters, function(parameter, index) {
                        angular.forEach($scope.parameterVariations, function(variation) {
                            var key = parameter.name + variation;
                            console.log(key);
                            var masterMOMNode = $scope.data.stateful.controller.query("master#" + master.name);
                            var styleDict = masterMOMNode.getComputedStyle();
                            var value = styleDict.get(key);
                            if (value) {
                                $scope.parameters[index][variation.toLowerCase()] = value;
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
   
    $scope.addParameterToPanel = function(parameterName) {
        $scope.panelParameter = parameterName;
        if ($scope.panelParameter && $scope.panelOperator) {
            $scope.addParameterToElements($scope.panelParameter, $scope.panelOperator);
        }
    };

    $scope.addOperatorToPanel = function(operatorName) {
        $scope.panelOperator = operatorName;
        if ($scope.panelParameter && $scope.panelOperator) {
            $scope.addParameterToElements($scope.panelParameter, $scope.panelOperator);
        }
    };
    
    $scope.addParameterToElements = function(parameter, operator) {
        angular.forEach($scope.data.sequences, function(sequence) {
            angular.forEach(sequence.masters, function(master) {
                if (master.type == "redpill" && master.edit[$scope.data.viewState]) {
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
    
    $scope.pushParameterToModel = function(element, newParameter, operator) {
        var hasRule = false;
        if (element.parameters.length > 0) {
            hasRule = true;
        }
        var hasParameter = false;
        var newValue = 1;
        angular.forEach(element.parameters, function(parameter) {
            if (parameter.name == newParameter) {
                hasParameter = true;
                parameter.operators.push({
                    name : operator,
                    value : newValue
                });
            }
        });
        if (!hasParameter) {
            element.parameters.push({
                name : newParameter,
                unit : "",
                operators : [{
                    name : operator,
                    value : newValue
                }]
            });
        }
        $scope.data.updateSelectionParameters();
        $scope.data.setParameterGlyph(newParameter, operator, newValue, hasRule);
    };
   
   
   
   

    $scope.$watch("data.sequences | glyphsInEditFilter:parameters:operators", function(newVal) {
        $scope.filteredGlyphParameters = newVal;
    }, true);

    $scope.editParameter = function(editParameter, editOperator) {
        angular.forEach($scope.data.sequences, function(sequence) {
            angular.forEach(sequence.masters, function(master) {
                if (master.type == "redpill" && master.edit[$scope.data.viewState]) {
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
                if (master.type == "redpill" && master.edit[$scope.data.viewState]) {
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
                if (master.type == "redpill" && master.edit[$scope.data.viewState]) {
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
                if (master.type == "redpill" && master.edit[$scope.data.viewState]) {
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
                if (master.type == "redpill" && master.edit[$scope.data.viewState]) {
                    selected = true;
                }
            });
        });
        return selected;
    };
});
