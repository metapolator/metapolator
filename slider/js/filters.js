app.filter('specimenFilter', function() {
    return function(string, options, sequences) {
        var strict = options.strict;
        var required = strict;
        var output = "";
        var newText = "";
        var text = string.split(" ");
        var filter = options.filter;

        if (filter.length == 0) {
            newText = string;
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

        // find the masters display true
        var masterArray = [];
        for (var j = 0; j < sequences.length; j++) {
            for (var k = 0; k < sequences[j].masters.length; k++) {
                var thisFont = sequences[j].masters[k];
                if (thisFont.display == true) {
                    var foundFont = {
                        "family": thisFont.fontFamily,
                        "weight": thisFont.weight,
                        "name": thisFont.name
                    };
                    masterArray.push(foundFont);
                }
            }
        }
        
        // break for fontby
        if (options.selectedFontby == "glyph") {
            var fontby = newText.split("");
        }
        else if (options.selectedFontby == "word") {
            var fontby = newText.split(" ");
        }
        
        

        var filtered = [];
        var masterIndex = 0;
        
        for (var i = 0; i < newText.length; i++) {
            var glyph = newText[i];
            var master = masterArray[masterIndex];
            var thisElement = {
                "glyph": glyph, 
                "master": master
            };
            filtered.push(thisElement);
            // looping the master array. ++ every time when fontby is glyph, ++ only at a space when fontby is word
            if ((options.selectedFontby == "glyph" && glyph != " ") || (options.selectedFontby == "word" && glyph == " ")) {
                masterIndex++;
            }
            if (masterIndex == masterArray.length) {
                masterIndex = 0;
            }
        }
       
        return filtered;
    };
}); 