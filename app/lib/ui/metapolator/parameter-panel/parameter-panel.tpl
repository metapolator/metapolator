<div id="parameters-selection">
    <mtk-selection ng-repeat="level in levels" mtk-model="model.selection[level]" ng-if="model.selection[level].elements"></mtk-selection>
</div>

<div class="single-panel control-panel" ng-if="data.view.parameterPanel.display" ng-style="{'left': data.view.parameterPanel.left + 'px', 'top': data.view.parameterPanel.top + 'px'}">
    <div ng-repeat="parameter in parameters" ng-class="{'selected': parameter.name == data.view.parameterPanel.selected}" class="control-panel-parameter control-panel-button push-button" ng-click="changeParameter(parameter)">{{parameter.name}}</div>
    <div class="control-panel-cancel control-panel-button push-button" ng-click="removeParameter()">
        Remove
    </div>
</div>

<div class="single-panel control-panel" ng-if="data.view.operatorPanel.display" ng-style="{'left': data.view.operatorPanel.left + 'px', 'top': data.view.operatorPanel.top + 'px'}">
    <div ng-repeat="operator in operators" ng-if="operator.name != 'effectiveValue' && showOperator(operator)" ng-class="{'selected': operator.name == data.view.operatorPanel.selected}" class="control-panel-parameter control-panel-button push-button" ng-click="changeOperator(operator)">{{operator.name}}</div>
    <div class="control-panel-cancel control-panel-button push-button" ng-click="removeOperator()">
        Remove
    </div>
</div>

<!--
<div ng-repeat="parameter in model.sequences[0].children[0].parameters">{{parameter.name}}
    <div ng-repeat="operator in parameter.operators">{{operator.name}}: {{operator.value}}</div>    
</div>

{{model.selection['master'].selectionParameters[0].selectionOperators}}
-->