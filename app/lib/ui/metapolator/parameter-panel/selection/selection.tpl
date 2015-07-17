<div class="parameter-selection-head">
    <div class="parameter-selection-title">{{model.level}}</div>
    <div class="parameter-selection-add-button" ng-click="parametersWindow($event, 1, model.level)">+</div>
</div>
<div class="parameter-selection-body">
    <mtk-selection-parameter ng-repeat="parameter in model.selectionParameters" mtk-model="parameter"></mtk-selection-parameter>
</div>

<div id="parameters-control-panel" ng-if="parameterOperatorPanel" ng-style="{'top': parameterPanelTop, 'left': parameterPanelLeft}">
    <div id="control-panel-parameters">
        <div ng-repeat="parameter in model.baseParameters" ng-class="{'selected': parameter.name == panelParameter.name}" class="control-panel-parameter control-panel-button push-button" ng-click="addParameterToPanel(parameter)">{{parameter.name}}</div>
    </div>
    <div id="control-panel-operators">
        <div ng-repeat="operator in model.baseOperators" ng-if="operator.name != 'effectiveValue'" ng-class="{'selected': operator.name == panelOperator.name}" class="control-panel-operator control-panel-button push-button" ng-click="addOperatorToPanel(operator)">{{operator.name}}</div>
    </div>
    <div class="control-panel-cancel control-panel-button push-button" ng-click="data.view.parameterOperatorPanel = 0">
        Cancel
    </div>
</div>