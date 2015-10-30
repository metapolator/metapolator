define([
    'metapolator/rendering/glyphBasics'
  , 'metapolator/rendering/dataTransformationCaches/DrawPointsProvider'
  , 'metapolator/rendering/dataTransformationCaches/SVGUsePathsProvider'
  , 'metapolator/rendering/dataTransformationCaches/SVGUseCustomProvider'
  , './GlyphInterface'
], function(
    glyphBasics
  , DrawPointsProvider
  , SVGUsePathProvider
  , SVGUseCustomProvider
  , GlyphInterface
) {
    "use strict";

    var svgns = 'http://www.w3.org/2000/svg'
      , centerlineRenderer = {
            penstroke: glyphBasics.renderPenstrokeCenterline
        }
      , metaLinesRenderer, labelsRenderer
      ;

    function drawLine(path, from, to) {
        path.pathSegList.appendItem(path.createSVGPathSegMovetoAbs(from[0], from[1]));
        path.pathSegList.appendItem(path.createSVGPathSegLinetoAbs(to[0], to[1]));
    }

    metaLinesRenderer = {
        penstroke: function( element, penstroke ) {
            var points = penstroke.children
              , doc = element.ownerDocument
              , i, l, point, center, left, right
              , posCenter, posIn, posOut
              , posLeft, posInL, posOutL
              , posRight, posInR, posOutR
              ;
            var path = element.ownerDocument.createElementNS(svgns, 'path');
            element.appendChild(path);

            for(i=0,l=points.length;i<l;i++) {
                point = points[i];
                center = point.center.getComputedStyle();
                left = point.left.getComputedStyle();
                right = point.right.getComputedStyle();

                posCenter = center.get('on', false);
                posIn = center.get('in', false);
                posOut = center.get('out', false);

                posLeft = left.get('on', false);
                posInL = left.get('in', false);
                posOutL = left.get('out', false);

                posRight = right.get('on', false);
                posInR = right.get('in', false);
                posOutR = right.get('out', false);


                if(posIn && posCenter) drawLine(path, posIn, posCenter);
                if(posCenter && posOut) drawLine(path, posCenter, posOut);

                if(posCenter && posLeft) drawLine(path, posCenter, posLeft);
                if(posCenter && posRight) drawLine(path, posCenter, posRight);

                if(posInL && posLeft) drawLine(path, posInL, posLeft);
                if(posLeft && posOutL) drawLine(path, posLeft, posOutL);

                if(posInR && posRight) drawLine(path, posInR, posRight);
                if(posRight && posOutR) drawLine(path, posRight, posOutR);
            }
        }
      , contour: function( element, contour ) {
            var points = contour.children
              , doc = element.ownerDocument
              , i, l, p, posOn, posIn, posOut
              ;

            var path = element.ownerDocument.createElementNS(svgns, 'path');
            element.appendChild(path);

            for(i=0,l=points.length;i<l;i++) {
                p = points[i].getComputedStyle();

                posOn = p.get('on').valueOf();
                posIn = p.get('in').valueOf();
                posOut = p.get('out').valueOf();

                drawLine(path, posIn, posOn);
                drawLine(path, posOn, posOut);
            }
        }
    };

    function GlyphUIService(document, drawPointsOutlineProvider) {
        this._doc = document;
        this._svg = this._doc.createElementNS(svgns, 'svg');
        this._svg.style.display = 'none';

        if(this._doc.body.firstChild)
            this._doc.body.insertBefore(this._svg, this._doc.body.firstChild);
        else
            this._doc.body.appendChild(this._svg);

        var prefix = 'mp_glyph_';// globally unique

        // What is the difference between services and layers?
        // None patricular: we can use layers automated to just draw in
        // order one over the other. Services in contrast are very special
        // in their uses and need extra effort to be useful.
        // In here, layers are specialized services.
        this.services = {};
        this.services.outline = drawPointsOutlineProvider;
        this.services.centerline = new DrawPointsProvider(centerlineRenderer);
        this.services.shapes = new SVGUsePathProvider(this._svg, prefix+'base', this.services.outline, false);

        this.layers = {};
        // This one is useful to display to whole glyph without controls/interaction
        // probably the simplest and cheapest way to draw glyphs.
        this.layers.full = new SVGUsePathProvider(this._svg, prefix+'full', this.services.outline, true);
        // draw the the centerlines (of penstrokes) as path
        this.layers.centerline = new SVGUsePathProvider(this._svg, prefix+'centerline', this.services.centerline, false);
        // draws a lot of clutter, will be refined soon
        // this information should only be rendered to selected elements ...
        this.layers.meta = new SVGUseCustomProvider(this._svg, prefix+'meta', metaLinesRenderer);
    }

    var _p = GlyphUIService.prototype;

    _p.get = function(glyph, options) {
        var canvas = new GlyphInterface(this._doc, this.layers, this.services, glyph, options);
        return canvas;
    };

    return GlyphUIService;
});
