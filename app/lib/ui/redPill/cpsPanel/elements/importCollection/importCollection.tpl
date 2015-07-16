<div title="{{message}}" ng-class="{invalid: invalid, busy: busy}">@import "<span
    ng-if="!edit"
    class="display"
    ng-init="initDisplay()"
        >{{cpsFile}}</span><!--
--><select
    ng-if="edit"
    class="input"

    ng-disabled="busy"
    ng-model="$parent.cpsFile"
    ng-options="name for name in cpsFileOptions"
    ng-change="ctrl.changeRule()"
    ng-init="initEdit()"
        ></select>";<!--
--><mtk-element-toolbar
    ng-if="!edit"
    mtk-tools="ctrl.mtkElementTools"
    mtk-click-handler="ctrl.clickToolHandler"
        ></mtk-element-toolbar>
</div>
