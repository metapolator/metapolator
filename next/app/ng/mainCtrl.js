define([], function() {
    
    function MainCtrl($scope) {
        this.$scope = $scope;
        this.greetMe('metapolating World')
    }
    var _p = MainCtrl.prototype;
    
    _p.greetMe = function(me){
        this.$scope.greetMe = me;
    }
    
    return {
        Constructor: MainCtrl
      , di: ['$scope', MainCtrl]
    }
})
