define([
    'bower_components/zip/zip'
	, 'models/FS'
    , './localStorageIO'
    , 'ufojs/ufoLib/glifLib/GlyphSet'
    , 'ufojs/tools/pens/SVGPen'
], function(
            Zip
            , FS
            , localStorageIO
            , GlyphSet
            , SVGPen
    ) {
	"use strict";
	function FileViewerController($scope, $rootScope, $compile, fileService) {
		this.$scope = $scope;
		this.$scope.name = 'FileViewer';

        this.$scope.selectedFile;
        this.$scope.$watch('selectedFile', function (newFile, oldFile) {
            if (newFile) {
                var onLoadGlyphSet = function (glyphSet) {
                    console.log('wt');
                    console.log(glyphSet);
                }
            var content = localStorage.getItem(newFile);
            this.$scope.fileName = fileService.getFilename();
            console.log(fileService);
            this.$scope.selectedFileContent = content;
                GlyphSet.factory(false, localStorageIO, this.$scope.fileName+'/glyphs')
                .then(onLoadGlyphSet);
            }
        }.bind(this));
	}
	
	FileViewerController.$inject = ['$scope', '$rootScope', '$compile', 'fileService'];
	var _p = FileViewerController.prototype;
    
    _p.initDraw = function() {
        
    }
    
    return FileViewerController;
})
//               var content = localStorage.getItem(newFile);
//                this.$scope.selectedFileContent = content;
//                var glyphJSON = glyphFactories.fromGlifString(content);
//                console.log(glyphJSON);
//                var two = new Two(renderParams).appendTo(canvasWrapper);
//                var group = two.makeGroup();
//                var glyph = glyphJSON.outline;
//                for (var i = 0; i <= glyph.length; i++){
//                    var anchors = [];
//                    if (glyph[i][0] == "contour") {
//                        for (var j = 0; j <= glyph[i][1].length; j++) { 
//                            var point = glyph[i][1][j];
//                            if (point.type) {
//                                var pointType = Two.Commands.curve;
//                                var closePoint = glyph[i][1].filter(function(p){
//                                        return (p.type)?true:false;
//                                });
//                                var anchor = new Two.Anchor(
//                                    point.x, point.y,
//                                    pointType
//                                );
//                                anchors.push(anchor);
//                            }
//                        }
//                    var ppoly = new Two.Polygon(anchors, true, true, true);
//                    ppoly.fill = 'black';
//                    group.add(ppoly);
//                    }
//                }
//                