<mtk-cps-collection-li
    ng-repeat="item in items track by $index + ':' + item.nodeID"
    ng-switch="item.constructor.name"
    ><mtk-cps-rule
        ng-switch-when="Rule"

        item="item"
        index="$index"

        mtk-element-tools="elementTools"
        mtk-drag="cps/rule"
        mtk-drag-data="[cpsCollection, $index]"

    ></mtk-cps-rule>
    <mtk-cps-namespace-collection mtk-cps-collection
        ng-switch-when="AtNamespaceCollection"

        item="item"
        index="$index"

        mtk-element-tools="elementTools"
        mtk-drag="cps/namespace-collection"
        mtk-drag-data="[cpsCollection, $index]"

        mtk-collection-drop
        mtk-collection-new-item

    ></mtk-cps-namespace-collection>
    <mtk-cps-comment
        ng-switch-when="Comment"

        item="item"
        index="$index"

        mtk-element-tools="elementTools"
        mtk-drag="cps/comment"
        mtk-drag-data="[cpsCollection, $index]"

    ></mtk-cps-comment>
    <mtk-cps-import-collection
        ng-switch-when="AtImportCollection"

        item="item"
        index="$index"

        mtk-element-tools="elementTools"
        mtk-drag="cps/import-collection"
        mtk-drag-data="[cpsCollection, $index]"

    ></mtk-cps-import-collection>
    <mtk-cps-generic
        ng-switch-default

        item="item"
        index="$index"

        mtk-element-tools="elementTools"
        mtk-drag="cps/generic-collection-item"
        mtk-drag-data="[cpsCollection, $index]"

    ></mtk-cps-generic>
</mtk-cps-collection-li>
