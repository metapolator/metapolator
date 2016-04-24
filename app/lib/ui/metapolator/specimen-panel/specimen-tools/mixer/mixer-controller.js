define([], function() {
    "use strict";
    function MixerController($scope) {
        this.$scope = $scope;
    }

    MixerController.$inject = ['$scope'];
    var _p = MixerController.prototype;

    return MixerController;
});
