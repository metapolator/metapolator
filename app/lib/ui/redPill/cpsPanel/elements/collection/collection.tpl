<div ng-repeat="item in items track by item.nodeID" ng-switch="item.constructor.name">
    <mtk-cps-rule
        ng-switch-when="Rule"
        cps-rule="item"
        index="$index"
    ></mtk-cps-rule>
    <mtk-cps-namespace-collection
        ng-switch-when="AtNamespaceCollection"
        cps-collection="item"
        index="$index"

        mtk-drag="cps/namespace-collection"
        mtk-drag-data="[cpsCollection, $index]"

    ></mtk-cps-namespace-collection>
    <mtk-cps-sub-collection
        ng-switch-when="ParameterCollection"
        cps-collection="item"></mtk-cps-sub-collection>
    <pre ng-switch-default>{{item.constructor.name}}:: {{item.toString()}}</pre>
</div>
