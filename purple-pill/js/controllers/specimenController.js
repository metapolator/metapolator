app.controller('specimenController', ['$scope', '$sce', 'sharedScope', '$http',
function($scope, $sce, sharedScope, $http) {
    $scope.data = sharedScope.data;

    $scope.data.renderGlyphs = function(masterName, glyphName) {
        return $scope.data.stateful.glyphRendererAPI.get(masterName, glyphName);
    };

    $scope.sortableOptions = {
        helper : 'clone'
    };

    /*****************filter parameters *****************/

    // specimenPanel tells the filter to use masters or instances
    $scope.specimenPanel

    // Preset Specimen Texts
    // NOTE: This is an array of arrays, to create the specimen dropdown picker's separators
    $scope.specimen = [[{
        name : "[Enter your own text]",
        text : "Metapolator"
    }], [{
        name : "3 Pangrams",
        text : "Quick wafting zephyrs vex bold Jim. The quick brown fox jumps over the lazy dog. Bright vixens jump dozy fowl quack."
    }, {
        name : "Capitalised Pan",
        text : "Aladine Biopsia Cumbia Diego Espejo Flecha Gaveta Hockey Index Jaque Kurdos Ludwing Motivo Nylon Ortiz Profit Quiff Roving Sioux Tizzy Unwary Vertex Wrathy Xammar Yachts Zaque"
    }, {
        name : "Ruder",
        text : "vertrag crainte screw, bibel malhabile modo. verwalter croyant science, biegen peuple punibile. verzicht fratricide sketchy, blind qualifier quindi. vorrede frivolité story, damals quelle dinamica. yankee instruction take, china quelque analiso. zwetschge lyre treaty, schaden salomon macchina. zypresse navette tricycle, schein sellier secondo. fraktur nocturne typograph, lager sommier singolo. kraft pervertir vanity, legion unique possibile. raffeln presto victory, mime unanime unico. reaktion prévoyant vivacity, mohn usuel legge. rekord priorité wayward, nagel abonner unione. revolte proscrire efficiency, puder agir punizione. tritt raviver without, quälen aiglon dunque. trotzkopf tactilité through, huldigen allégir quando. tyrann arrêt known, geduld alliance uomini."
    }], [{
        name : "Aa12%@…",
        text : "AaBbCcDdEeFfGgHhIiJjKkLlMmNnOoPpQqRrSsTtUuVvWwXxYyZz*n1234567890*n( { [ . , ¡ ! ¿ ? * ' ‘ ’ \" \“ \” ] } ) $ € £ % @ & ¶ § ¢ † ‡"
    }, {
        name : "Number Grid",
        text : "12345678901*n23456789012*n34567890123*n45678901234*n56789012345*n67890123456*n78901234567*n89012345678*n90123456789*n01234567890"
    }], [{
        name : "Paragraph",
        text : "Grumpy wizards make toxic brew for the evil Queen and Jack. One morning when Gregor Samsa woke from troubled dreams, he found himself transformed in his bed into a horrible vermin.*pHe lay on his armourlike back and if he lifted his head a little, he could see his brown belly slightly domed and divided by arches into stiff sections.*pThe bedding was hardly able to cover it and seemed ready to slide off any moment. His many legs pitifully thin compared with the size of the rest of him, waved about helplessly as he looked."
    }]];
    
    // only for the masters specimen panel
    $scope.addGlyphRange = function() {
        var glyphRange = [{
            name : "Glyph Range"
        }];
        $scope.specimen.push(glyphRange);
    };

    // load font mapping
    $scope.loadMapping = function() {
        $http.get("templates/mapping.csv").success(function(data) {
            $scope.data.mapping = processCSV(data);
        });
    };

    function processCSV(data) {
        var cols = 3;
        var lines = data.split(/\r\n|\n/);
        var output = [];
        for (var i = 0; i < lines.length; i++) {
            var thisSet = lines[i].split(";");
            var thisGlyph = {
                unicode : thisSet[0],
                glyphName : thisSet[1],
                description : thisSet[2],
            };
            output.push(thisGlyph);
        }
        return output;
    }

    // specimen toolbar initial settings
    $scope.selectedSpecimen = $scope.specimen[0][0];
    $scope.fontSize = 144;
    $scope.lineHeight = 0;
    $scope.fontbys = ["Glyph", "Word", "Specimen"];
    $scope.filterOptions = {
        filter : "",
        strict : 1,
        selectedFontby : $scope.fontbys[2]
    };
    
    $scope.selectSpecimen = function(specimen) {
        //console.clear();
        //console.log("change specimen:" + new Date().getTime());
        $scope.selectedSpecimen = specimen;
        $scope.data.localmenu.specimen1 = false;
        $scope.data.localmenu.specimen2 = false;
    };

    $scope.selectFontby = function(fontby) {
        $scope.filterOptions.selectedFontby = fontby;
        $scope.data.localmenu.fontby1 = false;
        $scope.data.localmenu.fontby2 = false;
    };
    
    // size tools
    var manageSpacesTimer;
    var sizeCounter = 0;

    $scope.$watch("selectedSpecimen | specimenFilter:filterOptions:data.sequences:data.families:specimenPanel:data.currentInstance:data.mapping", function(newVal) {
        //console.log("detected specimen change:" + new Date().getTime());
        $scope.filteredGlyphs = newVal;
        clearTimeout(manageSpacesTimer);
        manageSpacesTimer = setTimeout(function() {
            manageSpaces();
        }, 10);
    }, true);

    $scope.$watch("fontSize", function(newVal) {
        sizeCounter++;
        $scope.updateLineHeight();
        // make with auto for each resizing
        if (sizeCounter > 2) {
            var ul = document.getElementById("specimen-ul-" + $scope.data.view.viewState);
            var children = ul.children;
            for (var i = 0, l = children.length; i < l; i++) {
                children[i].firstElementChild.style.width = "auto";
            }
        }
        clearTimeout(manageSpacesTimer);
        manageSpacesTimer = setTimeout(function() {
            manageSpaces();
        }, 10);
    }, true);

    var startPosition = parseInt($("#specimen-content").css("padding-left"));

    function manageSpaces() {
        //console.log("start wordwrapping:" + new Date().getTime());
        var spaces = $(".space-character");
        var x = 0;
        var prev_x = 0;
        var prev_space = false;

        $(spaces).css({
            "width" : "auto",
            "clear" : "none"
        });
        var brokenEnd = false;
        $("#non-glyph-range li").each(function() {
            if ($(this).position().left == startPosition) {
                // prevent space at line start
                if ($(this).hasClass("space-character")) {
                    $(this).css({
                        "width" : "0",
                        "clear" : "both"
                    });
                }
                if (brokenEnd && !$(this).hasClass("space-character") && !$(this).hasClass("line-break") && !$(this).hasClass("paragraph-break") && !$(this).hasClass("specimen-break")) {
                    $(prev_space).css({
                        "width" : "0",
                        "clear" : "both"
                    });
                }
            }
            if ($(this).hasClass("space-character")) {
                prev_space = this;
                brokenEnd = false;
            } else if ($(this).hasClass("line-break") || $(this).hasClass("paragraph-break") || $(this).hasClass("specimen-break")) {
                brokenEnd = false;
            } else {
                brokenEnd = true;
            }
        });
        //console.log("end word wrapping:" + new Date().getTime());
    }
    
    // lineheight tools
    $scope.lineHeightOptions = [{
        name: "Tight",
        img: "tight.png",
        title: "Tight: 1.2@10pt, 1@24, 0.8@300﻿"
    }, {
        name: "Normal",
        img: "normal.png",
        title: "Normal: 1.5@10pt, 1.2@24, 0.9@300"
    }, {
        name: "Loose",
        img: "loose.png",
        title: "Loose: 2@10pt, 1.5@24, 1.1@300﻿"
    }];
    $scope.lineHeightOptionCustom = {
        name: "custom",
        title: "xxx﻿"
    };
    $scope.lineHeightSetting = $scope.lineHeightOptions[1];
    $scope.data.customLineHeight = parseFloat(1).toFixed(2); // need to keep this global, otherwise the input can't reach it, because ng-if makes a child scope
    
    $scope.changeLineHeightSetting = function (option) {
        $scope.lineHeightSetting = option;
        $scope.updateLineHeight();
        $scope.data.localmenu.lineheight = false;
    };

    $scope.updateLineHeight = function() {
        if ($scope.lineHeightSetting.name == "Normal") {
            $scope.lineHeight = 1 / (0.1 * $scope.fontSize + 0.58) + 0.8673;
        } else if ($scope.lineHeightSetting.name == "Tight") {
            $scope.lineHeight = 1 / (0.1525 * $scope.fontSize + 0.85) + 0.7785;
        } else if ($scope.lineHeightSetting.name == "Loose") {
            $scope.lineHeight = 1 / (0.087 * $scope.fontSize + 0.195) + 1.062;
        }
    };
    
    $scope.updateLineHeightCustom = function(keyEvent) {
        if (keyEvent == "blur" || keyEvent.keyCode == 13) {
            $scope.data.customLineHeight = parseFloat($scope.data.customLineHeight).toFixed(2);
            $scope.lineHeight = $scope.data.customLineHeight;
        }
        $scope.data.localmenu.lineheight = false;
    };

    $scope.getLineHeight = function(glyphName) {
        var lineHeight = $scope.lineHeight * $scope.fontSize;
        if (glyphName == "*specimenbreak") {
            lineHeight /= 2;
        }
        return lineHeight;
    };
    
    
    



    /***************** setting the edit mode of glyphs *****************/

    $scope.selectGlyph = function(sequenceId, masterId, glyphName) {
        angular.forEach($scope.data.sequences, function(sequence) {
            angular.forEach(sequence.masters, function(master) {
                if (master.edit[0]) {
                    angular.forEach(master.children, function(glyph) {
                        if (glyph.name == glyphName && sequence.id == sequenceId && master.id == masterId) {
                            glyph.edit = true;
                        } else {
                            glyph.edit = false;
                        }
                    });
                }
            });
        });
        $scope.data.updateSelectionParameters(true);
    };

    $scope.toggleGlyph = function(sequenceId, masterId, glyphName) {
        angular.forEach($scope.data.sequences, function(sequence) {
            angular.forEach(sequence.masters, function(master) {
                if (master.edit[0]) {
                    angular.forEach(master.children, function(glyph) {
                        if (glyph.name == glyphName && sequence.id == sequenceId && master.id == masterId) {
                            glyph.edit = !glyph.edit;
                        }
                    });
                }
            });
        });
        $scope.data.updateSelectionParameters(true);
    };

    $scope.selectSet = function(set) {
        angular.forEach($scope.data.sequences, function(sequence) {
            angular.forEach(sequence.masters, function(master) {
                if (master.edit[0]) {
                    angular.forEach(master.children, function(glyph) {
                        var isinset = false;
                        for (var m = 0; m < set.length; m++) {
                            if (glyph.name == set[m].glyph && sequence.id == set[m].sequence && master.id == set[m].master) {
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
        $scope.data.updateSelectionParameters(true);
    };

    $scope.toggleSet = function(set) {
        angular.forEach($scope.data.sequences, function(sequence) {
            angular.forEach(sequence.masters, function(master) {
                if (master.edit[0]) {
                    angular.forEach(master.children, function(glyph) {
                        var isinset = false;
                        for (var m = 0; m < set.length; m++) {
                            if (glyph.name == set[m].glyph && sequence.id == set[m].sequence && master.id == set[m].master) {
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
        $scope.data.updateSelectionParameters(true);
    };

    $scope.deselectAll = function() {
        angular.forEach($scope.data.sequences, function(sequence) {
            angular.forEach(sequence.masters, function(master) {
                if (master.edit[$scope.data.view.viewState]) {
                    angular.forEach(master.children, function(glyph) {
                        glyph.edit = false;
                    });
                }
            });
        });
        $scope.data.updateSelectionParameters(true);
    };

    // find out if the glyph edit is true
    $scope.askIfEditGlyph = function(glyphName, masterId, sequenceId) {
        var edit = false;
        angular.forEach($scope.data.sequences, function(sequence) {
            if (sequence.id == sequenceId) {
                angular.forEach(sequence.masters, function(master) {
                    if (master.id == masterId && master.edit[0]) {
                        angular.forEach(master.children, function(glyph) {
                            if (glyph.name == glyphName) {
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

    /***************** - *****************/

    $scope.data.fakeSVG = {
        M : '<svg viewBox="0 0 909 1200"><g id="mp_glyph_1414" transform="matrix(1,0,0,-1,0,900)"><path d="M795,0 C829.333,0 863.667,0 898,0 C898,6.6666 898,13.3334 898,20 C863.667,20 829.333,20 795,20 C795,13.3334 795,6.6666 795,0 z M795,20 C760.667,20 726.333,20 692,20 C692,13.3334 692,6.6666 692,0 C726.333,-4.20458e-15 760.667,4.20458e-15 795,0 C795,6.6666 795,13.3334 795,20 z M106,20 C71.667,20 37.333,20 3,20 C3,13.3334 3,6.6666 3,0 C37.333,-4.20458e-15 71.667,4.20458e-15 106,0 C106,6.6666 106,13.3334 106,20 z M165,722 C130.667,722 96.333,722 62,722 C62,715.333 62,708.667 62,702 C96.333,702 130.667,702 165,702 C165,708.667 165,715.333 165,722 z M734,702 C768.333,702 802.667,702 837,702 C837,708.667 837,715.333 837,722 C802.667,722 768.333,722 734,722 C734,715.333 734,708.667 734,702 z M106,0 C140.333,0 174.667,0 209,0 C209,6.6666 209,13.3334 209,20 C174.667,20 140.333,20 106,20 C106,13.3334 106,6.6666 106,0 z M805,0 C784.334,240.664 763.666,481.336 743,722 C736.333,722 729.667,722 723,722 C743,481.336 763,240.664 783,1.34711e-15 C790.333,-4.49019e-16 797.667,0 805,0 z M116,0 C135,240.664 154,481.336 173,722 C166.333,722 159.667,722 153,722 C133.334,481.336 113.666,240.664 94,1.34711e-15 C101.333,-4.49019e-16 108.667,0 116,0 z M457,0 C363.001,240.664 268.999,481.336 175,722 C168.333,722 161.667,722 155,722 C248.332,481.336 341.668,240.664 435,1.34711e-15 C442.333,-4.49019e-16 449.667,0 457,0 z M466,0 C557.666,240.664 649.334,481.336 741,722 C734.333,722 727.667,722 721,722 C628.334,481.336 535.666,240.664 443,1.40834e-15 C450.667,-4.69429e-16 458.333,0 466,0 z"></g></svg>',
        e : '<svg viewBox="0 0 581 1200"><g id="mp_glyph_1062" transform="matrix(1,0,0,-1,0,900)"><path d="M103,274 C233.332,274 363.668,274 494,274 C494.667,274 495.333,274 496,274 C496,274.667 496,275.333 496,276 C496,285 496,294 496,303 C496,444 431,533 299,533 C157,533 91,434 91,281 C91,111 166,0 324,0 C396,0 443,22 494,74 C489.333,78.9999 484.667,84.0001 480,89 C433,42 390,20 324,20 C180,20 113,125 113,281 C113,420 170,513 298,513 C417,513 475,432 475,305 C475,295.333 475,285.667 475,276 C478.333,279 481.667,282 485,285 C488,288 491,291 494,294 C363.668,294 233.332,294 103,294 C103,287.333 103,280.667 103,274 z"></g></svg>',
        t : '<svg viewBox="0 0 464 1200"><g id="mp_glyph_1323" transform="matrix(1,0,0,-1,0,900)"><path d="M43,477 C43,477 434,477 434,477 C434,483.667 434,490.333 434,497 C434,497 43,497 43,497 C43,490.333 43,483.667 43,477 z M410,45 C377,27 350,20 312,20 C239,20 208,65 208,144 C208,144 208,651 208,651 C200.667,646.667 193.333,642.333 186,638 C186,638 186,143 186,143 C186,53 227,1.01646e-14 310,0 C352,-5.14352e-15 381,9 419,28 C416,33.6666 413,39.3334 410,45 z"></g></svg>',
        a : '<svg viewBox="0 0 514 1200"><g id="mp_glyph_1005" transform="matrix(1,0,0,-1,0,900)"><path d="M64,464 C64,436.334 64,408.666 64,381 C70.6666,381 77.3334,381 84,381 C84,408.666 84,436.334 84,464 C77.3334,464 70.6666,464 64,464 z M421,0 C421,129.999 421,260.001 421,390 C421,496 360,533 255,533 C171,533 112,502 64,464 C67.6666,458.667 71.3334,453.333 75,448 C120,481 174,513 252,513 C346,513 399,480 399,384 C399,256.001 399,127.999 399,1.34711e-15 C406.333,-4.49019e-16 413.667,0 421,0 z M412,0 C443,0 474,0 505,0 C505,6.6666 505,13.3334 505,20 C474,20 443,20 412,20 C412,13.3334 412,6.6666 412,0 z M409,319 C329,308 281,303 201,292 C108,279 48,241 48,152 C48,56 101,1.77636e-15 196,1.77636e-15 C305,1.77636e-15 351,62 415,153 C411.333,156.667 407.667,160.333 404,164 C342,82 301,20 200,20 C116,20 70,69 70,154 C70,230 121,263 200,274 C281,285 329,291 410,302 C409.667,307.667 409.333,313.333 409,319 z"></g></svg>',
        p : '<svg viewBox="0 0 627 1200"><g id="mp_glyph_1219" transform="matrix(1,0,0,-1,0,900)"><path d="M127,-280 C92.667,-280 58.333,-280 24,-280 C24,-286.667 24,-293.333 24,-300 C58.333,-300 92.667,-300 127,-300 C127,-293.333 127,-286.667 127,-280 z M127,-300 C158,-300 189,-300 220,-300 C220,-293.333 220,-286.667 220,-280 C189,-280 158,-280 127,-280 C127,-286.667 127,-293.333 127,-300 z M128,533 C93.667,533 59.333,533 25,533 C25,526.333 25,519.667 25,513 C59.333,513 93.667,513 128,513 C128,519.667 128,526.333 128,533 z M132,410 C171,459 248,513 340,513 C470,513 536,404 536,263 C539,124 468,19 339,20 C255,20 192,47 134,108 C129.333,104.333 124.667,100.667 120,97 C180,29 248,1.11443e-14 339,0 C480,-1.72675e-14 558,114 558,264 C558,416 482,533 341,533 C244,533 163,477 121,424 C124.667,419.333 128.333,414.667 132,410 z M138,-300 C138,-22.3361 138,255.336 138,533 C130.667,533 123.333,533 116,533 C116,255.336 116,-22.3361 116,-300 C123.333,-300 130.667,-300 138,-300 z"></g></svg>',
        o : '<svg viewBox="0 0 644 1200"><g id="mp_glyph_1197" transform="matrix(1,0,0,-1,0,900)"><path d="M110,268 C110,122 177,20 315,20 C451,20 519,120.408 519,266 C519,412.407 449,513 311,513 C177,513 110,414 110,268 C102.667,268 95.3333,268 88,268 C88,424 164,533 312,533 C463,533 541,424.407 541,266 C541,107.404 464,0 314,0 C164,0 88,109 88,268 C95.3333,268 102.667,268 110,268 z"></g></svg>',
        l : '<svg viewBox="0 0 222 1200"><g id="mp_glyph_1160" transform="matrix(1,0,0,-1,0,900)"><path d="M107,20 C72.667,20 38.333,20 4,20 C4,13.3334 4,6.6666 4,0 C38.333,-4.20458e-15 72.667,4.20458e-15 107,0 C107,6.6666 107,13.3334 107,20 z M109,800 C74.667,800 40.333,800 6,800 C6,793.333 6,786.667 6,780 C40.333,780 74.667,780 109,780 C109,786.667 109,793.333 109,800 z M107,0 C141.333,0 175.667,0 210,0 C210,6.6666 210,13.3334 210,20 C175.667,20 141.333,20 107,20 C107,13.3334 107,6.6666 107,0 z M117,0 C117,266.664 117,533.336 117,800 C109.667,800 102.333,800 95,800 C95,533.336 95,266.664 95,1.34711e-15 C102.333,-4.49019e-16 109.667,0 117,0 z"></g></svg>',
        r : '<svg viewBox="0 0 405 1200"><g id="mp_glyph_1277" transform="matrix(1,0,0,-1,0,900)"><path d="M129,0 C160,0 191,0 222,0 C222,6.6666 222,13.3334 222,20 C191,20 160,20 129,20 C129,13.3334 129,6.6666 129,0 z M129,20 C94.667,20 60.333,20 26,20 C26,13.3334 26,6.6666 26,0 C60.333,-4.20458e-15 94.667,4.20458e-15 129,0 C129,6.6666 129,13.3334 129,20 z M128,533 C93.667,533 59.333,533 25,533 C25,526.333 25,519.667 25,513 C59.333,513 93.667,513 128,513 C128,519.667 128,526.333 128,533 z M140,0 C140,177.665 140,355.335 140,533 C132.667,533 125.333,533 118,533 C118,355.335 118,177.665 118,1.34711e-15 C125.333,-4.49019e-16 132.667,0 140,0 z M134,403 C185,492 274,513 378,513 C378,519.667 378,526.333 378,533 C268,533 173,511 125,415 C128,411 131,407 134,403 z"></g></svg>',
        A : '<svg viewBox="0 0 781 1200"><g id="mp_glyph_1350" transform="matrix(1,0,0,-1,0,900)"><path d="M114,20 C79.667,20 45.333,20 11,20 C11,13.3334 11,6.6666 11,0 C45.333,-4.20458e-15 79.667,4.20458e-15 114,0 C114,6.6666 114,13.3334 114,20 z M114,0 C148.333,0 182.667,0 217,0 C217,6.6666 217,13.3334 217,20 C182.667,20 148.333,20 114,20 C114,13.3334 114,6.6666 114,0 z M661,0 C695.333,0 729.667,0 764,0 C764,6.6666 764,13.3334 764,20 C729.667,20 695.333,20 661,20 C661,13.3334 661,6.6666 661,0 z M661,20 C626.667,20 592.333,20 558,20 C558,13.3334 558,6.6666 558,0 C592.333,-4.20458e-15 626.667,4.20458e-15 661,0 C661,6.6666 661,13.3334 661,20 z M571,276 C454.001,276 336.999,276 220,276 C217,269 214,262 211,255 C333.332,255 455.668,255 578,255 C575.667,262 573.333,269 571,276 z M684,0 C594.001,240.664 503.999,481.336 414,722 C407.333,722 400.667,722 394,722 C482.999,481.336 572.001,240.664 661,1.40834e-15 C668.667,-4.69429e-16 676.333,0 684,0 z M114,0 C213.332,240.664 312.668,481.336 412,722 C405.333,722 398.667,722 392,722 C291.334,481.336 190.666,240.664 90,1.46958e-15 C97.9999,-4.89839e-16 106,0 114,0 z"></g></svg>',
        g : '<svg viewBox="0 0 568 1200"><g id="mp_glyph_1100" transform="matrix(1,0,0,-1,0,900)"><path d="M422,461 C466.666,484.333 511.334,507.667 556,531 C552.333,537.333 548.667,543.667 545,550 C500,525.667 455,501.333 410,477 C414,471.667 418,466.333 422,461 z M115,358 C115,450 184,513 280,513 C375,513 440,453 440,361 C440,271 374,209 278,209 C184,209 115,267 115,358 C107.667,357.667 100.333,357.333 93,357 C93,254 170,189 276,189 C385,189 462,256 462,362 C462,466 387,533 280,533 C170,533 93,464 93,357 C100.333,357.333 107.667,357.667 115,358 z M174,226 C126,200 97,163 97,109 C97,24 179,-5 273,-13 C389,-23 497,-42 497,-145 C497,-247 393.534,-280 275,-280 C163.546,-280 71,-235 71,-135 C71,-64 116,-17 183,11 C179.333,15 175.667,19 172,23 C98,-7 49,-57 49,-136 C49,-248 150,-300 274,-300 C404.922,-300 519,-259 517,-143 C517,-31 403,-4 277,6 C193,12 119,36 119,111 C119,158 143,190 184,214 C180.667,218 177.333,222 174,226 z"></g></svg>',
  };

}]);
