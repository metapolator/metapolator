define([], function() {
    function AppController($scope) {
        this.$scope = $scope;
        this.greetMe('metapolating World')
    }
    var _p = AppController.prototype;
    
    _p.greetMe = function(me){
        this.$scope.greetMe = me;
    }
    
    return {
        Constructor: AppController
      , di: ['$scope', AppController]
    }
})
