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
            var string = specimen.text;
            var strict = options.strict;
            var required = strict;
            var output = "";
            var newText = "";
            var text = string.split(" ");
            var filter = options.filter;

            if (strict == 3) {
                newText = filter;
            } else {

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
            var masterIndex = 0;

            for (var i = 0; i < newText.length; i++) {
                var glyph = newText[i];

                // adding linebreak property for paragraphs
                var linebreak = false;
                if (glyph == "<" && newText[i + 1] == "b" && newText[i + 2] == "r") {
                    linebreak = true;
                    i += 3;
                    glyph = " ";
                }
                var master = masterArray[masterIndex];
                var thisElement = {
                    "glyph" : glyph,
                    "master" : master,
                    "linebreak" : linebreak
                };
                filtered.push(thisElement);
                // looping the master array. ++ every time when fontby is glyph, ++ only at a space when fontby is word
                if ((options.selectedFontby == "glyph" && newText[i] != " ") || (options.selectedFontby == "word" && newText[i] == " ") || (options.selectedFontby == "paragraph" && linebreak)) {
                    masterIndex++;
                }
                if (masterIndex == masterArray.length) {
                    masterIndex = 0;
                }
            }

            return filtered;
        }
    };
});
