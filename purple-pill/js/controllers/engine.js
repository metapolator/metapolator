app.controller('engine', function($scope, sharedScope) {
    $scope.data = sharedScope.data;


    $scope.data.stateful;
    $scope.data.stateless;
    $scope.data.pill = "blue";

    function onProjectLoaded(stateless, stateful) {
        $scope.data.stateful = stateful;
        $scope.data.stateless = stateless;
        // adding masters
        var masters = $scope.data.stateful.controller.queryAll("master");
        var masterId = 0;
        for (var i = 0; i < masters.length; i++){
            var master = masters[i];
            var masterName = master.id;
            var glyphs = master.children;
            var glyphs = [];
            var edit = false;
            if (i == 0) { edit = true; }
            // adding glyphs to each master
            for (var j = 0; j < master.children.length; j++) {
                glyphs.push({
                    value: master.children[j].id,
                    edit: false,
                    parameters: []
                });
            }
            $scope.data.sequences[0].masters.push({
                id: masterId,
                name: masterName,
                displayName: masterName,
                type: "redpill",
                display: true,
                edit: [edit, edit],
                ag: "ag",
                glyphs: glyphs,
                parameters: []
            });
            masterId++;  
        }
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

    if (!window.metapolatorReady) {
        window.metapolatorReady = [];
    }
    window.metapolatorReady.push(onMetapolatorReady);
    // <= could be an array or our api
    

});
