define([
    'metapolator/ui/redPill/cpsPanel/elements/collection/collection-controller'
], function(
    Parent
) {
    "use strict";
    function NamespaceCollectionController() {
        Parent.apply(this, arguments);
    }

    var _p = NamespaceCollectionController.prototype = Object.create(Parent.prototype);

    NamespaceCollectionController.$inject = Parent.$inject;
    return NamespaceCollectionController;
});
