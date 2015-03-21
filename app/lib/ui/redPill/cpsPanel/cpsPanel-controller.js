define([
], function(
) {
    "use strict";
    function CpsPanelController($scope, model) {
        var masterName = 'interpolated'
          ,parameterCollection = model.getMasterCPS(false, masterName)
          // NOTE: We must know where the rule is, it's the third one in
          // this case. Also, the items in a parameterCollection must
          // not all be of type CPS/Rule. There are also @namespace/@import
          // collections and comments.
          , cpsRule = parameterCollection.getItem(2)
          , parameterDict = cpsRule.parameters
          ;

        this.$scope = $scope;
        this.$scope.parameterDict = parameterDict;
    }
    CpsPanelController.$inject = ['$scope', 'ModelController'];
    var _p = CpsPanelController.prototype;


    // This is handling one ParameterCollection at a time.
    // Also it provides display and update facilities for StyleDicts
    // That is two modes!


    // everything that displays a "Rule" must also display the invalid
    // parameters of that rule, hence we can change it, parse it again
    // then see if it is a valid parameter or still invalid.
    // Change it refers to: a new name, a new value, both name and value are new
    // The old rule will be replaced


    // if possible invalid and valid parameters equal from their inputs but differ in style

    // Parameters are in:
    // StyleDict dictionary displays
    // Rule Displays (ParameterDict)

    // Rules are in ParameterCollections (displayed in Collection View)
    // ParameterCollections are in other ParameterCollections
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
    // the inactive parameters should be visually very differeny from the active parameters
    //           although, editing should be possible
    // parameters can be added to all displayed rules
    // (OR new rules can be added to the master ParameterCollection of the element
    // but that must be a shortcut to the same functionality as in the Collection View)

    // the other styledict view will just display the active key/value pairs
    // here is no way add a parameter (we wouldn't know where to add it)



    // startin bottom up ...
    // first I implement ParameterDict (a list of Parameters and Comments)
    // and the full update cycle of it.
    // initially: for each item: make item // just display
    //            subscribe to changes of ParameterCollection (things won't change, just get replaced)
    //            on any change: update the right thing
    //
    //            make an update to any thing
    //
    //
    //
    //            first, figure out how to notice angular that a specific
    //            element needs a redraw






    return CpsPanelController;
});
