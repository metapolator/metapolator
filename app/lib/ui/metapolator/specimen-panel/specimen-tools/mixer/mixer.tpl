<input ng-if="model.specimenSamples.setting.name != 'Glyph Range'" 
       placeholder="Mix glyphs…" 
       type="text" 
       ng-model="model.filter" 
       ng-keyup="model.parent.updateGlyphsOut()"
       ng-trim="false" 
       class="specimen-tool">
<input ng-if="model.specimenSamples.setting.name == 'Glyph Range'" 
       placeholder="Filter" 
       type="text" 
       id="filter" 
       ng-model="model.filter" 
       ng-keyup="model.parent.updateGlyphsOut()"
       ng-trim="false" 
       class="specimen-tool">
<mtk-strict ng-if="model.specimenSamples.setting.name != 'Glyph Range'"
     title="Set how glyphs are mixed with the specimen" 
     class="specimen-tool strict-box"
     mtk-model="model">
</mtk-strict>  