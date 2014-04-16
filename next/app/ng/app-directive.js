define([
    'require/text!./app.tpl'
    ], function(
    template
) {
    function AppDirective(mainCtrl) {
        return {
            restrict: 'E' // only matches element names
          , controller: 'AppController'
          , replace: true
          , template: template
        };
    }
    
    var _p = AppDirective.prototype;
    
    return {
        Constructor: AppDirective
      , di: ['$compile', AppDirective]
    }
})
