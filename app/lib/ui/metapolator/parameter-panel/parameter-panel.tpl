<div id="parameters-selection">
    <mtk-selection ng-repeat="level in selection.allLevels" mtk-model="selection.selection[level]" ng-if="selection.selection[level].elements.length > 0"></mtk-selection>
</div>