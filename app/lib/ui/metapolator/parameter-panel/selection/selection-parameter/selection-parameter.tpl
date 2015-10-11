<div class="operator-row" ng-repeat="operator in model.operators track by $index">
    <div ng-if="operator.name !== 'effectiveValue'">
        <div ng-click="toggleParameterPanel(model, $event)"
             class="parameter-key panel-zone"
             ng-class="{'selected-parameter': selection.panel === model.parent.level + '-parameter' && model.base.name === panel.selectedParameter.base.name}">
                <span ng-if="$index == 0">{{model.base.name}}</span>
        </div>
        <div class="parameter-operator panel-zone" ng-class="{'selected-parameter': selection.panel === model.parent.level + '-operator'}" ng-click="toggleOperatorPanel(model, operator, $event)">{{operator.base.sign}}</div>
        <div class="operator-value">
            <span ng-if="!operator.range">
                <input ng-model="operator.low.current"
                       ng-blur="changeValue(model, operator, 'low', $event)"
                       ng-keyup="changeValue(model, operator, 'low', $event)"
                       mtk-mousewheel="changeValue(model, operator, 'low', $event)"
                       mtk-enter="changeValue(model, operator, 'low', $event)">
            </span>
            <span ng-if="operator.range"> 
                <input class="range-input range-left"
                       ng-model="operator.low.current"
                       ng-blur="changeValue(model, operator, 'low', $event)"
                       ng-keyup="changeValue(model, operator, 'low', $event)"
                       mtk-mousewheel="changeValue(model, operator, 'low', $event)"
                       mtk-enter="changeValue(model, operator, 'low', $event)"> to
                <input class="range-input"
                       ng-model="operator.high.current"
                       ng-blur="changeValue(model, operator,'high', $event)"
                       ng-keyup="changeValue(model, operator, 'high', $event)"
                       mtk-mousewheel="changeValue(model, operator, 'high', $event)"
                       mtk-enter="changeValue(model, operator, 'high', $event)">
            </span>
        </div>
    </div>
</div> 
<div ng-if="model.effectiveValue" class="operator-row">
    <div class="parameter-key">{{model.base.name}}</div>
    <div class="parameter-operator effective-icon">&#10171;</div>
    <div class="operator-value operator-value-effective">
        <span ng-if="!model.effectiveValue.range">{{model.effectiveValue.low}}</span>
        <span ng-if="model.effectiveValue.range">{{model.effectiveValue.low}} to {{model.effectiveValue.high}}</span>
    </div>
</div>

<div class="single-panel control-panel"
     ng-if="selection.panel.level === model.parent.level && selection.panel.type === 'parameter' && model.base.name === selection.panel.parameter.base.name"
     ng-style="{'left': selection.panel.left + 'px', 'top': selection.panel.top + 'px'}">
    <div ng-repeat="parameter in selection.baseParameters"
         ng-class="{'selected': parameter.name === selection.panel.parameter.base.name}"
         class="control-panel-parameter control-panel-button push-button"
         ng-mousedown="changeParameter(parameter)">{{parameter.name}}</div>
    <div class="control-panel-cancel control-panel-button push-button" ng-mousedown="removeParameter()">
        Remove
    </div>
</div>

<div class="single-panel control-panel"
     ng-if="selection.panel.level === model.parent.level && selection.panel.type === 'operator'"
     ng-style="{'left': selection.panel.left + 'px', 'top': selection.panel.top + 'px'}">
    <div ng-repeat="operator in selection.baseOperators"
         ng-class="{'selected': operator.name === selection.panel.operator.base.name}"
         class="control-panel-parameter control-panel-button push-button"
         ng-mousedown="changeOperator(operator)">{{operator.sign}}</div>
    <div class="control-panel-cancel control-panel-button push-button" ng-mousedown="removeOperator()">
        Remove
    </div>
</div>