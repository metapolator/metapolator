app.controller('MetapolatorController', ['$scope', '$sce', function($scope, $sce) {

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
    }];
    $scope.selectedSpecimen = $scope.specimen[0];
    $scope.fontSize = 60;
    $scope.filter = "";
    $scope.strict = 1;
    $scope.fontbys = [
    	"glyph", "word"
    ];
    $scope.selectedFontby = $scope.fontbys[0];


    $scope.filteredText = function() {
        var strict = $scope.strict;
        var required = strict;
        var output = "";
        var newText = "";
        var text = $scope.selectedSpecimen.text.split(" ");
        var filter = $scope.filter;

        if (filter.length == 0) {
            newText = $scope.selectedSpecimen.text;
        } else {
            text.forEach(function(word) {
                var hits = 0;
                for (var i = 0; i < word.length; i++) {
                    if (filter.indexOf(word[i]) > -1) {
                        hits++;
                    }
                    if (strict == 3) {
                        required = word.length;
                    }
                    if (hits >= required) {
                        newText += word + " ";
                        break;
                    }
                }
            });
        }
        
        // build fonts in display array
        fontArray = [];
        var fontNr = 0;
        for (var j = 0; j < $scope.sequences.length; j++) {
        	for (var k = 0; k < $scope.sequences[j].masters.length; k++) {
        		var thisFont = $scope.sequences[j].masters[k];
        		if (thisFont.display == true) {
	        		fontArray[fontNr] = new Array();
	        		fontArray[fontNr][0] = thisFont.fontFamily;
	        		fontArray[fontNr][1] = thisFont.name;
	        		fontArray[fontNr][2] = thisFont.weight;
	        		fontNr++;
	        	}
        	}
        }
        
        // break for fontby
        if ($scope.selectedFontby == "glyph") {
        	var fontby = newText.split("");
        }
        else if ($scope.selectedFontby == "word") {
        	var fontby = newText.split(" ");
        }
        var fontArrayNr = 0;
        for (var l = 0; l < fontby.length; l++) {
        	// add a space
        	if (fontby[l] == " ") {
        		fontby[l] = "&nbsp;";
        	}
        	if ($scope.selectedFontby == "word") {
        		fontby[l] += "&nbsp;";
        	}
        	
        	output += '<div class="chunk" style="font-family:\'' + fontArray[fontArrayNr][0] + '\'; font-weight:' + fontArray[fontArrayNr][2] + ';">' + fontby[l] + '</div>';
        	fontArrayNr++;
        	if (fontArrayNr == fontArray.length) {
        		fontArrayNr = 0;
        	}
        }
        return $sce.trustAsHtml(output);
    };


    // masters panel
    $scope.sequences = [{
        name : "Weight",
        masters : [{
            fontFamily : 'Roboto',
            name : 'we-Light',
            weight : '100',
            display : true,
            edit : true
        }, {
            fontFamily : 'Roboto',
            name : 'we-Regular',
            weight : '400',
            display : false,
            edit : true
        }, {
            fontFamily : 'Roboto',
            name : 'we-Bold',
            weight : '700',
            display : true,
            edit : false
        }]
    }, {
        name : "Width",
        masters : [{
            fontFamily : 'Roboto Condensed',
            name : 'w-Regular',
            weight : '400',
            display : true,
            edit : false
        }, {
            fontFamily : 'Roboto Condensed',
            name : 'w-Bold',
            weight : '700',
            display : true,
            edit : false
        }]
    }, {
        name : "Slab",
        masters : [{
            fontFamily : 'Roboto Slab',
            name : 's-Regular',
            weight : '400',
            display : false,
            edit : false
        }, {
            fontFamily : 'Roboto Slab',
            name : 's-Bold',
            weight : '700',
            display : true,
            edit : false
        }]
    }];
}]);
