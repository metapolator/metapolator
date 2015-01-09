app.controller("MetapolatorController", function($scope) {

    $scope.mouseclick = false;
    $scope.mouseDown = false;
    $scope.commandDown = false;
    $scope.controlDown = false;
    $scope.shiftDown = false;
    $scope.start = 0;
    $scope.end
    $scope.sortableOptions = {
        helper : 'clone',
        cancel : '.diamond'
    };
    $scope.startDiamond
    $scope.lastDiamond

    $(window).keydown(function(e) {
        if (e.metaKey) {
            $scope.commandDown = true;
        }
        if (e.shiftKey) {
            $scope.shiftDown = true;
        }
        if (e.ctrlKey) {
            $scope.controlDown = true;
        }
    });

    $(window).keyup(function(e) {
        $scope.commandDown = false;
        $scope.controlDown = false;
        $scope.shiftDown = false;
    });

    // sequences column
    $scope.mastersSeqCache = [];
    $scope.startDrag = function(thisMaster, nr) {
        $scope.mouseclick = true;
        $scope.startDiamond = nr;
        // put stuff in a cache
        angular.forEach($scope.masters, function(master, key) {
            $scope.mastersSeqCache[key] = master.seq;
        });
    }

    $scope.whileDrag = function(thisMaster, nr) {
        if ($scope.mouseclick) {
            $scope.lastDiamond = nr;
            $scope.makeSequence();
        }
    }

    $scope.makeSequence = function() {
        var start = $scope.startDiamond;
        var last = $scope.lastDiamond
        var cache = $scope.mastersSeqCache;
        var masters = $scope.masters;

        if (start != last && cache[start] != "middle") {
            // dragging downwards
            if (start < last) {
                if (cache[start] == "start") {
                    // if dragging with a start (downwards)
                    masters[start].seq = "solo";
                    if (last - start > 1) {
                        for (var i = start + 1; i < last; i++) {
                            masters[i].seq = "solo";
                        }
                    }
                    if (cache[last] == "middle") {
                        masters[last].seq = "start";
                    }
                    if (cache[last] == "end") {
                        masters[last].seq = "solo";
                    }
                }
                if (cache[start] == "end") {
                    // if dragging with an end (downwards)
                    masters[start].seq = "middle";
                    if (last - start > 1) {
                        for (var i = start + 1; i < last; i++) {
                            masters[i].seq = "middle";
                        }
                    }
                    masters[last].seq = "end";
                    if (cache[last + 1]) {
                        if (cache[last + 1] == "end") {
                            masters[last + 1].seq = "solo";
                        }
                        if (cache[last + 1] == "middle") {
                            masters[last + 1].seq = "start";
                        }
                    }
                }
                if (cache[start] == "solo") {
                    // if dragging with a solo (downwards)
                    masters[start].seq = "start";
                    if (last - start > 1) {
                        for (var i = start + 1; i < last; i++) {
                            masters[i].seq = "middle";
                        }
                    }
                    masters[last].seq = "end";
                    if (cache[last + 1]) {
                        if (cache[last + 1] == "middle") {
                            masters[last + 1].seq = "start";
                        }
                        if (cache[last + 1] == "end") {
                            masters[last + 1].seq = "solo";
                        }
                    }
                }
            }
            // dragging upwards
            else {

                if (cache[start] == "start") {
                    // if dragging with a start (upwards)
                    masters[start].seq = "middle";
                    if (start - last > 1) {
                        for (var i = start - 1; i > last; i--) {
                            masters[i].seq = "middle";
                        }
                    }
                    masters[last].seq = "start";
                    if (cache[last - 1]) {
                        if (cache[last - 1] == "start") {
                            masters[last - 1].seq = "solo";
                        }
                        if (cache[last - 1] == "middle") {
                            masters[last - 1].seq = "end";
                        }
                    }
                }
                if (cache[start] == "end") {
                    // if dragging with an end (upwards)
                    masters[start].seq = "solo";
                    if (start - last > 1) {
                        for (var i = start - 1; i > last; i--) {
                            masters[i].seq = "solo";
                        }
                    }
                    if (cache[last] == "middle") {
                        masters[last].seq = "end";
                    }
                    if (cache[last] == "start") {
                        masters[last].seq = "solo";
                    }
                }
                if (cache[start] == "solo") {
                    // if dragging with a solo (upwards)
                    masters[start].seq = "end";
                    if (start - last > 1) {
                        for (var i = start - 1; i > last; i--) {
                            masters[i].seq = "middle";
                        }
                    }
                    masters[last].seq = "start";
                    if (cache[last - 1]) {
                        if (cache[last - 1] == "middle") {
                            masters[last - 1].seq = "end";
                        }
                        if (cache[last - 1] == "start") {
                            masters[last - 1].seq = "solo";
                        }
                    }
                }
            }
        }
    }
    // selection column

    $scope.selectMastersForEdit = function(thisMaster, nr) {
        if ($scope.commandDown || $scope.controlDown) {// toggle on ctrl click
            thisMaster.edit = !thisMaster.edit;
            $scope.start = nr;
        } else if ($scope.shiftDown) {// set end for shift click
            $scope.end = nr;
            $scope.selectSet();
        } else {// clean click clears all but current
            $scope.start = nr;
            angular.forEach($scope.masters, function(master) {
                master.edit = false;
            });
            thisMaster.edit = true;
        }
    }

    $scope.selectSet = function() {
        var countstart, countend;
        angular.forEach($scope.masters, function(master) {
            master.edit = false;
        });
        if ($scope.start > $scope.end) {// switch start and end for the loop
            countstart = $scope.end;
            countend = $scope.start + 1;
        } else {
            countstart = $scope.start;
            countend = $scope.end + 1;
        }
        for (var i = countstart; i < countend; i++) {
            $scope.masters[i].edit = true;
        }
    }
    // masters panel
    $scope.masters = [{
        fontFamily : 'Roboto',
        name : 'we-Light',
        weight : '100',
        display : true,
        edit : true,
        seq : 'start'

    }, {
        fontFamily : 'Roboto',
        name : 'we-Regular',
        weight : '400',
        display : false,
        edit : true,
        seq : 'end'
    }, {
        fontFamily : 'Roboto',
        name : 'we-Bold',
        weight : '700',
        display : true,
        edit : false,
        seq : 'start'
    }, {
        fontFamily : 'Roboto Condensed',
        name : 'w-Regular',
        weight : '400',
        display : true,
        edit : false,
        seq : 'middle'
    }, {
        fontFamily : 'Roboto Condensed',
        name : 'w-Bold',
        weight : '700',
        display : true,
        edit : false,
        seq : 'end'
    }, {
        fontFamily : 'Roboto Slab',
        name : 's-Regular',
        weight : '400',
        display : false,
        edit : false,
        seq : 'start'
    }, {
        fontFamily : 'Roboto Slab',
        name : 's-Bold',
        weight : '700',
        display : true,
        edit : false,
        seq : 'end'
    }];
});
