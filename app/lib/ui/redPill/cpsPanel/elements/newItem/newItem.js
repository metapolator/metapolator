define([
    'angular'
  , './newItem-controller'
  , './newItem-directive'
  , 'metapolator/ui/redPill/cpsPanel/elements/comment/comment'
  , 'metapolator/ui/redPill/cpsPanel/elements/importCollection/importCollection'
  , 'metapolator/ui/redPill/cpsPanel/elements/namespaceCollection/namespaceCollection'
  , 'metapolator/ui/redPill/cpsPanel/elements/rule/rule'
], function(
    angular
  , Controller
  , directive
  , comment
  , importCollection
  , namespaceCollection
  , rule
) {
    "use strict";
    return angular.module('cps.newItem', [comment.name, importCollection.name
                                        , namespaceCollection.name, rule.name])
      .controller('NewItemController', Controller)
      .directive('mtkCpsNewItem', directive)
      ;
});
