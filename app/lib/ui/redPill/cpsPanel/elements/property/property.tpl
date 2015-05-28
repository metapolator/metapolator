<mtk-cps-edit-property ng-if="edit"></mtk-cps-edit-property>
<div ng-if="!edit" title="{{message}}" ng-class="{invalid: invalid}">
    <span class="display-name">{{propertyModel.name}}</span>:
    <span class="display-value">{{propertyModel.value}}</span>;<!--
    --><mtk-cps-toolbar ng-if="tools" tools="tools"><div><!--
        --><mtk-drag-handle draggable="true"></mtk-drag-handle><!--
        --><mtk-cps-toolbutton
                ng-repeat="tool in tools"
                class="tool-{{tool}}"
                title={{tool}}
                ng-click="clickTool($event, tool)"
                >{{tool}}</mtk-cps-toolbutton><!--
    --></div></mtk-cps-toolbar>
</div>
