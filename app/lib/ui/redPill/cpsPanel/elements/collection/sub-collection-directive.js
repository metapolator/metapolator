define([
], function(
) {
    "use strict";

    // this is a workaround because it's not possible in AngularJS to
    // define recursive directives within templates.

    // FIXME: I'm not yet shure if this will need some more love
    function SubCollectionDirective($compile) {
        function link(scope, element, attrs) {
            element.append('<mtk-cps-collection cps-collection="cpsCollection"></mtk-cps-collection>');
            $compile(element.contents())(scope)
        }

        return {
            restrict: 'E' // only matches element names
          , replace: true
          , link: link
          , scope: { cpsCollection: '=' }
        };
    }
    SubCollectionDirective.$inject = ['$compile'];
    return SubCollectionDirective;
});
