define([], function() {
    'use strict';
    function SpecimenPanelController($scope) {
        this.$scope = $scope;

        $scope.model = {
            sequences : $scope.sequences
          , sizes : {
                fontSize : 128
              , lineHeight : null
              , lineHeightSetting : 1
          }
          , mixer : {
                specimenSample : null
              , fontBy : 'Specimen'
              , filter : ''
              , strict : 0
            }
          , selectedMasters : []
          , glyphsIn : []
          , rubberband : $scope.rubberband
          , glyphrange : $scope.glyphrange
          , type : $scope.type
        };

        console.log($scope.model);
    }

    SpecimenPanelController.$inject = ['$scope'];
    var _p = SpecimenPanelController.prototype;

    return SpecimenPanelController;
}); 