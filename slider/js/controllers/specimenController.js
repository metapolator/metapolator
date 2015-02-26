app.controller('specimenController', ['$scope', '$sce', 'sharedScope',
function($scope, $sce, sharedScope) {
    $scope.data = sharedScope.data;

    $scope.sortableOptions = {
        helper : 'clone'
    };

    // specimen panel parameters
    $scope.specimen = [{
        name : "pangram 1",
        text : "The quick brown fox jumps over the lazy dog."
    }, {
        name : "pangram 2",
        text : "Bright vixens jump dozy fowl quack."
    }, {
        name : "pangram 3",
        text : "Quick wafting zephyrs vex bold Jim."
    }, {
        name : "paragraph 1",
        text : "Duis tincidunt nisi id nibh feugiat mattis. Integer augue elit, eleifend eget lorem finibus, placerat scelerisque eros. Curabitur et tortor sapien. Mauris pulvinar efficitur velit. <br>Duis consequat placerat nisl condimentum ullamcorper. Aenean placerat, sapien non egestas sagittis, purus ex pharetra velit, vitae tincidunt lectus tortor vel mi. Praesent sollicitudin maximus orci, quis egestas sapien auctor vel. Aliquam erat volutpat. Interdum et malesuada fames ac ante ipsum primis in faucibus. <br>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque iaculis, purus a posuere iaculis, felis tortor mattis leo, vitae ullamcorper sem ligula in metus. Suspendisse ac tincidunt eros. Sed ac ornare elit. Integer ut lorem sed justo tempor vehicula. Phasellus facilisis justo quis felis faucibus ultrices. Integer pulvinar orci vitae leo accumsan, sit amet tincidunt ligula dapibus. Vestibulum in ligula turpis. "
    }, {
        name : "glyph range",
        text : ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z", "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z", "1", "2", "3", "4", "5", "6", "7", "8", "9", "0"]
    }];
    $scope.selectedSpecimen = $scope.specimen[0];
    $scope.fontSize = 80;
    $scope.nrOfFonts = 5;
    $scope.fontbys = ["word", "glyph", "paragraph"];
    $scope.filterOptions = {
        filter : "",
        strict : 1,
        selectedFontby : $scope.fontbys[0]
    };

    // setting the edit mode of glyphs
    $scope.selectGlyph = function(sequenceId, masterId, glyph) {
        for (var j = 0; j < $scope.data.sequences.length; j++) {
            for (var k = 0; k < $scope.data.sequences[j].masters.length; k++) {
                for (var l = 0; l < $scope.data.sequences[j].masters[k].glyphs.length; l++) {
                    if ($scope.data.sequences[j].masters[k].glyphs[l].value == glyph && sequenceId == j && masterId == k) {
                        $scope.data.sequences[j].masters[k].glyphs[l].edit = true;
                    } else {
                        $scope.data.sequences[j].masters[k].glyphs[l].edit = false;
                    }
                }
            }
        }
    };
    
    $scope.toggleGlyph = function(sequenceId, masterId, glyph) {
        for (var j = 0; j < $scope.data.sequences.length; j++) {
            for (var k = 0; k < $scope.data.sequences[j].masters.length; k++) {
                for (var l = 0; l < $scope.data.sequences[j].masters[k].glyphs.length; l++) {
                    if ($scope.data.sequences[j].masters[k].glyphs[l].value == glyph && sequenceId == j && masterId == k) {
                        $scope.data.sequences[j].masters[k].glyphs[l].edit = !$scope.data.sequences[j].masters[k].glyphs[l].edit;
                    }
                }
            }
        }
    };
    
    $scope.selectSet = function(set){
        for (var j = 0; j < $scope.data.sequences.length; j++) {
            for (var k = 0; k < $scope.data.sequences[j].masters.length; k++) {
                for (var l = 0; l < $scope.data.sequences[j].masters[k].glyphs.length; l++) {
                    var isinset = false;
                    for (var m = 0; m < set.length; m++){
                        if ($scope.data.sequences[j].masters[k].glyphs[l].value == set[m].glyph && j == set[m].sequence && k == set[m].master) {
                            isinset = true;
                        }
                    }
                    if (isinset) {
                       $scope.data.sequences[j].masters[k].glyphs[l].edit = true;
                    } else {
                        $scope.data.sequences[j].masters[k].glyphs[l].edit = false;
                    }
                }
            }
        } 
    };
    
    $scope.toggleSet = function(set){
        for (var j = 0; j < $scope.data.sequences.length; j++) {
            for (var k = 0; k < $scope.data.sequences[j].masters.length; k++) {
                for (var l = 0; l < $scope.data.sequences[j].masters[k].glyphs.length; l++) {
                    var isinset = false;
                    for (var m = 0; m < set.length; m++){
                        if ($scope.data.sequences[j].masters[k].glyphs[l].value == set[m].glyph && j == set[m].sequence && k == set[m].master) {
                            isinset = true;
                        }
                    }
                    if (isinset) {
                       $scope.data.sequences[j].masters[k].glyphs[l].edit = !$scope.data.sequences[j].masters[k].glyphs[l].edit;
                    }
                }
            }
        } 
    };
    
    $scope.deselectAll = function(){
        for (var j = 0; j < $scope.data.sequences.length; j++) {
            for (var k = 0; k < $scope.data.sequences[j].masters.length; k++) {
                for (var l = 0; l < $scope.data.sequences[j].masters[k].glyphs.length; l++) {
                    $scope.data.sequences[j].masters[k].glyphs[l].edit = false;
                }
            }
        } 
    };
    

    // find out if the glyph edit is true
    $scope.askIfEditGlyph = function(glyph, master) {
        var edit = false;
        for (var j = 0; j < $scope.data.sequences.length; j++) {
            for (var k = 0; k < $scope.data.sequences[j].masters.length; k++) {
                for (var l = 0; l < $scope.data.sequences[j].masters[k].glyphs.length; l++) {
                    if ($scope.data.sequences[j].masters[k].glyphs[l].value == glyph && $scope.data.sequences[j].masters[k].name == master && $scope.data.sequences[j].masters[k].glyphs[l].edit) {
                        var edit = true;
                    }
                }
            }
        }
        return edit;
    };
    
    $scope.$watch("selectedSpecimen | specimenFilter:filterOptions:data.sequences", function(newVal) {
        $scope.filteredGlyphs = newVal;
    }, true);

}]); 