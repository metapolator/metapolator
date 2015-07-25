<div class="parameter-selection-head" ng-if="model.level === 'master' || model.level === 'glyph'">
    <div class="parameter-selection-title">{{model.level}}</div>
    <div class="parameter-selection-add-button panel-zone" ng-click="togglePanel($event)">+</div>
</div>
<div class="parameter-selection-body">
    <mtk-selection-parameter ng-repeat="parameter in model.parameters" mtk-model="parameter"></mtk-selection-parameter>
</div>

<div class="parameters-control-panel panel-zone" 
     ng-if="selection.panel.level === model.level && selection.panel.type === 'parameterOperator'" 
     ng-style="{'top': selection.panel.top, 'left': selection.panel.left}">
    <div class="control-panel-parameters">
        <div ng-repeat="parameter in model.baseParameters" ng-class="{'selected': parameter.name == panelParameter.name}" class="control-panel-parameter control-panel-button push-button" ng-click="addParameterToPanel(parameter)">{{parameter.name}}</div>
    </div>
    <div class="control-panel-operators">
        <div ng-repeat="operator in model.baseOperators" ng-if="operator.name != 'effectiveValue'" ng-class="{'selected': operator.name == panelOperator.name}" class="control-panel-operator control-panel-button push-button" ng-click="addOperatorToPanel(operator)">{{operator.name}}</div>
    </div>
    <div class="control-panel-cancel control-panel-button push-button" ng-click="data.view.parameterOperatorPanel = 0">
        Cancel
    </div>
</div>

<!--
<div ng-repeat="element in model.elements">{{element.name}}</div>
-->