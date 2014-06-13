define([
    'require/text!./fileViewer.tpl'
    ], function(
    template
) {
    "use strict";
    function FileViewerDirective($compile) {
        return {
            restrict: 'E' // only matches element names
          , controller: 'FileViewerController'
          , replace: false
          , template: template
          , scope: {
                model: '=FileModel',
                drop: '&'
            }
          , link: function(scope, element, attrs) {
              scope.$on('filesReady', function(event) {
                  scope.filenames = [];
                  for (var key in localStorage){
                       scope.filenames.push(key);
                    }
                  var search = angular.element('<input type="text" ng-model="search" placeholder="search" />');
                  var select = angular.element('<select ng-model="selectedFile" ng-options="file for file in filenames | filter: search"></select>');
                  var selectedFile = angular.element('<pre ng-bind="selectedFileContent"></pre>');
                  search = $compile(search)(scope);
                  select = $compile(select)(scope);
                  selectedFile = $compile(selectedFile)(scope);
                  element.append(search);
                  element.append(select);
                  element.append(selectedFile);
              });
            return false
          }
        };
    }
    FileViewerDirective.$inject = ['$compile'];
    return FileViewerDirective;
})
