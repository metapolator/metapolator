<button
    class="draghandle"
    ng-mousedown="resizeHeight($event)"
    ></button>
<h1>CPS-Panel</h1>
<mtk-cps-panel-control>
    <select
        ng-model="displayMode"
        ng-options="name for name in ctrl.displayModes"
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
        ng-init="ctrl.changeSelector()"
        placeholder="enter a selector"
        />
</mtk-cps-panel-control><!--
--><mtk-cps-style-dict
    ng-if="displayMode==='cps-style' && styleElement"
    item="styleElement"

    mtk-dragover-autoscroll
    ></mtk-cps-style-dict><!--
--><mtk-cps-collection
    ng-if="displayMode==='cps-collection' && collection"
    class="root"
    item="collection"

    mtk-dragover-autoscroll
    mtk-collection-drop
    mtk-collection-new-item

    ></mtk-cps-collection>
