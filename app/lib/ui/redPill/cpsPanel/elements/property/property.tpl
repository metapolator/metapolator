<mtk-cps-edit-property ng-if="edit"></mtk-cps-edit-property>
<div ng-if="!edit" title="{{message}}" ng-class="{invalid: invalid}">
    <span class="display property-name">{{propertyModel.name}}</span>:
    <span class="display property-value">{{propertyModel.value}}</span>;<!--
     --><mtk-element-toolbar
            mtk-tools="mtkElementTools"
            mtk-click-handler="controller.toolClickHandler"
        ></mtk-element-toolbar>
</div>
