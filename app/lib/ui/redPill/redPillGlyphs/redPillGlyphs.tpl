<label>glyphs selector:
    <input
        type="text"
        ng-model="selector"
        />
</label>
<label>glyph size:
    <input type="range" min="0.01" max="1024" step="0.0001" ng-model="glyphsize"/>
    {{ glyphsize || initialGlypsize}}px
</label>

<ol>
    <li
        ng-repeat="glyph in selectGlyphs(selector) track by glyph.nodeID">
        <mtk-red-pill-glyph
            style="height:{{ glyphsize || initialGlypsize}}px"
            mtk-glyph-element="glyph">
            <span class="particulars">{{glyph.particulars }}</span>
            </mtk-red-pill-glyph>
    </li>
</ol>
