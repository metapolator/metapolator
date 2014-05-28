require([
    'webAPI/document'
  , 'ufojs/tools/pens/SVGPen'
  , 'ufojs/plistLib/main'
  , 'angular'
], function (
    document
  , domReady
  , SVGPen
  , plistLib
  , angular
  , $http
  , $scope
) {
    "use strict";
    console.log(angular);
    //return Module
    return angular.module('glyphInspector', [$http]).

    controller('glyphInspectorCtrl', ['http',function($scope, $http){
      var recivePlist = function(plist){
        $scope.glyphs = plistLib.readPlistFromString(plist);
      }
      var renderGlyph = function(name) {
      var glyph = glyphset[name],
          svgns = 'http://www.w3.org/2000/svg',
          svg = document.createElementNS(svgns, 'svg'),
          pathElement = document.createElementNS(svgns, 'path'),
          gElement = document.createElementNS(svgns, 'g'),
          svgPen = new SVGPen(pathElement, glyphset);
      svg.setAttribute('width', '100%');
      svg.setAttribute('height', '1000px');
      svg.setAttribute('style', 'background:#abcdef');
      
      gElement.setAttribute('transform', 'matrix(1, 0, 0, -1, 0, 800)');
      gElement.appendChild(pathElement);
      svg.appendChild(gElement);
      glyph.draw(svgPen);
      
      var oldSvg = document.getElementsByTagNameNS(svgns, 'svg');
      if(oldSvg.length)
          oldSvg[0].parentNode.replaceChild(svg, oldSvg[0]);
      else
          document.body.appendChild(svg);
    }

      $http.get('/glyphs/content.plist').success(recivePlist);
    }])

    .directive('glyph-inspector', function($scope){
      return {
        template: "<select id=\"glyphs\"><option ng-repeat=\"glyph in glyphs\">{{glyph}}</option></select><svg id=\"glyphsSVG\"></svg>"
      }
    })
});