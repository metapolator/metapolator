define([
    '../_BaseModel'
  , './SpecimenSizesModel'
  , './SpecimenSamplesModel'
], function(
    _BaseModel
  , SpecimenSizesModel
  , SpecimenSamplesModel
){
    "use strict";
    function SpecimenModel(glyphRange, selecting, type, parent) {
        this.name = type;
        this.sizes = new SpecimenSizesModel(this);
        // initial setting of the lineHeight
        this.sizes.updateLineHeight();

        this.mixer = {
            specimenSamples : new SpecimenSamplesModel(glyphRange, this),
            fontBy : null,
            filter : "",
            strict : 0,
            parent : this
        };
        this.settings = {
            selecting : selecting,
            inject : type
        };
        this.selectedMasters = [];
        this.glyphsIn = [];
        this.glyphsOut = [];
        this.filteredGlyphs = [];
        Object.defineProperty(this, 'parent', {
            value: parent,
            enumerable: false,
            writable: true,
            configurable: true
        });
    }
    
    var _p = SpecimenModel.prototype = Object.create(_BaseModel.prototype);
    
    _p.setFontby = function(fontBy) {
        this.mixer.fontBy = fontBy; 
        this.getFilteredGlyphs();
    };
    
    _p.setStrict = function(strict) {
        this.mixer.strict = strict;
        this.updateGlyphsOut();
    };
       
    _p.setSpecimenSample = function(specimenSample) {
        this.mixer.specimenSamples.currentSample = specimenSample;
        this.updateGlyphsIn();
    };
    
    _p.updateGlyphsIn = function() {
       var stringIn = this.mixer.specimenSamples.currentSample.text;
        if (stringIn.length > 0) { 
            this.glyphsIn = stringToGlyphs(stringIn, false, true);
        }
        this.updateGlyphsOut();
    };
    
    _p.updateSelectedMasters = function(sequences) {
        window.logCall("updateSelectedMasters " + this.name);
        var selectedMasters = [];
        for (var i = 0, il = sequences.length; i < il; i++) {
            var sequence = sequences[i];
            for (var j = 0, jl = sequence.children.length; j < jl; j++) {
                var master = sequence.children[j];
                if ((this.name == "masters" && master.edit[0]) || 
                   (this.name == "instances" && master == this.parent.instancePanel.currentInstance) || 
                    master.display) {
                    selectedMasters.push(master);
                }
            }
        }
        this.selectedMasters = selectedMasters;
        this.getFilteredGlyphs();
    };
    
    _p.updateGlyphsOut = function() {
        var filter = this.mixer.filter
          , glyphsOut = []
          , strict = this.mixer.strict;
        if (filter.length == 0) {
            // no filter? In == Out
            glyphsOut = this.glyphsIn;
        } else {
            if (strict == 0) {
                glyphsOut = this.strictZero();
            } else if (strict == 1) {
                glyphsOut = this.strictOne();
            } else if (strict == 2) {
                glyphsOut = this.strictTwo();
            }
        }
        this.glyphsOut = glyphsOut;
        this.getFilteredGlyphs();
    };
    
    _p.getFilteredGlyphs = function() {
        // building the filterd string, add a glyphid for the track by at the ng-repeat 
        // we can't use track by $index, otherwise some ui changes aren't picked up by angular
        // like adding and removing classes, and especially the append svg
        var masterArray = this.selectedMasters
          , glyphsOut = this.glyphsOut
          , fontBy = this.mixer.fontBy;
        if (masterArray.length == 0) {
            this.filteredGlyphs = [];
        } else {
            var filtered = [];
            var glyphId = 0;
            for (var q = 0, ql = masterArray.length; q < ql; q++) {
                // repeating for the number of master with display true. every glyph of this loop starts with a new master (masterId)
                var masterId = q;
                for (var i = 0, il = glyphsOut.length; i < il; i++) {
                    var glyph = glyphsOut[i];
                    var master = masterArray[masterId];
                    if (glyph == "*specimenbreak" || glyph == "*n" || glyph == "*p") {
                       filtered.push({
                           glyph: {
                               name: glyph
                           },
                           glyphId: glyph + "-" + glyphId
                       }); 
                    } else {
                        // search for the glyph in the master
                        var thisGlyph = getGlyph(master, glyph);
                        if (thisGlyph) {
                            filtered.push({
                                glyph: thisGlyph,
                                glyphId: glyph + "-" + glyphId
                            });
                        }
                    }
                    glyphId++;
                    if ((fontBy == "Glyph") || (fontBy == "Word" && glyph == "space") || (fontBy == "Specimen" && i == (glyphsOut.length - 1))) {
                        masterId++;
                    }
                    if (masterId == ql) {
                        masterId = 0;
                    }
                }
                // specimen break after each loop
                if (q < masterArray.length - 1) {
                    filtered.push({
                        glyph: {
                            name: "*specimenbreak",
                        },
                        glyphId: "*specimenbreak-" + glyphId++
                    });
                }
            }
            this.filteredGlyphs = filtered;
            window.logCall("end filter");
            //startTimer();
        }
    };
    
    // helper functions
    
    _p.strictZero = function() {
        // if strict is 0, glyphs from the filter are inserted in stringIn
        var filter = this.mixer.filter
          , glyphsIn = this.glyphsIn
          , pushedFilterGlyph = 0
          , glyphsOut = []
          , filterGlyphs = stringToGlyphs(filter, false, true)
          , insertionInterval = Math.sqrt(2 * glyphsIn.length / filter.length)
          , insertionCounter = 0.5;
        for (var i = 0, l = glyphsIn.length; i < l; i++) {
            glyphsOut.push(glyphsIn[i]);
            var thisPosition = Math.floor(insertionCounter * insertionInterval);
            if (thisPosition == i) {
                // insert glyph from filter
                glyphsOut.push(filterGlyphs[pushedFilterGlyph]);
                pushedFilterGlyph++;
                if (pushedFilterGlyph == filterGlyphs.length) {
                    pushedFilterGlyph = 0;
                }
                insertionCounter++;
            }
        }
        return glyphsOut;
    };
    
    _p.strictOne = function() {
        // if strict is 1, glyphs from the filter replace glyphs in stringIn
        var filter = this.mixer.filter
          , glyphsIn = this.glyphsIn
          , pushedFilterGlyph = 0
          , glyphsOut = []
          , filterGlyphs = stringToGlyphs(filter, false, true)
          , withoutSpaces_i = 0
          , insertionCounter = 1;
        for (var i = 0, l = glyphsIn.length; i < l; i++) {
            if (!isSpaceGlyph(glyphsIn[i])) {
                if (withoutSpaces_i == insertionCounter) {
                    glyphsOut.push(filterGlyphs[pushedFilterGlyph]);
                    insertionCounter += 2;
                    pushedFilterGlyph++;
                    if (pushedFilterGlyph == filterGlyphs.length) {
                        pushedFilterGlyph = 0;
                    }
                } else {
                    glyphsOut.push(glyphsIn[i]);
                }
                withoutSpaces_i++;
            } else {
                glyphsOut.push(glyphsIn[i]);
            }
        }
        return glyphsOut;
    };
    
    _p.strictTwo = function() {
        // if strict is 2, the glyphsOut is totally based on the filter
        var filter = this.mixer.filter
          , filterGlyphs = stringToGlyphs(filter, true, false)
          , glyphsOut = [];
        if (filterGlyphs.length == 1) {
            glyphsOut.push(filterGlyphs[0]);
        } else {
            for (var i = 0, l = filterGlyphs.length; i < l; i++) {
                for (var j = i; j < l; j++) {
                    if (i == j) {
                        if (i == 0 || i == (filterGlyphs.length - 1)) {
                            glyphsOut.push(filterGlyphs[i], filterGlyphs[i]);
                        } else {
                            glyphsOut.push("space", filterGlyphs[i], filterGlyphs[i]);
                        }
                    } else if ((j - i) % 2 == 0) {
                        glyphsOut.push("space", filterGlyphs[i], filterGlyphs[j], filterGlyphs[i]);
                    } else {
                        glyphsOut.push(filterGlyphs[j], filterGlyphs[i]);
                    }
                }
            }
        }
        return glyphsOut;
    };
    
    function stringToGlyphs(string, unique, includeSpaces) {
        var glyphs = [];
        for (var i = 0, l = string.length; i < l; i++) {
            var glyph = string[i];
            var substitutePosition = substitute(glyph);
            // detecting space, linebreak or paragraph
            if (glyph == " ") {
                glyph = "space";
            } else if (glyph == "*" && (string[i + 1] == "n" || string[i + 1] == "p")) {
                glyph = "*" + string[i + 1];
                i++;
            } else if (glyph == "<") {
                // detecting foreign glyph
                glyph = "";
                var foundEnd = false;
                for (var q = 1; q < 10; q++) {
                    if (!foundEnd) {
                        if (string[i + q] != ">") {
                            glyph += string[i + q];
                        } else {
                            var foundEnd = true;
                        }
                    }
                }
                if (!foundEnd) {
                    // just a normal "<"
                    glyph = "<";
                } else {
                    i = i + glyph.length + 1;
                }
            } else if (substitutePosition > -1) {
                glyph = fontMapping[substitutePosition].glyphName;
            }
            if (unique) {
                // unique is set for the filter
                if (glyphs.indexOf(glyph) < 0 || glyph == "*n" || glyph == "*p") {
                    if (glyph != "space" || includeSpaces) {
                        glyphs.push(glyph);
                    }
                }
            } else {
                if (glyph != "space" || includeSpaces) {
                    glyphs.push(glyph);
                }
            }
        }
        return glyphs;
    }
    
    function getGlyph(master, glyph) {
        for (var j = master.children.length - 1; j >= 0; j--) {
            var thisGlyph = master.children[j];
            if (thisGlyph.name == glyph) {
                return thisGlyph;
            }
        } 
        return false;
    }
                
    function isSpaceGlyph(glyph) {
        if (glyph == "space" || glyph == "*n" || glyph == "*p") {
            return true;
        } else {
            return false;
        }
    }

    function substitute(glyph) {
        // check if glyph is a-z A-Z
        if (/^[a-zA-Z]*$/.test(glyph) || glyph == " ") {
            return -1;
        } else {
            // we should add var pos = -2. So -1 is regular alphabetic, -2 is unknown
            var pos = -1;
            var preUnicode = glyph.charCodeAt(0).toString(16).toUpperCase();
            var n = 4 - preUnicode.length;
            var pre = "";
            for (var q = 0; q < n; q++) {
                pre += "0";
            }
            var unicode = pre + preUnicode;
            /*
            for ( i = 0; i < fontMapping.length; i++) {
                if (unicode == fontMapping[i].unicode) {
                    pos = i;
                    break;
                }
            }
            */
            return pos;
        }
    }
    
    return SpecimenModel;
});
