app.controller('engine', function($scope, sharedScope) {
    $scope.data = sharedScope.data;

    $scope.data.stateful
    $scope.data.stateless
    $scope.data.pill = "blue";

    function onProjectLoaded(stateless, stateful) {
        $scope.data.stateful = stateful;
        $scope.data.stateless = stateless;
        // adding initial masters
        var masters = $scope.data.stateful.controller.queryAll("master");
        var masterId = 0;
        angular.forEach(masters, function(thisMaster) {
            var masterName = thisMaster.id;
            // skip base for the ui
            if (masterName != "base") {
                var glyphs = [];
                // adding glyphs to each master
                angular.forEach(thisMaster.children, function(thisGlyph) {
                    var penstrokes = [];
                    // adding strokes to each glyph
                    angular.forEach(thisGlyph.children, function(thisStroke, k) {
                        var points = [];
                        // adding points to each penstroke
                        angular.forEach(thisStroke.children, function(thisPoint, l) {
                            // adding points to each penstroke
                            var point = thisPoint.right.getComputedStyle();
                            var newPoint = {
                                name : "point:i(" + l + ")",
                                parent : null,
                                level : "point",
                                ruleIndex : null,
                                parameters : [{
                                    name : "Weight",
                                    cpsFactor : 1,
                                    operators : [{
                                        name : "=",
                                        value : point.get("onLength")
                                    }, {
                                        name : "effectiveValue",
                                        initial : point.get("onLength"),
                                        value : point.get("onLength")
                                    }]
                                }]
                            };
                            points.push(newPoint);
                        });
                        var newPenstroke = {
                            name : "penstroke:i(" + k + ")",
                            parent : null,
                            level : "penstroke",
                            ruleIndex : null,
                            parameters : [],
                            children : points
                        };
                        angular.forEach(newPenstroke.children, function(child) {
                            child.parent = newPenstroke;
                        });
                        penstrokes.push(newPenstroke);
                    });
                    // temp hack untill #392 is fixed
                    var initialWidth = thisGlyph._advanceWidth;
                    var newGlyph = {
                        name : thisGlyph.id,
                        parent : null,
                        level : "glyph",
                        ruleIndex : null,
                        edit : false,
                        parameters : [{
                            name : "Width",
                            cpsFactor : 1,
                            operators : [{
                                name : "=",
                                value : initialWidth
                            }, {
                                name : "effectiveValue",
                                initial : initialWidth,
                                value : initialWidth
                            }]
                        }],
                        children : penstrokes
                    };
                    angular.forEach(newGlyph.children, function(child) {
                        child.parent = newGlyph;
                    });
                    glyphs.push(newGlyph);
                });
                // temp private method, see issue #332
                var cpsFile = $scope.data.stateful.controller._getMasterRule(masterName);
                var newMaster = {
                    id : masterId,
                    name : masterName,
                    parent : $scope.data.sequences[0],
                    displayName : masterName,
                    cpsFile : cpsFile,
                    ruleIndex : null,
                    display : false,
                    edit : [true, false],
                    ag : "Ag",
                    children : glyphs,
                    level : "master",
                    parameters : []
                };
                angular.forEach(newMaster.children, function(child) {
                    child.parent = newMaster;
                });
                $scope.data.sequences[0].masters.push(newMaster);
                masterId++;
            }
        });
        $scope.data.updateSelectionParameters();
        $scope.data.pill = "red";
        $scope.$apply();
        // hide intro screen
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
            "id" : 0,
            "name" : "Sequence 1",
            "masters" : [{
                "id" : 0,
                "name" : "regular",
                "displayName" : "regular",
                "cpsFile" : "lib/parameters.cps",
                "ruleIndex" : null,
                "display" : false,
                "edit" : [true, false],
                "ag" : "Ag",
                "children" : [{
                    "name" : "a",
                    "parent" : ["master", "regular"],
                    "level" : "glyph",
                    "ruleIndex" : null,
                    "edit" : false,
                    "parameters" : [{
                        "name" : "Width",
                        "cpsFactor" : 1,
                        "operators" : [{
                            "name" : "=",
                            "value" : 514
                        }, {
                            "name" : "effectiveValue",
                            "initial" : 514,
                            "value" : 514
                        }]
                    }],
                    "children" : [{
                        "name" : "penstroke:i(0)",
                        "parent" : ["glyph", "a"],
                        "level" : "penstroke",
                        "ruleIndex" : null,
                        "parameters" : [],
                        "children" : [{
                            "name" : "point:i(0)",
                            "parent" : ["penstroke", "penstroke:i(0)"],
                            "level" : "point",
                            "ruleIndex" : null,
                            "parameters" : [{
                                "name" : "Weight",
                                "cpsFactor" : 1,
                                "operators" : [{
                                    "name" : "=",
                                    "value" : 10
                                }, {
                                    "name" : "effectiveValue",
                                    "initial" : 10,
                                    "value" : 10
                                }]
                            }]
                        }, {
                            "name" : "point:i(1)",
                            "parent" : ["penstroke", "penstroke:i(0)"],
                            "level" : "point",
                            "ruleIndex" : null,
                            "parameters" : [{
                                "name" : "Weight",
                                "cpsFactor" : 1,
                                "operators" : [{
                                    "name" : "=",
                                    "value" : 10
                                }, {
                                    "name" : "effectiveValue",
                                    "initial" : 10,
                                    "value" : 10
                                }]
                            }]
                        }]
                    }, {
                        "name" : "penstroke:i(1)",
                        "parent" : ["glyph", "a"],
                        "level" : "penstroke",
                        "ruleIndex" : null,
                        "parameters" : [],
                        "children" : [{
                            "name" : "point:i(0)",
                            "parent" : ["penstroke", "penstroke:i(1)"],
                            "level" : "point",
                            "ruleIndex" : null,
                            "parameters" : [{
                                "name" : "Weight",
                                "cpsFactor" : 1,
                                "operators" : [{
                                    "name" : "=",
                                    "value" : 11
                                }, {
                                    "name" : "effectiveValue",
                                    "initial" : 11,
                                    "value" : 11
                                }]
                            }]
                        }, {
                            "name" : "point:i(1)",
                            "parent" : ["penstroke", "penstroke:i(1)"],
                            "level" : "point",
                            "ruleIndex" : null,
                            "parameters" : [{
                                "name" : "Weight",
                                "cpsFactor" : 1,
                                "operators" : [{
                                    "name" : "=",
                                    "value" : 11.40175425099138
                                }, {
                                    "name" : "effectiveValue",
                                    "initial" : 11.40175425099138,
                                    "value" : 11.40175425099138
                                }]
                            }]
                        }, {
                            "name" : "point:i(2)",
                            "parent" : ["penstroke", "penstroke:i(1)"],
                            "level" : "point",
                            "ruleIndex" : null,
                            "parameters" : [{
                                "name" : "Weight",
                                "cpsFactor" : 1,
                                "operators" : [{
                                    "name" : "=",
                                    "value" : 10.111874208078342
                                }, {
                                    "name" : "effectiveValue",
                                    "initial" : 10.111874208078342,
                                    "value" : 10.111874208078342
                                }]
                            }]
                        }, {
                            "name" : "point:i(3)",
                            "parent" : ["penstroke", "penstroke:i(1)"],
                            "level" : "point",
                            "ruleIndex" : null,
                            "parameters" : [{
                                "name" : "Weight",
                                "cpsFactor" : 1,
                                "operators" : [{
                                    "name" : "=",
                                    "value" : 9.7082439194738
                                }, {
                                    "name" : "effectiveValue",
                                    "initial" : 9.7082439194738,
                                    "value" : 9.7082439194738
                                }]
                            }]
                        }]
                    }, {
                        "name" : "penstroke:i(2)",
                        "parent" : ["glyph", "a"],
                        "level" : "penstroke",
                        "ruleIndex" : null,
                        "parameters" : [],
                        "children" : [{
                            "name" : "point:i(0)",
                            "parent" : ["penstroke", "penstroke:i(2)"],
                            "level" : "point",
                            "ruleIndex" : null,
                            "parameters" : [{
                                "name" : "Weight",
                                "cpsFactor" : 1,
                                "operators" : [{
                                    "name" : "=",
                                    "value" : 10
                                }, {
                                    "name" : "effectiveValue",
                                    "initial" : 10,
                                    "value" : 10
                                }]
                            }]
                        }, {
                            "name" : "point:i(1)",
                            "parent" : ["penstroke", "penstroke:i(2)"],
                            "level" : "point",
                            "ruleIndex" : null,
                            "parameters" : [{
                                "name" : "Weight",
                                "cpsFactor" : 1,
                                "operators" : [{
                                    "name" : "=",
                                    "value" : 10
                                }, {
                                    "name" : "effectiveValue",
                                    "initial" : 10,
                                    "value" : 10
                                }]
                            }]
                        }]
                    }, {
                        "name" : "penstroke:i(3)",
                        "parent" : ["glyph", "a"],
                        "level" : "penstroke",
                        "ruleIndex" : null,
                        "parameters" : [],
                        "children" : [{
                            "name" : "point:i(0)",
                            "parent" : ["penstroke", "penstroke:i(3)"],
                            "level" : "point",
                            "ruleIndex" : null,
                            "parameters" : [{
                                "name" : "Weight",
                                "cpsFactor" : 1,
                                "operators" : [{
                                    "name" : "=",
                                    "value" : 8.514693182963201
                                }, {
                                    "name" : "effectiveValue",
                                    "initial" : 8.514693182963201,
                                    "value" : 8.514693182963201
                                }]
                            }]
                        }, {
                            "name" : "point:i(1)",
                            "parent" : ["penstroke", "penstroke:i(3)"],
                            "level" : "point",
                            "ruleIndex" : null,
                            "parameters" : [{
                                "name" : "Weight",
                                "cpsFactor" : 1,
                                "operators" : [{
                                    "name" : "=",
                                    "value" : 9.013878188659973
                                }, {
                                    "name" : "effectiveValue",
                                    "initial" : 9.013878188659973,
                                    "value" : 9.013878188659973
                                }]
                            }]
                        }, {
                            "name" : "point:i(2)",
                            "parent" : ["penstroke", "penstroke:i(3)"],
                            "level" : "point",
                            "ruleIndex" : null,
                            "parameters" : [{
                                "name" : "Weight",
                                "cpsFactor" : 1,
                                "operators" : [{
                                    "name" : "=",
                                    "value" : 11.045361017187261
                                }, {
                                    "name" : "effectiveValue",
                                    "initial" : 11.045361017187261,
                                    "value" : 11.045361017187261
                                }]
                            }]
                        }, {
                            "name" : "point:i(3)",
                            "parent" : ["penstroke", "penstroke:i(3)"],
                            "level" : "point",
                            "ruleIndex" : null,
                            "parameters" : [{
                                "name" : "Weight",
                                "cpsFactor" : 1,
                                "operators" : [{
                                    "name" : "=",
                                    "value" : 10.198039027185569
                                }, {
                                    "name" : "effectiveValue",
                                    "initial" : 10.198039027185569,
                                    "value" : 10.198039027185569
                                }]
                            }]
                        }, {
                            "name" : "point:i(4)",
                            "parent" : ["penstroke", "penstroke:i(3)"],
                            "level" : "point",
                            "ruleIndex" : null,
                            "parameters" : [{
                                "name" : "Weight",
                                "cpsFactor" : 1,
                                "operators" : [{
                                    "name" : "=",
                                    "value" : 7.7781745930520225
                                }, {
                                    "name" : "effectiveValue",
                                    "initial" : 7.7781745930520225,
                                    "value" : 7.7781745930520225
                                }]
                            }]
                        }]
                    }]
                }, {
                    "name" : "e",
                    "parent" : ["master", "regular"],
                    "level" : "glyph",
                    "ruleIndex" : null,
                    "edit" : false,
                    "parameters" : [{
                        "name" : "Width",
                        "cpsFactor" : 1,
                        "operators" : [{
                            "name" : "=",
                            "value" : 581
                        }, {
                            "name" : "effectiveValue",
                            "initial" : 581,
                            "value" : 581
                        }]
                    }],
                    "children" : [{
                        "name" : "penstroke:i(0)",
                        "parent" : ["glyph", "e"],
                        "level" : "penstroke",
                        "ruleIndex" : null,
                        "parameters" : [],
                        "children" : [{
                            "name" : "point:i(0)",
                            "parent" : ["penstroke", "penstroke:i(0)"],
                            "level" : "point",
                            "ruleIndex" : null,
                            "parameters" : [{
                                "name" : "Weight",
                                "cpsFactor" : 1,
                                "operators" : [{
                                    "name" : "=",
                                    "value" : 10
                                }, {
                                    "name" : "effectiveValue",
                                    "initial" : 10,
                                    "value" : 10
                                }]
                            }]
                        }, {
                            "name" : "point:i(1)",
                            "parent" : ["penstroke", "penstroke:i(0)"],
                            "level" : "point",
                            "ruleIndex" : null,
                            "parameters" : [{
                                "name" : "Weight",
                                "cpsFactor" : 1,
                                "operators" : [{
                                    "name" : "=",
                                    "value" : 10
                                }, {
                                    "name" : "effectiveValue",
                                    "initial" : 10,
                                    "value" : 10
                                }]
                            }]
                        }, {
                            "name" : "point:i(2)",
                            "parent" : ["penstroke", "penstroke:i(0)"],
                            "level" : "point",
                            "ruleIndex" : null,
                            "parameters" : [{
                                "name" : "Weight",
                                "cpsFactor" : 1,
                                "operators" : [{
                                    "name" : "=",
                                    "value" : 7.7781745930520225
                                }, {
                                    "name" : "effectiveValue",
                                    "initial" : 7.7781745930520225,
                                    "value" : 7.7781745930520225
                                }]
                            }]
                        }, {
                            "name" : "point:i(3)",
                            "parent" : ["penstroke", "penstroke:i(0)"],
                            "level" : "point",
                            "ruleIndex" : null,
                            "parameters" : [{
                                "name" : "Weight",
                                "cpsFactor" : 1,
                                "operators" : [{
                                    "name" : "=",
                                    "value" : 10.5
                                }, {
                                    "name" : "effectiveValue",
                                    "initial" : 10.5,
                                    "value" : 10.5
                                }]
                            }]
                        }, {
                            "name" : "point:i(4)",
                            "parent" : ["penstroke", "penstroke:i(0)"],
                            "level" : "point",
                            "ruleIndex" : null,
                            "parameters" : [{
                                "name" : "Weight",
                                "cpsFactor" : 1,
                                "operators" : [{
                                    "name" : "=",
                                    "value" : 10.547511554864494
                                }, {
                                    "name" : "effectiveValue",
                                    "initial" : 10.547511554864494,
                                    "value" : 10.547511554864494
                                }]
                            }]
                        }, {
                            "name" : "point:i(5)",
                            "parent" : ["penstroke", "penstroke:i(0)"],
                            "level" : "point",
                            "ruleIndex" : null,
                            "parameters" : [{
                                "name" : "Weight",
                                "cpsFactor" : 1,
                                "operators" : [{
                                    "name" : "=",
                                    "value" : 10.012492197250394
                                }, {
                                    "name" : "effectiveValue",
                                    "initial" : 10.012492197250394,
                                    "value" : 10.012492197250394
                                }]
                            }]
                        }, {
                            "name" : "point:i(6)",
                            "parent" : ["penstroke", "penstroke:i(0)"],
                            "level" : "point",
                            "ruleIndex" : null,
                            "parameters" : [{
                                "name" : "Weight",
                                "cpsFactor" : 1,
                                "operators" : [{
                                    "name" : "=",
                                    "value" : 11
                                }, {
                                    "name" : "effectiveValue",
                                    "initial" : 11,
                                    "value" : 11
                                }]
                            }]
                        }, {
                            "name" : "point:i(7)",
                            "parent" : ["penstroke", "penstroke:i(0)"],
                            "level" : "point",
                            "ruleIndex" : null,
                            "parameters" : [{
                                "name" : "Weight",
                                "cpsFactor" : 1,
                                "operators" : [{
                                    "name" : "=",
                                    "value" : 10
                                }, {
                                    "name" : "effectiveValue",
                                    "initial" : 10,
                                    "value" : 10
                                }]
                            }]
                        }, {
                            "name" : "point:i(8)",
                            "parent" : ["penstroke", "penstroke:i(0)"],
                            "level" : "point",
                            "ruleIndex" : null,
                            "parameters" : [{
                                "name" : "Weight",
                                "cpsFactor" : 1,
                                "operators" : [{
                                    "name" : "=",
                                    "value" : 10.259142264341596
                                }, {
                                    "name" : "effectiveValue",
                                    "initial" : 10.259142264341596,
                                    "value" : 10.259142264341596
                                }]
                            }]
                        }]
                    }]
                }, {
                    "name" : "g",
                    "parent" : ["master", "regular"],
                    "level" : "glyph",
                    "ruleIndex" : null,
                    "edit" : false,
                    "parameters" : [{
                        "name" : "Width",
                        "cpsFactor" : 1,
                        "operators" : [{
                            "name" : "=",
                            "value" : 568
                        }, {
                            "name" : "effectiveValue",
                            "initial" : 568,
                            "value" : 568
                        }]
                    }],
                    "children" : [{
                        "name" : "penstroke:i(0)",
                        "parent" : ["glyph", "g"],
                        "level" : "penstroke",
                        "ruleIndex" : null,
                        "parameters" : [],
                        "children" : [{
                            "name" : "point:i(0)",
                            "parent" : ["penstroke", "penstroke:i(0)"],
                            "level" : "point",
                            "ruleIndex" : null,
                            "parameters" : [{
                                "name" : "Weight",
                                "cpsFactor" : 1,
                                "operators" : [{
                                    "name" : "=",
                                    "value" : 10
                                }, {
                                    "name" : "effectiveValue",
                                    "initial" : 10,
                                    "value" : 10
                                }]
                            }]
                        }, {
                            "name" : "point:i(1)",
                            "parent" : ["penstroke", "penstroke:i(0)"],
                            "level" : "point",
                            "ruleIndex" : null,
                            "parameters" : [{
                                "name" : "Weight",
                                "cpsFactor" : 1,
                                "operators" : [{
                                    "name" : "=",
                                    "value" : 10.977249200050075
                                }, {
                                    "name" : "effectiveValue",
                                    "initial" : 10.977249200050075,
                                    "value" : 10.977249200050075
                                }]
                            }]
                        }]
                    }, {
                        "name" : "penstroke:i(1)",
                        "parent" : ["glyph", "g"],
                        "level" : "penstroke",
                        "ruleIndex" : null,
                        "parameters" : [],
                        "children" : [{
                            "name" : "point:i(0)",
                            "parent" : ["penstroke", "penstroke:i(1)"],
                            "level" : "point",
                            "ruleIndex" : null,
                            "parameters" : [{
                                "name" : "Weight",
                                "cpsFactor" : 1,
                                "operators" : [{
                                    "name" : "=",
                                    "value" : 11.01135777277262
                                }, {
                                    "name" : "effectiveValue",
                                    "initial" : 11.01135777277262,
                                    "value" : 11.01135777277262
                                }]
                            }]
                        }, {
                            "name" : "point:i(1)",
                            "parent" : ["penstroke", "penstroke:i(1)"],
                            "level" : "point",
                            "ruleIndex" : null,
                            "parameters" : [{
                                "name" : "Weight",
                                "cpsFactor" : 1,
                                "operators" : [{
                                    "name" : "=",
                                    "value" : 10
                                }, {
                                    "name" : "effectiveValue",
                                    "initial" : 10,
                                    "value" : 10
                                }]
                            }]
                        }, {
                            "name" : "point:i(2)",
                            "parent" : ["penstroke", "penstroke:i(1)"],
                            "level" : "point",
                            "ruleIndex" : null,
                            "parameters" : [{
                                "name" : "Weight",
                                "cpsFactor" : 1,
                                "operators" : [{
                                    "name" : "=",
                                    "value" : 11.01135777277262
                                }, {
                                    "name" : "effectiveValue",
                                    "initial" : 11.01135777277262,
                                    "value" : 11.01135777277262
                                }]
                            }]
                        }, {
                            "name" : "point:i(3)",
                            "parent" : ["penstroke", "penstroke:i(1)"],
                            "level" : "point",
                            "ruleIndex" : null,
                            "parameters" : [{
                                "name" : "Weight",
                                "cpsFactor" : 1,
                                "operators" : [{
                                    "name" : "=",
                                    "value" : 10.04987562112089
                                }, {
                                    "name" : "effectiveValue",
                                    "initial" : 10.04987562112089,
                                    "value" : 10.04987562112089
                                }]
                            }]
                        }, {
                            "name" : "point:i(4)",
                            "parent" : ["penstroke", "penstroke:i(1)"],
                            "level" : "point",
                            "ruleIndex" : null,
                            "parameters" : [{
                                "name" : "Weight",
                                "cpsFactor" : 1,
                                "operators" : [{
                                    "name" : "=",
                                    "value" : 11.01135777277262
                                }, {
                                    "name" : "effectiveValue",
                                    "initial" : 11.01135777277262,
                                    "value" : 11.01135777277262
                                }]
                            }]
                        }]
                    }, {
                        "name" : "penstroke:i(2)",
                        "parent" : ["glyph", "g"],
                        "level" : "penstroke",
                        "ruleIndex" : null,
                        "parameters" : [],
                        "children" : [{
                            "name" : "point:i(0)",
                            "parent" : ["penstroke", "penstroke:i(2)"],
                            "level" : "point",
                            "ruleIndex" : null,
                            "parameters" : [{
                                "name" : "Weight",
                                "cpsFactor" : 1,
                                "operators" : [{
                                    "name" : "=",
                                    "value" : 7.810249675906654
                                }, {
                                    "name" : "effectiveValue",
                                    "initial" : 7.810249675906654,
                                    "value" : 7.810249675906654
                                }]
                            }]
                        }, {
                            "name" : "point:i(1)",
                            "parent" : ["penstroke", "penstroke:i(2)"],
                            "level" : "point",
                            "ruleIndex" : null,
                            "parameters" : [{
                                "name" : "Weight",
                                "cpsFactor" : 1,
                                "operators" : [{
                                    "name" : "=",
                                    "value" : 11.045361017187261
                                }, {
                                    "name" : "effectiveValue",
                                    "initial" : 11.045361017187261,
                                    "value" : 11.045361017187261
                                }]
                            }]
                        }, {
                            "name" : "point:i(2)",
                            "parent" : ["penstroke", "penstroke:i(2)"],
                            "level" : "point",
                            "ruleIndex" : null,
                            "parameters" : [{
                                "name" : "Weight",
                                "cpsFactor" : 1,
                                "operators" : [{
                                    "name" : "=",
                                    "value" : 9.7082439194738
                                }, {
                                    "name" : "effectiveValue",
                                    "initial" : 9.7082439194738,
                                    "value" : 9.7082439194738
                                }]
                            }]
                        }, {
                            "name" : "point:i(3)",
                            "parent" : ["penstroke", "penstroke:i(2)"],
                            "level" : "point",
                            "ruleIndex" : null,
                            "parameters" : [{
                                "name" : "Weight",
                                "cpsFactor" : 1,
                                "operators" : [{
                                    "name" : "=",
                                    "value" : 10.04987562112089
                                }, {
                                    "name" : "effectiveValue",
                                    "initial" : 10.04987562112089,
                                    "value" : 10.04987562112089
                                }]
                            }]
                        }, {
                            "name" : "point:i(4)",
                            "parent" : ["penstroke", "penstroke:i(2)"],
                            "level" : "point",
                            "ruleIndex" : null,
                            "parameters" : [{
                                "name" : "Weight",
                                "cpsFactor" : 1,
                                "operators" : [{
                                    "name" : "=",
                                    "value" : 10.012492197250394
                                }, {
                                    "name" : "effectiveValue",
                                    "initial" : 10.012492197250394,
                                    "value" : 10.012492197250394
                                }]
                            }]
                        }, {
                            "name" : "point:i(5)",
                            "parent" : ["penstroke", "penstroke:i(2)"],
                            "level" : "point",
                            "ruleIndex" : null,
                            "parameters" : [{
                                "name" : "Weight",
                                "cpsFactor" : 1,
                                "operators" : [{
                                    "name" : "=",
                                    "value" : 11.01135777277262
                                }, {
                                    "name" : "effectiveValue",
                                    "initial" : 11.01135777277262,
                                    "value" : 11.01135777277262
                                }]
                            }]
                        }, {
                            "name" : "point:i(6)",
                            "parent" : ["penstroke", "penstroke:i(2)"],
                            "level" : "point",
                            "ruleIndex" : null,
                            "parameters" : [{
                                "name" : "Weight",
                                "cpsFactor" : 1,
                                "operators" : [{
                                    "name" : "=",
                                    "value" : 8.139410298049853
                                }, {
                                    "name" : "effectiveValue",
                                    "initial" : 8.139410298049853,
                                    "value" : 8.139410298049853
                                }]
                            }]
                        }]
                    }]
                }, {
                    "name" : "l",
                    "parent" : ["master", "regular"],
                    "level" : "glyph",
                    "ruleIndex" : null,
                    "edit" : false,
                    "parameters" : [{
                        "name" : "Width",
                        "cpsFactor" : 1,
                        "operators" : [{
                            "name" : "=",
                            "value" : 222
                        }, {
                            "name" : "effectiveValue",
                            "initial" : 222,
                            "value" : 222
                        }]
                    }],
                    "children" : [{
                        "name" : "penstroke:i(0)",
                        "parent" : ["glyph", "l"],
                        "level" : "penstroke",
                        "ruleIndex" : null,
                        "parameters" : [],
                        "children" : [{
                            "name" : "point:i(0)",
                            "parent" : ["penstroke", "penstroke:i(0)"],
                            "level" : "point",
                            "ruleIndex" : null,
                            "parameters" : [{
                                "name" : "Weight",
                                "cpsFactor" : 1,
                                "operators" : [{
                                    "name" : "=",
                                    "value" : 10
                                }, {
                                    "name" : "effectiveValue",
                                    "initial" : 10,
                                    "value" : 10
                                }]
                            }]
                        }, {
                            "name" : "point:i(1)",
                            "parent" : ["penstroke", "penstroke:i(0)"],
                            "level" : "point",
                            "ruleIndex" : null,
                            "parameters" : [{
                                "name" : "Weight",
                                "cpsFactor" : 1,
                                "operators" : [{
                                    "name" : "=",
                                    "value" : 10
                                }, {
                                    "name" : "effectiveValue",
                                    "initial" : 10,
                                    "value" : 10
                                }]
                            }]
                        }]
                    }, {
                        "name" : "penstroke:i(1)",
                        "parent" : ["glyph", "l"],
                        "level" : "penstroke",
                        "ruleIndex" : null,
                        "parameters" : [],
                        "children" : [{
                            "name" : "point:i(0)",
                            "parent" : ["penstroke", "penstroke:i(1)"],
                            "level" : "point",
                            "ruleIndex" : null,
                            "parameters" : [{
                                "name" : "Weight",
                                "cpsFactor" : 1,
                                "operators" : [{
                                    "name" : "=",
                                    "value" : 10
                                }, {
                                    "name" : "effectiveValue",
                                    "initial" : 10,
                                    "value" : 10
                                }]
                            }]
                        }, {
                            "name" : "point:i(1)",
                            "parent" : ["penstroke", "penstroke:i(1)"],
                            "level" : "point",
                            "ruleIndex" : null,
                            "parameters" : [{
                                "name" : "Weight",
                                "cpsFactor" : 1,
                                "operators" : [{
                                    "name" : "=",
                                    "value" : 10
                                }, {
                                    "name" : "effectiveValue",
                                    "initial" : 10,
                                    "value" : 10
                                }]
                            }]
                        }]
                    }, {
                        "name" : "penstroke:i(2)",
                        "parent" : ["glyph", "l"],
                        "level" : "penstroke",
                        "ruleIndex" : null,
                        "parameters" : [],
                        "children" : [{
                            "name" : "point:i(0)",
                            "parent" : ["penstroke", "penstroke:i(2)"],
                            "level" : "point",
                            "ruleIndex" : null,
                            "parameters" : [{
                                "name" : "Weight",
                                "cpsFactor" : 1,
                                "operators" : [{
                                    "name" : "=",
                                    "value" : 10
                                }, {
                                    "name" : "effectiveValue",
                                    "initial" : 10,
                                    "value" : 10
                                }]
                            }]
                        }, {
                            "name" : "point:i(1)",
                            "parent" : ["penstroke", "penstroke:i(2)"],
                            "level" : "point",
                            "ruleIndex" : null,
                            "parameters" : [{
                                "name" : "Weight",
                                "cpsFactor" : 1,
                                "operators" : [{
                                    "name" : "=",
                                    "value" : 10
                                }, {
                                    "name" : "effectiveValue",
                                    "initial" : 10,
                                    "value" : 10
                                }]
                            }]
                        }]
                    }, {
                        "name" : "penstroke:i(3)",
                        "parent" : ["glyph", "l"],
                        "level" : "penstroke",
                        "ruleIndex" : null,
                        "parameters" : [],
                        "children" : [{
                            "name" : "point:i(0)",
                            "parent" : ["penstroke", "penstroke:i(3)"],
                            "level" : "point",
                            "ruleIndex" : null,
                            "parameters" : [{
                                "name" : "Weight",
                                "cpsFactor" : 1,
                                "operators" : [{
                                    "name" : "=",
                                    "value" : 11
                                }, {
                                    "name" : "effectiveValue",
                                    "initial" : 11,
                                    "value" : 11
                                }]
                            }]
                        }, {
                            "name" : "point:i(1)",
                            "parent" : ["penstroke", "penstroke:i(3)"],
                            "level" : "point",
                            "ruleIndex" : null,
                            "parameters" : [{
                                "name" : "Weight",
                                "cpsFactor" : 1,
                                "operators" : [{
                                    "name" : "=",
                                    "value" : 11
                                }, {
                                    "name" : "effectiveValue",
                                    "initial" : 11,
                                    "value" : 11
                                }]
                            }]
                        }]
                    }]
                }, {
                    "name" : "o",
                    "parent" : ["master", "regular"],
                    "level" : "glyph",
                    "ruleIndex" : null,
                    "edit" : false,
                    "parameters" : [{
                        "name" : "Width",
                        "cpsFactor" : 1,
                        "operators" : [{
                            "name" : "=",
                            "value" : 644
                        }, {
                            "name" : "effectiveValue",
                            "initial" : 644,
                            "value" : 644
                        }]
                    }],
                    "children" : [{
                        "name" : "penstroke:i(0)",
                        "parent" : ["glyph", "o"],
                        "level" : "penstroke",
                        "ruleIndex" : null,
                        "parameters" : [],
                        "children" : [{
                            "name" : "point:i(0)",
                            "parent" : ["penstroke", "penstroke:i(0)"],
                            "level" : "point",
                            "ruleIndex" : null,
                            "parameters" : [{
                                "name" : "Weight",
                                "cpsFactor" : 1,
                                "operators" : [{
                                    "name" : "=",
                                    "value" : 11
                                }, {
                                    "name" : "effectiveValue",
                                    "initial" : 11,
                                    "value" : 11
                                }]
                            }]
                        }, {
                            "name" : "point:i(1)",
                            "parent" : ["penstroke", "penstroke:i(0)"],
                            "level" : "point",
                            "ruleIndex" : null,
                            "parameters" : [{
                                "name" : "Weight",
                                "cpsFactor" : 1,
                                "operators" : [{
                                    "name" : "=",
                                    "value" : 10.012492197250394
                                }, {
                                    "name" : "effectiveValue",
                                    "initial" : 10.012492197250394,
                                    "value" : 10.012492197250394
                                }]
                            }]
                        }, {
                            "name" : "point:i(2)",
                            "parent" : ["penstroke", "penstroke:i(0)"],
                            "level" : "point",
                            "ruleIndex" : null,
                            "parameters" : [{
                                "name" : "Weight",
                                "cpsFactor" : 1,
                                "operators" : [{
                                    "name" : "=",
                                    "value" : 11
                                }, {
                                    "name" : "effectiveValue",
                                    "initial" : 11,
                                    "value" : 11
                                }]
                            }]
                        }, {
                            "name" : "point:i(3)",
                            "parent" : ["penstroke", "penstroke:i(0)"],
                            "level" : "point",
                            "ruleIndex" : null,
                            "parameters" : [{
                                "name" : "Weight",
                                "cpsFactor" : 1,
                                "operators" : [{
                                    "name" : "=",
                                    "value" : 10.012492197250394
                                }, {
                                    "name" : "effectiveValue",
                                    "initial" : 10.012492197250394,
                                    "value" : 10.012492197250394
                                }]
                            }]
                        }, {
                            "name" : "point:i(4)",
                            "parent" : ["penstroke", "penstroke:i(0)"],
                            "level" : "point",
                            "ruleIndex" : null,
                            "parameters" : [{
                                "name" : "Weight",
                                "cpsFactor" : 1,
                                "operators" : [{
                                    "name" : "=",
                                    "value" : 11
                                }, {
                                    "name" : "effectiveValue",
                                    "initial" : 11,
                                    "value" : 11
                                }]
                            }]
                        }]
                    }]
                }, {
                    "name" : "p",
                    "parent" : ["master", "regular"],
                    "level" : "glyph",
                    "ruleIndex" : null,
                    "edit" : false,
                    "parameters" : [{
                        "name" : "Width",
                        "cpsFactor" : 1,
                        "operators" : [{
                            "name" : "=",
                            "value" : 627
                        }, {
                            "name" : "effectiveValue",
                            "initial" : 627,
                            "value" : 627
                        }]
                    }],
                    "children" : [{
                        "name" : "penstroke:i(0)",
                        "parent" : ["glyph", "p"],
                        "level" : "penstroke",
                        "ruleIndex" : null,
                        "parameters" : [],
                        "children" : [{
                            "name" : "point:i(0)",
                            "parent" : ["penstroke", "penstroke:i(0)"],
                            "level" : "point",
                            "ruleIndex" : null,
                            "parameters" : [{
                                "name" : "Weight",
                                "cpsFactor" : 1,
                                "operators" : [{
                                    "name" : "=",
                                    "value" : 10
                                }, {
                                    "name" : "effectiveValue",
                                    "initial" : 10,
                                    "value" : 10
                                }]
                            }]
                        }, {
                            "name" : "point:i(1)",
                            "parent" : ["penstroke", "penstroke:i(0)"],
                            "level" : "point",
                            "ruleIndex" : null,
                            "parameters" : [{
                                "name" : "Weight",
                                "cpsFactor" : 1,
                                "operators" : [{
                                    "name" : "=",
                                    "value" : 10
                                }, {
                                    "name" : "effectiveValue",
                                    "initial" : 10,
                                    "value" : 10
                                }]
                            }]
                        }]
                    }, {
                        "name" : "penstroke:i(1)",
                        "parent" : ["glyph", "p"],
                        "level" : "penstroke",
                        "ruleIndex" : null,
                        "parameters" : [],
                        "children" : [{
                            "name" : "point:i(0)",
                            "parent" : ["penstroke", "penstroke:i(1)"],
                            "level" : "point",
                            "ruleIndex" : null,
                            "parameters" : [{
                                "name" : "Weight",
                                "cpsFactor" : 1,
                                "operators" : [{
                                    "name" : "=",
                                    "value" : 10
                                }, {
                                    "name" : "effectiveValue",
                                    "initial" : 10,
                                    "value" : 10
                                }]
                            }]
                        }, {
                            "name" : "point:i(1)",
                            "parent" : ["penstroke", "penstroke:i(1)"],
                            "level" : "point",
                            "ruleIndex" : null,
                            "parameters" : [{
                                "name" : "Weight",
                                "cpsFactor" : 1,
                                "operators" : [{
                                    "name" : "=",
                                    "value" : 10
                                }, {
                                    "name" : "effectiveValue",
                                    "initial" : 10,
                                    "value" : 10
                                }]
                            }]
                        }]
                    }, {
                        "name" : "penstroke:i(2)",
                        "parent" : ["glyph", "p"],
                        "level" : "penstroke",
                        "ruleIndex" : null,
                        "parameters" : [],
                        "children" : [{
                            "name" : "point:i(0)",
                            "parent" : ["penstroke", "penstroke:i(2)"],
                            "level" : "point",
                            "ruleIndex" : null,
                            "parameters" : [{
                                "name" : "Weight",
                                "cpsFactor" : 1,
                                "operators" : [{
                                    "name" : "=",
                                    "value" : 10
                                }, {
                                    "name" : "effectiveValue",
                                    "initial" : 10,
                                    "value" : 10
                                }]
                            }]
                        }, {
                            "name" : "point:i(1)",
                            "parent" : ["penstroke", "penstroke:i(2)"],
                            "level" : "point",
                            "ruleIndex" : null,
                            "parameters" : [{
                                "name" : "Weight",
                                "cpsFactor" : 1,
                                "operators" : [{
                                    "name" : "=",
                                    "value" : 10
                                }, {
                                    "name" : "effectiveValue",
                                    "initial" : 10,
                                    "value" : 10
                                }]
                            }]
                        }]
                    }, {
                        "name" : "penstroke:i(3)",
                        "parent" : ["glyph", "p"],
                        "level" : "penstroke",
                        "ruleIndex" : null,
                        "parameters" : [],
                        "children" : [{
                            "name" : "point:i(0)",
                            "parent" : ["penstroke", "penstroke:i(3)"],
                            "level" : "point",
                            "ruleIndex" : null,
                            "parameters" : [{
                                "name" : "Weight",
                                "cpsFactor" : 1,
                                "operators" : [{
                                    "name" : "=",
                                    "value" : 8.902246907382429
                                }, {
                                    "name" : "effectiveValue",
                                    "initial" : 8.902246907382429,
                                    "value" : 8.902246907382429
                                }]
                            }]
                        }, {
                            "name" : "point:i(1)",
                            "parent" : ["penstroke", "penstroke:i(3)"],
                            "level" : "point",
                            "ruleIndex" : null,
                            "parameters" : [{
                                "name" : "Weight",
                                "cpsFactor" : 1,
                                "operators" : [{
                                    "name" : "=",
                                    "value" : 10.012492197250394
                                }, {
                                    "name" : "effectiveValue",
                                    "initial" : 10.012492197250394,
                                    "value" : 10.012492197250394
                                }]
                            }]
                        }, {
                            "name" : "point:i(2)",
                            "parent" : ["penstroke", "penstroke:i(3)"],
                            "level" : "point",
                            "ruleIndex" : null,
                            "parameters" : [{
                                "name" : "Weight",
                                "cpsFactor" : 1,
                                "operators" : [{
                                    "name" : "=",
                                    "value" : 11.01135777277262
                                }, {
                                    "name" : "effectiveValue",
                                    "initial" : 11.01135777277262,
                                    "value" : 11.01135777277262
                                }]
                            }]
                        }, {
                            "name" : "point:i(3)",
                            "parent" : ["penstroke", "penstroke:i(3)"],
                            "level" : "point",
                            "ruleIndex" : null,
                            "parameters" : [{
                                "name" : "Weight",
                                "cpsFactor" : 1,
                                "operators" : [{
                                    "name" : "=",
                                    "value" : 10
                                }, {
                                    "name" : "effectiveValue",
                                    "initial" : 10,
                                    "value" : 10
                                }]
                            }]
                        }, {
                            "name" : "point:i(4)",
                            "parent" : ["penstroke", "penstroke:i(3)"],
                            "level" : "point",
                            "ruleIndex" : null,
                            "parameters" : [{
                                "name" : "Weight",
                                "cpsFactor" : 1,
                                "operators" : [{
                                    "name" : "=",
                                    "value" : 8.902246907382429
                                }, {
                                    "name" : "effectiveValue",
                                    "initial" : 8.902246907382429,
                                    "value" : 8.902246907382429
                                }]
                            }]
                        }]
                    }, {
                        "name" : "penstroke:i(4)",
                        "parent" : ["glyph", "p"],
                        "level" : "penstroke",
                        "ruleIndex" : null,
                        "parameters" : [],
                        "children" : [{
                            "name" : "point:i(0)",
                            "parent" : ["penstroke", "penstroke:i(4)"],
                            "level" : "point",
                            "ruleIndex" : null,
                            "parameters" : [{
                                "name" : "Weight",
                                "cpsFactor" : 1,
                                "operators" : [{
                                    "name" : "=",
                                    "value" : 11
                                }, {
                                    "name" : "effectiveValue",
                                    "initial" : 11,
                                    "value" : 11
                                }]
                            }]
                        }, {
                            "name" : "point:i(1)",
                            "parent" : ["penstroke", "penstroke:i(4)"],
                            "level" : "point",
                            "ruleIndex" : null,
                            "parameters" : [{
                                "name" : "Weight",
                                "cpsFactor" : 1,
                                "operators" : [{
                                    "name" : "=",
                                    "value" : 11
                                }, {
                                    "name" : "effectiveValue",
                                    "initial" : 11,
                                    "value" : 11
                                }]
                            }]
                        }]
                    }]
                }, {
                    "name" : "r",
                    "parent" : ["master", "regular"],
                    "level" : "glyph",
                    "ruleIndex" : null,
                    "edit" : false,
                    "parameters" : [{
                        "name" : "Width",
                        "cpsFactor" : 1,
                        "operators" : [{
                            "name" : "=",
                            "value" : 405
                        }, {
                            "name" : "effectiveValue",
                            "initial" : 405,
                            "value" : 405
                        }]
                    }],
                    "children" : [{
                        "name" : "penstroke:i(0)",
                        "parent" : ["glyph", "r"],
                        "level" : "penstroke",
                        "ruleIndex" : null,
                        "parameters" : [],
                        "children" : [{
                            "name" : "point:i(0)",
                            "parent" : ["penstroke", "penstroke:i(0)"],
                            "level" : "point",
                            "ruleIndex" : null,
                            "parameters" : [{
                                "name" : "Weight",
                                "cpsFactor" : 1,
                                "operators" : [{
                                    "name" : "=",
                                    "value" : 10
                                }, {
                                    "name" : "effectiveValue",
                                    "initial" : 10,
                                    "value" : 10
                                }]
                            }]
                        }, {
                            "name" : "point:i(1)",
                            "parent" : ["penstroke", "penstroke:i(0)"],
                            "level" : "point",
                            "ruleIndex" : null,
                            "parameters" : [{
                                "name" : "Weight",
                                "cpsFactor" : 1,
                                "operators" : [{
                                    "name" : "=",
                                    "value" : 10
                                }, {
                                    "name" : "effectiveValue",
                                    "initial" : 10,
                                    "value" : 10
                                }]
                            }]
                        }]
                    }, {
                        "name" : "penstroke:i(1)",
                        "parent" : ["glyph", "r"],
                        "level" : "penstroke",
                        "ruleIndex" : null,
                        "parameters" : [],
                        "children" : [{
                            "name" : "point:i(0)",
                            "parent" : ["penstroke", "penstroke:i(1)"],
                            "level" : "point",
                            "ruleIndex" : null,
                            "parameters" : [{
                                "name" : "Weight",
                                "cpsFactor" : 1,
                                "operators" : [{
                                    "name" : "=",
                                    "value" : 10
                                }, {
                                    "name" : "effectiveValue",
                                    "initial" : 10,
                                    "value" : 10
                                }]
                            }]
                        }, {
                            "name" : "point:i(1)",
                            "parent" : ["penstroke", "penstroke:i(1)"],
                            "level" : "point",
                            "ruleIndex" : null,
                            "parameters" : [{
                                "name" : "Weight",
                                "cpsFactor" : 1,
                                "operators" : [{
                                    "name" : "=",
                                    "value" : 10
                                }, {
                                    "name" : "effectiveValue",
                                    "initial" : 10,
                                    "value" : 10
                                }]
                            }]
                        }]
                    }, {
                        "name" : "penstroke:i(2)",
                        "parent" : ["glyph", "r"],
                        "level" : "penstroke",
                        "ruleIndex" : null,
                        "parameters" : [],
                        "children" : [{
                            "name" : "point:i(0)",
                            "parent" : ["penstroke", "penstroke:i(2)"],
                            "level" : "point",
                            "ruleIndex" : null,
                            "parameters" : [{
                                "name" : "Weight",
                                "cpsFactor" : 1,
                                "operators" : [{
                                    "name" : "=",
                                    "value" : 10
                                }, {
                                    "name" : "effectiveValue",
                                    "initial" : 10,
                                    "value" : 10
                                }]
                            }]
                        }, {
                            "name" : "point:i(1)",
                            "parent" : ["penstroke", "penstroke:i(2)"],
                            "level" : "point",
                            "ruleIndex" : null,
                            "parameters" : [{
                                "name" : "Weight",
                                "cpsFactor" : 1,
                                "operators" : [{
                                    "name" : "=",
                                    "value" : 10
                                }, {
                                    "name" : "effectiveValue",
                                    "initial" : 10,
                                    "value" : 10
                                }]
                            }]
                        }]
                    }, {
                        "name" : "penstroke:i(3)",
                        "parent" : ["glyph", "r"],
                        "level" : "penstroke",
                        "ruleIndex" : null,
                        "parameters" : [],
                        "children" : [{
                            "name" : "point:i(0)",
                            "parent" : ["penstroke", "penstroke:i(3)"],
                            "level" : "point",
                            "ruleIndex" : null,
                            "parameters" : [{
                                "name" : "Weight",
                                "cpsFactor" : 1,
                                "operators" : [{
                                    "name" : "=",
                                    "value" : 11
                                }, {
                                    "name" : "effectiveValue",
                                    "initial" : 11,
                                    "value" : 11
                                }]
                            }]
                        }, {
                            "name" : "point:i(1)",
                            "parent" : ["penstroke", "penstroke:i(3)"],
                            "level" : "point",
                            "ruleIndex" : null,
                            "parameters" : [{
                                "name" : "Weight",
                                "cpsFactor" : 1,
                                "operators" : [{
                                    "name" : "=",
                                    "value" : 11
                                }, {
                                    "name" : "effectiveValue",
                                    "initial" : 11,
                                    "value" : 11
                                }]
                            }]
                        }]
                    }, {
                        "name" : "penstroke:i(4)",
                        "parent" : ["glyph", "r"],
                        "level" : "penstroke",
                        "ruleIndex" : null,
                        "parameters" : [],
                        "children" : [{
                            "name" : "point:i(0)",
                            "parent" : ["penstroke", "penstroke:i(4)"],
                            "level" : "point",
                            "ruleIndex" : null,
                            "parameters" : [{
                                "name" : "Weight",
                                "cpsFactor" : 1,
                                "operators" : [{
                                    "name" : "=",
                                    "value" : 7.5
                                }, {
                                    "name" : "effectiveValue",
                                    "initial" : 7.5,
                                    "value" : 7.5
                                }]
                            }]
                        }, {
                            "name" : "point:i(1)",
                            "parent" : ["penstroke", "penstroke:i(4)"],
                            "level" : "point",
                            "ruleIndex" : null,
                            "parameters" : [{
                                "name" : "Weight",
                                "cpsFactor" : 1,
                                "operators" : [{
                                    "name" : "=",
                                    "value" : 10
                                }, {
                                    "name" : "effectiveValue",
                                    "initial" : 10,
                                    "value" : 10
                                }]
                            }]
                        }]
                    }]
                }, {
                    "name" : "t",
                    "parent" : ["master", "regular"],
                    "level" : "glyph",
                    "ruleIndex" : null,
                    "edit" : false,
                    "parameters" : [{
                        "name" : "Width",
                        "cpsFactor" : 1,
                        "operators" : [{
                            "name" : "=",
                            "value" : 464
                        }, {
                            "name" : "effectiveValue",
                            "initial" : 464,
                            "value" : 464
                        }]
                    }],
                    "children" : [{
                        "name" : "penstroke:i(0)",
                        "parent" : ["glyph", "t"],
                        "level" : "penstroke",
                        "ruleIndex" : null,
                        "parameters" : [],
                        "children" : [{
                            "name" : "point:i(0)",
                            "parent" : ["penstroke", "penstroke:i(0)"],
                            "level" : "point",
                            "ruleIndex" : null,
                            "parameters" : [{
                                "name" : "Weight",
                                "cpsFactor" : 1,
                                "operators" : [{
                                    "name" : "=",
                                    "value" : 10
                                }, {
                                    "name" : "effectiveValue",
                                    "initial" : 10,
                                    "value" : 10
                                }]
                            }]
                        }, {
                            "name" : "point:i(1)",
                            "parent" : ["penstroke", "penstroke:i(0)"],
                            "level" : "point",
                            "ruleIndex" : null,
                            "parameters" : [{
                                "name" : "Weight",
                                "cpsFactor" : 1,
                                "operators" : [{
                                    "name" : "=",
                                    "value" : 10
                                }, {
                                    "name" : "effectiveValue",
                                    "initial" : 10,
                                    "value" : 10
                                }]
                            }]
                        }]
                    }, {
                        "name" : "penstroke:i(1)",
                        "parent" : ["glyph", "t"],
                        "level" : "penstroke",
                        "ruleIndex" : null,
                        "parameters" : [],
                        "children" : [{
                            "name" : "point:i(0)",
                            "parent" : ["penstroke", "penstroke:i(1)"],
                            "level" : "point",
                            "ruleIndex" : null,
                            "parameters" : [{
                                "name" : "Weight",
                                "cpsFactor" : 1,
                                "operators" : [{
                                    "name" : "=",
                                    "value" : 9.617692030835672
                                }, {
                                    "name" : "effectiveValue",
                                    "initial" : 9.617692030835672,
                                    "value" : 9.617692030835672
                                }]
                            }]
                        }, {
                            "name" : "point:i(1)",
                            "parent" : ["penstroke", "penstroke:i(1)"],
                            "level" : "point",
                            "ruleIndex" : null,
                            "parameters" : [{
                                "name" : "Weight",
                                "cpsFactor" : 1,
                                "operators" : [{
                                    "name" : "=",
                                    "value" : 10.04987562112089
                                }, {
                                    "name" : "effectiveValue",
                                    "initial" : 10.04987562112089,
                                    "value" : 10.04987562112089
                                }]
                            }]
                        }, {
                            "name" : "point:i(2)",
                            "parent" : ["penstroke", "penstroke:i(1)"],
                            "level" : "point",
                            "ruleIndex" : null,
                            "parameters" : [{
                                "name" : "Weight",
                                "cpsFactor" : 1,
                                "operators" : [{
                                    "name" : "=",
                                    "value" : 11.01135777277262
                                }, {
                                    "name" : "effectiveValue",
                                    "initial" : 11.01135777277262,
                                    "value" : 11.01135777277262
                                }]
                            }]
                        }, {
                            "name" : "point:i(3)",
                            "parent" : ["penstroke", "penstroke:i(1)"],
                            "level" : "point",
                            "ruleIndex" : null,
                            "parameters" : [{
                                "name" : "Weight",
                                "cpsFactor" : 1,
                                "operators" : [{
                                    "name" : "=",
                                    "value" : 12.776932339180638
                                }, {
                                    "name" : "effectiveValue",
                                    "initial" : 12.776932339180638,
                                    "value" : 12.776932339180638
                                }]
                            }]
                        }]
                    }]
                }, {
                    "name" : "A",
                    "parent" : ["master", "regular"],
                    "level" : "glyph",
                    "ruleIndex" : null,
                    "edit" : false,
                    "parameters" : [{
                        "name" : "Width",
                        "cpsFactor" : 1,
                        "operators" : [{
                            "name" : "=",
                            "value" : 781
                        }, {
                            "name" : "effectiveValue",
                            "initial" : 781,
                            "value" : 781
                        }]
                    }],
                    "children" : [{
                        "name" : "penstroke:i(0)",
                        "parent" : ["glyph", "A"],
                        "level" : "penstroke",
                        "ruleIndex" : null,
                        "parameters" : [],
                        "children" : [{
                            "name" : "point:i(0)",
                            "parent" : ["penstroke", "penstroke:i(0)"],
                            "level" : "point",
                            "ruleIndex" : null,
                            "parameters" : [{
                                "name" : "Weight",
                                "cpsFactor" : 1,
                                "operators" : [{
                                    "name" : "=",
                                    "value" : 10
                                }, {
                                    "name" : "effectiveValue",
                                    "initial" : 10,
                                    "value" : 10
                                }]
                            }]
                        }, {
                            "name" : "point:i(1)",
                            "parent" : ["penstroke", "penstroke:i(0)"],
                            "level" : "point",
                            "ruleIndex" : null,
                            "parameters" : [{
                                "name" : "Weight",
                                "cpsFactor" : 1,
                                "operators" : [{
                                    "name" : "=",
                                    "value" : 10
                                }, {
                                    "name" : "effectiveValue",
                                    "initial" : 10,
                                    "value" : 10
                                }]
                            }]
                        }]
                    }, {
                        "name" : "penstroke:i(1)",
                        "parent" : ["glyph", "A"],
                        "level" : "penstroke",
                        "ruleIndex" : null,
                        "parameters" : [],
                        "children" : [{
                            "name" : "point:i(0)",
                            "parent" : ["penstroke", "penstroke:i(1)"],
                            "level" : "point",
                            "ruleIndex" : null,
                            "parameters" : [{
                                "name" : "Weight",
                                "cpsFactor" : 1,
                                "operators" : [{
                                    "name" : "=",
                                    "value" : 10
                                }, {
                                    "name" : "effectiveValue",
                                    "initial" : 10,
                                    "value" : 10
                                }]
                            }]
                        }, {
                            "name" : "point:i(1)",
                            "parent" : ["penstroke", "penstroke:i(1)"],
                            "level" : "point",
                            "ruleIndex" : null,
                            "parameters" : [{
                                "name" : "Weight",
                                "cpsFactor" : 1,
                                "operators" : [{
                                    "name" : "=",
                                    "value" : 10
                                }, {
                                    "name" : "effectiveValue",
                                    "initial" : 10,
                                    "value" : 10
                                }]
                            }]
                        }]
                    }, {
                        "name" : "penstroke:i(2)",
                        "parent" : ["glyph", "A"],
                        "level" : "penstroke",
                        "ruleIndex" : null,
                        "parameters" : [],
                        "children" : [{
                            "name" : "point:i(0)",
                            "parent" : ["penstroke", "penstroke:i(2)"],
                            "level" : "point",
                            "ruleIndex" : null,
                            "parameters" : [{
                                "name" : "Weight",
                                "cpsFactor" : 1,
                                "operators" : [{
                                    "name" : "=",
                                    "value" : 10
                                }, {
                                    "name" : "effectiveValue",
                                    "initial" : 10,
                                    "value" : 10
                                }]
                            }]
                        }, {
                            "name" : "point:i(1)",
                            "parent" : ["penstroke", "penstroke:i(2)"],
                            "level" : "point",
                            "ruleIndex" : null,
                            "parameters" : [{
                                "name" : "Weight",
                                "cpsFactor" : 1,
                                "operators" : [{
                                    "name" : "=",
                                    "value" : 10
                                }, {
                                    "name" : "effectiveValue",
                                    "initial" : 10,
                                    "value" : 10
                                }]
                            }]
                        }]
                    }, {
                        "name" : "penstroke:i(3)",
                        "parent" : ["glyph", "A"],
                        "level" : "penstroke",
                        "ruleIndex" : null,
                        "parameters" : [],
                        "children" : [{
                            "name" : "point:i(0)",
                            "parent" : ["penstroke", "penstroke:i(3)"],
                            "level" : "point",
                            "ruleIndex" : null,
                            "parameters" : [{
                                "name" : "Weight",
                                "cpsFactor" : 1,
                                "operators" : [{
                                    "name" : "=",
                                    "value" : 10
                                }, {
                                    "name" : "effectiveValue",
                                    "initial" : 10,
                                    "value" : 10
                                }]
                            }]
                        }, {
                            "name" : "point:i(1)",
                            "parent" : ["penstroke", "penstroke:i(3)"],
                            "level" : "point",
                            "ruleIndex" : null,
                            "parameters" : [{
                                "name" : "Weight",
                                "cpsFactor" : 1,
                                "operators" : [{
                                    "name" : "=",
                                    "value" : 10
                                }, {
                                    "name" : "effectiveValue",
                                    "initial" : 10,
                                    "value" : 10
                                }]
                            }]
                        }]
                    }, {
                        "name" : "penstroke:i(4)",
                        "parent" : ["glyph", "A"],
                        "level" : "penstroke",
                        "ruleIndex" : null,
                        "parameters" : [],
                        "children" : [{
                            "name" : "point:i(0)",
                            "parent" : ["penstroke", "penstroke:i(4)"],
                            "level" : "point",
                            "ruleIndex" : null,
                            "parameters" : [{
                                "name" : "Weight",
                                "cpsFactor" : 1,
                                "operators" : [{
                                    "name" : "=",
                                    "value" : 11.067971810589327
                                }, {
                                    "name" : "effectiveValue",
                                    "initial" : 11.067971810589327,
                                    "value" : 11.067971810589327
                                }]
                            }]
                        }, {
                            "name" : "point:i(1)",
                            "parent" : ["penstroke", "penstroke:i(4)"],
                            "level" : "point",
                            "ruleIndex" : null,
                            "parameters" : [{
                                "name" : "Weight",
                                "cpsFactor" : 1,
                                "operators" : [{
                                    "name" : "=",
                                    "value" : 11.423659658795863
                                }, {
                                    "name" : "effectiveValue",
                                    "initial" : 11.423659658795863,
                                    "value" : 11.423659658795863
                                }]
                            }]
                        }]
                    }, {
                        "name" : "penstroke:i(5)",
                        "parent" : ["glyph", "A"],
                        "level" : "penstroke",
                        "ruleIndex" : null,
                        "parameters" : [],
                        "children" : [{
                            "name" : "point:i(0)",
                            "parent" : ["penstroke", "penstroke:i(5)"],
                            "level" : "point",
                            "ruleIndex" : null,
                            "parameters" : [{
                                "name" : "Weight",
                                "cpsFactor" : 1,
                                "operators" : [{
                                    "name" : "=",
                                    "value" : 11.5
                                }, {
                                    "name" : "effectiveValue",
                                    "initial" : 11.5,
                                    "value" : 11.5
                                }]
                            }]
                        }, {
                            "name" : "point:i(1)",
                            "parent" : ["penstroke", "penstroke:i(5)"],
                            "level" : "point",
                            "ruleIndex" : null,
                            "parameters" : [{
                                "name" : "Weight",
                                "cpsFactor" : 1,
                                "operators" : [{
                                    "name" : "=",
                                    "value" : 10
                                }, {
                                    "name" : "effectiveValue",
                                    "initial" : 10,
                                    "value" : 10
                                }]
                            }]
                        }]
                    }, {
                        "name" : "penstroke:i(6)",
                        "parent" : ["glyph", "A"],
                        "level" : "penstroke",
                        "ruleIndex" : null,
                        "parameters" : [],
                        "children" : [{
                            "name" : "point:i(0)",
                            "parent" : ["penstroke", "penstroke:i(6)"],
                            "level" : "point",
                            "ruleIndex" : null,
                            "parameters" : [{
                                "name" : "Weight",
                                "cpsFactor" : 1,
                                "operators" : [{
                                    "name" : "=",
                                    "value" : 12
                                }, {
                                    "name" : "effectiveValue",
                                    "initial" : 12,
                                    "value" : 12
                                }]
                            }]
                        }, {
                            "name" : "point:i(1)",
                            "parent" : ["penstroke", "penstroke:i(6)"],
                            "level" : "point",
                            "ruleIndex" : null,
                            "parameters" : [{
                                "name" : "Weight",
                                "cpsFactor" : 1,
                                "operators" : [{
                                    "name" : "=",
                                    "value" : 10
                                }, {
                                    "name" : "effectiveValue",
                                    "initial" : 10,
                                    "value" : 10
                                }]
                            }]
                        }]
                    }]
                }, {
                    "name" : "M",
                    "parent" : ["master", "regular"],
                    "level" : "glyph",
                    "ruleIndex" : null,
                    "edit" : false,
                    "parameters" : [{
                        "name" : "Width",
                        "cpsFactor" : 1,
                        "operators" : [{
                            "name" : "=",
                            "value" : 909
                        }, {
                            "name" : "effectiveValue",
                            "initial" : 909,
                            "value" : 909
                        }]
                    }],
                    "children" : [{
                        "name" : "penstroke:i(0)",
                        "parent" : ["glyph", "M"],
                        "level" : "penstroke",
                        "ruleIndex" : null,
                        "parameters" : [],
                        "children" : [{
                            "name" : "point:i(0)",
                            "parent" : ["penstroke", "penstroke:i(0)"],
                            "level" : "point",
                            "ruleIndex" : null,
                            "parameters" : [{
                                "name" : "Weight",
                                "cpsFactor" : 1,
                                "operators" : [{
                                    "name" : "=",
                                    "value" : 10
                                }, {
                                    "name" : "effectiveValue",
                                    "initial" : 10,
                                    "value" : 10
                                }]
                            }]
                        }, {
                            "name" : "point:i(1)",
                            "parent" : ["penstroke", "penstroke:i(0)"],
                            "level" : "point",
                            "ruleIndex" : null,
                            "parameters" : [{
                                "name" : "Weight",
                                "cpsFactor" : 1,
                                "operators" : [{
                                    "name" : "=",
                                    "value" : 10
                                }, {
                                    "name" : "effectiveValue",
                                    "initial" : 10,
                                    "value" : 10
                                }]
                            }]
                        }]
                    }, {
                        "name" : "penstroke:i(1)",
                        "parent" : ["glyph", "M"],
                        "level" : "penstroke",
                        "ruleIndex" : null,
                        "parameters" : [],
                        "children" : [{
                            "name" : "point:i(0)",
                            "parent" : ["penstroke", "penstroke:i(1)"],
                            "level" : "point",
                            "ruleIndex" : null,
                            "parameters" : [{
                                "name" : "Weight",
                                "cpsFactor" : 1,
                                "operators" : [{
                                    "name" : "=",
                                    "value" : 10
                                }, {
                                    "name" : "effectiveValue",
                                    "initial" : 10,
                                    "value" : 10
                                }]
                            }]
                        }, {
                            "name" : "point:i(1)",
                            "parent" : ["penstroke", "penstroke:i(1)"],
                            "level" : "point",
                            "ruleIndex" : null,
                            "parameters" : [{
                                "name" : "Weight",
                                "cpsFactor" : 1,
                                "operators" : [{
                                    "name" : "=",
                                    "value" : 10
                                }, {
                                    "name" : "effectiveValue",
                                    "initial" : 10,
                                    "value" : 10
                                }]
                            }]
                        }]
                    }, {
                        "name" : "penstroke:i(2)",
                        "parent" : ["glyph", "M"],
                        "level" : "penstroke",
                        "ruleIndex" : null,
                        "parameters" : [],
                        "children" : [{
                            "name" : "point:i(0)",
                            "parent" : ["penstroke", "penstroke:i(2)"],
                            "level" : "point",
                            "ruleIndex" : null,
                            "parameters" : [{
                                "name" : "Weight",
                                "cpsFactor" : 1,
                                "operators" : [{
                                    "name" : "=",
                                    "value" : 10
                                }, {
                                    "name" : "effectiveValue",
                                    "initial" : 10,
                                    "value" : 10
                                }]
                            }]
                        }, {
                            "name" : "point:i(1)",
                            "parent" : ["penstroke", "penstroke:i(2)"],
                            "level" : "point",
                            "ruleIndex" : null,
                            "parameters" : [{
                                "name" : "Weight",
                                "cpsFactor" : 1,
                                "operators" : [{
                                    "name" : "=",
                                    "value" : 10
                                }, {
                                    "name" : "effectiveValue",
                                    "initial" : 10,
                                    "value" : 10
                                }]
                            }]
                        }]
                    }, {
                        "name" : "penstroke:i(3)",
                        "parent" : ["glyph", "M"],
                        "level" : "penstroke",
                        "ruleIndex" : null,
                        "parameters" : [],
                        "children" : [{
                            "name" : "point:i(0)",
                            "parent" : ["penstroke", "penstroke:i(3)"],
                            "level" : "point",
                            "ruleIndex" : null,
                            "parameters" : [{
                                "name" : "Weight",
                                "cpsFactor" : 1,
                                "operators" : [{
                                    "name" : "=",
                                    "value" : 10
                                }, {
                                    "name" : "effectiveValue",
                                    "initial" : 10,
                                    "value" : 10
                                }]
                            }]
                        }, {
                            "name" : "point:i(1)",
                            "parent" : ["penstroke", "penstroke:i(3)"],
                            "level" : "point",
                            "ruleIndex" : null,
                            "parameters" : [{
                                "name" : "Weight",
                                "cpsFactor" : 1,
                                "operators" : [{
                                    "name" : "=",
                                    "value" : 10
                                }, {
                                    "name" : "effectiveValue",
                                    "initial" : 10,
                                    "value" : 10
                                }]
                            }]
                        }]
                    }, {
                        "name" : "penstroke:i(4)",
                        "parent" : ["glyph", "M"],
                        "level" : "penstroke",
                        "ruleIndex" : null,
                        "parameters" : [],
                        "children" : [{
                            "name" : "point:i(0)",
                            "parent" : ["penstroke", "penstroke:i(4)"],
                            "level" : "point",
                            "ruleIndex" : null,
                            "parameters" : [{
                                "name" : "Weight",
                                "cpsFactor" : 1,
                                "operators" : [{
                                    "name" : "=",
                                    "value" : 10
                                }, {
                                    "name" : "effectiveValue",
                                    "initial" : 10,
                                    "value" : 10
                                }]
                            }]
                        }, {
                            "name" : "point:i(1)",
                            "parent" : ["penstroke", "penstroke:i(4)"],
                            "level" : "point",
                            "ruleIndex" : null,
                            "parameters" : [{
                                "name" : "Weight",
                                "cpsFactor" : 1,
                                "operators" : [{
                                    "name" : "=",
                                    "value" : 10
                                }, {
                                    "name" : "effectiveValue",
                                    "initial" : 10,
                                    "value" : 10
                                }]
                            }]
                        }]
                    }, {
                        "name" : "penstroke:i(5)",
                        "parent" : ["glyph", "M"],
                        "level" : "penstroke",
                        "ruleIndex" : null,
                        "parameters" : [],
                        "children" : [{
                            "name" : "point:i(0)",
                            "parent" : ["penstroke", "penstroke:i(5)"],
                            "level" : "point",
                            "ruleIndex" : null,
                            "parameters" : [{
                                "name" : "Weight",
                                "cpsFactor" : 1,
                                "operators" : [{
                                    "name" : "=",
                                    "value" : 10
                                }, {
                                    "name" : "effectiveValue",
                                    "initial" : 10,
                                    "value" : 10
                                }]
                            }]
                        }, {
                            "name" : "point:i(1)",
                            "parent" : ["penstroke", "penstroke:i(5)"],
                            "level" : "point",
                            "ruleIndex" : null,
                            "parameters" : [{
                                "name" : "Weight",
                                "cpsFactor" : 1,
                                "operators" : [{
                                    "name" : "=",
                                    "value" : 10
                                }, {
                                    "name" : "effectiveValue",
                                    "initial" : 10,
                                    "value" : 10
                                }]
                            }]
                        }]
                    }, {
                        "name" : "penstroke:i(6)",
                        "parent" : ["glyph", "M"],
                        "level" : "penstroke",
                        "ruleIndex" : null,
                        "parameters" : [],
                        "children" : [{
                            "name" : "point:i(0)",
                            "parent" : ["penstroke", "penstroke:i(6)"],
                            "level" : "point",
                            "ruleIndex" : null,
                            "parameters" : [{
                                "name" : "Weight",
                                "cpsFactor" : 1,
                                "operators" : [{
                                    "name" : "=",
                                    "value" : 11
                                }, {
                                    "name" : "effectiveValue",
                                    "initial" : 11,
                                    "value" : 11
                                }]
                            }]
                        }, {
                            "name" : "point:i(1)",
                            "parent" : ["penstroke", "penstroke:i(6)"],
                            "level" : "point",
                            "ruleIndex" : null,
                            "parameters" : [{
                                "name" : "Weight",
                                "cpsFactor" : 1,
                                "operators" : [{
                                    "name" : "=",
                                    "value" : 10
                                }, {
                                    "name" : "effectiveValue",
                                    "initial" : 10,
                                    "value" : 10
                                }]
                            }]
                        }]
                    }, {
                        "name" : "penstroke:i(7)",
                        "parent" : ["glyph", "M"],
                        "level" : "penstroke",
                        "ruleIndex" : null,
                        "parameters" : [],
                        "children" : [{
                            "name" : "point:i(0)",
                            "parent" : ["penstroke", "penstroke:i(7)"],
                            "level" : "point",
                            "ruleIndex" : null,
                            "parameters" : [{
                                "name" : "Weight",
                                "cpsFactor" : 1,
                                "operators" : [{
                                    "name" : "=",
                                    "value" : 11
                                }, {
                                    "name" : "effectiveValue",
                                    "initial" : 11,
                                    "value" : 11
                                }]
                            }]
                        }, {
                            "name" : "point:i(1)",
                            "parent" : ["penstroke", "penstroke:i(7)"],
                            "level" : "point",
                            "ruleIndex" : null,
                            "parameters" : [{
                                "name" : "Weight",
                                "cpsFactor" : 1,
                                "operators" : [{
                                    "name" : "=",
                                    "value" : 10
                                }, {
                                    "name" : "effectiveValue",
                                    "initial" : 10,
                                    "value" : 10
                                }]
                            }]
                        }]
                    }, {
                        "name" : "penstroke:i(8)",
                        "parent" : ["glyph", "M"],
                        "level" : "penstroke",
                        "ruleIndex" : null,
                        "parameters" : [],
                        "children" : [{
                            "name" : "point:i(0)",
                            "parent" : ["penstroke", "penstroke:i(8)"],
                            "level" : "point",
                            "ruleIndex" : null,
                            "parameters" : [{
                                "name" : "Weight",
                                "cpsFactor" : 1,
                                "operators" : [{
                                    "name" : "=",
                                    "value" : 11
                                }, {
                                    "name" : "effectiveValue",
                                    "initial" : 11,
                                    "value" : 11
                                }]
                            }]
                        }, {
                            "name" : "point:i(1)",
                            "parent" : ["penstroke", "penstroke:i(8)"],
                            "level" : "point",
                            "ruleIndex" : null,
                            "parameters" : [{
                                "name" : "Weight",
                                "cpsFactor" : 1,
                                "operators" : [{
                                    "name" : "=",
                                    "value" : 10
                                }, {
                                    "name" : "effectiveValue",
                                    "initial" : 10,
                                    "value" : 10
                                }]
                            }]
                        }]
                    }, {
                        "name" : "penstroke:i(9)",
                        "parent" : ["glyph", "M"],
                        "level" : "penstroke",
                        "ruleIndex" : null,
                        "parameters" : [],
                        "children" : [{
                            "name" : "point:i(0)",
                            "parent" : ["penstroke", "penstroke:i(9)"],
                            "level" : "point",
                            "ruleIndex" : null,
                            "parameters" : [{
                                "name" : "Weight",
                                "cpsFactor" : 1,
                                "operators" : [{
                                    "name" : "=",
                                    "value" : 11.5
                                }, {
                                    "name" : "effectiveValue",
                                    "initial" : 11.5,
                                    "value" : 11.5
                                }]
                            }]
                        }, {
                            "name" : "point:i(1)",
                            "parent" : ["penstroke", "penstroke:i(9)"],
                            "level" : "point",
                            "ruleIndex" : null,
                            "parameters" : [{
                                "name" : "Weight",
                                "cpsFactor" : 1,
                                "operators" : [{
                                    "name" : "=",
                                    "value" : 10
                                }, {
                                    "name" : "effectiveValue",
                                    "initial" : 10,
                                    "value" : 10
                                }]
                            }]
                        }]
                    }]
                }],
                "level" : "master",
                "parameters" : [{
                    "name" : "Weight",
                    "cpsFactor" : 1,
                    "operators" : [{
                        "name" : "x",
                        "value" : 1
                    }]
                }, {
                    "name" : "Width",
                    "cpsFactor" : 1,
                    "operators" : [{
                        "name" : "x",
                        "value" : 1
                    }]
                }, {
                    "name" : "Height",
                    "cpsFactor" : 1,
                    "operators" : [{
                        "name" : "x",
                        "value" : 1
                    }]
                }, {
                    "name" : "Spacing",
                    "cpsFactor" : 0,
                    "unit" : "",
                    "operators" : [{
                        "name" : "+",
                        "value" : 0
                    }]
                }]
            }]
        }];
        $scope.data.pill = "blue";
        $("#layover").hide();
    };

    var masters = [{
        name : "",
        parameters : [],
        children : [{
            name : "",
            parameters : [],
            children : [{

            }]
        }]
    }]

});
