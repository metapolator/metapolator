define([
    'metapolator/models/MOM/Master'
  , 'metapolator/models/MOM/Glyph'
  , 'metapolator/models/MOM/PenStroke'
  , 'metapolator/models/MOM/PenStrokePoint'
], function(
    Master
  , Glyph
  , PenStroke
  , PenStrokePoint
){
    /**
     * Create a simple MOM Master tree as a test fixture
     *
     * We can enhance this module when the need for more
     * complex fixtures arises.
     *
     * For even more complex fixtures it might be more
     * interesting to create a test project and load
     * that directly
     */

    /**
     * A Stroke with 6 points (and empty skeleton)
     */
    function _makeStroke() {
        var stroke = new PenStroke()
          , points = 6
          , skeleton
          , i = 0
          ;
        for(;i<points;i++) {
            skeleton = new PenStrokePoint.SkeletonDataConstructor({});
            stroke.add(new PenStrokePoint(skeleton));
        }
        return stroke;
    }

    /**
     * Returns always the same glyph essentially
     * 3 strokes, all created by _makeStroke.
     */
    function _makeGlyph(name) {
        var glyph = new Glyph()
          , strokes = 3
          , i=0
          ;
        for(;i<strokes;i++)
            glyph.add(_makeStroke());
        glyph.id = name;
        return glyph;
    }

    /**
     * Returns a master with generic glyphs. The amount and
     * name of the glyphs is defined by the glyphNames array.
     */
    function makeMasterFixture(masterName, glyphNames) {
        var master = new Master();
        glyphNames.map(function(name){ return _makeGlyph(name); })
                  .forEach(function(glyph){ this.add(glyph);}, master);
        master.id = masterName;
        return master;
    }

    return makeMasterFixture;
});
