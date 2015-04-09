app.controller('specimenController', ['$scope', '$sce', 'sharedScope',
function($scope, $sce, sharedScope) {
    $scope.data = sharedScope.data;

    $scope.data.renderGlyphs = function(masterName, glyphName) {
        return $scope.data.stateful.glyphRendererAPI.get(masterName, glyphName);
    };


    $scope.sortableOptions = {
        helper : 'clone'
    };

    /*****************filter parameters *****************/
   
   // specimenPanel tells the filter to use masters or instances
   $scope.specimenPanel;

    $scope.specimen = [{
        name : "metapolator",
        text : "metapolator"
    }, {
        name : "Pangram 1",
        text : "The quick brown fox jumps over the lazy dog"
    }, {
        name : "Pangram 2",
        text : "Bright vixens jump dozy fowl quack"
    }, {
        name : "Pangram 3",
        text : "Quick wafting zephyrs vex bold Jim"
    }, {
        name : "Something with breaks",
        text : "hey you*nthe rock*nsteady crew"
    }, {
        name : "Devanagari",
        text : "<dvA><dvI><dvKHA><dvBHA><dvDA><dvDHA>"
    }, {
        name : "Paragraph 1",
        text : "Grumpy wizards make toxic brew for the evil Queen and Jack One morning when Gregor Samsa woke from troubled dreams he found himself transformed in his bed into a horrible vermin*pHe lay on his armour-like back and if he lifted his head a little he could see his brown belly slightly domed and divided by arches into stiff sections*pThe bedding was hardly able to cover it and seemed ready to slide off any moment His many legs pitifully thin compared with the size of the rest of him waved about helplessly as he looked"
    }];

    // only for the masters specimen panel
    $scope.addGlyphRange = function() {
        $scope.specimen.push({
            name : "glyph range"
        });
    };

    $scope.selectedSpecimen = $scope.specimen[0];
    $scope.fontSize = 90;
    $scope.lineHeight = 0.8;
    $scope.nrOfFonts = 5;
    $scope.fontbys = ["word", "glyph", "paragraph"];
    $scope.filterOptions = {
        filter : "",
        strict : 1,
        selectedFontby : $scope.fontbys[0]
    };

    $scope.$watch("selectedSpecimen | specimenFilter:filterOptions:data.sequences:data.families:specimenPanel", function(newVal) {
        $scope.filteredGlyphs = newVal;
        setTimeout(function() {
             manageSpaces();
        }, 500);
    }, true);
    
    $scope.$watch("fontSize", function(newVal) {
        setTimeout(function() {
             manageSpaces();
        }, 500);
    }, true);

    function manageSpaces() {
        var spaces = $(".space-character");
        var x = 0;
        var prev_x = 0;
        var prev_space = false;
        
        $(spaces).css({
            // width: auto when the master will have a space character
            "width": "40px",
            "clear": "none"
        }); 
        var brokenEnd = false;
        var startPosition = 16;
        $("#non-glyph-range li").each(function(){
            if ($(this).position().left == startPosition){                
                if ($(this).hasClass("space-character")) {
                    $(this).css({
                        "width": "0",
                        "clear": "both"
                    }); 
                }
                if (brokenEnd && !$(this).hasClass("space-character")&& !$(this).hasClass("line-break") && !$(this).hasClass("paragraph-break")) {
                    $(prev_space).css({
                        "width": "0",
                        "clear": "both"
                    });
                }
            }
            if ($(this).hasClass("space-character")) {
                prev_space = this;
                brokenEnd = false;
            } else if ($(this).hasClass("line-break") || $(this).hasClass("paragraph-break")) {
                brokenEnd = false;
            } else {
                brokenEnd = true;
            }
        });
    }

    /***************** setting the edit mode of glyphs *****************/

    $scope.selectGlyph = function(sequenceId, masterId, glyphName) {
        angular.forEach($scope.data.sequences, function(sequence) {
            angular.forEach(sequence.masters, function(master) {
                if(master.type == "redpill" && master.edit) {
                    angular.forEach(master.glyphs, function(glyph) {
                        if (glyph.value == glyphName && sequence.id == sequenceId && master.id == masterId) {
                            glyph.edit = true;
                        } else {
                            glyph.edit = false;
                        }
                    }); 
                }
            });
        });
        $scope.data.updateSelectionParameters();
    };

    $scope.toggleGlyph = function(sequenceId, masterId, glyphName) {
        angular.forEach($scope.data.sequences, function(sequence) {
            angular.forEach(sequence.masters, function(master) {
                if(master.type == "redpill" && master.edit) {
                    angular.forEach(master.glyphs, function(glyph) {
                        if (glyph.value == glyphName && sequence.id == sequenceId && master.id == masterId) {
                            glyph.edit = !glyph.edit;
                        }
                    }); 
                }
            });
        });
    };

    $scope.selectSet = function(set) {
        angular.forEach($scope.data.sequences, function(sequence) {
            angular.forEach(sequence.masters, function(master) {
                if(master.type == "redpill" && master.edit) {
                    angular.forEach(master.glyphs, function(glyph) {
                        var isinset = false;
                        for (var m = 0; m < set.length; m++) {
                            if (glyph.value == set[m].glyph && sequence.id == set[m].sequence && master.id == set[m].master) {
                                isinset = true;
                            }
                        } 
                        // could gain speed here, by removing out of set
                        if (isinset) {
                            glyph.edit = true;
                        } else {
                            glyph.edit = false;
                        }
                    }); 
                }
            });
        });
    };

    $scope.toggleSet = function(set) {
        angular.forEach($scope.data.sequences, function(sequence) {
            angular.forEach(sequence.masters, function(master) {
                if(master.type == "redpill" && master.edit) {
                    angular.forEach(master.glyphs, function(glyph) {
                        var isinset = false;
                        for (var m = 0; m < set.length; m++) {
                            if (glyph.value == set[m].glyph && sequence.id == set[m].sequence && master.id == set[m].master) {
                                isinset = true;
                            }
                        } 
                        // could gain speed here, by removing out of set
                        if (isinset) {
                            glyph.edit = !glyph.edit;
                        }
                    }); 
                }
            });
        });
    };

    $scope.deselectAll = function() {
        angular.forEach($scope.data.sequences, function(sequence) {
            angular.forEach(sequence.masters, function(master) {
                if(master.type == "redpill" && master.edit) {
                    angular.forEach(master.glyphs, function(glyph) {
                        glyph.edit = false;
                    }); 
                }
            });
        });
        $scope.data.updateSelectionParameters();
    };

    // find out if the glyph edit is true
    $scope.askIfEditGlyph = function(glyphName, masterId, sequenceId) {
        var edit = false;
        angular.forEach($scope.data.sequences, function(sequence) {
            if (sequence.id == sequenceId) {
                angular.forEach(sequence.masters, function(master) {
                    if(master.id == masterId && master.edit[0]) {
                        angular.forEach(master.glyphs, function(glyph) {
                            if(glyph.value == glyphName) {
                                if (glyph.edit) {
                                    edit = true;
                                }
                            }    
                        }); 
                    }
                });
            }
        });
        return edit;
    };



}]);
