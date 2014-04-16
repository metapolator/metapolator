define([
    'require/text!./main.tpl'
    ], function(
    template
) {
    function MainDir(mainCtrl) {
        return {
            restrict: 'E' // only matches element names
          , controller: 'mainCtrl'
          , replace: true
          , template: template
        };
    }
    
    var _p = MainDir.prototype;
    
    return {
        Constructor: MainDir
      , di: ['$compile', MainDir]
    }
})
