var metapolatortestApp = angular.module('metapolatortestApp', []);

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


metapolatortestApp.controller('SliderCtrl', ['$scope',
                                             'instancesListService',
    function($scope, instancesListService){
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
}]);

metapolatortestApp.controller('canvasCtrl', ['$scope',
                                            'instancesListService',
    function($scope, instancesListService) {
        $scope.canvasConfig = {};
        $scope.init = function (model) {
                var instanceObj = instancesListService.createInstance(model);
                if (instanceObj.loaded()){
                    instanceObj.interpolate();
                }
            return instanceObj;
        }
        $scope.watchConf = function(instanceObj, newVal){
                if (instanceObj.loaded()) {
                    instanceObj = newVal;
                    instanceObj.interpolate();
                }
            }
    }]);

metapolatortestApp.controller('glyphCtrl', ['$scope',
                                            'instancesListService',
    function($scope, instancesListService) {
        $scope.glyphConfig = {
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
        console.log($scope);
        var glyphInstance = $scope.init($scope.glyphConfig);
        $scope.$watchCollection('glyphConfig', function(newVal, oldVal){
            $scope.watchConf(glyphInstance, newVal);
        });
    }]);
metapolatortestApp.controller('wordCtrl', ['$scope',
                                            'instancesListService',
    function($scope, instancesListService) {
        $scope.glyphConfig = {
            canvas: '#glyphsWord',
            slider: '#sliderAB',
            fontslist: [
                'app/fonts/Roboto-Regular.otf',
                'app/fonts/Roboto-Bold.otf',
                'app/fonts/Roboto-Regular-space.otf'
            ],
            text: 'Hanna',
            fontSize: 80,
            lineHeight: 110,
            interpolationValueAB: 0.2,
        };
        console.log($scope);
        var glyphInstance = $scope.init($scope.glyphConfig);
        $scope.$watchCollection('glyphConfig', function(newVal, oldVal){
            $scope.watchConf(glyphInstance, newVal);
        });
    }]);

metapolatortestApp.controller('wordCtrl', ['$scope',
    'instancesListService',
    function($scope, instancesListService) {
        $scope.glyphConfig = {
            canvas: '#glyphsWord',
            slider: '#sliderAB',
            fontslist: [
                'app/fonts/Roboto-Regular.otf',
                'app/fonts/Roboto-Bold.otf',
                'app/fonts/Roboto-Regular-space.otf'
            ],
            text: 'Hanna',
            fontSize: 80,
            lineHeight: 110,
            interpolationValueAB: 0.2,
        };
        console.log($scope);
        var glyphInstance = $scope.init($scope.glyphConfig);
        $scope.$watchCollection('glyphConfig', function(newVal, oldVal){
            $scope.watchConf(glyphInstance, newVal);
        });
    }]);

metapolatortestApp.controller('paragraphCtrl', ['$scope',
                                                'instancesListService',
    function($scope, instancesListService) {
        $scope.glyphConfig = {
            canvas: '#paragraphWord',
            slider: '#sliderAB',
            fontslist: [
                'app/fonts/RobotoSlab_Thin.otf',
                'app/fonts/RobotoSlab_Bold.otf',
                'app/fonts/RobotoSlab_Thin_Space.otf'
            ],
            text: 'Donald Ervin Knuth (born January 10, 1938) is an American computer scientist, mathematician, and Professor Emeritus at Stanford University. He is the author of the multi-volume work The Art of Computer Programming. Knuth has been called the "father" of the analysis of algorithms. He contributed to the development of the rigorous analysis of the computational complexity of algorithms and systematized formal mathematical techniques for it. In the process he also popularized the asymptotic notation. In addition to fundamental contributions in several branches of theoretical computer science, Knuth is the creator of the TeX computer typesetting system, the related METAFONT font definition language and rendering system, and the Computer Modern family of typefaces.',
            fontSize: 20,
            lineHeight: 32,
            width: 690,
            height: 400,
            linebreaks: true,
            interpolationValueAB: 0.2,
        };
        console.log($scope);
        var glyphInstance = $scope.init($scope.glyphConfig);
        $scope.$watchCollection('glyphConfig', function(newVal, oldVal){
            $scope.watchConf(glyphInstance, newVal);
        });
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