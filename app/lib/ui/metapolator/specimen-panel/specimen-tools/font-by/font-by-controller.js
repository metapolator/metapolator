define([], function() {
    'use strict';
    function FontByController($scope) {
        this.$scope = $scope;

        $scope.fontBys = ['Glyph', 'Word', 'Specimen'];

        $scope.setFontBy = function(fontBy) {
             $scope.model.fontBy = fontBy;
        };
    }


    FontByController.$inject = ['$scope'];
    var _p = FontByController.prototype;

    return FontByController;
});
