define([
    'angular'
  , 'require/text!./comment.tpl'
    ], function(
    angular
  , template
) {
    "use strict";

    function CommentDirective() {
        function link(scope, element, attrs) {
        }
        return {
            restrict: 'E' // only matches element names
          , controller: 'CommentController'
          , replace: false
          , template: template
          , scope: {comment: '=', index: '=', mtkElementTools: '='}
          , controllerAs: 'ctrl'
          , bindToController: true
          , link: link
        };
    }
    CommentDirective.$inject = [];
    return CommentDirective;
});
