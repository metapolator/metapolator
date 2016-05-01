<input ng-if="model.specimenSample.name !== 'Glyph Range'"
       placeholder="Mix glyphs…" 
       type="text" 
       ng-model="model.filter" 
       ng-trim="false"
       class="specimen-tool">
<input ng-if="model.specimenSample.name === 'Glyph Range'"
       placeholder="Filter" 
       type="text" 
       id="filter" 
       ng-model="model.filter" 
       ng-trim="false"
       class="specimen-tool">
<mtk-strict ng-if="model.specimenSample.name !== 'Glyph Range'"
     title="Set how glyphs are mixed with the specimen" 
     class="specimen-tool strict-box"
     mtk-model="model">
</mtk-strict>  