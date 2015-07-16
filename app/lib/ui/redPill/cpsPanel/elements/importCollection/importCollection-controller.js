define([
    'metapolator/errors'
  , 'metapolator/ui/redPill/cpsPanel/elementToolbar/clickHandler'
], function(
    errors
  , clickHandler
) {
    "use strict";
    function ImportCollectionController($scope, ruleController) {
        this.$scope = $scope;
        this._ruleController = ruleController;
        // this bindToController thing has the problem that
        // this: angular.element(target).isolateScope().index
        // doesn't work without help.
        this.$scope.index = this.index;
        this.clickToolHandler = clickHandler.bind(this, 'command');

        $scope.edit = false;
        $scope.busy = false;
        this._waiting = null;
        this._resetItemScope();
    }

    ImportCollectionController.$inject = ['$scope', 'ruleController'];
    var _p = ImportCollectionController.prototype;
    _p.constructor = ImportCollectionController;

    _p._setValidityMessage = function(message) {
        this.$scope.invalid = (!!message) || this.item.invalid;

        var _message = [];
        if(message)
            _message.push(message);
        if(this.item.invalid)
            _message.push('The collection is invalid.');
        this.$scope.message = _message.join('\n');
    };

    _p._resetItemScope = function(errorMessage) {
        var $scope = this.$scope;
        $scope.cpsFile = this.item.resourceName;
        $scope.cpsFileOptions = null;
        this._setValidityMessage(errorMessage);
    };


    _p._startWaiting = function(promise) {
        this._waiting = promise.then(this._stopWaiting.bind(this))
            .then(this.$scope.$apply.bind(this.$scope))
            .then(null, errors.unhandledPromise)
            ;
        this.$scope.busy = true;
        return this._waiting;
    };

    _p._stopWaiting = function(errorMessage) {
        this._waiting = null;
        this.$scope.busy = false;
        if(!this.$scope.edit)
            this._resetItemScope(errorMessage);
        else
            this._setValidityMessage(errorMessage);
    };

    _p._startEditSuccess = function(files) {
        var $scope =  this.$scope;
        $scope.cpsFileOptions = files;
        $scope.edit = true;
        return null;
    };

    _p._startEditFail = function(error) {
        // do error reporting
        var $scope =  this.$scope;
        $scope.edit = false;
        return 'Can\'t start editing, can\'t gather the list of cps files: ' + error;
    };

    _p._ruleLoadedFail = function(error) {
        return 'Loading CPS failed: ' + error;
    };

    _p.startEdit = function() {
        var promise;
        if(this._waiting)
            return;

        promise = this._ruleController.getAvailableRules(true)
            .then(
                this._startEditSuccess.bind(this)
              , this._startEditFail.bind(this)
            );

        return this._startWaiting(promise);
    };

    _p.changeRule = function() {
        var promise;
        if(this._waiting)
            return;
        promise = this.item.setResource(true, this.$scope.cpsFile)
            .then(
                function(){return null;}
              , this._ruleLoadedFail.bind(this)
            );
        return this._startWaiting(promise);
    };

    _p.finalize = function() {
        var $scope =  this.$scope;
        $scope.edit = false;
        if(!this._waiting)
            this._resetItemScope();
    };

    return ImportCollectionController;
});
