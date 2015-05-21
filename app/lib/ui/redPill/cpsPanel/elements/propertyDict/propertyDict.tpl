<ol>
    <li ng-repeat="item in items track by $index" ng-switch="item.constructor.name">
        <mtk-cps-property
            ng-switch-when="Parameter"
            cps-property-dict="cpsPropertyDict"
            property="item"
            index="$index"
        ></mtk-cps-property>
        <span ng-switch-default>{{item.constructor.name}}:: {{item.toString()}}</span>
    </li>
    <li ng-if="$parent.newProperty" >
        new <mtk-cps-new-property
            cps-property-dict="cpsPropertyDict"
        ></mtk-cps-new-property>
    </li>
</ol>
