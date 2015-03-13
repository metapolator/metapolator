app.controller("parametersController", function($scope, sharedScope) {
    'use strict';
    $scope.data = sharedScope.data;

    $scope.sortableOptions = {
        connectWith : ".master-ul",
        cancel : ".selectable-ag"
    };

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
    
    $scope.data.updateParameters = function() {
        // empty parameters selection
        angular.forEach($scope.data.glyphParameters, function(parameterValue, parameterKey) {
            $scope.data.glyphParameters[parameterKey] = [];
        }); 
        angular.forEach($scope.data.masterParameters, function(parameterValue, parameterKey) {
            $scope.data.masterParameters[parameterKey] = [];
        }); 
        
        // find glyphs with edit == true
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
    };
    
    $scope.parametersWindow = function(event, target) {
        var top = $(event.target).position().top + 15;
        $scope.parameterPanelTop = top;
        if (target != $scope.data.parametersPanel) {
            $scope.data.parametersPanel = target;
        } else {
            $scope.data.parametersPanel = 0;
        }
    };

});
