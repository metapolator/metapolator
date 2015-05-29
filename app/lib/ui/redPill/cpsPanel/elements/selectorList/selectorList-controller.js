define([
    'metapolator/errors'
  , 'metapolator/ui/redPill/cpsPanel/elements/cpsTools'
  , 'metapolator/ui/redPill/cpsPanel/elements/helpers'
  , 'metapolator/models/CPS/parsing/parseSelectorList'
], function(
    errors
  , cpsTools
  , helpers
  , parseSelectorList
) {
    "use strict";

    var CPSParserError = errors.CPSParser;

    function SelectorListController($scope) {
        this.$scope = $scope;
        $scope.edit = false;

        this._initSelectorList();
        this._setValueBoxSize($scope.selectorList);

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
    };

    _p._setValueBoxSize = function(value) {
        var sizes = helpers.calculateTextBoxSize(value)
          , cols = sizes[0]
          , lines = sizes[1];
        this.$scope.valueWidth = cols;
        this.$scope.valueHeight = lines;
    };

    _p._getSelectorList = function() {
        try {
            return parseSelectorList.fromString(
                                    this.$scope.selectorList, undefined);
        }
        catch(error) {
            if(!(error instanceof CPSParserError))
                throw error;
            // duckktyping an invalid selectorlist
            return {
                message: error + ''
              , invalid: true
            };
        }
    };

    _p.changeSelectorList = function() {
        var selectorList = this._getSelectorList();
        this.$scope.invalid = selectorList.invalid;
        this.$scope.message = selectorList.invalid
            ? (selectorList.message || 'no message :-(')
            : ''
            ;
        this._setValueBoxSize(this.$scope.selectorList);
        // no update in here, as long as in edit mode
    };

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
    };

    _p.startEdit = function() {
        this.$scope.edit = true;
    };

    _p.finalize = function() {
        var selectorList;

        this.$scope.edit = false;

        selectorList = this._getSelectorList();
        if(!selectorList.invalid) {
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
        // this will set the selectorlist to the last version
        // which is valid if it was set using this method.
        this._initSelectorList();
        this._setValueBoxSize(this.$scope.selectorList);

    };

    /**
     * this is only called via the cps-engine
     */
    _p._selectorListChangeHandler = function() {
        this._initSelectorList();
        this._setValueBoxSize(this.$scope.selectorList);
        this.$scope.$apply();
    };

    return SelectorListController;
});
