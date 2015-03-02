define([
    'intern!object'
  , 'intern/chai!assert'
  , 'metapolator/errors'
  , 'metapolator/models/MOM/_Node'
  , 'metapolator/models/MOM/Univers'
  , 'metapolator/models/MOM/Master'
  , 'metapolator/models/MOM/Glyph'
  , 'metapolator/models/MOM/_Contour'
  , 'metapolator/models/MOM/PenStroke'
  , 'metapolator/models/MOM/PenStrokePoint'
], function (
    registerSuite
  , assert
  , errors
  , _Node
  , Univers
  , Master
  , Glyph
  , _Contour
  , PenStroke
  , PenStrokePoint
) {
    "use strict";
    registerSuite({
        name: 'MOM relationship',
        Node_: function() {
            var univers = new Univers
              , master = new Master
              , glyph = new Glyph
              , penStroke = new PenStroke
              , penStrokePoint = new PenStrokePoint
              ;

            assert.isTrue(univers instanceof _Node);
            assert.isTrue(univers.isMOMNode(univers));
            assert.isFalse(univers.isMOMNode({}));
            assert.isTrue(univers.isMOMNode(master));
            assert.isTrue(univers.qualifiesAsChild(master));

            univers.add(master);
            assert.strictEqual(univers, master.parent);
            assert.isTrue(univers.isMOMNode(glyph));

            assert.throws(
                univers.add.bind(univers, glyph)
              , errors.MOM
              , '<MOM Univers> doesn\'t accept <MOM Glyph> as a child object.'
            );

            assert.isTrue(master.qualifiesAsChild(glyph));
            master.add(glyph);
            assert.strictEqual(master, glyph.parent);

            assert.isTrue(penStroke instanceof _Contour);
            assert.isTrue(glyph.qualifiesAsChild(penStroke));
            glyph.add(penStroke);
            assert.strictEqual(glyph, penStroke.parent);

            assert.isTrue(penStroke.qualifiesAsChild(penStrokePoint));
            penStroke.add(penStrokePoint);
            assert.strictEqual(penStroke, penStrokePoint.parent);
        }
    });
})
