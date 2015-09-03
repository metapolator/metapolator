<span ng-if="!edit"
      class="display {{getFormatClass(ctrl.comment.value)}}"
      ng-init="initDisplay()"
></span><!--
--><mtk-element-toolbar
        ng-if="!edit"
        mtk-tools="ctrl.mtkElementTools"
        mtk-click-handler="ctrl.clickToolHandler"
    ></mtk-element-toolbar><!--
--><textarea
    ng-if="edit"
    type="text"
    class="input"
    ng-model="$parent.comment"
    ng-change="ctrl.changeComment()"
    ng-init="initEdit()"
    ng-trim="false"
    style="height:{{(valueHeight || 1) * 1.2}}em"
    cols="{{valueWidth < 2 ? 2 : valueWidth}}"
    title="Enter a comment; insert #md as first content to render the comment as markdown."
></textarea>
