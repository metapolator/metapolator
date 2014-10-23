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
    
    function svgPenFactory(glyphset) {
        var svg = document.createElementNS(svgns, 'svg')
          , pathElement = document.createElementNS(svgns, 'path')
          , gElement = document.createElementNS(svgns, 'g')
          , svgPen = new SVGPen(pathElement, glyphset)
          ;
        svg.setAttribute('width', '100%');
        svg.setAttribute('viewBox', '0 0 1000 1000');
        // A quick way to draw the path as outline instead of filled:
        //pathElement.setAttribute('stroke', 'black');
        //pathElement.setAttribute('fill', 'none');
        gElement.setAttribute('transform', 'matrix(1, 0, 0, -1, 0, 800)');
        gElement.appendChild(pathElement);
        svg.appendChild(gElement);
        return svgPen;
    }
    
    function render(element, glyph, model, interval) {
        var ep = Object.create(ExportController.prototype)
          , svgPen = svgPenFactory({})
          , pointPen = new PointToSegmentPen(svgPen)
          ;
        var gen = ep.drawGlyphToPointPenGenerator(model, glyph, pointPen);
        var promise = interval(function () {
                          if (gen.next().done) {
                              interval.cancel(promise);
                              var old = element[0].getElementsByTagName('svg')[0];
                              if(old)
                                  old.parentNode.replaceChild(svgPen.path.ownerSVGElement, old);
                              else
                                  element.append(svgPen.path.ownerSVGElement);
                          }
                      },
                      20);
    }
    
    function redPillGlyphDirective(model, interval) {
        function link(scope, element, attrs) {
            render(element, scope.mtkGlyphElement, model, interval);
            scope.$on('cpsUpdate', render.bind(null, element, scope.mtkGlyphElement, model, interval))
        }
        return {
            restrict: 'E'
          , link: link
          , scope: { mtkGlyphElement: '=' }
        };
    }
    
    redPillGlyphDirective.$inject = ['ModelController', '$interval'];
    return redPillGlyphDirective;
})
