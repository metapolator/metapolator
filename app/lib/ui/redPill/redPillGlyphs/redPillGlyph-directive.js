define([
    'metapolator/webAPI/document'
  , 'metapolator/project/ExportController'
  , 'ufojs/tools/pens/PointToSegmentPen'
  , 'ufojs/tools/pens/SVGPen'
    ], function(
    document
  , ExportController
  , PointToSegmentPen
  , SVGPen
) {
    "use strict";
    
    var svgns = 'http://www.w3.org/2000/svg';
    
    function svgPenFactory(layer, glyphset) {
        var pathElement = document.createElementNS(svgns, 'path')
          , svgPen = new SVGPen(pathElement, glyphset)
          ;
        // make empty
        while (layer.firstChild)
            layer.removeChild(layer.firstChild);
        layer.appendChild(pathElement);
        return svgPen;
    }
    
    function getSVG(element) {
        var svg = element[0].getElementsByTagName('svg')[0];
        if(!svg) {
            svg = document.createElementNS(svgns, 'svg');
            svg.setAttribute('width', '100%');
            svg.setAttribute('viewBox', '0 0 1000 1000');
            element.append(svg);
        }
        return svg;
    }
    function getLayer(svg, name) {
        // Use classnames, because ids are available from the host document
        // as well, and thus they could create unwanted situations.
        // Classes are also available from the host document, but they don't
        // need to be unique.
        // These classes should be unique within this svg document.
        var uniqueClass = 'layer-'+name
          , layer = svg.getElementsByClassName(uniqueClass)[0];
        if(!layer) {
            layer = document.createElementNS(svgns, 'g');
            layer.setAttribute('transform', 'matrix(1, 0, 0, -1, 0, 800)');
            layer.setAttribute('class', uniqueClass);
            svg.appendChild(layer);
        }
        return layer;
    }
    
    function getLayerGenerator(ep, svg, model, glyph, layername, renderer) {
        var layer = getLayer(svg, layername)
          , svgPen = svgPenFactory(layer, {})
          , pointPen = new PointToSegmentPen(svgPen)
          ;
        return ep.drawGlyphToPointPenGenerator(renderer, model, glyph, pointPen);
    }
    
    function iterateGenerator(gen) {
        var done = false;
        try {
            done = gen.next().done;
        }
        catch(error) {
            if(error.message === "Generator has already finished")
                done = true;
            else
                throw error;
        }
        // clear this from the list
        return done;
    }
    
    function render(scope, element, glyph, model) {
        var ep = Object.create(ExportController.prototype)
          , svg = getSVG(element)
          , _getLayerGenerator = getLayerGenerator.bind(null, ep, svg, model, glyph)
          , layers = [
                _getLayerGenerator('outline', ExportController.renderPenstrokeOutline)
              , _getLayerGenerator('centerline', ExportController.renderPenstrokeCenterline)
            ]
          ;
        function layerCtrl() {
            // execute
            var done = layers.map(iterateGenerator);
            // remove finished generators
            layers = layers.filter(function(item, i){return !done[i];});
            if(layers.length)
                scope.timeoutId = setTimeout(layerCtrl, 0);
        }
        if(scope.timeoutId)
            clearTimeout(scope.timeoutId);
        scope.timeoutId = setTimeout(layerCtrl, 0);
    }
    
    function redPillGlyphDirective(model) {
        function link(scope, element, attrs) {
            render(scope, element, scope.mtkGlyphElement, model);
            scope.$on('cpsUpdate', render.bind(null, scope, element, scope.mtkGlyphElement, model));
            element.on('$destroy', function() {
                clearTimeout(scope.timeoutId);
            });
        }
        return {
            restrict: 'E'
          , link: link
          , scope: { mtkGlyphElement: '=' }
        };
    }
    
    redPillGlyphDirective.$inject = ['ModelController'];
    return redPillGlyphDirective;
});
