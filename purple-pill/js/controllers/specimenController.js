app.controller('specimenController', ['$scope', '$sce', 'sharedScope',
function($scope, $sce, sharedScope) {
    $scope.data = sharedScope.data;

    /***************** API *****************/

    var globalStateful;
    var globalMastername;

    function initializeInputSliders(container) {
        return ['width ', ' weight '].map(function(labelText) {
            var items = [], item, i;
            item = document.createElement('input');
            item.setAttribute('type', 'range');
            item.setAttribute('min', 0.0);
            item.setAttribute('max', 1.0);
            item.setAttribute('value', 0.5);
            item.setAttribute('step', 0.0001);

            var label = document.createElement('label');
            label.textContent = labelText;
            label.appendChild(item);
            document.getElementById('parameter-slider').appendChild(label);
            return item;
        });
    }

    function onProjectLoaded(stateless, stateful) {
        // stateful has the keys: 'project', 'glyphRendererAPI','controller'
        console.log('project loaded', Object.keys(stateful));

        var masterName = 'interpolated', parameterCollection = stateful.controller.getMasterCPS(false, masterName)
        // NOTE: We must know where the rule is,   it's the third one in
        // this case. Also, the items in a parameterCollection must
        // not all be of type CPS/Rule. There are also @namespace/@import
        // collections and comments.
        , cpsRule = parameterCollection.getItem(2), parameterDict = cpsRule.parameters, inputs = initializeInputSliders(document.body), setParameter = stateless.cpsAPITools.setParameter// shortcut
        ;

        function inputChangeHandler() {
            var x = parseFloat(inputs[0].value), y = parseFloat(inputs[1].value), a = (1 - x) * (1 - y), b = (x) * (1 - y), c = (1 - x) * (y), d = (x) * (y);
            setParameter(parameterDict, 'proportion1', a);
            setParameter(parameterDict, 'proportion2', b);
            setParameter(parameterDict, 'proportion3', c);
            setParameter(parameterDict, 'proportion4', d);
        }


        inputs[0].addEventListener('input', inputChangeHandler);
        inputs[1].addEventListener('input', inputChangeHandler);

        globalStateful = stateful;
        globalMastername = masterName;
    }

    function onMetapolatorReady(stateless) {
        // stateless has the keys 'initProject' and 'cpsAPITools'
        console.log('metapolator is now ready', Object.keys(stateless));
        // The path for a Ajax request on your webserver
        // NOTE: the project is exported with directory listing index.html files
        //       we need that for "static" HTTP servers!
        var projectPath = 'project';
        // returns a promise
        stateless.initProject(projectPath).then(onProjectLoaded.bind(null, stateless));
    }

    if (!window.metapolatorReady) {
        window.metapolatorReady = [];

    }
    window.metapolatorReady.push(onMetapolatorReady);
    // <= could be an array or our api

    /***************** end of API *****************/


    var checker;
    checker = setInterval(function() {
            stateChecker();
    }, 100);
    function stateChecker() {
        if (globalStateful) {
            $scope.specimen[0].text = "metapolator";
            $scope.$apply();
            clearInterval(checker);
        }
    }

    $scope.renderGlyphs = function(glyphName) {
        return globalStateful.glyphRendererAPI.get(globalMastername, glyphName);
    };


    $scope.svgSpecimen = "";
    
    
    /************************************************/

    $scope.sortableOptions = {
        helper : 'clone'
    };

    // specimen panel parameters
    $scope.specimen = [{
        name : "metapolator",
        text : ""
    }, {
        name : "pangram 2",
        text : "Bright vixens jump dozy fowl quack"
    }, {
        name : "pangram 3",
        text : "Quick wafting zephyrs vex bold Jim"
    }, {
        name : "paragraph 1",
        text : "Duis tincidunt nisi id nibh feugiat mattis. Integer augue elit, eleifend eget lorem finibus, placerat scelerisque eros. Curabitur et tortor sapien. Mauris pulvinar efficitur velit. <br>Duis consequat placerat nisl condimentum ullamcorper. Aenean placerat, sapien non egestas sagittis, purus ex pharetra velit, vitae tincidunt lectus tortor vel mi. Praesent sollicitudin maximus orci, quis egestas sapien auctor vel. Aliquam erat volutpat. Interdum et malesuada fames ac ante ipsum primis in faucibus. <br>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque iaculis, purus a posuere iaculis, felis tortor mattis leo, vitae ullamcorper sem ligula in metus. Suspendisse ac tincidunt eros. Sed ac ornare elit. Integer ut lorem sed justo tempor vehicula. Phasellus facilisis justo quis felis faucibus ultrices. Integer pulvinar orci vitae leo accumsan, sit amet tincidunt ligula dapibus. Vestibulum in ligula turpis. "
    }];

    $scope.addGlyphRange = function() {
        $scope.specimen.push({
            name : "glyph range"
        });
    };

    $scope.selectedSpecimen = $scope.specimen[0];
    $scope.fontSize = 120;
    $scope.lineHeight = 0.8;
    $scope.nrOfFonts = 5;
    $scope.fontbys = ["word", "glyph", "paragraph"];
    $scope.filterOptions = {
        filter : "",
        strict : 1,
        selectedFontby : $scope.fontbys[0]
    };

    // setting the edit mode of glyphs
    $scope.selectGlyph = function(sequenceId, masterId, glyph) {
        for (var j = 0; j < $scope.data.sequences.length; j++) {
            for (var k = 0; k < $scope.data.sequences[j].masters.length; k++) {
                for (var l = 0; l < $scope.data.sequences[j].masters[k].glyphs.length; l++) {
                    if ($scope.data.sequences[j].masters[k].glyphs[l].value == glyph && sequenceId == j && masterId == k) {
                        $scope.data.sequences[j].masters[k].glyphs[l].edit = true;
                    } else {
                        $scope.data.sequences[j].masters[k].glyphs[l].edit = false;
                    }
                }
            }
        }
    };

    $scope.toggleGlyph = function(sequenceId, masterId, glyph) {
        for (var j = 0; j < $scope.data.sequences.length; j++) {
            for (var k = 0; k < $scope.data.sequences[j].masters.length; k++) {
                for (var l = 0; l < $scope.data.sequences[j].masters[k].glyphs.length; l++) {
                    if ($scope.data.sequences[j].masters[k].glyphs[l].value == glyph && sequenceId == j && masterId == k) {
                        $scope.data.sequences[j].masters[k].glyphs[l].edit = !$scope.data.sequences[j].masters[k].glyphs[l].edit;
                    }
                }
            }
        }
    };

    $scope.selectSet = function(set) {
        for (var j = 0; j < $scope.data.sequences.length; j++) {
            for (var k = 0; k < $scope.data.sequences[j].masters.length; k++) {
                for (var l = 0; l < $scope.data.sequences[j].masters[k].glyphs.length; l++) {
                    var isinset = false;
                    for (var m = 0; m < set.length; m++) {
                        if ($scope.data.sequences[j].masters[k].glyphs[l].value == set[m].glyph && j == set[m].sequence && k == set[m].master) {
                            isinset = true;
                        }
                    }
                    if (isinset) {
                        $scope.data.sequences[j].masters[k].glyphs[l].edit = true;
                    } else {
                        $scope.data.sequences[j].masters[k].glyphs[l].edit = false;
                    }
                }
            }
        }
    };

    $scope.toggleSet = function(set) {
        for (var j = 0; j < $scope.data.sequences.length; j++) {
            for (var k = 0; k < $scope.data.sequences[j].masters.length; k++) {
                for (var l = 0; l < $scope.data.sequences[j].masters[k].glyphs.length; l++) {
                    var isinset = false;
                    for (var m = 0; m < set.length; m++) {
                        if ($scope.data.sequences[j].masters[k].glyphs[l].value == set[m].glyph && j == set[m].sequence && k == set[m].master) {
                            isinset = true;
                        }
                    }
                    if (isinset) {
                        $scope.data.sequences[j].masters[k].glyphs[l].edit = !$scope.data.sequences[j].masters[k].glyphs[l].edit;
                    }
                }
            }
        }
    };

    $scope.deselectAll = function() {
        for (var j = 0; j < $scope.data.sequences.length; j++) {
            for (var k = 0; k < $scope.data.sequences[j].masters.length; k++) {
                for (var l = 0; l < $scope.data.sequences[j].masters[k].glyphs.length; l++) {
                    $scope.data.sequences[j].masters[k].glyphs[l].edit = false;
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

    $scope.$watch("selectedSpecimen | specimenFilter:filterOptions:data.sequences", function(newVal) {
        $scope.filteredGlyphs = newVal;
    }, true);

}]);
