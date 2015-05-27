<input
    ng-if="edit"
    type="text"
    ng-model="$parent.selectorList"
    ng-change="controller.changeSelectorList()"
    title="{{message}}"
    ng-class="{invalid: invalid}">
/>
    {{selectorList}}
