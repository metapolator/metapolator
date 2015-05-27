<ol>
    <li ng-repeat="item in items track by controller.getPropertyHash($index)"
        ng-switch="item.constructor.name">
        <mtk-cps-property
            ng-switch-when="Parameter"
            cps-property-dict="controller.cpsPropertyDict"
            property="item"
            index="$index"
            edit="controller.getEditingPropertyData($index, false)"
        ></mtk-cps-property>
        <span ng-switch-default>{{item.constructor.name}}:: {{item.toString()}}</span>
    </li>
    <li ng-if="$parent.newProperty" >
        new <mtk-cps-new-property
            cps-property-dict="controller.cpsPropertyDict"
        ></mtk-cps-new-property>
    </li>
</ol>
