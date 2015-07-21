<div class="operator-row" ng-repeat="operator in model.operators track by $index">
    <div ng-if="operator.name !== 'effectiveValue'">
        <div ng-click="openParameterPanel(parameter, $event, level)" class="parameter-key"><span ng-if="$index == 0">{{model.base.name}}</span></div>
        <div class="parameter-operator" ng-click="openOperatorPanel(parameter, operator, $event, level)">{{operator.base.name}}</div>
        <div class="operator-value">
            <span ng-if="!operator.range">
                <input ng-model="operator.low.current" ng-blur="changeValue(model, operator, operator.low, 'blur')" ng-keyup=""> 
            </span>
            <span ng-if="operator.range"> 
                <input class="range-input range-left" ng-model="operator.low.current" ng-init="operator.low.old = operator.low.current" ng-blur="changeValue(model, operator, operator.low, 'blur')" ng-keyup=""> to
                <input class="range-input" ng-model="operator.high.current" ng-init="operator.high.old = operator.high.current"  ng-blur="changeValue(model, operator, operator.high, 'blur')" ng-keyup="">
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

