<div title="{{message}}" ng-class="{invalid: invalid}">
<input
       type="text"
       class="input property-name"
       ng-model="propertyModel.name"
       ng-trim="false"
       size="{{propertyModel.name.length || 1}}"
       ng-change="changeHandler()"
/>:
<textarea
       class="input property-value"
       ng-model="propertyModel.value"
       ng-trim="false"
       style="height:{{(valueHeight || 1) * 1.2}}em"
       cols="{{valueWidth < 2 ? 2 : valueWidth}}"
       ng-change="changeHandler()"
></textarea>;
</div>
