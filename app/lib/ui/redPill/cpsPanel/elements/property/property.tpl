<div title="{{message}}" ng-class="{invalid: invalid}">
<input type="text"
       ng-model="propertyModel.name" ng-trim="false"
       size="{{propertyModel.name.length || 1}}"
       ng-change="changeHandler()"
       />:
<textarea
       ng-model="propertyModel.value" ng-trim="false"
       style="height:{{(valueHeight || 1) * 1.2}}em"
       cols="{{valueWidth < 2 ? 2 : valueWidth}}"
       ng-change="changeHandler()"
       ></textarea>;
<mtk-cps-toolbar ng-if="tools" tools="tools">
    <mtk-cps-toolbutton
        ng-repeat="tool in tools"
        class="tool-{{tool}}"
        title={{tool}}
        ng-click="clickTool(tool)"
        draggable="{{tool == 'drag' ? 'true' : 'false'}}"
        >{{tool}}</button>

</mtk-cps-toolbar>
</div>
