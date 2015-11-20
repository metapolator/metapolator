define([], function() {
    "use strict";
    function AppController($scope, model, registerFrontend, config) {
        this.$scope = $scope;
        this.$scope.name = 'app';
        // registering the root of the app, for callback purposes
        registerFrontend(this);

        this.$scope.model = this.model = model;
        this.$scope.config = config;

        this.$scope.$on('echo-request', this._echoRequest.bind(this));

    }

    AppController.$inject = ['$scope', 'redPillModel', 'registerFrontend', 'config'];
    var _p = AppController.prototype;

    _p._echoRequest = function(event, request) {
        this.$scope.$broadcast(request.name, request.data);
    }

    _p.redraw = function() {
        this.$scope.$apply();
    };

    return AppController;
});
