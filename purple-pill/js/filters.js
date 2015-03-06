app.filter('rangeFilter', function() {
    return function(specimen, filter) {
        var filtered = [];
        for (var i = 0; i < specimen.length; i++) {
            var thisGlyph = specimen[i];
            if (filter.length == 0) {
                filtered.push(thisGlyph);
            } else {
                if (filter.indexOf(thisGlyph.value) > -1) {
                    filtered.push(thisGlyph);
                }
            }
        }
        return filtered;
    };
});

app.filter('specimenFilter', function() {
    return function(specimen, options, sequences) {
        if (specimen.name != "glyph range") {
            // count fonts visible
            var nrOfFonts = 0;
            for (var i = 0; i < sequences.length; i++) {
                for (var j = 0; j < sequences[i].masters.length; j++) {
                    var thisFont = sequences[i].masters[j];
                    if (thisFont.display == true) {
                        nrOfFonts++;
                    }
                }
            }
            var string = specimen.text;
            
            var filter;
            // remove doubles from filter
            var filter = "";
            for (var i = 0; i< options.filter.length; i++){
                if (filter.indexOf(options.filter[i]) == -1) {
                    filter += options.filter[i];
                }
            }    
                   
            // setting the numer of characters needed to match the search box
            var strict = options.strict;
            var required = strict;
            if (strict == 2 && filter.length == 1) {
                required = 1;
            }
            
            var output = "";
            var newText = "";
            var text = string.split(" ");
            

            // if nothing if filter, then we use the string 1:1
            if (filter.length == 0) {
                newText = string;
            } else {
                if (strict == 3) {
                    // if strict is 3, we use the filter 1:1
                    newText = filter;
                } else {
                    text.forEach(function(word) {
                        var hits = 0;
                        for (var i = 0; i < word.length; i++) {
                            if (filter.indexOf(word[i]) > -1) {
                                hits++;
                            }
                            if (hits >= required) {
                                newText += word + " ";
                                break;
                            }
                        }
                    });
                }
            }

            // find the masters display true
            var masterArray = [];
            for (var j = 0; j < sequences.length; j++) {
                for (var k = 0; k < sequences[j].masters.length; k++) {
                    var thisFont = sequences[j].masters[k];
                    if (thisFont.display == true) {
                        var foundFont = {
                            "sequenceId" : j,
                            "masterId" : k,
                            "family" : thisFont.fontFamily,
                            "weight" : thisFont.weight,
                            "name" : thisFont.name
                        };
                        masterArray.push(foundFont);
                    }
                }
            }

            var filtered = [];
            

            // repeat proces for nr of fonts
            for (var i = 0; i < newText.length; i++) {
                var glyph = newText[i];

                // adding linebreak property for paragraphs
                var linebreak = false;
                if (glyph == "<" && newText[i + 1] == "b" && newText[i + 2] == "r") {
                    linebreak = true;
                    i += 3;
                    glyph = " ";
                }
                if (glyph != " ") {
                    filtered.push(glyph.toLowerCase());
                }
            }
            return filtered;
        }
    };
});
