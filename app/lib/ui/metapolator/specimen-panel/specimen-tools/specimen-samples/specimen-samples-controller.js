define([], function() {
    "use strict";
    function SpecimenSamplesController($scope) {
        this.$scope = $scope;
        this.$scope.name = 'specimenSamples';
        
        // add the glyphRange if the model is set to have it
        if ($scope.model.glyphRange) {
            $scope.model.addGlyphRange();
        }
        
        $scope.setSpecimenText = function(newValue) {
            console.log($scope.model.currentSample.text);
        };
        
        $scope.selectSpecimen = function(specimen) {
            $scope.model.parent.setSpecimenSample(specimen);
        };
        
        // select initial specimen
        $scope.model.currentSample = $scope.model.samples[0][0];
    }


    SpecimenSamplesController.$inject = ['$scope'];
    var _p = SpecimenSamplesController.prototype;

    return SpecimenSamplesController;
});
