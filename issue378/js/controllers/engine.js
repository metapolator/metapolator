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
        for (var i = 0; i < masters.length; i++){
            var master = masters[i];
            var masterName = master.id;
            // skip base for the ui
            if (masterName != "base") {
                var glyphs = master.children;
                var glyphs = [];
                // adding glyphs to each master
                for (var j = 0; j < master.children.length; j++) {
                    glyphs.push({
                        value: master.children[j].id,
                        edit: false,
                        parameters: []
                    });
                }
                // temp private method, see issue #332
                var cpsFile = $scope.data.stateful.controller._getMasterRule(masterName);
                $scope.data.sequences[0].masters.push({
                    id: masterId,
                    name: masterName,
                    displayName: masterName,
                    cpsFile: cpsFile,
                    type: "redpill",
                    display: true,
                    edit: [true, true],
                    ag: "ag",
                    glyphs: glyphs,
                    parameters: [{
                        name: "weight",
                        unit: "",
                        operators: [{
                           name: "Factor",
                           value: 1 
                        }]
                        
                    }, {
                        name: "width",
                        unit: "",
                        operators: [{
                           name: "Factor",
                           value: 1 
                        }]
                    },{
                        name: "height",
                        unit: "",
                        operators: [{
                           name: "Factor",
                           value: 1 
                        }]
                    }]
                });
                masterId++; 
            } 
        }
        $scope.data.pill = "red";
        $scope.$apply();
        $("#layover").hide();
        $(".compatibility-info").hide();
        $scope.issueFunctions();
    }
    
    $scope.issueFunctions = function() {

    };
    

    
    
    
    

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
    
    $scope.engine = function () {
        if (!window.metapolatorReady) {
            window.metapolatorReady = [];
        }
        window.metapolatorReady.push(onMetapolatorReady);
        // <= could be an array or our api
    };

    

});
