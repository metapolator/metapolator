define([
    'metapolator/errors'
  , 'metapolator/ui/redPill/cpsPanel/elements/cpsTools'
  , 'metapolator/models/CPS/parsing/parseSelectorList'
], function(
    errors
  , cpsTools
  , parseSelectorList
) {
    "use strict";

    var CPSParserError = errors.CPSParser;

    function SelectorListController($scope) {
        this.$scope = $scope;
        $scope.edit = true;

        this._initSelectorList();

        this._subscription = this.selectorListHost.on(
             'selector-change', this._selectorListChangeHandler.bind(this));

    }

    SelectorListController.$inject = ['$scope'];
    var _p = SelectorListController.prototype;

    _p._initSelectorList = function() {
        var $scope = this.$scope;
        $scope.selectorList = this.selectorListHost.getSelectorList().toString();
        $scope.invalid = $scope.selectorList.invalid;
        $scope.message = $scope.selectorList.message || '';
    }

    _p.changeSelectorList = function() {
        var selectorList;
        try {
            selectorList = parseSelectorList.fromString(
                                    this.$scope.selectorList, undefined);
        }
        catch(error) {
            if(!(error instanceof CPSParserError))
                throw error;

            this.$scope.message = error + '';
            this.$scope.invalid = true;
            return;
        }

        if(selectorList.invalid) {
            this.$scope.message = selectorList.message;
            this.$scope.invalid = true;
            return;
        }

        // FIXME:
        // valid: *:i(0) as: *:i(0)
        // BUT:
        // valid: *:a(0) as: *:a
        // an unkown pseudo-class should create a message not be silently
        // discarded!
        console.log('valid:', this.$scope.selectorList, 'as: '+ selectorList);
        // update ...
        this._updateSelectorList(selectorList);
    }

    _p._updateSelectorList = function(selectorlist) {
        // Without setTimeout this fails as:
        // Error: [$rootScope:inprog] $apply already in progress
        // because of _selectorListChangeHandler which calls
        // this.$scope.$apply();
        // but, _selectorListChangeHandler should be called async anyways
        // so it is kind of OK to decouple here.
        setTimeout(this.selectorListHost.setSelectorList.bind(this.selectorListHost)
                , 0
                , selectorlist
        );
    }

    _p._selectorListChangeHandler = function() {
        this._initSelectorList();
        this.$scope.$apply();
    }

    return SelectorListController;
});
