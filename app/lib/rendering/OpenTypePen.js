/**
 * Copyright (c) 2015, Felipe Correa da Silva Sanches <juca@members.fsf.org>
 * 
 * You should have received a copy of the MIT License along with this program.
 * If not, see http://www.opensource.org/licenses/mit-license.php
 * 
 */
define(
    [
        'opentype'
      , 'ufojs/tools/pens/BasePen'
    ],
    function(
        opentype
      , Parent
) {
    "use strict";

    /*constructor*/
    function OpenTypePen () {
        this.path = new opentype.Path();
    };

    /*inheritance*/
    var _p = OpenTypePen.prototype = Object.create(Parent.prototype);


    _p._moveTo = function(pt, kwargs/* optional, object contour attributes*/) {
        this.path.moveTo(pt[0], pt[1]);
    };

    _p._lineTo = function(pt) {
        this.path.lineTo(pt[0], pt[1]);
    };

    _p._curveToOne = function(pt1, pt2, pt3) {
        this.path.curveTo(pt1[0], pt1[1], pt2[0], pt2[1], pt3[0], pt3[1]);
    };

    _p.getPath = function(){
       return this.path;
    };

    return OpenTypePen;
});
