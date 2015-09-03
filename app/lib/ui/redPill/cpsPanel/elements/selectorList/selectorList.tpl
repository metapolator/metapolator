<div
    title="{{message}}"
    ng-class="{invalid: invalid}"
><textarea
    ng-if="edit"
    type="text"
    class="input selectorlist"
    ng-model="$parent.selectorList"
    ng-change="controller.changeSelectorList()"
    ng-init="initEdit()"
    ng-trim="false"
    style="height:{{(valueHeight || 1) * 1.2}}em"
    cols="{{valueWidth < 2 ? 2 : valueWidth}}"
    placeholder="{{controller.placeholder}}"
    title="enter a selector"
></textarea><!--
--><span
    ng-if="!edit"
    class="display selectorlist"
    ng-init="initDisplay()"
    >{{selectorList}}</span><!--
--></div>
