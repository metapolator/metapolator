<div ng-repeat="item in items track by $index" ng-switch="item.constructor.name">
    <mtk-cps-rule
        ng-switch-when="Rule"
        cps-rule="item"></mtk-cps-rule>
    <mtk-cps-namespace-collection
        ng-switch-when="AtNamespaceCollection"
        cps-collection="item"></mtk-cps-namespace-collection>
    <mtk-cps-sub-collection
        ng-switch-when="ParameterCollection"
        cps-collection="item"></mtk-cps-sub-collection>
    <pre ng-switch-default>{{item.constructor.name}}:: {{item.toString()}}</pre>
</div>
