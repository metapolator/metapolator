define([
    '../../../lib/bower_components/zip/zip'
    , './localStorageIO'
    , 'ufojs/ufoLib/glifLib/GlyphSet'
    , 'ufojs/tools/pens/SVGPen'
], function(
            Zip
            , localStorageIO
            , GlyphSet
            , SVGPen
    ) {
	"use strict";
	function FileViewerController($scope, $rootScope, $compile, fileService) {
		this.$scope = $scope;
		this.$scope.name = 'FileViewer';
        this.svgns = 'http://www.w3.org/2000/svg',
        this.$scope.selectedFile;
        this.glyphSet;
        this.$scope.$watch('selectedFile', function (newFile, oldFile) {
            if (newFile) {
                var content = localStorage.getItem(newFile);
                this.$scope.fileName = fileService.getFilename();
                this.$scope.selectedFileContent = content;
                if ( this.glyphSet && !fileService.isNewFile() ) {
                    this.onLoadGlyphSet(newFile, this.glyphSet)
                } else {
                    var io = new localStorageIO();
                    this.glyphSet = GlyphSet.factory(false, io, this.$scope.fileName+'/glyphs');
                    this.onLoadGlyphSet(newFile, this.glyphSet);
                }
            }
        }.bind(this)
        );
	}
	
	FileViewerController.$inject = ['$scope', '$rootScope', '$compile', 'fileService'];
	var _p = FileViewerController.prototype;
    
    _p.initDraw = function() {
        
    }
    
    _p.mountSVG = function(svg) {
        var oldSvg = document.getElementsByTagNameNS(this.svgns, 'svg');
        if(oldSvg.length)
            oldSvg[0].parentNode.replaceChild(svg, oldSvg[0]);
        else
            document.getElementById('ufoGlyph').appendChild(svg);
    }
                
    _p.svgPenFactory = function(glyphset) {
        var svg = document.createElementNS(this.svgns, 'svg')
          , pathElement = document.createElementNS(this.svgns, 'path')
          , gElement = document.createElementNS(this.svgns, 'g')
          , svgPen = new SVGPen(pathElement, glyphset)
          ;
        svg.setAttribute('width', '360px');
        svg.setAttribute('height', '360px');
        svg.setAttribute('style', 'background:transparent; margin-left:135px;');

        gElement.setAttribute('transform', 'matrix(0.45, 0, 0, 0.45, 0, 20)');
//        gElement.setAttribute('transform', 'scale(0.45, 0.45)');
        gElement.appendChild(pathElement);
        svg.appendChild(gElement);
        return svgPen;
    }
    
    _p.onLoadGlyphSet = function (newFile, glyphSet) {
        var fileName = this.$scope.fileName;
        try {
            if (newFile.indexOf(fileName+'/glyphs/') > -1) {
                var glyphName = newFile.replace(fileName+'/glyphs/','')
                var glyphName = Object.keys(glyphSet.contents).filter(function(key) {return glyphSet.contents[key] === glyphName})[0];
            }
        var pen = this.svgPenFactory(glyphSet)
          , glyph
          ;
        glyph = glyphSet.get(glyphName);
        glyph.draw(true, pen)
            .then(this.mountSVG.bind(this, pen.path.ownerSVGElement));
        } catch(e) {
            console.log(e);   
        }
    }
    
    return FileViewerController;
})