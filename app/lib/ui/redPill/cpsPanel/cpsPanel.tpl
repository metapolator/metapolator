<button
    class="draghandle"
    ng-mousedown="resizeHeight($event)"
    ></button>
<mtk-cps-panel-control>
    <select
        ng-model="displayMode"
        ng-options="key as label for (key , label) in ctrl.displayModes"
        ></select>
    <select
        ng-if="displayMode==='cps-collection'"
        ng-model="$parent.cpsFile"
        ng-options="name for name in cpsFileOptions"
        ng-change="ctrl.changeCPSFile()"
        ng-init="ctrl.initCPSFileOptions()"
        ></select>
    <input
        ng-if="displayMode==='cps-style'"
        ng-model="$parent.elementSelector"
        ng-change="ctrl.changeSelector()"
        placeholder="enter a selector"
        size="40"
        />
</mtk-cps-panel-control><!--
--><div
    ng-if="displayMode === 'cps-style'"
    class="mtl-cps-style-dict-container"
><!--
The "ng-repeat" convebiently handles the destruction of the mtk-cps-style-dict
for us, using track by item.nodeID. This way we always get a element when
the mom-node changes.
--><mtk-cps-style-dict
    ng-repeat="item in styleElement track by item.nodeID"
    item="item"
    mtk-dragover-autoscroll
    ></mtk-cps-style-dict></div><!--
--><mtk-cps-collection
    ng-if="displayMode==='cps-collection' && collection"
    class="root"
    item="collection"

    mtk-dragover-autoscroll
    mtk-collection-drop
    mtk-collection-new-item

    ></mtk-cps-collection>
