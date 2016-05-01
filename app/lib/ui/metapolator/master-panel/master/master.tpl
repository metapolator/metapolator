<div class="list-sequence">
    <svg height="12" width="12">
        <polygon points="5,0 0,3 0,8 5,11 10,8 10,3">
    </svg> 
</div>

<div class="list-view" ng-class="{'selected': model.display}">
    <ul>
        <li ng-repeat="character in model.ag"><!--
            
            --><mtk-glyph ng-if="getGlyph(character)" mtk-model="getGlyph(character)" class="list-mtk-glyph"></mtk-glyph><!--
            
        --></li>
    </ul> 
</div>

<div mtk-rename="model.displayName" class="list-edit" ng-click="selectManager($event, model)"></div>