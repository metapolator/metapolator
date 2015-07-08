define([], function() {
    "use strict";
    function MixerController($scope) {
        this.$scope = $scope;
        this.$scope.name = 'mixer';
    }


    MixerController.$inject = ['$scope'];
    var _p = MixerController.prototype;

    return MixerController;
});
