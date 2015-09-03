<div>{{ctrl.element.particulars}}</div>
<mtk-cps-rule
        ng-repeat="item in ctrl.items track by $index + ':' + item.nodeID"
        item="item"
        index="$index"
    ></mtk-cps-rule>
