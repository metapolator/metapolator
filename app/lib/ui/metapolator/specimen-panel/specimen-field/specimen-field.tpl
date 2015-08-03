<div mtk-specimen-rubberband="{{model.rubberband}}"
     mtk-model="model.sequences"
     class="specimen-content non-glyph-range"
     ng-class="'specimen-field-' + model.type"
     ng-if="model.mixer.specimenSamples.currentSample.name !== 'Glyph Range'">
    <ul class="specimen-ul-{{model.type}}">
        <li ng-repeat="glyph in filteredGlyphs() track by tracker($index, glyph)"
            ng-class="'master-' + getMasterName(glyph)"
            ng-style="{'height': model.sizes.lineHeight * model.sizes.fontSize}"><!--
            --><mtk-glyph mtk-model="glyph"
                          ng-click="glyphClick($event, glyph)"
                          ng-class="{'selected' : glyph.edit, 'selected-master': glyph.parent.edit}"
                          ng-style="{'height': model.sizes.fontSize + 'px'}"></mtk-glyph><!--

        --></li>
    </ul>
</div>