app.controller('engine', function($scope, sharedScope) {
    $scope.data = sharedScope.data;

    $scope.data.stateful;
    $scope.data.stateless;
    $scope.data.pill = "blue";

    function onProjectLoaded(stateless, stateful) {
        $scope.data.stateful = stateful;
        $scope.data.stateless = stateless;
        // adding initial masters
        var masters = $scope.data.stateful.controller.queryAll("master");
        var masterId = 0;
        for (var i = 0, l = masters.length; i < l; i++) {
            var master = masters[i];
            var masterName = master.id;
            // skip base for the ui
            if (masterName != "base") {
                var glyphs = master.children;
                var glyphs = [];
                // adding glyphs to each master
                for (var j = 0, m = master.children.length; j < m; j++) {
                    var thisGlyph = master.children[j];
                    var strokes = [];
                    // adding strokes to each glyph
                    for (var k = 0, n = thisGlyph.children.length; k < n; k++) {
                        var points = [];
                        var thisStroke = thisGlyph.children[k];
                        // adding points to each stroke
                        for (var l = 0, o = thisStroke.children.length; l < o; l++) {
                            var thisPoint = thisStroke.children[l];
                            // adding points to each stroke
                            var point = $scope.data.stateful.controller.getComputedStyle(thisPoint.right);
                            points.push({
                                name : thisPoint.id,
                                level : "point",
                                initial : {
                                    weight: point.get("onLength") 
                                },
                                parameters : []
                            });   
                        }
                        strokes.push({
                            name : thisStroke.id,
                            level : "stroke",
                            initial : {},
                            parameters : [],
                            points : points
                        }); 
                    }
                    // temp hack untill #392 is fixed
                    var initialWidth = thisGlyph._advanceWidth;
                    glyphs.push({
                        name : thisGlyph.id,
                        level : "glyph",
                        edit : false,
                        initial : {
                            width: initialWidth
                        },
                        parameters : [],
                        strokes: strokes
                    });
                }
                // temp private method, see issue #332
                var cpsFile = $scope.data.stateful.controller._getMasterRule(masterName);
                $scope.data.sequences[0].masters.push({
                    id : masterId,
                    name : masterName,
                    displayName : masterName,
                    cpsFile : cpsFile,
                    ruleIndex : 3,
                    display : false,
                    edit : [true, false],
                    ag : "Ag",
                    glyphs : glyphs,
                    level : "master",
                    parameters : [{
                        name : "Weight",
                        operators : [{
                            name : "x",
                            value : 1
                        }]

                    }, {
                        name : "Width",
                        operators : [{
                            name : "x",
                            value : 1
                        }]
                    }, {
                        name : "Height",
                        operators : [{
                            name : "x",
                            value : 1
                        }]
                    }, {
                        name : "Spacing",
                        unit : "",
                        operators : [{
                            name : "+",
                            value : 0
                        }]
                    }]
                });
                masterId++;
            }
        }
        $scope.data.updateSelectionParameters();
        $scope.data.pill = "red";
        $scope.$apply();
        $("#layover").hide();
        $("splashscreen").hide();
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


    $scope.engine = function() {
        if (!window.metapolatorReady) {
            window.metapolatorReady = [];
        }
        window.metapolatorReady.push(onMetapolatorReady);
        // <= could be an array or our api
    };

    $scope.fakeEngine = function() {
        var masters = [["A", "Regular"], ["B", "Light"], ["C", "Bold"], ["D", "Condensed"]];
        var myGlyphs = ["a", "e", "l", "m", "o", "p", "r", "t"];
        var glyphs = [];
        // adding glyphs to each master
        for (var j = 0; j < myGlyphs.length; j++) {
            glyphs.push({
                name : myGlyphs[j],
                edit : false,
                parameters : []
            });
        }
        var newParam = {
            name : "weight",
            displayName : "Weight",
            operators : [{
                name : "x",
                value : 3
            }]
        };
        glyphs[3].parameters.push(newParam);

        for (var i = 0; i < masters.length; i++) {
            $scope.data.sequences[0].masters.push({
                id : i,
                name : masters[i][0],
                displayName : masters[i][1],
                display : false,
                edit : [true, false],
                ruleIndex : 3,
                ag : "ag",
                glyphs : glyphs,
                parameters : [{
                    name : "Weight",
                    operators : [{
                        name : "x",
                        value : (i+1)
                    }]

                }, {
                    name : "Width",
                    operators : [{
                        name : "x",
                        value : 1
                    }]
                }, {
                    name : "Height",
                    unit : "",
                    operators : [{
                        name : "x",
                        value : 1
                    }]
                }]

            });
        }

        $scope.data.pill = "blue";
        $("#layover").hide();
    };

});
