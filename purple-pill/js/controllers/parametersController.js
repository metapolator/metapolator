app.controller("parametersController", function($scope, sharedScope) {
    $scope.data = sharedScope.data;
    
    $scope.parameters = [{
        name: "weight",
        factor: 1,
        summand: null
    },{
        name: "width",
        factor: 1,
        summand: null
    },{
        name: "height",
        factor: 1,
        summand: null
    }];
    /*,{
        name: "sideBearingLeft",
        factor: 1,
        summand: null
    },{
        name: "sideBearingRight",
        factor: 1,
        summand: null
    }];
    */
    $scope.parameterVariations = ["Factor", "Summand"];


    
    $scope.data.setParameterMaster = function (key, value, type) {
        var keyName = key.name + type;
        if (key.name == "weight") {
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
                    setParameter(parameterDict, keyName, value); 
                }
            });
        });
    };
    
    $scope.data.setParameterGlyph = function (key, value, type) {
        var keyName = key.name + type;
        angular.forEach($scope.data.sequences, function(sequence) {
            angular.forEach(sequence.masters, function(master) {
                if (master.type == "redpill" && master.edit[0]) {
                    angular.forEach(master.glyphs, function(glyph) {
                        if(glyph.edit){
                            var parameterCollection = $scope.data.stateful.project.ruleController.getRule(false, master.cpsFile);
                            // check if there is already a rule for this keyName in this glyph
                            if (!hasRule(glyph)) {
                                var l = parameterCollection.length;
                                var selectorListString = "glyph#" + glyph.value + " *";
                                var ruleIndex = $scope.data.stateless.cpsAPITools.addNewRule(parameterCollection, l, selectorListString);
                                // register rule position in model
                                glyph.ruleIndex = ruleIndex;
                            } else {
                                var ruleIndex = glyph.ruleIndex;
                                console.log("has rule(" + ruleIndex + ")");
                            }
                            // check if parameter is there already in the rule
                            if (!hasParameter(glyph, keyName)) {
                                // add parameter to rule
                                glyph.parameters.push({
                                    name: keyName,
                                    value: value
                                }); 
                            } else {
                                // edit parameter in rule
                                var parameter = getParameterInRule(glyph, keyName);
                                parameter.value = value;
                            }
                            var cpsRule = parameterCollection.getItem(ruleIndex);
                            console.log(cpsRule);
                            var parameterDict = cpsRule.parameters;
                            console.log(parameterDict);
                            var setParameter = $scope.data.stateless.cpsAPITools.setParameter;
                            setParameter(parameterDict, keyName, value); 
                        }
                    });
                }
            });
        });
    };
    
    function getParameterInRule(glyph, keyName){
        var theParameter;
        angular.forEach(glyph.parameters, function(parameter) {
            if (parameter.name == keyName) {
                theParameter = parameter;
            }
        });
        return theParameter;
    }
    
    function hasRule(glyph){
        var hasRule = false;
        if (glyph.parameters.length > 0) {
            hasRule = true;
        }
        return hasRule;
    }
    
    function hasParameter(glyph, keyName){
        var hasParameter = false;
        angular.forEach(glyph.parameters, function(parameter) {
            if (parameter.name == keyName) {
                hasParameter = true;
            }
        });
        return hasParameter;
    }

    $scope.data.getParameter = function () {
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
    
    
    
    

    
    
    
    /******/






    //$scope.parameters = ["width", "height", "xHeight", "slant", "spacing", "sidebearings", "tension", "weight"];
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
