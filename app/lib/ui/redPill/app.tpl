<h1>Hello {{ greetMe }}!</h1>
<label class="master-selection">choose a Master:
    <select multiple ng-model="currentMasters" ng-options="name for name in model.masters"></select>
</label>

<mtk-red-pill-master
        ng-repeat="item in currentMasters"
        mtk-master-name="currentMasters[$index]" />
