define([
    'angular'
  , 'require/text!./styleDict.tpl'
    ], function(
    angular
  , template
) {
    "use strict";

    function styleDictDirective() {
        function link(scope, element, attrs, controller) {
            scope.formatTrace = function(trace) {
                var i, item, result = [], depth = '';
                for(i=trace.length-1;i>=0;i--) {
                    item = trace[i];
                    switch(item.constructor.name) {
                        case 'ParameterCollection':
                            // NOTE: the first of these probably did not get @imported
                            // the others most probably got.
                            // We should however rather add the @import items to the trace
                            // as it is easier to extend if other sources for
                            // ParameterCollections come into being, like @generate
                            // ParameterCollection could be ignored.
                            // The first parameter collection, however helps
                            // to identify the "master cps file" that is useful
                            // information! (and not @imported ...)
                            result.push(depth + '@import "'+item.source.name+'";');
                            break;
                        case 'AtNamespaceCollection':
                            result.push(depth + '@namespace('+ item.selectorList + ')');
                            break;
                        default:
                        result.push(depth + item.constructor.name);
                    }
                    depth = depth + '  ';
                }
                return result.join('\n');
            };

            scope.updateNames = function(usedNamesSet) {
                var i,l,j
                    , containers = element[0].getElementsByClassName('container')[0].children
                    , container, child
                    , childTags = new Set(['mtk-cps-rule', 'mtk-cps-property-dict'])
                    ;
                for(i=0,l=containers.length;i<l;i++) {
                    container = containers[i];
                    // assume that child is rather at the end of the container
                    // element. At the moment of writing this reflects the
                    // DOM layout
                    for(j=container.children.length-1;j>=0;j--) {
                        child = container.children[j];
                        if(!childTags.has(child.tagName.toLowerCase()))
                            continue;
                        angular.element(child)
                           .isolateScope()
                           .updateUsedNames(usedNamesSet);
                        // there's just one child per container
                        break;
                    }
                }
            };
        }


        return {
            restrict: 'E' // only matches element names
          , controller: 'StyleDictController'
          , replace: false
          , template: template
          , scope: { element: '=item' }
          , link:link
          , controllerAs: 'ctrl'
          , bindToController: true
        };
    }
    styleDictDirective.$inject = [];
    return styleDictDirective;
});
