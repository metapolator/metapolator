<div class="list-sequence">
    <svg height="17" width="13">
        <polygon points="10,2 4,2 2,6 7,15 12,6" stroke="{{model.color}}" stroke-width="2" fill="{{getDiamondColor(model)}}">
    </svg> 
</div>

<div class="list-view" ng-class="{'selected': model.display}">
    <ul>
        <li ng-repeat="character in model.ag"><!--
            --><mtk-glyph ng-if="getGlyph(character)" mtk-model="getGlyph(character)" class="list-mtk-glyph"></mtk-glyph><!--
        --></li>
    </ul> 
</div>

<div mtk-rename="model.displayName" class="list-edit" ng-click="selectInstance(model)"></div>

<div class="export-col">
    <div class="instance-spacer">&nbsp;</div>
    <div class="instance-chechmark-container">
        <div class="instance-checkmark-export" ng-click="model.exportFont = !model.exportFont">
            <div ng-if="model.exportFont">H</div>
        </div>
        <div class="instance-checkmark-otf" ng-click="model.openTypeFeatures = !model.openTypeFeatures">
            <div ng-if="model.openTypeFeatures">ot.fea</div>
        </div>
    </div>
</div>
