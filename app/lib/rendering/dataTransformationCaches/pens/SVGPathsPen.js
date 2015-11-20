define([
    'ufojs/errors'
  , 'ufojs/tools/pens/SVGPen'
], function(
    errors
  , Parent
) {
    "use strict";

    /**
     * This pen creates several <path> elements within one container element.
     *
     * A path must start with a moveTo command, which is standard for pens.
     *
     * Multiple <path> elements are much better to use SVG markers than
     * subpathes of the same <path> element because: »Note that ‘marker-start’
     * and ‘marker-end’ refer to the first and last vertex of the entire
     * path, not each subpath.«
     * https://svgwg.org/svg2-draft/painting.html#MarkerEndProperty
     */

    var svgns = 'http://www.w3.org/2000/svg'
      , NotImplementedError = errors.NotImplemented()
      ;

    function SVGPathsPen(container, glyphSet) {
        Parent.call(this, {}, glyphSet);
        this.container = container;
        this._doc = this.container.ownerDocument;
    }

    var _p = SVGPathsPen.prototype = Object.create(Parent.prototype);
    _p.constructor = SVGPathsPen;

    _p._switchPath = function() {
        this.path = this._doc.createElementNS(svgns, 'path');
        this.segments = this.path.pathSegList;
        this.container.appendChild(this.path);
    };

    _p._moveTo = function(pt) {
        this._switchPath();
        Parent.prototype._moveTo.call(this, pt);
    };

    // Parent defines this interface. I'm not sure if it is ever used.
    _p.clear =  function() {
        throw new NotImplementedError('Clear is not implemented. Just create a new pen.');
    };

    return SVGPathsPen;

});
