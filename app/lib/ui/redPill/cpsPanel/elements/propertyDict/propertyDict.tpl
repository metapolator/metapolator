<ol>
    <li ng-repeat="item in properties track by $index" ng-switch="item[0]">
        <mtk-cps-property
            ng-switch-when="Property"
            cps-property-dict="cpsPropertyDict"
            property="item"
        ></mtk-cps-property>
        <span ng-switch-default>{{item[0]}}:: {{item[1].toString()}}</span>
    </li>
</ol>
