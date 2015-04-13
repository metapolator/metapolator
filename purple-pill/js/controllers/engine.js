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
        for (var i = 0; i < masters.length; i++) {
            var master = masters[i];
            var masterName = master.id;
            // skip base for the ui
            if (masterName != "base") {
                var glyphs = master.children;
                var glyphs = [];
                // adding glyphs to each master
                for (var j = 0; j < master.children.length; j++) {
                    glyphs.push({
                        value : master.children[j].id,
                        elementType: "glyph",
                        edit : false,
                        parameters : []
                    });
                }
                // temp private method, see issue #332
                var cpsFile = $scope.data.stateful.controller._getMasterRule(masterName);
                $scope.data.sequences[0].masters.push({
                    id : masterId,
                    name : masterName,
                    displayName : masterName,
                    cpsFile : cpsFile,
                    type : "redpill",
                    display : true,
                    edit : true,
                    ag : "ag",
                    glyphs : glyphs,
                    elementType : "master",
                    parameters : [{
                        name : "weight",
                        displayName: "Weight",
                        unit : "",
                        operators : [{
                            name : "x",
                            value : 1
                        }]
    
                    }, {
                        name : "width",
                        displayName: "Width",
                        unit : "",
                        operators : [{
                            name : "x",
                            value : 1
                        }]
                    }, {
                        name : "height",
                        displayName: "Height",
                        unit : "",
                        operators : [{
                            name : "x",
                            value : 1
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
        $(".compatibility-info").hide();
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
                value : myGlyphs[j],
                edit : false,
                parameters : []
            });
        }

        for (var i = 0; i < masters.length; i++) {
            var myEdit = false;
            if (i == 0) {
                myEdit = true;
            }
            $scope.data.sequences[0].masters.push({
                id : i,
                name : masters[i][0],
                displayName : masters[i][1],
                type : "redpill",
                display : myEdit,
                edit : myEdit,
                ag : "ag",
                glyphs : glyphs,
                parameters : [{
                    name : "weight",
                    displayName: "Weight",
                    unit : "",
                    operators : [{
                        name : "x",
                        value : 1
                    }]

                }, {
                    name : "width",
                    displayName: "Width",
                    unit : "",
                    operators : [{
                        name : "x",
                        value : 1
                    }]
                }, {
                    name : "height",
                    displayName: "Height",
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
        $(".compatibility-info").hide();
    };

});
