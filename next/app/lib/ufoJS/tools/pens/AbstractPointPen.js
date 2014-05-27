/**
 * Copyright (c) 2011, Lasse Fister lasse@graphicore.de, http://graphicore.de
 * 
 * You should have received a copy of the MIT License along with this program.
 * If not, see http://www.opensource.org/licenses/mit-license.php
 * 
 * This is a translation of AbstractPointPen defined in robofab/pens/pointPen.py
 * The svn revision of the source file in trunk/Lib/ was 67 from 2008-03-11 10:18:32 +0100
 * Ther very same pen is to be found in robofab/branches/ufo3k/Lib/ufoLib/pointPen.py
 * revision 517 2011-12-07 18:17:40 +0100 (Wed, 07 Dec 2011)
 * 
 * I even copied the docstrings and comments! (These may still refer to the Python code)
 * 
 * 
 * =========
 * PointPens
 * =========
 * 
 * Where **SegmentPens** have an intuitive approach to drawing
 * (if you're familiar with postscript anyway), the **PointPen**
 * is geared towards accessing all the data in the contours of
 * the glyph. A PointsPen has a very simple interface, it just
 * steps through all the points in a call from glyph.drawPoints().
 * This allows the caller to provide more data for each point.
 * For instance, whether or not a point is smooth, and its name.
 */

define(['ufojs', 'ufojs/errors'], function(main, errors) {
    "use strict";
    var enhance = main.enhance;
    //shortcuts
    var NotImplementedError = errors.NotImplemented;
    
    /*constructor*/
    /**
     * Baseclass for all PointPens.
     */
    function AbstractPointPen(){};

    /*inheritance*/
    //pass

    /*definition*/
    enhance(AbstractPointPen, {
        /**
         * Start a new sub path.
         */
        beginPath: function(identifier)
        {
            throw new NotImplementedError(
                'AbstractPointPen has not implemented'
                +' beginPath');
        },
        /**
         * End the current sub path.
         */
        endPath: function()
        {
            throw new NotImplementedError(
                'AbstractPointPen has not implemented'
                +' endPath');
        },
        /**
         * Add a point to the current sub path.
         */
        addPoint: function(
            pt,
            segmentType /* default null */,
            smooth /* default false */,
            name /* default null */,
            kwargs /* default an object, javascript has no **kwargs syntax */
        ) {
            segmentType = (segmentType === undefined) ? null : segmentType;
            smooth = (smooth || false);
            name = (name === undefined) ? null : name;
            kwargs = (kwargs || {});//an "options" object
            throw new NotImplementedError(
                'AbstractPointPen has not implemented'
                +' addPoint');
        },
        /**
         * Add a sub glyph.
         */
        addComponent: function(baseGlyphName, transformation)
        {
            throw new NotImplementedError(
                'AbstractPointPen has not implemented'
                +' addComponent');
        }
    });
    return AbstractPointPen;
});
