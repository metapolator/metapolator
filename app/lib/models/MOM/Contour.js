define([
    './_Contour'
  , './ContourPoint'
], function(
    Parent
  , ContourPoint
) {
    "use strict";
    /**
     * This Element is the container of all points of a outline contour.
     * It may have some metadata (like an identifier) and contain children
     * of type MOM ContourPoint.
     */
    function Contour() {
        Parent.call(this);
    }
    var _p = Contour.prototype = Object.create(Parent.prototype);
    _p.constructor = Contour;

    Object.defineProperty(_p, 'MOMType', {
        value: 'MOM Contour'
    });

    Object.defineProperty(_p, 'type', {
        /* this is used for CPS selectors*/
        value: 'contour'
    });

    _p._acceptedChildren = [ContourPoint];

    return Contour;
});

