define([
    'metapolator/errors'
  , 'metapolator/models/CPS/cpsTools'
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
        this._editInitialSlectorList = null;

        this._initSelectorList();

        this._subscription = this.selectorListHost.on(
             'selector-change', this._selectorListChangeHandler.bind(this));

    }

    SelectorListController.$inject = ['$scope'];
    var _p = SelectorListController.prototype;

    _p.placeholder = 'enter a selector';

    _p._initSelectorList = function() {
        var $scope = this.$scope
          , selectorList = this.selectorListHost.getSelectorList();
        $scope.selectorList = selectorList.toString();
        $scope.invalid = selectorList.invalid;
        $scope.message = selectorList.message || '';
        this._setValueBoxSize($scope.selectorList);
    };

    _p._setValueBoxSize = function(_value) {
        var value = _value === ''
                    ? this.placeholder
                    : _value
          , sizes = helpers.calculateTextBoxSize(value)
          , cols = sizes[0]
          , lines = sizes[1];
        this.$scope.valueWidth = cols;
        this.$scope.valueHeight = lines;
    };

    _p._getNewSelectorList = function() {
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
        var selectorList = this._getNewSelectorList();
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
        this._editInitialSlectorList = this.selectorListHost.getSelectorList();
    };

    function selectorlistsEqual(a, b) {
        return a.toString() === b.toString();
    }

    _p.finalize = function() {
        // assert this.$scope.edit === true;
        var selectorList
          , initialSelectorlist = this._editInitialSlectorList
          ;
        this.$scope.edit = false;
        this._editInitialSlectorList = null;

        selectorList = this._getNewSelectorList();
        if(!selectorList.invalid && !selectorlistsEqual(selectorList, initialSelectorlist)) {
            // FIXME:
            // valid: *:i(0) as: *:i(0)
            // BUT:
            // valid: *:a(0) as: *:a
            // an unkown pseudo-class should create a message not be silently
            // discarded!
            console.warn('valid:', this.$scope.selectorList, 'as: '+ selectorList);
            // update ...
            this._updateSelectorList(selectorList);
        }
        // this will set the selectorlist to the last version
        // which is valid if it was set using this method.
        this._initSelectorList();
    };

    /**
     * this is only called via the cps-engine
     */
    _p._selectorListChangeHandler = function() {
        this._initSelectorList();
        this.$scope.$apply();
    };

    return SelectorListController;
});
