/**
 * Copyright (c) 2012, Lasse Fister lasse@graphicore.de, http://graphicore.de
 * 
 * You should have received a copy of the MIT License along with this program.
 * If not, see http://www.opensource.org/licenses/mit-license.php
 * 
 * This is a port of glifLib.Glyph defined in robofab/branches/ufo3k/Lib/ufoLib/gliflib.py
 *
 */ 
 
define(
    [
        'ufojs',
        'ufojs/errors',
        'ufojs/tools/pens/PointToSegmentPen'
    ],
    function(
        main,
        errors,
        PointToSegmentPen
) {
    "use strict";
    var enhance = main.enhance;
    
    // ------------
    // Simple Glyph
    //-------------
    
    /**
     * Minimal glyph object. It has no glyph attributes until either
     * the draw() or the drawPoint() method has been called.
     */
     
    function Glyph(glyphName, glyphSet){
        this.glyphName = glyphName
        this.glyphSet = glyphSet
    };
    
    enhance(Glyph, {
        /**
         * Draw this glyph onto a *FontTools* Pen.
         */
        draw: function(pen) {
            var pointPen = PointToSegmentPen(pen);
            this.drawPoints(pointPen);
        },
        /**
         * Draw this glyph onto a PointPen.
         */
        drawPoints: function(pointPen) {
            this.glyphSet.readGlyph(this.glyphName, this, pointPen);
        }
    });
    
    return Glyph;
});
