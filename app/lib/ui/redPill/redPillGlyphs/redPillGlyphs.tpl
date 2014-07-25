<button ng-click="updateCPS()">update preview</button>

<label>glyphs selector:
    <input
        type="text"
        ng-model="selector"
        />
</label>
<label>glyph size:
    <input type="range" min="0.01" max="100" step="0.0001" ng-model="glyphsize"/>
    {{ glyphsize || initialGlypsize}} %
</label>

<ol>
    <li style="width:{{ glyphsize || initialGlypsize}}%"
        ng-repeat="glyph in selectGlyphs(selector) track by glyph.nodeID">
        <mtk-red-pill-glyph
            mtk-glyph-element="glyph">
            {{ glyph.particulars }}
            </mtk-red-pill-glyph>

    </li>
</ol>
