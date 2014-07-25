define([], function() {
    "use strict";
    function RedPillMasterController($scope) {
        this.$scope = $scope;
        this.$scope.name = 'redPillMaster';
        
        this.$scope.modes = [
            'files',
            'rules'
        ]
        
        // if there is no data element cached already (from a previous
        // incarnation of this element) create a new one, and fill it 
        // with defaults
        if( this.$scope.$parent.masterData[this.$scope.master] === undefined)
             this.$scope.$parent.masterData[this.$scope.master] = {
                // default values
                mode: this.$scope.modes[0]
              , modeData: {}
            };
        // shortcut
        this.$scope.data = this.$scope.$parent.masterData[this.$scope.master];
    }
    RedPillMasterController.$inject = ['$scope'];
    var _p = RedPillMasterController.prototype;
    
    return RedPillMasterController;
})
