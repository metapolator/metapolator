<mtk-local-menu class="localmenu">
    <div class="lm-head" ng-mousedown="localMenuCtrl.toggleMenu('instances')">
        Instances
    </div>
    <div class="lm-body" ng-if="display.localMenu == 'instances'">
        <div class="lm-button" ng-class="{'inactive': !canAddInstance()}" ng-mouseup="addInstance()">New</div>
        <div class="lm-button" ng-class="{'inactive': !model.currentInstance}" ng-mouseup="duplicateInstance(model.currentInstance)">Duplicate</div>
        <div class="lm-divider"></div>
        <div class="lm-button" ng-class="{'inactive': !model.currentInstance}" ng-mouseup="deleteInstance(model.currentInstance)">Delete</div>
    </div>
</mtk-local-menu>

<div class="list-container" mtk-view-rubberband="instances">
    <div class="list-stretcher">
    <div class="fake-instance-panel">&nbsp;</div>
    <div class="fake-export-panel">&nbsp;</div>
        <ul class="ul-sequence">
            <li class="li-sequence" ng-repeat="sequence in model.sequences">
                <ul class="ul-master" ui-sortable="sortableOptions" ng-model="sequence.children">
                    <li class="li-master"
                        ng-repeat="instance in sequence.children"
                        ng-mouseover="mouseoverInstance(instance)"
                        ng-mouseleave="mouseleaveInstance()">
                        <mtk-instance class="mtk-master"
                                      mtk-model="instance"
                                      ng-class="{'selected': instance == model.currentInstance}"></mtk-instance>
                    </li>
                </ul>
            </li>
        </ul>

        <div class="list-buttons">
            <div title="Add Instance" ng-click="addInstance();" class="list-button">
                <img src="lib/ui/metapolator/assets/img/addInstance.png" ng-class="{'inactive': !canAddInstance()}">
            </div>
            <div title="Duplicate Instance" ng-click="duplicateInstance(model.currentInstance);" class="list-button">
                <img src="lib/ui/metapolator/assets/img/duplicateInstance.png" ng-class="{'inactive': !model.currentInstance}">
            </div>
            <div title="Delete" ng-click="deleteInstance(model.currentInstance);" class="list-button">
                <img src="lib/ui/metapolator/assets/img/deleteInstance.png" ng-class="{'inactive': !model.currentInstance}">
            </div>
            <div class="list-button export-button" ng-click="exportFonts()" ng-class="{'inactive': !instancesForExport() || export_is_running}">
                Export…
            </div>
        </div>
    </div>
</div>
