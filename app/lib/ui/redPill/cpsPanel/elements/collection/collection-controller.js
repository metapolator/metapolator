define([
], function(
) {
    "use strict";
    function CollectionController($scope) {
        this.$scope = $scope;

        this.$scope.items = $scope.cpsCollection.items;
        // subscribe to the collection ...
        // this._subscription = $scope.cpsCollection.on(...)
        // $scope.$on('$destroy', this._destroy.bind(this));
    }

    CollectionController.$inject = ['$scope'];
    var _p = CollectionController.prototype;

    // _p._destroy = function() {
    //     this.$scope.cpsCollection.off(this._subscription);
    // }

    return CollectionController;
});
