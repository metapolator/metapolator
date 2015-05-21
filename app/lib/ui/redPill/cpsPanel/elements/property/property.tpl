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
</div>
