app.controller("MetapolatorController", function($scope) {

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

    $scope.filteredText = function() {
        var strict = $scope.strict;
        var required = strict;
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
        return newText;
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
});
