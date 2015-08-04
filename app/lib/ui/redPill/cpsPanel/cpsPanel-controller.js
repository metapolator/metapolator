define([
    'metapolator/errors'
], function(
    errors
) {
    "use strict";

    var CPSError = errors.CPS;

    function CpsPanelController($scope, modelController, ruleController) {
        this.$scope = $scope;
        this.$scope.ctrl = this;

        this._modelController = modelController;
        this._ruleController = ruleController;

        this.displayModes = ['cps-collection', 'cps-style'];
        $scope.displayMode = this.displayModes[1];

        $scope.cpsFile = null;
        $scope.cpsFileOptions = [];
        $scope.collection = null;

        $scope.elementSelector = 'left'; //null
        $scope.styleElement = null;


        this._waiting = null;
    }
    CpsPanelController.$inject = ['$scope', 'ModelController', 'ruleController'];
    var _p = CpsPanelController.prototype;


    // This is handling one PropertyCollection at a time.
    // Also it provides display and update facilities for StyleDicts
    // That is two modes!


    // everything that displays a "Rule" must also display the invalid
    // parameters of that rule, hence we can change it, parse it again
    // then see if it is a valid parameter or still invalid.
    // Change it refers to: a new name, a new value, both name and value are new
    // The old rule will be replaced


    // if possible invalid and valid parameters equal from their inputs but differ in style

    // Properties are in:
    // StyleDict dictionary displays
    // Rule Displays (PropertyDict)

    // Rules are in PropertyCollections (displayed in Collection View)
    // PropertyCollections are in other PropertyCollections
    //          - It should be possible to embed a Collection View into another
    //            with some visual impression of the depth (maybe not indents, because space may get few)
    //          - it should be possible to open any collection view as top level
    //          - later: (remeber opening history and navigate it)

    // SelectorLists are in:
    // Rule, @namespace: both edits are the same, both require valid selectorlists on update!
    //


    // We have currently no way to Select the Element for a StyleDict view
    // we could use:
    //    a textbox for a query => simple, starter !
    //    a MOM-tree navigation => simple, seccond !
    //    click to glyph image  => third (having different path elements for different penstrokes/contours would make this easier!)
    //                             however, this woul be most fun with more information in the canvas,
    //                             like all the points, contour direction etc.

    // For the styledict view we should be able to display all rules that it is made up from
    // the most specific one at the top (styledict knows the order)
    // the inactive parameters should be visually very different from the active parameters
    //           although, editing should be possible
    // parameters can be added to all displayed rules
    // (OR new rules can be added to the master PropertyCollection of the element
    // but that must be a shortcut to the same functionality as in the Collection View)

    // the other styledict view will just display the active key/value pairs
    // here is no way add a parameter (we wouldn't know where to add it)



    // startin bottom up ...
    // first I implement PropertyDict (a list of Propertys and Comments)
    // and the full update cycle of it.
    // initially: for each item: make item // just display
    //            subscribe to changes of PropertyCollection (things won't change, just get replaced)
    //            on any change: update the right thing
    //
    //            make an update to any thing
    //
    //
    //
    //            first, figure out how to notice angular that a specific
    //            element needs a redraw


    _p._receiveOptions = function(options) {
        this.$scope.cpsFileOptions = options;
        this._waiting = null;
        setTimeout(this.$scope.$apply.bind(this.$scope));
    };

    _p._receiveCollection = function(collection) {
        this.$scope.collection = collection;
        setTimeout(this.$scope.$apply.bind(this.$scope));
        this._waiting = null;
    };

    _p.initCPSFileOptions = function() {
        if(this._waiting) return;

        this._waiting = this._ruleController.getAvailableRules(true)
            .then(this._receiveOptions.bind(this))
            .then(this._initCollectionView.bind(this))
            .then(null, errors.unhandledPromise)
            ;
        return this._waiting;
    };

    _p._initCollectionView = function() {
        if(!this.$scope.cpsFile) {
            // 0 is often 'base.cps' which is kind of a bad default choice
            // because it is very big.
            // TODO: find a better way to select a default, maybe use
            // the cps file of the first master
            this.$scope.cpsFile = this.$scope.cpsFileOptions[1];
        }
        this.changeCPSFile();
    };

    _p.changeCPSFile = function() {
        if(this._waiting) return;
        var file = this.$scope.cpsFile;
        this.$scope.collection = null;
        this._waiting = this._ruleController.getRule(true, file)
            .then(this._receiveCollection.bind(this))
            .then(null, errors.unhandledPromise)
            ;
        return this._waiting;
    };

    _p._selectFirst = function(selector) {
        try {
            return this._modelController.query(selector);
        }
        catch(error) {
            if(!(error instanceof CPSError))
                throw error;
            console.warn('selector "' + selector + '" did not parse:', error.message);
        }
        return null;
    };

    _p._changeElement = function(element) {
        this.$scope.styleElement = element;
        this.$scope.$apply();
    }

    _p.changeSelector = function() {
        // select one element (query, not query all)
        // then set scope.styleElement = result

        var element = this._selectFirst(this.$scope.elementSelector) || null;
        if(this.$scope.styleElement === element)
            return;
        // force to unload the current element
        this.$scope.styleElement = null;
        // later, load the new one
        setTimeout(this._changeElement.bind(this, element));

    };

    return CpsPanelController;
});
