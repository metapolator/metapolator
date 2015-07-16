<mtk-cps-collection-li ng-repeat="item in items track by $index + ':' + item.nodeID" ng-switch="item.constructor.name">
    <mtk-cps-rule
        ng-switch-when="Rule"

        cps-rule="item"
        index="$index"

        mtk-element-tools="elementTools"
        mtk-drag="cps/rule"
        mtk-drag-data="[cpsCollection, $index]"

    ></mtk-cps-rule>
    <mtk-cps-namespace-collection mtk-cps-collection
        ng-switch-when="AtNamespaceCollection"

        cps-collection="item"
        index="$index"

        mtk-element-tools="elementTools"
        mtk-drag="cps/namespace-collection"
        mtk-drag-data="[cpsCollection, $index]"

        mtk-collection-drop

    ></mtk-cps-namespace-collection>
    <mtk-cps-comment
        ng-switch-when="Comment"

        comment="item"
        index="$index"

        mtk-element-tools="elementTools"
        mtk-drag="cps/comment"
        mtk-drag-data="[cpsCollection, $index]"

    ></mtk-cps-comment>
    <mtk-cps-generic
        ng-switch-default

        item="item"
        index="$index"

        mtk-element-tools="elementTools"
        mtk-drag="cps/generic-collection-item"
        mtk-drag-data="[cpsCollection, $index]"

    ></mtk-cps-generic>
</mtk-cps-collection-li>
