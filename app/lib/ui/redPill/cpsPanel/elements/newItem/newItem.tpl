<select
    class="input"
    ng-model="element"
    ng-options="name for name in elementKeys"
    ng-change="changeElement()"
        ></select>:
<div class="new-item-placeholder"></div><!--
--><mtk-cps-toolbutton
        class="tool-cancel"
        title="cancel"
        xx-comment="the mousedown is to prevent the blur from firing,
                    so that we receive the mouseup instead of losing
                    focus and instantly destroy the element."
        ng-mousedown="$event.preventDefault();"
        xx-comment="the mouseup does what click was supposed to do, but
                    because of the events triggered by blur we never
                    actually receive a click event."
        ng-mouseup="destroy()"
        >cancel</mtk-cps-toolbutton>
