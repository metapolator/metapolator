define([
    'metapolator/errors'
], function(
    errors
) {
    "use strict";

    var unhandledPromise = errors.unhandledPromise;

    function MastersImportController($scope, $timeout) {
        this.$scope = $scope;
        this.$timeout = $timeout;
        this.items = [];
        this.current = null;


        this.next = this._next.bind(this);


        this.importProcess.initialized
                          .then(this.next
                                // should not happen because importProcess
                                // should handle this
                              , unhandledPromise
                          );
    }

    MastersImportController.$inject = ['$scope', '$timeout'];
    var _p = MastersImportController.prototype;

    _p._next = function() {
        this._updateItems();
        if(!this.current)
            return;
        this.$timeout(this.next, 0, false);
        this.$scope.$apply();
    };

    _p.cancel = function(fileName) {
        if(this.current.file === fileName)
            this.current.cancel = true;
        else {
            this.importProcess.cancelScheduled(fileName);
            this.$scope.$apply();
        }
    };

    _p._updateItems = function() {
        var i, l, item;
        this.current = this.importProcess.next(this.current ? !this.current.cancel : true/* carryOn */) || null;
        this.items = [];
        for(i=0,l=this.importProcess.itemsLength;i<l;i++) {
            item = this.importProcess.getItem(i);
            this.items.push(item.file);
        }
        this.$scope.$apply();
    };

    return MastersImportController;
});
