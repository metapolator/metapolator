<mtk-local-menu class="localmenu">
    <div class="lm-head" ng-mousedown="localMenuCtrl.toggleMenu('masters')">
        Masters
    </div>
    <div class="lm-body" ng-if="display.localMenu == 'masters'">
        <div class="lm-button" ng-mouseup="importUfo_dialog_open()">Import ufo…</div>
        <div class="lm-divider"></div>
        <div class="lm-button" ng-mouseup="duplicateMasters()" ng-class="{'inactive': !model.areMastersSelected()}">Duplicate</div>
        <div class="lm-divider"></div>
        <div class="lm-button" ng-mouseup="removeMasters()" ng-class="{'inactive': !model.areMastersSelected()}">Delete…</div>
    </div>
</mtk-local-menu>

<div id="importufo_dialog" class="dialog" style="display:none">
    <h2>Want to load your own UFO?</h2>
    <p>Show us you want this by buying a T shirt:</p>
    <br>
    <ul>
        <li>
            <a title='Support the project and buy a T shirt (USA)' href='http://teespring.com/metapolator-beta-0-3-0' target='_blank' class='newtab'>USA</a>
        </li>
        <li>
            <a title='Support the project and buy a T shirt (Worldwide)' href='http://metapolator.spreadshirt.com' target='_blank' class='newtab'>Worldwide</a>
        </li>
    </ul>
    <br><br>
    <input type='file' accept='application/zip' onchange='angular.element(this).scope().handleUFOimportFiles(this)' />
</div>

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
