define([
    'jquery'
  , 'metapolator/ui/metapolator/services/selection'
], function(
    $
  , selection
) {
    'use strict';
    function SpecimenFieldController($scope, metapolatorModel) {
        this.$scope = $scope;

        // filter
        $scope.tracker = function(id, glyph) {
            return $scope.getMasterName(glyph) + '-' + glyph.name + '-' + id;
        };

        var specimenbreak = {
            name: '*specimenbreak',
            type: 'fake'
        }, linebreak = {
            name : '*n',
            type: 'fake'
        }, paragraphbreak = {
            name : '*p',
            type: 'fake'
        };

        $scope.getMasterName = function(glyph) {
            if(glyph.type === 'fake') {
                return 'fake';
            } else {
                return glyph.getMasterName();
            }

        };

        $scope.filteredGlyphs = function() {
            // building the filterd string, add a glyphid for the track by at the ng-repeat
            // we can't use track by $index, otherwise some ui changes aren't picked up by angular
            // like adding and removing classes, and especially the append svg
            var masterArray = $scope.selectedMasters()
              , glyphsOut = $scope.glyphsOut()
              , fontBy = $scope.model.mixer.fontBy
              , filtered = [];
            if (masterArray.length === 0) {
                filtered = [];
            } else {
                  var counter = 0
                  , glyphContainer
                  , glyph;
                for (var q = 0, ql = masterArray.length; q < ql; q++) {
                    // repeating for the number of master with display true. every glyph of this loop starts with a new master (masterId)
                    var masterId = q;
                    for (var i = 0, il = glyphsOut.length; i < il; i++) {
                        var glyphName = glyphsOut[i]
                          , master = masterArray[masterId];
                        if (glyphName === '*p') {
                            glyph = paragraphbreak;
                        } else if (glyphName === '*n') {
                            glyph = linebreak;
                        } else if (glyphName === '*specimenbreak') {
                            glyph = specimenbreak;
                        } else {
                            glyph = getGlyph(master, glyphName);
                        }
                        if (glyph) {
                            filtered.push(glyph);
                        }
                        counter++;
                        if ((fontBy === 'Glyph') || (fontBy === 'Word' && glyphName === 'space') || (fontBy === 'Specimen' && i === (glyphsOut.length - 1))) {
                            masterId++;
                        }
                        if (masterId === ql) {
                            masterId = 0;
                        }
                    }
                    // specimen break after each loop
                    if (q < masterArray.length - 1) {
                        filtered.push(specimenbreak);
                    }
                }
                startTimer();
            }
            return filtered;
        };

        function createGlyphId(masterName, glyphName, counter) {
            return masterName + '-' + glyphName + '-' + counter;
        }


        $scope.selectedMasters = function() {
            var selectedMasters = [];
            for (var i = 0, il = $scope.model.sequences.length; i < il; i++) {
                var sequence = $scope.model.sequences[i];
                for (var j = 0, jl = sequence.children.length; j < jl; j++) {
                    var master = sequence.children[j];
                    if (($scope.model.type === 'master' && master.edit) ||
                        ($scope.model.type === 'instance' && master === metapolatorModel.currentInstance) || master.display) {
                        selectedMasters.push(master);
                    }
                }
            }
            return selectedMasters;
        };

        $scope.glyphsOut = function() {
            var filter = $scope.model.mixer.filter
              , strict = $scope.model.mixer.strict;
            if (filter.length === 0) {
                // no filter? In === Out
                return $scope.glyphsIn();
            } else {
                if (strict === 0) {
                    return strictZero();
                } else if (strict === 1) {
                    return strictOne();
                } else if (strict === 2) {
                    return strictTwo();
                }
            }
        };

        $scope.glyphsIn = function() {
            var stringIn = $scope.model.mixer.specimenSample.text;
            if (stringIn.length > 0) {
                return stringToGlyphs(stringIn, false, true);
            } else {
                return [];
            }
        };

        function strictZero() {
            // if strict is 0, glyphs from the filter are inserted in stringIn
            var filter = $scope.model.mixer.filter
                , glyphsIn = $scope.glyphsIn()
                , pushedFilterGlyph = 0
                , glyphsOut = []
                , filterGlyphs = stringToGlyphs(filter, false, true)
                , insertionInterval = Math.sqrt(2 * glyphsIn.length / filter.length)
                , insertionCounter = 0.5;
            for (var i = 0, l = glyphsIn.length; i < l; i++) {
                glyphsOut.push(glyphsIn[i]);
                var thisPosition = Math.floor(insertionCounter * insertionInterval);
                if (thisPosition === i) {
                    // insert glyph from filter
                    glyphsOut.push(filterGlyphs[pushedFilterGlyph]);
                    pushedFilterGlyph++;
                    if (pushedFilterGlyph === filterGlyphs.length) {
                        pushedFilterGlyph = 0;
                    }
                    insertionCounter++;
                }
            }
            return glyphsOut;
        }

        function strictOne() {
            // if strict is 1, glyphs from the filter replace glyphs in stringIn
            var filter = $scope.model.mixer.filter
                , glyphsIn = $scope.glyphsIn()
                , pushedFilterGlyph = 0
                , glyphsOut = []
                , filterGlyphs = stringToGlyphs(filter, false, true)
                , withoutSpaces_i = 0
                , insertionCounter = 1;
            for (var i = 0, l = glyphsIn.length; i < l; i++) {
                if (!isSpaceGlyph(glyphsIn[i])) {
                    if (withoutSpaces_i === insertionCounter) {
                        glyphsOut.push(filterGlyphs[pushedFilterGlyph]);
                        insertionCounter += 2;
                        pushedFilterGlyph++;
                        if (pushedFilterGlyph === filterGlyphs.length) {
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
        }

        function strictTwo() {
            // if strict is 2, the glyphsOut is totally based on the filter
            var filter = $scope.model.mixer.filter
              , filterGlyphs = stringToGlyphs(filter, true, false)
              , glyphsOut = [];
            if (filterGlyphs.length === 1) {
                glyphsOut.push(filterGlyphs[0]);
            } else {
                for (var i = 0, l = filterGlyphs.length; i < l; i++) {
                    for (var j = i; j < l; j++) {
                        if (i === j) {
                            if (i === 0 || i === (filterGlyphs.length - 1)) {
                                glyphsOut.push(filterGlyphs[i], filterGlyphs[i]);
                            } else {
                                glyphsOut.push('space', filterGlyphs[i], filterGlyphs[i]);
                            }
                        } else if ((j - i) % 2 === 0) {
                            glyphsOut.push('space', filterGlyphs[i], filterGlyphs[j], filterGlyphs[i]);
                        } else {
                            glyphsOut.push(filterGlyphs[j], filterGlyphs[i]);
                        }
                    }
                }
            }
            return glyphsOut;
        }

        function stringToGlyphs(string, unique, includeSpaces) {
            var glyphs = []
              , foundEnd;
            for (var i = 0, l = string.length; i < l; i++) {
                var glyph = string[i]
                  , substitutePosition = substitute(glyph);
                // detecting space, linebreak or paragraph
                if (glyph === ' ') {
                    glyph = 'space';
                } else if (glyph === '*' && (string[i + 1] === 'n' || string[i + 1] === 'p')) {
                    glyph = '*' + string[i + 1];
                    i++;
                } else if (glyph === '<') {
                    // detecting foreign glyph
                    glyph = '';
                    foundEnd = false;
                    for (var q = 1; q < 10; q++) {
                        if (!foundEnd) {
                            if (string[i + q] != '>') {
                                glyph += string[i + q];
                            } else {
                                foundEnd = true;
                            }
                        }
                    }
                    if (!foundEnd) {
                        // just a normal '<'
                        glyph = '<';
                    } else {
                        i = i + glyph.length + 1;
                    }
                } else if (substitutePosition > -1) {
                    glyph = fontMapping[substitutePosition].glyphName;
                }
                if (unique) {
                    // unique is set for the filter
                    if (glyphs.indexOf(glyph) < 0 || glyph === '*n' || glyph === '*p') {
                        if (glyph != 'space' || includeSpaces) {
                            glyphs.push(glyph);
                        }
                    }
                } else {
                    if (glyph !== 'space' || includeSpaces) {
                        glyphs.push(glyph);
                    }
                }
            }
            return glyphs;
        }

        function getGlyph(master, glyphName) {
            for (var j = master.children.length - 1; j >= 0; j--) {
                var thisGlyph = master.children[j];
                if (thisGlyph.name === glyphName) {
                    return thisGlyph;
                }
            }
            return false;
        }

        function isSpaceGlyph(glyph) {
            if (glyph === 'space' || glyph === '*n' || glyph === '*p') {
                return true;
            } else {
                return false;
            }
        }

        function substitute(glyph) {
            // check if glyph is a-z A-Z
            if (/^[a-zA-Z]*$/.test(glyph) || glyph === ' ') {
                return -1;
            } else {
                // we should add var pos = -2. So -1 is regular alphabetic, -2 is unknown
                var pos = -1;
                var preUnicode = glyph.charCodeAt(0).toString(16).toUpperCase();
                var n = 4 - preUnicode.length;
                var pre = '';
                for (var q = 0; q < n; q++) {
                    pre += '0';
                }
                var unicode = pre + preUnicode;
                /*
                 for ( i = 0; i < fontMapping.length; i++) {
                 if (unicode === fontMapping[i].unicode) {
                 pos = i;
                 break;
                 }
                 }
                 */
                return pos;
            }
        }


        // glyph clicking
        $scope.glyphClick = function(event, glyph) {
            if ($scope.model.rubberband && glyph.level) { // the second condition excludes fake glyphs like paragraph break, which hasnt a real model
                if (event.metaKey || event.shiftKey || event.altKey) {
                   toggleGlyph(glyph);
                } else {
                    selectGlyph(glyph);
                }
                selection.updateSelection('glyph');
                //metapolatorModel.masterPanel.updateSelections('glyph');
            }
        };

        function toggleGlyph(glyph) {
            if (glyph.edit) {
                glyph.edit = false;
            } else {
                glyph.edit = false;
            }
        }

        function selectGlyph(glyph) {
            glyph.edit = true;
        }

        // spaces manager
        var manageSpacesTimer;
        /*
        $scope.$watch('model.sizes.fontSize', function() {
            startTimer();
        }, true);
        */

        function startTimer () {
            clearTimeout(manageSpacesTimer);
            manageSpacesTimer = setTimeout(function() {
                manageSpaces();
            }, 50); 
        }
        
        var startPosition = null;
        
        function manageSpaces() {
            if (!startPosition) {
                startPosition = parseInt($('mtk-specimen-field > .specimen-content').css('padding-left'));
            }
            var spaces = $('.space-character'),
                prevSpace = false;
    
            $(spaces).css({
                'width' : 'auto',
                'clear' : 'none'
            });
            var brokenEnd = false;
            $('mtk-specimen-field li').each(function() {
                if ($(this).position().left === startPosition) {
                    // prevent space at line start
                    if ($(this).hasClass('space-character')) {
                        $(this).css({
                            'width' : '0',
                            'clear' : 'both'
                        });
                    }
                    if (brokenEnd && !$(this).hasClass('space-character') && !$(this).hasClass('line-break') && !$(this).hasClass('paragraph-break') && !$(this).hasClass('specimen-break')) {
                        $(prevSpace).css({
                            'width' : '0',
                            'clear' : 'both'
                        });
                    }
                }
                if ($(this).hasClass('space-character')) {
                    prevSpace = this;
                    brokenEnd = false;
                } else if ($(this).hasClass('line-break') || $(this).hasClass('paragraph-break') || $(this).hasClass('specimen-break')) {
                    brokenEnd = false;
                } else {
                    brokenEnd = true;
                }
            });
        }
    }


    SpecimenFieldController.$inject = ['$scope', 'metapolatorModel'];
    var _p = SpecimenFieldController.prototype;

    return SpecimenFieldController;
});
