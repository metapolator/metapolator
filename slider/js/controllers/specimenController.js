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
        text : "Lorem ipsum dolor sit amet.Sed consectetur enim posuere.Etiam nec metus non velit posuere finibus a cursus magna."
    }, {
        name : "glyph range",
        text : ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z", "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z", "1", "2", "3", "4", "5", "6", "7", "8", "9", "0"]
    }];
    $scope.selectedSpecimen = $scope.specimen[0];
    $scope.fontSize = 80;
    $scope.fontbys = ["word", "glyph", "paragraph"];
    $scope.filterOptions = {
        filter : "",
        strict : 1,
        selectedFontby : $scope.fontbys[0]
    };

    // setting the edit mode of glyphs
    $scope.toggleGlyph = function(glyph, master) {
        for (var j = 0; j < $scope.data.sequences.length; j++) {
            for (var k = 0; k < $scope.data.sequences[j].masters.length; k++) {
                for (var l = 0; l < $scope.data.sequences[j].masters[k].glyphs.length; l++) {
                    if ($scope.data.sequences[j].masters[k].glyphs[l].value == glyph && $scope.data.sequences[j].masters[k].name == master) {
                        $scope.data.sequences[j].masters[k].glyphs[l].edit = !$scope.data.sequences[j].masters[k].glyphs[l].edit;
                    }
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
    
    $scope.$watch("selectedSpecimen.text | specimenFilter:filterOptions:data.sequences", function(newVal) {
        $scope.filteredGlyphs = newVal;
    }, true);

}]); 