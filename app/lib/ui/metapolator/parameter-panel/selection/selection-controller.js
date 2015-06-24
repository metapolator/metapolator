define([
    'jquery'
], function(
    $
) {
    "use strict";
    function SelectionController($scope, metapolatorModel) {
        $scope.operatorId = 1;
        // Handling the parameter add panel 
        $scope.parameterOperatorPanel = null;
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
            var elements = $scope.model.findSelectedElements($scope.model.level);
            $scope.model.elements = elements;
            for (var i = elements.length - 1; i >= 0; i--) {
                var element = elements[i];
                // each operator gets the same operator id
                // when there are stacked operators in a parameter, when can identify 
                // which operator has changed by it's id
                // after destacking, the id is set to null, so we always know that when an operator has an id
                // the operator is added during this selection session
                element.addParameterOperator(parameter, operator, $scope.operatorId);
            }
            $scope.operatorId++;
            $scope.parameterOperatorPanel = null;
            $scope.model.updateParameters();
        };
    
        $scope.parametersWindow = function(event, target, level) {
            $scope.parameterLevel = level;
            $scope.panelOperator = null;
            $scope.panelParameter = null;
            var top = $(event.target).offset().top + 20;
            var left = $(event.target).offset().left + 20;
            $scope.parameterPanelTop = top;
            $scope.parameterPanelLeft = left;
            if (target != $scope.parameterOperatorPanel) {
                $scope.parameterOperatorPanel = target;
            } else {
                $scope.parameterOperatorPanel = null;
            }
        };
        
        
        
        $scope.openParameterPanel = function(parameter, event, level) {
            $scope.closeParameterPanel();
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
        
        $scope.closeParameterPanel = function() {
            $scope.data.view.parameterPanel.display = false;
            $scope.data.view.parameterPanel.selected = null;
            $scope.data.view.parameterPanel.level = null;
            $("parameters .parameter-key").each(function() {
                $(this).removeClass("selected-parameter");
            });
        };
    
        $scope.openOperatorPanel = function(parameter, operator, event, level) {
            $scope.closeOperatorPanel();
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
        
        $scope.closeOperatorPanel = function() {
            $scope.data.view.operatorPanel.display = false;
            $scope.data.view.operatorPanel.selectedParameter = null;
            $scope.data.view.operatorPanel.selected = null;
            $scope.data.view.operatorPanel.level = null;
            $("parameters .parameter-operator").each(function() {
                $(this).removeClass("selected-parameter");
            });
        };
    }

    SelectionController.$inject = ['$scope', 'metapolatorModel'];
    var _p = SelectionController.prototype;

    return SelectionController;
}); 