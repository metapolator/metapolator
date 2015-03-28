app.controller("parametersController", function($scope, sharedScope) {
    $scope.data = sharedScope.data;
    
    /* temp testing */
    $scope.data.weightFactor = 100;
    $scope.data.widthFactor = 100;
    $scope.data.heightFactor = 100;
    $scope.data.sidebearingLeft = 0;
    $scope.data.sidebearingRight = 0;
    
    
    $scope.data.editParameter = function (key, value, nr, factor) {
        angular.forEach($scope.data.sequences, function(sequence) {
            angular.forEach(sequence.masters, function(master) {
                if (master.type == "redpill" && master.edit[0]) {
                    var parameterCollection = $scope.data.stateful.project.ruleController.getRule(false, master.cpsFile);
                    var l = parameterCollection.length;
                    var cpsRule = parameterCollection.getItem(l - nr);
                    var parameterDict = cpsRule.parameters;
                    var setParameter = $scope.data.stateless.cpsAPITools.setParameter;
                    if (!factor) {
                        value /= 100;
                    }
                    setParameter(parameterDict, key, value); 
                }
            });
        });
    };
    
    $scope.data.addRule = function () {
        var key = "widthFactor";
        var value = 5;
        var masterName = "web";
        var glyphName = "a";
        var parameterCollection = $scope.data.stateful.controller.getMasterCPS(false, masterName);
        var l = parameterCollection.length;
        var selectorListString = "master#" + masterName + " glyph#" + glyphName + " *";
        var ruleIndex = $scope.data.stateless.cpsAPITools.addNewRule(parameterCollection, l, selectorListString);
        var cpsRule = parameterCollection.getItem(ruleIndex);
        var parameterDict = cpsRule.parameters;
        var setParameter = $scope.data.stateless.cpsAPITools.setParameter;
        setParameter(parameterDict, key, value); 
    };
    

    
    /******/






    $scope.parameters = ["width", "height", "xHeight", "slant", "spacing", "sidebearings", "tension", "weight"];
    $scope.operators = ["x", "÷", "+", "-", "=", "min", "max"];
    $scope.parameterLevel = null;

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

    $scope.windowParameter = null;
    $scope.windowOperator = null;

    $scope.parametersWindow = function(event, target, level) {
        $scope.parameterLevel = level;
        $scope.windowOperator = null;
        $scope.windowParameter = null;
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

    $scope.addParameter = function(parameter) {
        $scope.windowParameter = parameter;
        if ($scope.windowParameter && $scope.windowOperator) {
            $scope.setParameter($scope.windowParameter, $scope.windowOperator);
        }
    };

    $scope.addOperator = function(operator) {
        $scope.windowOperator = operator;
        if ($scope.windowParameter && $scope.windowOperator) {
            $scope.setParameter($scope.windowParameter, $scope.windowOperator);
        }
    };

    $scope.setParameter = function(parameter, operator) {
        angular.forEach($scope.data.sequences, function(sequence) {
            angular.forEach(sequence.masters, function(master) {
                if (master.type == "redpill" && master.edit[$scope.data.viewState]) {
                    if ($scope.parameterLevel == "master") {
                        $scope.pushParameter(master, parameter, operator);
                    } else if ($scope.parameterLevel == "glyph") {
                        angular.forEach(master.glyphs, function(glyph) {
                            if (glyph.edit) {
                                $scope.pushParameter(glyph, parameter, operator);
                            }
                        });
                    }
                }
            });
        });
        $scope.data.parametersPanel = 0;
    };

    $scope.pushParameter = function(element, newParameter, operator) {
        var hasParameter = false;
        angular.forEach(element.parameters, function(parameter) {
            if (parameter.name == newParameter) {
                hasParameter = true;
                parameter.operations.push({
                    operator : operator,
                    value : 0
                });
            }
        });
        if (!hasParameter) {
            element.parameters.push({
                name : newParameter,
                unit : "",
                operations : [{
                    operator : operator,
                    value : 0
                }]
            });
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
