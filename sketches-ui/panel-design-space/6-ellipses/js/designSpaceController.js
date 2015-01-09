app.controller("designSpaceController", function($scope) {

    $scope.designSpaces = [{
        name : "Space 1",
        type : "Explore",
        masters : [{
            master : {
                name : "M1"
            },
            coordinates : [350, 130]
        }, {
            master : {
                name : "M2"
            },
            coordinates : [300, 80]
        }, {
            master : {
                name : "M3"
            },
            coordinates : [200, 130]
        }, {
            master : {
                name : "M4"
            },
            coordinates : [400, 50]
        }, {
            master : {
                name : "M5"
            },
            coordinates : [250, 240]
        }],
        axes : []
    }];

    $scope.selectedDesignSpaces = $scope.designSpaces[0];

    $scope.newMaster = function() {
        $scope.selectedDesignSpaces.masters.push({
            master : {
                name: "M" + ($scope.selectedDesignSpaces.masters.length + 1)
            },
            coordinates : [Math.random() * 300, Math.random() * 200]
        });
    }
});
