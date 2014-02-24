var metapolatortestApp = angular.module('metapolatortestApp', []);

function formatter(value) {

}

metapolatortestApp.directive('fontSlider', function(){
    return {
        controller: 'canvasCtrl',
        link: function($scope, element, attrs) {
            var config = $.grep($scope.sliders, function(e) {return e.id == attrs.id  } )[0];
            $(element).after($('<span></span>').attr({id:config.id+'Value'}).text(config.value));
            $(element).before($('<span></span>').text(config.name));
            $(element).slider(config).on('slide', function(e){
                $('#'+config.id+'Value').text(Number(e.value).toFixed(2));
                $scope.canvasInstances.interpolationValueAB = e.value;
                $scope.$digest();
            });
        }
    }
});


metapolatortestApp.controller('SliderCtrl', ['$scope','instancesListService', function($scope, instancesListService){
    $scope.sliders = [
        {
            name:'width',
            id:'sliderAB',
            min: 0,
            max: 1,
            step:0.01,
            value:0.2,
            selection:'after',
            formatter: function(value){
                return Number(value).toFixed(2);
            }
        }
    ];
    instancesListService.addInstance('Something1');
}]);

metapolatortestApp.controller('canvasCtrl', ['$scope','instancesListService', function($scope, instancesListService) {
        $scope.canvasInstances = {
        canvas: '#glyph',
        slider: '#sliderAB',
        fontslist: [
        'app/fonts/RobotoSlab_Thin.otf',
        'app/fonts/RobotoSlab_Bold.otf',
        'app/fonts/RobotoSlab_Thin.otf'
        ],
        text: 'a',
        fontSize: 400,
        lineHeight: 215,
        interpolationValueAB: 0.2,
        };
    $scope.item = 'a';
    var glyphInstance = instancesListService.createInstance($scope.canvasInstances);
    if (glyphInstance.loaded()){
        glyphInstance.interpolate();
    }
    $scope.$watchCollection('canvasInstances', function(newVal, oldVal){
        if (glyphInstance.loaded()) {
            glyphInstance.interpolationValueAB = newVal.interpolationValueAB;
            glyphInstance.interpolate();
        }
    }, true);
}]);

metapolatortestApp.service('instancesListService', function(){
   var list = [];
   return {
       addInstance : function (instance) {
           list.push(instance);
       },
       createInstance : function (config){
           var instance = Instance(config);
           list.push(instance);
           return instance;
       }
   }
});