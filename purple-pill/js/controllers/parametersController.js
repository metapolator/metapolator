app.controller("parametersController", function($scope, sharedScope) {
    'use strict';
    $scope.data = sharedScope.data;

    $scope.sortableOptions = {
        connectWith : ".master-ul",
        cancel : ".selectable-ag"
    };

    $scope.parameters = ["width", "height", "xHeight", "slant", "spacing", "sidebearings", "tension", "weight"];
    $scope.operators = ["=", "x", "÷", "+", "-", "min", "max"];
    $scope.parameterLevel = null;
    
    $scope.$watch("data.sequences | glyphsInEditFilter:parameters:operators", function(newVal) {
        $scope.filteredGlyphParameters = newVal;
    }, true);

    $scope.data.glyphParameters = {
        width : [],
        height : [],
        xHeight : [],
        slant : [],
        spacing : [],
        sidebearings : [],
        tension : [],
        weight : []
    };

    $scope.data.masterParameters = {
        width : [],
        height : [],
        xHeight : [],
        slant : [],
        spacing : [],
        sidebearings : [],
        tension : [],
        weight : []
    };

    $scope.rangeToHightLow = function() {
        angular.forEach($scope.data.glyphParameters, function(parameterValue, parameterKey) {
            var thisParameter = $scope.data.glyphParameters[parameterKey];
            if (thisParameter.length > 1) {
                thisParameter = thisParameter.sort();
                var lowest = thisParameter[0];
                console.log(lowest);
                var highest = thisParameter[thisParameter.length - 1];
                $scope.data.glyphParameters[parameterKey] = lowest + " to " + highest;
            } else {
                var thisValue = thisParameter[0];
                $scope.data.glyphParameters[parameterKey] = thisValue;
            }
        });
    };

    $scope.data.updateParameters = function() {
        // empty parameters selection
        /*
         angular.forEach($scope.data.glyphParameters, function(parameterValue, parameterKey) {
         $scope.data.glyphParameters[parameterKey] = [];
         });
         angular.forEach($scope.data.masterParameters, function(parameterValue, parameterKey) {
         $scope.data.masterParameters[parameterKey] = [];
         });

         angular.forEach($scope.data.sequences, function(sequence) {
         angular.forEach(sequence.masters, function(master) {
         if(master.type == "redpill" && master.edit) {
         // push master parametes
         angular.forEach(master.parameters, function(parameterValue, parameterKey) {
         $scope.data.masterParameters[parameterKey].push(parameterValue);
         });
         angular.forEach(master.glyphs, function(glyph) {
         if (glyph.edit) {
         // push glyph parameters
         angular.forEach(glyph.parameters, function(parameterValue, parameterKey) {
         $scope.data.glyphParameters[parameterKey].push(parameterValue);
         });
         }
         });
         }
         });
         });
         $scope.rangeToHightLow();
         */
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
                if (master.type == "redpill" && master.edit) {
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
    
    $scope.pushParameter = function (element, newParameter, operator) {
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
                name: newParameter,
                unit: "",
                operations: [{
                    operator: operator,
                    value: 0
                }]
            });    
        }      
    };

    $scope.hasInheritance = function(parameterName) {
        
    };
    
});
