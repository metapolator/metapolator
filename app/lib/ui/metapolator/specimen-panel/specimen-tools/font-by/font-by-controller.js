define([], function() {
    "use strict";
    function FontByController($scope) {
        this.$scope = $scope;
        this.$scope.name = 'fontBy';
        
        $scope.fontBys = ["Glyph", "Word", "Specimen"];
        // inital setting
        $scope.model.fontBy = $scope.fontBys[2];
        
        $scope.setFontBy = function(fontBy) {
             $scope.model.parent.setFontby(fontBy);   
        };
    }


    FontByController.$inject = ['$scope'];
    var _p = FontByController.prototype;

    return FontByController;
});
