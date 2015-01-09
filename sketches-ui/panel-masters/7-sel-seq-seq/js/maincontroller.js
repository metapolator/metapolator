app.controller("MetapolatorController", function($scope) {

    $scope.mouseclick = false;
    $scope.mouseDown = false;
    $scope.commandDown = false;
    $scope.controlDown = false;
    $scope.shiftDown = false;
    $scope.sortableOptionsMasters = {
        helper : 'clone',
        cancel : '.diamond, .sequence-name',
        connectWith : '.sequence'
    };
    
    $scope.sortableOptionsSequences = {
        helper : 'clone',
        handle : '.sequence-name'
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
    
    $scope.allMastersSelected = function (thisSequence) {
        var i = 0;
        var hit = 0;
        angular.forEach(thisSequence.masters, function(master) {
            if (master.edit == true) {
                hit ++;
            }
            i++;
        });
        if (hit == i && i!= 0) {
            return true;
        }
    }

    $scope.selectionStart = [0, 0];
    $scope.selectionEnd = [];
    $scope.selectMastersForEdit = function(thisMaster, sIndex, mIndex) {
        if ($scope.commandDown || $scope.controlDown) {// toggle on ctrl click
            thisMaster.edit = !thisMaster.edit;
            $scope.selectionStart = [sIndex, mIndex];
        } else if ($scope.shiftDown) {// set end for shift click
            $scope.selectionEnd = [sIndex, mIndex];
            $scope.selectSet();
        } else {// clean click clears all but current
            $scope.selectionStart = [sIndex, mIndex];
            $scope.deselectAll();
            thisMaster.edit = true;
        }
    }
       
    $scope.selectSequenceForEdit = function (thisSequence) {
        $scope.deselectAll();
        angular.forEach(thisSequence.masters, function(master) {
            master.edit = true;
        });
    }

    $scope.selectSet = function() {
        var countStart = [];
        var countEnd = [];
        // deselect all
        $scope.deselectAll();
        // check if selection is upwards or downwards
        if ($scope.selectionStart[0] * 10 + $scope.selectionStart[1] > $scope.selectionEnd[0] * 10 + $scope.selectionEnd[1]) {
            countStart = $scope.selectionEnd;
            countEnd = $scope.selectionStart;
        } else {
            countStart = $scope.selectionStart;
            countEnd = $scope.selectionEnd;
        }
        // walk through sequences.masters
        for (var i = countStart[0]; i < countEnd[0] + 1; i++) {
            // first sequence in selection
            if (i == countStart[0]) {
                for (var j = countStart[1]; j < $scope.sequences[i].masters.length; j++) {
                    $scope.sequences[i].masters[j].edit = true;
                }
                // last sequence in selection
            } else if (i == countEnd[0]) {
                for (var j = 0; j < countEnd[1] + 1; j++) {
                    $scope.sequences[i].masters[j].edit = true;
                }
                // middle sequences
            } else {
                for (var j = 0; j < $scope.sequences[i].masters.length; j++) {
                    $scope.sequences[i].masters[j].edit = true;
                }
            }
        }
    }
    
    $scope.deselectAll = function() {
        angular.forEach($scope.sequences, function(sequence) {
            angular.forEach(sequence.masters, function(master) {
                master.edit = false;
            });
        });  
    }
    
    
    
    
    
    // masters panel
    $scope.sequences = [{
        name : "Weight",
        masters : [{
            fontFamily : 'Roboto',
            name : 'we-Light',
            weight : '100',
            display : true,
            edit : true
        }, {
            fontFamily : 'Roboto',
            name : 'we-Regular',
            weight : '400',
            display : false,
            edit : true
        }, {
            fontFamily : 'Roboto',
            name : 'we-Bold',
            weight : '700',
            display : true,
            edit : false
        }]
    }, {
        name : "Width",
        masters : [{
            fontFamily : 'Roboto Condensed',
            name : 'w-Regular',
            weight : '400',
            display : true,
            edit : false
        }, {
            fontFamily : 'Roboto Condensed',
            name : 'w-Bold',
            weight : '700',
            display : true,
            edit : false
        }]
    }, {
        name : "Slab",
        masters : [{
            fontFamily : 'Roboto Slab',
            name : 's-Regular',
            weight : '400',
            display : false,
            edit : false
        }, {
            fontFamily : 'Roboto Slab',
            name : 's-Bold',
            weight : '700',
            display : true,
            edit : false
        }]
    }];
});
