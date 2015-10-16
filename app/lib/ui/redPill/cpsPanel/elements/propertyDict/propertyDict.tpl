<ol class="container">
    <li ng-repeat="item in items track by item[0]"
        ng-switch="item[1].constructor.name">
        <mtk-cps-property
            ng-switch-when="Parameter"

            cps-property-dict="controller.cpsPropertyDict"
            property="item[1]"
            index="$index"
            edit="controller.getEditingPropertyData($index, false)"

            mtk-element-tools="elementTools"
            mtk-drag="cps/property"
            mtk-drag-data="[controller.cpsPropertyDict, $index]"

        ></mtk-cps-property>
        <mtk-cps-comment
            ng-switch-when="Comment"

            item="item[1]"
            index="$index"

            mtk-element-tools="elementTools"
            mtk-drag="cps/comment"
            mtk-drag-data="[controller.cpsPropertyDict, $index]"

        ></mtk-cps-comment>
        <mtk-cps-generic
            ng-switch-default

            item="item[1]"
            index="$index"

            mtk-element-tools="elementTools"
            mtk-drag="cps/generic-rule-item"
            mtk-drag-data="[controller.cpsPropertyDict, $index]"

            ></mtk-cps-generic>
    </li>
    <li ng-if="newProperty" >
        new <mtk-cps-new-property
            cps-property-dict="controller.cpsPropertyDict"
        ></mtk-cps-new-property>
    </li>
</ol>
