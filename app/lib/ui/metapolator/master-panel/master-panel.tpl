<mtk-local-menu class="localmenu">
<input
    id="ufo-file-dialog"
    style="display: none;"
    type='file'
    accept='application/zip'
    onchange='angular.element(this).scope().handleUFOimportFiles(this)' />

    <div class="lm-head" ng-mousedown="localMenuCtrl.toggleMenu('masters')">
        Masters
    </div>
    <div class="lm-body" ng-if="display.localMenu == 'masters'">
        <div class="lm-button" ng-mouseup="importUfo()">Import ufo…</div>
        <div class="lm-divider"></div>
        <div class="lm-button" ng-mouseup="duplicateMasters()" ng-class="{'inactive': !model.areMastersSelected()}">Duplicate</div>
        <div class="lm-divider"></div>
        <div class="lm-button" ng-mouseup="removeMasters()" ng-class="{'inactive': !model.areMastersSelected()}">Delete…</div>
    </div>
</mtk-local-menu>

<div class="list-container" mtk-view-rubberband="masters">
    <ul class="ul-sequence">
        <li class="li-sequence" ng-repeat="sequence in model.masterSequences">
            <ul class="ul-master" ui-sortable="sortableOptions" ng-model="sequence.children">
                <li class="li-master"
                    ng-repeat="master in sequence.children"
                    ng-mouseover="mouseoverMaster(master)"
                    ng-mouseleave="mouseleaveMaster()">
                    <mtk-master class="mtk-master"
                                mtk-model="master"
                                ng-class="{'selected': master.edit}"></mtk-master>
                </li>
            </ul>
        </li>
    </ul>
    <div class="list-buttons">
        <div title="Import UFO" ng-click="importUfo();" class="list-button">
            <img src="lib/ui/metapolator/assets/img/importUfo.png">
        </div>
        <div title="Duplicate Master(s)" ng-click="duplicateMasters();" class="list-button">
            <img src="lib/ui/metapolator/assets/img/duplicateMaster.png" ng-class="{'inactive': !model.areMastersSelected()}">
        </div>
    </div>
</div>
