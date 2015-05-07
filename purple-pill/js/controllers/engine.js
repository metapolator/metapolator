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
                                parent : ["stroke", thisStroke.id],
                                level : "point",
                                parameters : [{
                                    name : "Weight",
                                    operators : [{
                                        name : "=",
                                        value : point.get("onLength")
                                    }, {
                                        name : "effectiveValue",
                                        initial : point.get("onLength"),
                                        value : point.get("onLength")
                                    }]
                                }]
                            });
                        }
                        strokes.push({
                            name : thisStroke.id,
                            parent : ["glyph", thisGlyph.id],
                            level : "stroke",
                            initial : {},
                            parameters : [],
                            children : points
                        });
                    }
                    // temp hack untill #392 is fixed
                    var initialWidth = thisGlyph._advanceWidth;
                    glyphs.push({
                        name : thisGlyph.id,
                        parent : ["master", master.id],
                        level : "glyph",
                        edit : false,
                        parameters : [{
                            name : "Width",
                            operators : [{
                                name : "=",
                                value : initialWidth
                            }, {
                                name : "effectiveValue",
                                initial : initialWidth,
                                value : initialWidth
                            }]
                        }],
                        children : strokes
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
                    children : glyphs,
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
            "id" : 0,
            "name" : "Sequence 1",
            "masters" : [{
                "id" : 0,
                "name" : "regular",
                "displayName" : "regular",
                "cpsFile" : "lib/parameters.cps",
                "ruleIndex" : 3,
                "display" : false,
                "edit" : [true, false],
                "ag" : "Ag",
                "children" : [{
                    "name" : "a",
                    "parent" : ["master", "regular"],
                    "level" : "glyph",
                    "edit" : false,
                    "parameters" : [{
                        "name" : "Width",
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
                        "name" : null,
                        "parent" : ["glyph", "a"],
                        "level" : "stroke",
                        "initial" : {},
                        "parameters" : [],
                        "children" : [{
                            "name" : null,
                            "parent" : ["stroke", null],
                            "level" : "point",
                            "parameters" : [{
                                "name" : "Weight",
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
                            "name" : null,
                            "parent" : ["stroke", null],
                            "level" : "point",
                            "parameters" : [{
                                "name" : "Weight",
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
                        "name" : null,
                        "parent" : ["glyph", "a"],
                        "level" : "stroke",
                        "initial" : {},
                        "parameters" : [],
                        "children" : [{
                            "name" : null,
                            "parent" : ["stroke", null],
                            "level" : "point",
                            "parameters" : [{
                                "name" : "Weight",
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
                            "name" : null,
                            "parent" : ["stroke", null],
                            "level" : "point",
                            "parameters" : [{
                                "name" : "Weight",
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
                            "name" : null,
                            "parent" : ["stroke", null],
                            "level" : "point",
                            "parameters" : [{
                                "name" : "Weight",
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
                            "name" : null,
                            "parent" : ["stroke", null],
                            "level" : "point",
                            "parameters" : [{
                                "name" : "Weight",
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
                        "name" : null,
                        "parent" : ["glyph", "a"],
                        "level" : "stroke",
                        "initial" : {},
                        "parameters" : [],
                        "children" : [{
                            "name" : null,
                            "parent" : ["stroke", null],
                            "level" : "point",
                            "parameters" : [{
                                "name" : "Weight",
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
                            "name" : null,
                            "parent" : ["stroke", null],
                            "level" : "point",
                            "parameters" : [{
                                "name" : "Weight",
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
                        "name" : null,
                        "parent" : ["glyph", "a"],
                        "level" : "stroke",
                        "initial" : {},
                        "parameters" : [],
                        "children" : [{
                            "name" : null,
                            "parent" : ["stroke", null],
                            "level" : "point",
                            "parameters" : [{
                                "name" : "Weight",
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
                            "name" : null,
                            "parent" : ["stroke", null],
                            "level" : "point",
                            "parameters" : [{
                                "name" : "Weight",
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
                            "name" : null,
                            "parent" : ["stroke", null],
                            "level" : "point",
                            "parameters" : [{
                                "name" : "Weight",
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
                            "name" : null,
                            "parent" : ["stroke", null],
                            "level" : "point",
                            "parameters" : [{
                                "name" : "Weight",
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
                            "name" : null,
                            "parent" : ["stroke", null],
                            "level" : "point",
                            "parameters" : [{
                                "name" : "Weight",
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
                    "edit" : false,
                    "parameters" : [{
                        "name" : "Width",
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
                        "name" : null,
                        "parent" : ["glyph", "e"],
                        "level" : "stroke",
                        "initial" : {},
                        "parameters" : [],
                        "children" : [{
                            "name" : null,
                            "parent" : ["stroke", null],
                            "level" : "point",
                            "parameters" : [{
                                "name" : "Weight",
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
                            "name" : null,
                            "parent" : ["stroke", null],
                            "level" : "point",
                            "parameters" : [{
                                "name" : "Weight",
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
                            "name" : null,
                            "parent" : ["stroke", null],
                            "level" : "point",
                            "parameters" : [{
                                "name" : "Weight",
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
                            "name" : null,
                            "parent" : ["stroke", null],
                            "level" : "point",
                            "parameters" : [{
                                "name" : "Weight",
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
                            "name" : null,
                            "parent" : ["stroke", null],
                            "level" : "point",
                            "parameters" : [{
                                "name" : "Weight",
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
                            "name" : null,
                            "parent" : ["stroke", null],
                            "level" : "point",
                            "parameters" : [{
                                "name" : "Weight",
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
                            "name" : null,
                            "parent" : ["stroke", null],
                            "level" : "point",
                            "parameters" : [{
                                "name" : "Weight",
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
                            "name" : null,
                            "parent" : ["stroke", null],
                            "level" : "point",
                            "parameters" : [{
                                "name" : "Weight",
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
                            "name" : null,
                            "parent" : ["stroke", null],
                            "level" : "point",
                            "parameters" : [{
                                "name" : "Weight",
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
                    "edit" : false,
                    "parameters" : [{
                        "name" : "Width",
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
                        "name" : null,
                        "parent" : ["glyph", "g"],
                        "level" : "stroke",
                        "initial" : {},
                        "parameters" : [],
                        "children" : [{
                            "name" : null,
                            "parent" : ["stroke", null],
                            "level" : "point",
                            "parameters" : [{
                                "name" : "Weight",
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
                            "name" : null,
                            "parent" : ["stroke", null],
                            "level" : "point",
                            "parameters" : [{
                                "name" : "Weight",
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
                        "name" : null,
                        "parent" : ["glyph", "g"],
                        "level" : "stroke",
                        "initial" : {},
                        "parameters" : [],
                        "children" : [{
                            "name" : null,
                            "parent" : ["stroke", null],
                            "level" : "point",
                            "parameters" : [{
                                "name" : "Weight",
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
                            "name" : null,
                            "parent" : ["stroke", null],
                            "level" : "point",
                            "parameters" : [{
                                "name" : "Weight",
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
                            "name" : null,
                            "parent" : ["stroke", null],
                            "level" : "point",
                            "parameters" : [{
                                "name" : "Weight",
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
                            "name" : null,
                            "parent" : ["stroke", null],
                            "level" : "point",
                            "parameters" : [{
                                "name" : "Weight",
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
                            "name" : null,
                            "parent" : ["stroke", null],
                            "level" : "point",
                            "parameters" : [{
                                "name" : "Weight",
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
                        "name" : null,
                        "parent" : ["glyph", "g"],
                        "level" : "stroke",
                        "initial" : {},
                        "parameters" : [],
                        "children" : [{
                            "name" : null,
                            "parent" : ["stroke", null],
                            "level" : "point",
                            "parameters" : [{
                                "name" : "Weight",
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
                            "name" : null,
                            "parent" : ["stroke", null],
                            "level" : "point",
                            "parameters" : [{
                                "name" : "Weight",
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
                            "name" : null,
                            "parent" : ["stroke", null],
                            "level" : "point",
                            "parameters" : [{
                                "name" : "Weight",
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
                            "name" : null,
                            "parent" : ["stroke", null],
                            "level" : "point",
                            "parameters" : [{
                                "name" : "Weight",
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
                            "name" : null,
                            "parent" : ["stroke", null],
                            "level" : "point",
                            "parameters" : [{
                                "name" : "Weight",
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
                            "name" : null,
                            "parent" : ["stroke", null],
                            "level" : "point",
                            "parameters" : [{
                                "name" : "Weight",
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
                            "name" : null,
                            "parent" : ["stroke", null],
                            "level" : "point",
                            "parameters" : [{
                                "name" : "Weight",
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
                    "edit" : false,
                    "parameters" : [{
                        "name" : "Width",
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
                        "name" : null,
                        "parent" : ["glyph", "l"],
                        "level" : "stroke",
                        "initial" : {},
                        "parameters" : [],
                        "children" : [{
                            "name" : null,
                            "parent" : ["stroke", null],
                            "level" : "point",
                            "parameters" : [{
                                "name" : "Weight",
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
                            "name" : null,
                            "parent" : ["stroke", null],
                            "level" : "point",
                            "parameters" : [{
                                "name" : "Weight",
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
                        "name" : null,
                        "parent" : ["glyph", "l"],
                        "level" : "stroke",
                        "initial" : {},
                        "parameters" : [],
                        "children" : [{
                            "name" : null,
                            "parent" : ["stroke", null],
                            "level" : "point",
                            "parameters" : [{
                                "name" : "Weight",
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
                            "name" : null,
                            "parent" : ["stroke", null],
                            "level" : "point",
                            "parameters" : [{
                                "name" : "Weight",
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
                        "name" : null,
                        "parent" : ["glyph", "l"],
                        "level" : "stroke",
                        "initial" : {},
                        "parameters" : [],
                        "children" : [{
                            "name" : null,
                            "parent" : ["stroke", null],
                            "level" : "point",
                            "parameters" : [{
                                "name" : "Weight",
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
                            "name" : null,
                            "parent" : ["stroke", null],
                            "level" : "point",
                            "parameters" : [{
                                "name" : "Weight",
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
                        "name" : null,
                        "parent" : ["glyph", "l"],
                        "level" : "stroke",
                        "initial" : {},
                        "parameters" : [],
                        "children" : [{
                            "name" : null,
                            "parent" : ["stroke", null],
                            "level" : "point",
                            "parameters" : [{
                                "name" : "Weight",
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
                            "name" : null,
                            "parent" : ["stroke", null],
                            "level" : "point",
                            "parameters" : [{
                                "name" : "Weight",
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
                    "edit" : false,
                    "parameters" : [{
                        "name" : "Width",
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
                        "name" : null,
                        "parent" : ["glyph", "o"],
                        "level" : "stroke",
                        "initial" : {},
                        "parameters" : [],
                        "children" : [{
                            "name" : null,
                            "parent" : ["stroke", null],
                            "level" : "point",
                            "parameters" : [{
                                "name" : "Weight",
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
                            "name" : null,
                            "parent" : ["stroke", null],
                            "level" : "point",
                            "parameters" : [{
                                "name" : "Weight",
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
                            "name" : null,
                            "parent" : ["stroke", null],
                            "level" : "point",
                            "parameters" : [{
                                "name" : "Weight",
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
                            "name" : null,
                            "parent" : ["stroke", null],
                            "level" : "point",
                            "parameters" : [{
                                "name" : "Weight",
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
                            "name" : null,
                            "parent" : ["stroke", null],
                            "level" : "point",
                            "parameters" : [{
                                "name" : "Weight",
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
                    "edit" : false,
                    "parameters" : [{
                        "name" : "Width",
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
                        "name" : null,
                        "parent" : ["glyph", "p"],
                        "level" : "stroke",
                        "initial" : {},
                        "parameters" : [],
                        "children" : [{
                            "name" : null,
                            "parent" : ["stroke", null],
                            "level" : "point",
                            "parameters" : [{
                                "name" : "Weight",
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
                            "name" : null,
                            "parent" : ["stroke", null],
                            "level" : "point",
                            "parameters" : [{
                                "name" : "Weight",
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
                        "name" : null,
                        "parent" : ["glyph", "p"],
                        "level" : "stroke",
                        "initial" : {},
                        "parameters" : [],
                        "children" : [{
                            "name" : null,
                            "parent" : ["stroke", null],
                            "level" : "point",
                            "parameters" : [{
                                "name" : "Weight",
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
                            "name" : null,
                            "parent" : ["stroke", null],
                            "level" : "point",
                            "parameters" : [{
                                "name" : "Weight",
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
                        "name" : null,
                        "parent" : ["glyph", "p"],
                        "level" : "stroke",
                        "initial" : {},
                        "parameters" : [],
                        "children" : [{
                            "name" : null,
                            "parent" : ["stroke", null],
                            "level" : "point",
                            "parameters" : [{
                                "name" : "Weight",
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
                            "name" : null,
                            "parent" : ["stroke", null],
                            "level" : "point",
                            "parameters" : [{
                                "name" : "Weight",
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
                        "name" : null,
                        "parent" : ["glyph", "p"],
                        "level" : "stroke",
                        "initial" : {},
                        "parameters" : [],
                        "children" : [{
                            "name" : null,
                            "parent" : ["stroke", null],
                            "level" : "point",
                            "parameters" : [{
                                "name" : "Weight",
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
                            "name" : null,
                            "parent" : ["stroke", null],
                            "level" : "point",
                            "parameters" : [{
                                "name" : "Weight",
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
                            "name" : null,
                            "parent" : ["stroke", null],
                            "level" : "point",
                            "parameters" : [{
                                "name" : "Weight",
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
                            "name" : null,
                            "parent" : ["stroke", null],
                            "level" : "point",
                            "parameters" : [{
                                "name" : "Weight",
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
                            "name" : null,
                            "parent" : ["stroke", null],
                            "level" : "point",
                            "parameters" : [{
                                "name" : "Weight",
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
                        "name" : null,
                        "parent" : ["glyph", "p"],
                        "level" : "stroke",
                        "initial" : {},
                        "parameters" : [],
                        "children" : [{
                            "name" : null,
                            "parent" : ["stroke", null],
                            "level" : "point",
                            "parameters" : [{
                                "name" : "Weight",
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
                            "name" : null,
                            "parent" : ["stroke", null],
                            "level" : "point",
                            "parameters" : [{
                                "name" : "Weight",
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
                    "edit" : false,
                    "parameters" : [{
                        "name" : "Width",
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
                        "name" : null,
                        "parent" : ["glyph", "r"],
                        "level" : "stroke",
                        "initial" : {},
                        "parameters" : [],
                        "children" : [{
                            "name" : null,
                            "parent" : ["stroke", null],
                            "level" : "point",
                            "parameters" : [{
                                "name" : "Weight",
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
                            "name" : null,
                            "parent" : ["stroke", null],
                            "level" : "point",
                            "parameters" : [{
                                "name" : "Weight",
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
                        "name" : null,
                        "parent" : ["glyph", "r"],
                        "level" : "stroke",
                        "initial" : {},
                        "parameters" : [],
                        "children" : [{
                            "name" : null,
                            "parent" : ["stroke", null],
                            "level" : "point",
                            "parameters" : [{
                                "name" : "Weight",
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
                            "name" : null,
                            "parent" : ["stroke", null],
                            "level" : "point",
                            "parameters" : [{
                                "name" : "Weight",
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
                        "name" : null,
                        "parent" : ["glyph", "r"],
                        "level" : "stroke",
                        "initial" : {},
                        "parameters" : [],
                        "children" : [{
                            "name" : null,
                            "parent" : ["stroke", null],
                            "level" : "point",
                            "parameters" : [{
                                "name" : "Weight",
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
                            "name" : null,
                            "parent" : ["stroke", null],
                            "level" : "point",
                            "parameters" : [{
                                "name" : "Weight",
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
                        "name" : null,
                        "parent" : ["glyph", "r"],
                        "level" : "stroke",
                        "initial" : {},
                        "parameters" : [],
                        "children" : [{
                            "name" : null,
                            "parent" : ["stroke", null],
                            "level" : "point",
                            "parameters" : [{
                                "name" : "Weight",
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
                            "name" : null,
                            "parent" : ["stroke", null],
                            "level" : "point",
                            "parameters" : [{
                                "name" : "Weight",
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
                        "name" : null,
                        "parent" : ["glyph", "r"],
                        "level" : "stroke",
                        "initial" : {},
                        "parameters" : [],
                        "children" : [{
                            "name" : null,
                            "parent" : ["stroke", null],
                            "level" : "point",
                            "parameters" : [{
                                "name" : "Weight",
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
                            "name" : null,
                            "parent" : ["stroke", null],
                            "level" : "point",
                            "parameters" : [{
                                "name" : "Weight",
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
                    "edit" : false,
                    "parameters" : [{
                        "name" : "Width",
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
                        "name" : null,
                        "parent" : ["glyph", "t"],
                        "level" : "stroke",
                        "initial" : {},
                        "parameters" : [],
                        "children" : [{
                            "name" : null,
                            "parent" : ["stroke", null],
                            "level" : "point",
                            "parameters" : [{
                                "name" : "Weight",
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
                            "name" : null,
                            "parent" : ["stroke", null],
                            "level" : "point",
                            "parameters" : [{
                                "name" : "Weight",
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
                        "name" : null,
                        "parent" : ["glyph", "t"],
                        "level" : "stroke",
                        "initial" : {},
                        "parameters" : [],
                        "children" : [{
                            "name" : null,
                            "parent" : ["stroke", null],
                            "level" : "point",
                            "parameters" : [{
                                "name" : "Weight",
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
                            "name" : null,
                            "parent" : ["stroke", null],
                            "level" : "point",
                            "parameters" : [{
                                "name" : "Weight",
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
                            "name" : null,
                            "parent" : ["stroke", null],
                            "level" : "point",
                            "parameters" : [{
                                "name" : "Weight",
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
                            "name" : null,
                            "parent" : ["stroke", null],
                            "level" : "point",
                            "parameters" : [{
                                "name" : "Weight",
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
                    "edit" : false,
                    "parameters" : [{
                        "name" : "Width",
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
                        "name" : null,
                        "parent" : ["glyph", "A"],
                        "level" : "stroke",
                        "initial" : {},
                        "parameters" : [],
                        "children" : [{
                            "name" : null,
                            "parent" : ["stroke", null],
                            "level" : "point",
                            "parameters" : [{
                                "name" : "Weight",
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
                            "name" : null,
                            "parent" : ["stroke", null],
                            "level" : "point",
                            "parameters" : [{
                                "name" : "Weight",
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
                        "name" : null,
                        "parent" : ["glyph", "A"],
                        "level" : "stroke",
                        "initial" : {},
                        "parameters" : [],
                        "children" : [{
                            "name" : null,
                            "parent" : ["stroke", null],
                            "level" : "point",
                            "parameters" : [{
                                "name" : "Weight",
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
                            "name" : null,
                            "parent" : ["stroke", null],
                            "level" : "point",
                            "parameters" : [{
                                "name" : "Weight",
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
                        "name" : null,
                        "parent" : ["glyph", "A"],
                        "level" : "stroke",
                        "initial" : {},
                        "parameters" : [],
                        "children" : [{
                            "name" : null,
                            "parent" : ["stroke", null],
                            "level" : "point",
                            "parameters" : [{
                                "name" : "Weight",
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
                            "name" : null,
                            "parent" : ["stroke", null],
                            "level" : "point",
                            "parameters" : [{
                                "name" : "Weight",
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
                        "name" : null,
                        "parent" : ["glyph", "A"],
                        "level" : "stroke",
                        "initial" : {},
                        "parameters" : [],
                        "children" : [{
                            "name" : null,
                            "parent" : ["stroke", null],
                            "level" : "point",
                            "parameters" : [{
                                "name" : "Weight",
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
                            "name" : null,
                            "parent" : ["stroke", null],
                            "level" : "point",
                            "parameters" : [{
                                "name" : "Weight",
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
                        "name" : null,
                        "parent" : ["glyph", "A"],
                        "level" : "stroke",
                        "initial" : {},
                        "parameters" : [],
                        "children" : [{
                            "name" : null,
                            "parent" : ["stroke", null],
                            "level" : "point",
                            "parameters" : [{
                                "name" : "Weight",
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
                            "name" : null,
                            "parent" : ["stroke", null],
                            "level" : "point",
                            "parameters" : [{
                                "name" : "Weight",
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
                        "name" : null,
                        "parent" : ["glyph", "A"],
                        "level" : "stroke",
                        "initial" : {},
                        "parameters" : [],
                        "children" : [{
                            "name" : null,
                            "parent" : ["stroke", null],
                            "level" : "point",
                            "parameters" : [{
                                "name" : "Weight",
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
                            "name" : null,
                            "parent" : ["stroke", null],
                            "level" : "point",
                            "parameters" : [{
                                "name" : "Weight",
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
                        "name" : null,
                        "parent" : ["glyph", "A"],
                        "level" : "stroke",
                        "initial" : {},
                        "parameters" : [],
                        "children" : [{
                            "name" : null,
                            "parent" : ["stroke", null],
                            "level" : "point",
                            "parameters" : [{
                                "name" : "Weight",
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
                            "name" : null,
                            "parent" : ["stroke", null],
                            "level" : "point",
                            "parameters" : [{
                                "name" : "Weight",
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
                    "edit" : false,
                    "parameters" : [{
                        "name" : "Width",
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
                        "name" : null,
                        "parent" : ["glyph", "M"],
                        "level" : "stroke",
                        "initial" : {},
                        "parameters" : [],
                        "children" : [{
                            "name" : null,
                            "parent" : ["stroke", null],
                            "level" : "point",
                            "parameters" : [{
                                "name" : "Weight",
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
                            "name" : null,
                            "parent" : ["stroke", null],
                            "level" : "point",
                            "parameters" : [{
                                "name" : "Weight",
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
                        "name" : null,
                        "parent" : ["glyph", "M"],
                        "level" : "stroke",
                        "initial" : {},
                        "parameters" : [],
                        "children" : [{
                            "name" : null,
                            "parent" : ["stroke", null],
                            "level" : "point",
                            "parameters" : [{
                                "name" : "Weight",
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
                            "name" : null,
                            "parent" : ["stroke", null],
                            "level" : "point",
                            "parameters" : [{
                                "name" : "Weight",
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
                        "name" : null,
                        "parent" : ["glyph", "M"],
                        "level" : "stroke",
                        "initial" : {},
                        "parameters" : [],
                        "children" : [{
                            "name" : null,
                            "parent" : ["stroke", null],
                            "level" : "point",
                            "parameters" : [{
                                "name" : "Weight",
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
                            "name" : null,
                            "parent" : ["stroke", null],
                            "level" : "point",
                            "parameters" : [{
                                "name" : "Weight",
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
                        "name" : null,
                        "parent" : ["glyph", "M"],
                        "level" : "stroke",
                        "initial" : {},
                        "parameters" : [],
                        "children" : [{
                            "name" : null,
                            "parent" : ["stroke", null],
                            "level" : "point",
                            "parameters" : [{
                                "name" : "Weight",
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
                            "name" : null,
                            "parent" : ["stroke", null],
                            "level" : "point",
                            "parameters" : [{
                                "name" : "Weight",
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
                        "name" : null,
                        "parent" : ["glyph", "M"],
                        "level" : "stroke",
                        "initial" : {},
                        "parameters" : [],
                        "children" : [{
                            "name" : null,
                            "parent" : ["stroke", null],
                            "level" : "point",
                            "parameters" : [{
                                "name" : "Weight",
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
                            "name" : null,
                            "parent" : ["stroke", null],
                            "level" : "point",
                            "parameters" : [{
                                "name" : "Weight",
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
                        "name" : null,
                        "parent" : ["glyph", "M"],
                        "level" : "stroke",
                        "initial" : {},
                        "parameters" : [],
                        "children" : [{
                            "name" : null,
                            "parent" : ["stroke", null],
                            "level" : "point",
                            "parameters" : [{
                                "name" : "Weight",
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
                            "name" : null,
                            "parent" : ["stroke", null],
                            "level" : "point",
                            "parameters" : [{
                                "name" : "Weight",
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
                        "name" : null,
                        "parent" : ["glyph", "M"],
                        "level" : "stroke",
                        "initial" : {},
                        "parameters" : [],
                        "children" : [{
                            "name" : null,
                            "parent" : ["stroke", null],
                            "level" : "point",
                            "parameters" : [{
                                "name" : "Weight",
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
                            "name" : null,
                            "parent" : ["stroke", null],
                            "level" : "point",
                            "parameters" : [{
                                "name" : "Weight",
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
                        "name" : null,
                        "parent" : ["glyph", "M"],
                        "level" : "stroke",
                        "initial" : {},
                        "parameters" : [],
                        "children" : [{
                            "name" : null,
                            "parent" : ["stroke", null],
                            "level" : "point",
                            "parameters" : [{
                                "name" : "Weight",
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
                            "name" : null,
                            "parent" : ["stroke", null],
                            "level" : "point",
                            "parameters" : [{
                                "name" : "Weight",
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
                        "name" : null,
                        "parent" : ["glyph", "M"],
                        "level" : "stroke",
                        "initial" : {},
                        "parameters" : [],
                        "children" : [{
                            "name" : null,
                            "parent" : ["stroke", null],
                            "level" : "point",
                            "parameters" : [{
                                "name" : "Weight",
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
                            "name" : null,
                            "parent" : ["stroke", null],
                            "level" : "point",
                            "parameters" : [{
                                "name" : "Weight",
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
                        "name" : null,
                        "parent" : ["glyph", "M"],
                        "level" : "stroke",
                        "initial" : {},
                        "parameters" : [],
                        "children" : [{
                            "name" : null,
                            "parent" : ["stroke", null],
                            "level" : "point",
                            "parameters" : [{
                                "name" : "Weight",
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
                            "name" : null,
                            "parent" : ["stroke", null],
                            "level" : "point",
                            "parameters" : [{
                                "name" : "Weight",
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
                    "operators" : [{
                        "name" : "x",
                        "value" : 1
                    }]
                }, {
                    "name" : "Width",
                    "operators" : [{
                        "name" : "x",
                        "value" : 1
                    }]
                }, {
                    "name" : "Height",
                    "operators" : [{
                        "name" : "x",
                        "value" : 1
                    }]
                }, {
                    "name" : "Spacing",
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

});
