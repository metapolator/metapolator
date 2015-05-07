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
                                    Weight: point.get("onLength") 
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
                            Width: initialWidth
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
        $scope.data.sequences = [{
            "id": 0,
            "name": "Sequence 1",
            "masters": [
                {
                    "id": 0,
                    "name": "regular",
                    "displayName": "regular",
                    "cpsFile": "lib/parameters.cps",
                    "ruleIndex": 3,
                    "display": false,
                    "edit": [
                        true,
                        false
                    ],
                    "ag": "Ag",
                    "glyphs": [
                        {
                            "name": "a",
                            "level": "glyph",
                            "edit": false,
                            "initial": {
                                "Width": 514
                            },
                            "parameters": [],
                            "strokes": [
                                {
                                    "name": null,
                                    "level": "stroke",
                                    "initial": {},
                                    "parameters": [],
                                    "points": [
                                        {
                                            "name": null,
                                            "level": "point",
                                            "initial": {
                                                "Weight": 10
                                            },
                                            "parameters": []
                                        },
                                        {
                                            "name": null,
                                            "level": "point",
                                            "initial": {
                                                "Weight": 10
                                            },
                                            "parameters": []
                                        }
                                    ]
                                },
                                {
                                    "name": null,
                                    "level": "stroke",
                                    "initial": {},
                                    "parameters": [],
                                    "points": [
                                        {
                                            "name": null,
                                            "level": "point",
                                            "initial": {
                                                "Weight": 11
                                            },
                                            "parameters": []
                                        },
                                        {
                                            "name": null,
                                            "level": "point",
                                            "initial": {
                                                "Weight": 11.40175425099138
                                            },
                                            "parameters": []
                                        },
                                        {
                                            "name": null,
                                            "level": "point",
                                            "initial": {
                                                "Weight": 10.111874208078342
                                            },
                                            "parameters": []
                                        },
                                        {
                                            "name": null,
                                            "level": "point",
                                            "initial": {
                                                "Weight": 9.7082439194738
                                            },
                                            "parameters": []
                                        }
                                    ]
                                },
                                {
                                    "name": null,
                                    "level": "stroke",
                                    "initial": {},
                                    "parameters": [],
                                    "points": [
                                        {
                                            "name": null,
                                            "level": "point",
                                            "initial": {
                                                "Weight": 10
                                            },
                                            "parameters": []
                                        },
                                        {
                                            "name": null,
                                            "level": "point",
                                            "initial": {
                                                "Weight": 10
                                            },
                                            "parameters": []
                                        }
                                    ]
                                },
                                {
                                    "name": null,
                                    "level": "stroke",
                                    "initial": {},
                                    "parameters": [],
                                    "points": [
                                        {
                                            "name": null,
                                            "level": "point",
                                            "initial": {
                                                "Weight": 8.514693182963201
                                            },
                                            "parameters": []
                                        },
                                        {
                                            "name": null,
                                            "level": "point",
                                            "initial": {
                                                "Weight": 9.013878188659973
                                            },
                                            "parameters": []
                                        },
                                        {
                                            "name": null,
                                            "level": "point",
                                            "initial": {
                                                "Weight": 11.045361017187261
                                            },
                                            "parameters": []
                                        },
                                        {
                                            "name": null,
                                            "level": "point",
                                            "initial": {
                                                "Weight": 10.198039027185569
                                            },
                                            "parameters": []
                                        },
                                        {
                                            "name": null,
                                            "level": "point",
                                            "initial": {
                                                "Weight": 7.7781745930520225
                                            },
                                            "parameters": []
                                        }
                                    ]
                                }
                            ]
                        },
                        {
                            "name": "e",
                            "level": "glyph",
                            "edit": false,
                            "initial": {
                                "Width": 581
                            },
                            "parameters": [],
                            "strokes": [
                                {
                                    "name": null,
                                    "level": "stroke",
                                    "initial": {},
                                    "parameters": [],
                                    "points": [
                                        {
                                            "name": null,
                                            "level": "point",
                                            "initial": {
                                                "Weight": 10
                                            },
                                            "parameters": []
                                        },
                                        {
                                            "name": null,
                                            "level": "point",
                                            "initial": {
                                                "Weight": 10
                                            },
                                            "parameters": []
                                        },
                                        {
                                            "name": null,
                                            "level": "point",
                                            "initial": {
                                                "Weight": 7.7781745930520225
                                            },
                                            "parameters": []
                                        },
                                        {
                                            "name": null,
                                            "level": "point",
                                            "initial": {
                                                "Weight": 10.5
                                            },
                                            "parameters": []
                                        },
                                        {
                                            "name": null,
                                            "level": "point",
                                            "initial": {
                                                "Weight": 10.547511554864494
                                            },
                                            "parameters": []
                                        },
                                        {
                                            "name": null,
                                            "level": "point",
                                            "initial": {
                                                "Weight": 10.012492197250394
                                            },
                                            "parameters": []
                                        },
                                        {
                                            "name": null,
                                            "level": "point",
                                            "initial": {
                                                "Weight": 11
                                            },
                                            "parameters": []
                                        },
                                        {
                                            "name": null,
                                            "level": "point",
                                            "initial": {
                                                "Weight": 10
                                            },
                                            "parameters": []
                                        },
                                        {
                                            "name": null,
                                            "level": "point",
                                            "initial": {
                                                "Weight": 10.259142264341596
                                            },
                                            "parameters": []
                                        }
                                    ]
                                }
                            ]
                        },
                        {
                            "name": "g",
                            "level": "glyph",
                            "edit": false,
                            "initial": {
                                "Width": 568
                            },
                            "parameters": [],
                            "strokes": [
                                {
                                    "name": null,
                                    "level": "stroke",
                                    "initial": {},
                                    "parameters": [],
                                    "points": [
                                        {
                                            "name": null,
                                            "level": "point",
                                            "initial": {
                                                "Weight": 10
                                            },
                                            "parameters": []
                                        },
                                        {
                                            "name": null,
                                            "level": "point",
                                            "initial": {
                                                "Weight": 10.977249200050075
                                            },
                                            "parameters": []
                                        }
                                    ]
                                },
                                {
                                    "name": null,
                                    "level": "stroke",
                                    "initial": {},
                                    "parameters": [],
                                    "points": [
                                        {
                                            "name": null,
                                            "level": "point",
                                            "initial": {
                                                "Weight": 11.01135777277262
                                            },
                                            "parameters": []
                                        },
                                        {
                                            "name": null,
                                            "level": "point",
                                            "initial": {
                                                "Weight": 10
                                            },
                                            "parameters": []
                                        },
                                        {
                                            "name": null,
                                            "level": "point",
                                            "initial": {
                                                "Weight": 11.01135777277262
                                            },
                                            "parameters": []
                                        },
                                        {
                                            "name": null,
                                            "level": "point",
                                            "initial": {
                                                "Weight": 10.04987562112089
                                            },
                                            "parameters": []
                                        },
                                        {
                                            "name": null,
                                            "level": "point",
                                            "initial": {
                                                "Weight": 11.01135777277262
                                            },
                                            "parameters": []
                                        }
                                    ]
                                },
                                {
                                    "name": null,
                                    "level": "stroke",
                                    "initial": {},
                                    "parameters": [],
                                    "points": [
                                        {
                                            "name": null,
                                            "level": "point",
                                            "initial": {
                                                "Weight": 7.810249675906654
                                            },
                                            "parameters": []
                                        },
                                        {
                                            "name": null,
                                            "level": "point",
                                            "initial": {
                                                "Weight": 11.045361017187261
                                            },
                                            "parameters": []
                                        },
                                        {
                                            "name": null,
                                            "level": "point",
                                            "initial": {
                                                "Weight": 9.7082439194738
                                            },
                                            "parameters": []
                                        },
                                        {
                                            "name": null,
                                            "level": "point",
                                            "initial": {
                                                "Weight": 10.04987562112089
                                            },
                                            "parameters": []
                                        },
                                        {
                                            "name": null,
                                            "level": "point",
                                            "initial": {
                                                "Weight": 10.012492197250394
                                            },
                                            "parameters": []
                                        },
                                        {
                                            "name": null,
                                            "level": "point",
                                            "initial": {
                                                "Weight": 11.01135777277262
                                            },
                                            "parameters": []
                                        },
                                        {
                                            "name": null,
                                            "level": "point",
                                            "initial": {
                                                "Weight": 8.139410298049853
                                            },
                                            "parameters": []
                                        }
                                    ]
                                }
                            ]
                        },
                        {
                            "name": "l",
                            "level": "glyph",
                            "edit": false,
                            "initial": {
                                "Width": 222
                            },
                            "parameters": [],
                            "strokes": [
                                {
                                    "name": null,
                                    "level": "stroke",
                                    "initial": {},
                                    "parameters": [],
                                    "points": [
                                        {
                                            "name": null,
                                            "level": "point",
                                            "initial": {
                                                "Weight": 10
                                            },
                                            "parameters": []
                                        },
                                        {
                                            "name": null,
                                            "level": "point",
                                            "initial": {
                                                "Weight": 10
                                            },
                                            "parameters": []
                                        }
                                    ]
                                },
                                {
                                    "name": null,
                                    "level": "stroke",
                                    "initial": {},
                                    "parameters": [],
                                    "points": [
                                        {
                                            "name": null,
                                            "level": "point",
                                            "initial": {
                                                "Weight": 10
                                            },
                                            "parameters": []
                                        },
                                        {
                                            "name": null,
                                            "level": "point",
                                            "initial": {
                                                "Weight": 10
                                            },
                                            "parameters": []
                                        }
                                    ]
                                },
                                {
                                    "name": null,
                                    "level": "stroke",
                                    "initial": {},
                                    "parameters": [],
                                    "points": [
                                        {
                                            "name": null,
                                            "level": "point",
                                            "initial": {
                                                "Weight": 10
                                            },
                                            "parameters": []
                                        },
                                        {
                                            "name": null,
                                            "level": "point",
                                            "initial": {
                                                "Weight": 10
                                            },
                                            "parameters": []
                                        }
                                    ]
                                },
                                {
                                    "name": null,
                                    "level": "stroke",
                                    "initial": {},
                                    "parameters": [],
                                    "points": [
                                        {
                                            "name": null,
                                            "level": "point",
                                            "initial": {
                                                "Weight": 11
                                            },
                                            "parameters": []
                                        },
                                        {
                                            "name": null,
                                            "level": "point",
                                            "initial": {
                                                "Weight": 11
                                            },
                                            "parameters": []
                                        }
                                    ]
                                }
                            ]
                        },
                        {
                            "name": "o",
                            "level": "glyph",
                            "edit": false,
                            "initial": {
                                "Width": 644
                            },
                            "parameters": [],
                            "strokes": [
                                {
                                    "name": null,
                                    "level": "stroke",
                                    "initial": {},
                                    "parameters": [],
                                    "points": [
                                        {
                                            "name": null,
                                            "level": "point",
                                            "initial": {
                                                "Weight": 11
                                            },
                                            "parameters": []
                                        },
                                        {
                                            "name": null,
                                            "level": "point",
                                            "initial": {
                                                "Weight": 10.012492197250394
                                            },
                                            "parameters": []
                                        },
                                        {
                                            "name": null,
                                            "level": "point",
                                            "initial": {
                                                "Weight": 11
                                            },
                                            "parameters": []
                                        },
                                        {
                                            "name": null,
                                            "level": "point",
                                            "initial": {
                                                "Weight": 10.012492197250394
                                            },
                                            "parameters": []
                                        },
                                        {
                                            "name": null,
                                            "level": "point",
                                            "initial": {
                                                "Weight": 11
                                            },
                                            "parameters": []
                                        }
                                    ]
                                }
                            ]
                        },
                        {
                            "name": "p",
                            "level": "glyph",
                            "edit": false,
                            "initial": {
                                "Width": 627
                            },
                            "parameters": [],
                            "strokes": [
                                {
                                    "name": null,
                                    "level": "stroke",
                                    "initial": {},
                                    "parameters": [],
                                    "points": [
                                        {
                                            "name": null,
                                            "level": "point",
                                            "initial": {
                                                "Weight": 10
                                            },
                                            "parameters": []
                                        },
                                        {
                                            "name": null,
                                            "level": "point",
                                            "initial": {
                                                "Weight": 10
                                            },
                                            "parameters": []
                                        }
                                    ]
                                },
                                {
                                    "name": null,
                                    "level": "stroke",
                                    "initial": {},
                                    "parameters": [],
                                    "points": [
                                        {
                                            "name": null,
                                            "level": "point",
                                            "initial": {
                                                "Weight": 10
                                            },
                                            "parameters": []
                                        },
                                        {
                                            "name": null,
                                            "level": "point",
                                            "initial": {
                                                "Weight": 10
                                            },
                                            "parameters": []
                                        }
                                    ]
                                },
                                {
                                    "name": null,
                                    "level": "stroke",
                                    "initial": {},
                                    "parameters": [],
                                    "points": [
                                        {
                                            "name": null,
                                            "level": "point",
                                            "initial": {
                                                "Weight": 10
                                            },
                                            "parameters": []
                                        },
                                        {
                                            "name": null,
                                            "level": "point",
                                            "initial": {
                                                "Weight": 10
                                            },
                                            "parameters": []
                                        }
                                    ]
                                },
                                {
                                    "name": null,
                                    "level": "stroke",
                                    "initial": {},
                                    "parameters": [],
                                    "points": [
                                        {
                                            "name": null,
                                            "level": "point",
                                            "initial": {
                                                "Weight": 8.902246907382429
                                            },
                                            "parameters": []
                                        },
                                        {
                                            "name": null,
                                            "level": "point",
                                            "initial": {
                                                "Weight": 10.012492197250394
                                            },
                                            "parameters": []
                                        },
                                        {
                                            "name": null,
                                            "level": "point",
                                            "initial": {
                                                "Weight": 11.01135777277262
                                            },
                                            "parameters": []
                                        },
                                        {
                                            "name": null,
                                            "level": "point",
                                            "initial": {
                                                "Weight": 10
                                            },
                                            "parameters": []
                                        },
                                        {
                                            "name": null,
                                            "level": "point",
                                            "initial": {
                                                "Weight": 8.902246907382429
                                            },
                                            "parameters": []
                                        }
                                    ]
                                },
                                {
                                    "name": null,
                                    "level": "stroke",
                                    "initial": {},
                                    "parameters": [],
                                    "points": [
                                        {
                                            "name": null,
                                            "level": "point",
                                            "initial": {
                                                "Weight": 11
                                            },
                                            "parameters": []
                                        },
                                        {
                                            "name": null,
                                            "level": "point",
                                            "initial": {
                                                "Weight": 11
                                            },
                                            "parameters": []
                                        }
                                    ]
                                }
                            ]
                        },
                        {
                            "name": "r",
                            "level": "glyph",
                            "edit": false,
                            "initial": {
                                "Width": 405
                            },
                            "parameters": [],
                            "strokes": [
                                {
                                    "name": null,
                                    "level": "stroke",
                                    "initial": {},
                                    "parameters": [],
                                    "points": [
                                        {
                                            "name": null,
                                            "level": "point",
                                            "initial": {
                                                "Weight": 10
                                            },
                                            "parameters": []
                                        },
                                        {
                                            "name": null,
                                            "level": "point",
                                            "initial": {
                                                "Weight": 10
                                            },
                                            "parameters": []
                                        }
                                    ]
                                },
                                {
                                    "name": null,
                                    "level": "stroke",
                                    "initial": {},
                                    "parameters": [],
                                    "points": [
                                        {
                                            "name": null,
                                            "level": "point",
                                            "initial": {
                                                "Weight": 10
                                            },
                                            "parameters": []
                                        },
                                        {
                                            "name": null,
                                            "level": "point",
                                            "initial": {
                                                "Weight": 10
                                            },
                                            "parameters": []
                                        }
                                    ]
                                },
                                {
                                    "name": null,
                                    "level": "stroke",
                                    "initial": {},
                                    "parameters": [],
                                    "points": [
                                        {
                                            "name": null,
                                            "level": "point",
                                            "initial": {
                                                "Weight": 10
                                            },
                                            "parameters": []
                                        },
                                        {
                                            "name": null,
                                            "level": "point",
                                            "initial": {
                                                "Weight": 10
                                            },
                                            "parameters": []
                                        }
                                    ]
                                },
                                {
                                    "name": null,
                                    "level": "stroke",
                                    "initial": {},
                                    "parameters": [],
                                    "points": [
                                        {
                                            "name": null,
                                            "level": "point",
                                            "initial": {
                                                "Weight": 11
                                            },
                                            "parameters": []
                                        },
                                        {
                                            "name": null,
                                            "level": "point",
                                            "initial": {
                                                "Weight": 11
                                            },
                                            "parameters": []
                                        }
                                    ]
                                },
                                {
                                    "name": null,
                                    "level": "stroke",
                                    "initial": {},
                                    "parameters": [],
                                    "points": [
                                        {
                                            "name": null,
                                            "level": "point",
                                            "initial": {
                                                "Weight": 7.5
                                            },
                                            "parameters": []
                                        },
                                        {
                                            "name": null,
                                            "level": "point",
                                            "initial": {
                                                "Weight": 10
                                            },
                                            "parameters": []
                                        }
                                    ]
                                }
                            ]
                        },
                        {
                            "name": "t",
                            "level": "glyph",
                            "edit": false,
                            "initial": {
                                "Width": 464
                            },
                            "parameters": [],
                            "strokes": [
                                {
                                    "name": null,
                                    "level": "stroke",
                                    "initial": {},
                                    "parameters": [],
                                    "points": [
                                        {
                                            "name": null,
                                            "level": "point",
                                            "initial": {
                                                "Weight": 10
                                            },
                                            "parameters": []
                                        },
                                        {
                                            "name": null,
                                            "level": "point",
                                            "initial": {
                                                "Weight": 10
                                            },
                                            "parameters": []
                                        }
                                    ]
                                },
                                {
                                    "name": null,
                                    "level": "stroke",
                                    "initial": {},
                                    "parameters": [],
                                    "points": [
                                        {
                                            "name": null,
                                            "level": "point",
                                            "initial": {
                                                "Weight": 9.617692030835672
                                            },
                                            "parameters": []
                                        },
                                        {
                                            "name": null,
                                            "level": "point",
                                            "initial": {
                                                "Weight": 10.04987562112089
                                            },
                                            "parameters": []
                                        },
                                        {
                                            "name": null,
                                            "level": "point",
                                            "initial": {
                                                "Weight": 11.01135777277262
                                            },
                                            "parameters": []
                                        },
                                        {
                                            "name": null,
                                            "level": "point",
                                            "initial": {
                                                "Weight": 12.776932339180638
                                            },
                                            "parameters": []
                                        }
                                    ]
                                }
                            ]
                        },
                        {
                            "name": "A",
                            "level": "glyph",
                            "edit": false,
                            "initial": {
                                "Width": 781
                            },
                            "parameters": [],
                            "strokes": [
                                {
                                    "name": null,
                                    "level": "stroke",
                                    "initial": {},
                                    "parameters": [],
                                    "points": [
                                        {
                                            "name": null,
                                            "level": "point",
                                            "initial": {
                                                "Weight": 10
                                            },
                                            "parameters": []
                                        },
                                        {
                                            "name": null,
                                            "level": "point",
                                            "initial": {
                                                "Weight": 10
                                            },
                                            "parameters": []
                                        }
                                    ]
                                },
                                {
                                    "name": null,
                                    "level": "stroke",
                                    "initial": {},
                                    "parameters": [],
                                    "points": [
                                        {
                                            "name": null,
                                            "level": "point",
                                            "initial": {
                                                "Weight": 10
                                            },
                                            "parameters": []
                                        },
                                        {
                                            "name": null,
                                            "level": "point",
                                            "initial": {
                                                "Weight": 10
                                            },
                                            "parameters": []
                                        }
                                    ]
                                },
                                {
                                    "name": null,
                                    "level": "stroke",
                                    "initial": {},
                                    "parameters": [],
                                    "points": [
                                        {
                                            "name": null,
                                            "level": "point",
                                            "initial": {
                                                "Weight": 10
                                            },
                                            "parameters": []
                                        },
                                        {
                                            "name": null,
                                            "level": "point",
                                            "initial": {
                                                "Weight": 10
                                            },
                                            "parameters": []
                                        }
                                    ]
                                },
                                {
                                    "name": null,
                                    "level": "stroke",
                                    "initial": {},
                                    "parameters": [],
                                    "points": [
                                        {
                                            "name": null,
                                            "level": "point",
                                            "initial": {
                                                "Weight": 10
                                            },
                                            "parameters": []
                                        },
                                        {
                                            "name": null,
                                            "level": "point",
                                            "initial": {
                                                "Weight": 10
                                            },
                                            "parameters": []
                                        }
                                    ]
                                },
                                {
                                    "name": null,
                                    "level": "stroke",
                                    "initial": {},
                                    "parameters": [],
                                    "points": [
                                        {
                                            "name": null,
                                            "level": "point",
                                            "initial": {
                                                "Weight": 11.067971810589327
                                            },
                                            "parameters": []
                                        },
                                        {
                                            "name": null,
                                            "level": "point",
                                            "initial": {
                                                "Weight": 11.423659658795863
                                            },
                                            "parameters": []
                                        }
                                    ]
                                },
                                {
                                    "name": null,
                                    "level": "stroke",
                                    "initial": {},
                                    "parameters": [],
                                    "points": [
                                        {
                                            "name": null,
                                            "level": "point",
                                            "initial": {
                                                "Weight": 11.5
                                            },
                                            "parameters": []
                                        },
                                        {
                                            "name": null,
                                            "level": "point",
                                            "initial": {
                                                "Weight": 10
                                            },
                                            "parameters": []
                                        }
                                    ]
                                },
                                {
                                    "name": null,
                                    "level": "stroke",
                                    "initial": {},
                                    "parameters": [],
                                    "points": [
                                        {
                                            "name": null,
                                            "level": "point",
                                            "initial": {
                                                "Weight": 12
                                            },
                                            "parameters": []
                                        },
                                        {
                                            "name": null,
                                            "level": "point",
                                            "initial": {
                                                "Weight": 10
                                            },
                                            "parameters": []
                                        }
                                    ]
                                }
                            ]
                        },
                        {
                            "name": "M",
                            "level": "glyph",
                            "edit": false,
                            "initial": {
                                "Width": 909
                            },
                            "parameters": [],
                            "strokes": [
                                {
                                    "name": null,
                                    "level": "stroke",
                                    "initial": {},
                                    "parameters": [],
                                    "points": [
                                        {
                                            "name": null,
                                            "level": "point",
                                            "initial": {
                                                "Weight": 10
                                            },
                                            "parameters": []
                                        },
                                        {
                                            "name": null,
                                            "level": "point",
                                            "initial": {
                                                "Weight": 10
                                            },
                                            "parameters": []
                                        }
                                    ]
                                },
                                {
                                    "name": null,
                                    "level": "stroke",
                                    "initial": {},
                                    "parameters": [],
                                    "points": [
                                        {
                                            "name": null,
                                            "level": "point",
                                            "initial": {
                                                "Weight": 10
                                            },
                                            "parameters": []
                                        },
                                        {
                                            "name": null,
                                            "level": "point",
                                            "initial": {
                                                "Weight": 10
                                            },
                                            "parameters": []
                                        }
                                    ]
                                },
                                {
                                    "name": null,
                                    "level": "stroke",
                                    "initial": {},
                                    "parameters": [],
                                    "points": [
                                        {
                                            "name": null,
                                            "level": "point",
                                            "initial": {
                                                "Weight": 10
                                            },
                                            "parameters": []
                                        },
                                        {
                                            "name": null,
                                            "level": "point",
                                            "initial": {
                                                "Weight": 10
                                            },
                                            "parameters": []
                                        }
                                    ]
                                },
                                {
                                    "name": null,
                                    "level": "stroke",
                                    "initial": {},
                                    "parameters": [],
                                    "points": [
                                        {
                                            "name": null,
                                            "level": "point",
                                            "initial": {
                                                "Weight": 10
                                            },
                                            "parameters": []
                                        },
                                        {
                                            "name": null,
                                            "level": "point",
                                            "initial": {
                                                "Weight": 10
                                            },
                                            "parameters": []
                                        }
                                    ]
                                },
                                {
                                    "name": null,
                                    "level": "stroke",
                                    "initial": {},
                                    "parameters": [],
                                    "points": [
                                        {
                                            "name": null,
                                            "level": "point",
                                            "initial": {
                                                "Weight": 10
                                            },
                                            "parameters": []
                                        },
                                        {
                                            "name": null,
                                            "level": "point",
                                            "initial": {
                                                "Weight": 10
                                            },
                                            "parameters": []
                                        }
                                    ]
                                },
                                {
                                    "name": null,
                                    "level": "stroke",
                                    "initial": {},
                                    "parameters": [],
                                    "points": [
                                        {
                                            "name": null,
                                            "level": "point",
                                            "initial": {
                                                "Weight": 10
                                            },
                                            "parameters": []
                                        },
                                        {
                                            "name": null,
                                            "level": "point",
                                            "initial": {
                                                "Weight": 10
                                            },
                                            "parameters": []
                                        }
                                    ]
                                },
                                {
                                    "name": null,
                                    "level": "stroke",
                                    "initial": {},
                                    "parameters": [],
                                    "points": [
                                        {
                                            "name": null,
                                            "level": "point",
                                            "initial": {
                                                "Weight": 11
                                            },
                                            "parameters": []
                                        },
                                        {
                                            "name": null,
                                            "level": "point",
                                            "initial": {
                                                "Weight": 10
                                            },
                                            "parameters": []
                                        }
                                    ]
                                },
                                {
                                    "name": null,
                                    "level": "stroke",
                                    "initial": {},
                                    "parameters": [],
                                    "points": [
                                        {
                                            "name": null,
                                            "level": "point",
                                            "initial": {
                                                "Weight": 11
                                            },
                                            "parameters": []
                                        },
                                        {
                                            "name": null,
                                            "level": "point",
                                            "initial": {
                                                "Weight": 10
                                            },
                                            "parameters": []
                                        }
                                    ]
                                },
                                {
                                    "name": null,
                                    "level": "stroke",
                                    "initial": {},
                                    "parameters": [],
                                    "points": [
                                        {
                                            "name": null,
                                            "level": "point",
                                            "initial": {
                                                "Weight": 11
                                            },
                                            "parameters": []
                                        },
                                        {
                                            "name": null,
                                            "level": "point",
                                            "initial": {
                                                "Weight": 10
                                            },
                                            "parameters": []
                                        }
                                    ]
                                },
                                {
                                    "name": null,
                                    "level": "stroke",
                                    "initial": {},
                                    "parameters": [],
                                    "points": [
                                        {
                                            "name": null,
                                            "level": "point",
                                            "initial": {
                                                "Weight": 11.5
                                            },
                                            "parameters": []
                                        },
                                        {
                                            "name": null,
                                            "level": "point",
                                            "initial": {
                                                "Weight": 10
                                            },
                                            "parameters": []
                                        }
                                    ]
                                }
                            ]
                        }
                    ],
                    "level": "master",
                    "parameters": [
                        {
                            "name": "Weight",
                            "operators": [
                                {
                                    "name": "x",
                                    "value": 1
                                }
                            ]
                        },
                        {
                            "name": "Width",
                            "operators": [
                                {
                                    "name": "x",
                                    "value": 1
                                }
                            ]
                        },
                        {
                            "name": "Height",
                            "operators": [
                                {
                                    "name": "x",
                                    "value": 1
                                }
                            ]
                        },
                        {
                            "name": "Spacing",
                            "unit": "",
                            "operators": [
                                {
                                    "name": "+",
                                    "value": 0
                                }
                            ]
                        }
                    ]
                }
            ]
        }];
        $scope.data.pill = "blue";
        $("#layover").hide();
    };

});
