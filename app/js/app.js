var metapolatortestApp = angular.module('metapolatortestApp', []);

metapolatortestApp.controller('SliderCtrl', ['$scope',
                                             'instanceListService',
                                             'guiListService',
    function($scope, instanceListService, guiListService){
        $scope.sliders = [
            {
                id:'paperGlyphSlider',
                min: 0,
                max: 1,
                selection:'after',
                canvasConfig: 'paperjsConfig',
                canvas: 'paperjsCanvas',
                interpolationValueAB: 0.2,
            },
            {
                id:'glyphSlider',
                min: 0,
                max: 1,
                selection:'after',
                canvasConfig: 'glyphConfig',
                canvas: 'glyph',
                interpolationValueAB: 0.2,
            },
            {
                id:'wordSlider',
                min: 0,
                max: 1,
                selection:'after',
                canvasConfig: 'wordConfig',
                interpolationValueAB: 0.2,
                interpolationValueAC: 0.2,
                forSlider: 2
            },
            {
                id:'wordSlider',
                min: 0,
                max: 1,
                selection:'after',
                canvasConfig: 'paragraphGlyphConfig',
                interpolationValueAB: 0.2,
                interpolationValueAC: 0.2,
            },
            {
                id:'xheightSlider',
                min: 0,
                max: 1,
                selection:'after',
                canvasConfig: 'xheightConfig',
                interpolationValueAB: 0.2,
            }

        ];
        var interLn = {
          interpolationValueAB: 'bold',
          interpolationValueAC: 'space',
          interpolationValueAD: 'x-height'
        };
        var objectToFunc = function(object, funct) {
            for (key in object){
                funct[key] = object[key];
            }
            return funct;
        }
        angular.forEach($scope.sliders, function(slider, index){
            var gui = guiListService.getGui(slider.id);
            var newGui = false;
            if (!gui){
              gui = new dat.GUI();
              guiListService.addGui(slider.id, gui);
              newGui = true;
            }
            var sliderFunct = objectToFunc(slider, new Function());
            var controllers = [];
            var sliderEl = document.getElementById(slider.id);

            if (newGui) {
                angular.forEach(slider, function(key, index){
                    if (index.indexOf('interpolationValue') > -1) {
                        controllers.push(gui.add(sliderFunct, index, slider.min, slider.max));
                    }
                });

                angular.forEach(controllers, function(control, index){
                  control.name(interLn[control.property]);
                    control.onChange(function(value){
                        var canvasModel = instanceListService.getInstance(slider.canvasConfig);
                        canvasModel[control.property] = value;
                        canvasModel.interpolate();
                        if (slider.forSlider){
                            canvasModel = instanceListService.getInstance($scope.sliders[slider.forSlider].canvasConfig);
                            canvasModel[control.property] = value;
                            canvasModel.interpolate();
                        }
                    });
                });
                console.log(sliderEl);

                sliderEl.appendChild(gui.domElement);
            };
        });

}]);

metapolatortestApp.controller('canvasCtrl', ['$scope',
                                            'instanceListService',
                                            '$http',
    function($scope, instanceListService, $http) {
        $scope.canvasConfig = {};
        $scope.init = function (model) {
                if (model.lib == 'paperjs'){
                    $.ajax({
                    url : model.glyphJSONUrls[0],
                    success : function(data, status, headers, config) {
                      model.glyphJSON.push(data);
                      $.ajax({
                        url: model.glyphJSONUrls[1],
                        success : function(data, status, headers, config) {
                            model.glyphJSON.push(data);
                          var instanceObj = Instance(model);
                          instanceObj.interpolate();
                          instanceListService.addInstance(instanceObj);
                      },
                      error : function(data, status, headers, config) {
                        console.log('ERROR');
                        },
                      aync: false
                        });
                    },
                    error : function(data, status, headers, config) {
                      console.log('ERROR');
                      },
                    aync: false
                      });
                } else {
                    var instanceObj = Instance(model);
                    if (instanceObj.loaded()){
                        instanceObj.interpolate();
                    }
                    instanceListService.addInstance(instanceObj);
                }
            return instanceObj;
        }
        $scope.watchConf = function(instanceObj, newVal){
            if (instanceObj && instanceObj.loaded()) {
                    instanceObj = newVal;
                    instanceObj.interpolate();
                }
            }
    }]);

metapolatortestApp.controller('glyphCtrl', ['$scope',
                                            'instanceListService',
    function($scope, instanceListService) {
        $scope.glyphConfig = {
                name: 'glyphConfig',
                canvas: '#glyph',
                fontslist: [
                'app/fonts/RobotoSlab_Thin.otf',
                'app/fonts/RobotoSlab_Bold.otf',
                'app/fonts/RobotoSlab_Thin.otf'
                ],
                text: 'a',
                lib: 'opentype',
                fontSize: 380,
                lineHeight: 215,
                interpolationValueAB: 0.2,
            };
        var glyphInstance = $scope.init($scope.glyphConfig);
        $scope.$watchCollection('glyphConfig', function(newVal, oldVal){
            $scope.watchConf(glyphInstance, newVal);
        });
    }]);
metapolatortestApp.controller('paperjsCtrl', ['$scope',
                                            'instanceListService',
    function($scope, instanceListService) {
        $scope.paperjsConfig = {
            name: 'paperjsConfig',
            canvas: '#paperjsCanvas',
            fontSize: 80,
            lineHeight: 110,
            interpolationValueAB: 0.2,
            interpolationValueAC: 0.2,
            lib:'paperjs',
            glyphJSONUrls: [
            '/app/RobotoSlab_Thin_a.json',
            '/app/RobotoSlab_Bold_a.json'
            ],
            glyphJSON : [],

        };
        var glyphInstance = $scope.init($scope.paperjsConfig);
        $scope.$watchCollection('paperjsConfig', function(newVal, oldVal){
            $scope.watchConf(glyphInstance, newVal);
        });
    }]);

metapolatortestApp.controller('wordCtrl', ['$scope',
                                            'instanceListService',
    function($scope, instanceListService) {
        $scope.wordConfig = {
            name: 'wordConfig',
            canvas: '#glyphsWord',
            fontslist: [
                'app/fonts/Roboto-Regular.otf',
                'app/fonts/Roboto-Bold.otf',
                'app/fonts/Roboto-Regular-space.otf'
            ],
            text: 'Hanna',
            fontSize: 80,
            lineHeight: 110,
            lib: 'opentype',
            interpolationValueAB: 0.2,
            interpolationValueAC: 0.2,
        };
        var glyphInstance = $scope.init($scope.wordConfig);
        $scope.$watchCollection('wordConfig', function(newVal, oldVal){
            $scope.watchConf(glyphInstance, newVal);
        });
    }]);

metapolatortestApp.controller('paragraphCtrl', ['$scope',
                                                'instanceListService',
    function($scope, instanceListService) {
        $scope.paragraphGlyphConfig = {
            name: 'paragraphGlyphConfig',
            canvas: '#paragraphWord',
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
            lib: 'opentype',
            linebreaks: true,
            interpolationValueAB: 0.2,
            interpolationValueAC: 0.2,
        };
        var glyphInstance = $scope.init($scope.paragraphGlyphConfig);
        $scope.$watchCollection('paragraphGlyphConfig', function(newVal, oldVal){
            $scope.watchConf(glyphInstance, newVal);
        });
    }]);

metapolatortestApp.controller('xheightCtrl', ['$scope',
                                            'instanceListService',
    function($scope, instanceListService) {
        $scope.xheightConfig = {
                name: 'xheightConfig',
                canvas: '#xheight',
                fontslist: [
                'app/fonts/Roboto-Regular-x-low.otf',
                'app/fonts/Roboto-Regular-x-high.otf',
                'app/fonts/Roboto-Regular-x-high.otf'
                ],
                text: 'Hanna',
                lib: 'opentype',
                fontSize: 80,
                lineHeight: 120,
                interpolationValueAB: 0.2,
            };
        var glyphInstance = $scope.init($scope.xheightConfig);
        $scope.$watchCollection('xheightConfig', function(newVal, oldVal){
            $scope.watchConf(glyphInstance, newVal);
        });
    }]);



metapolatortestApp.service('instanceListService', function(){
   var list = {};
   return {
       addInstance : function (instance) {
           list[instance.name] = instance;
       },
       getInstance: function (name){
        return list[name]
    }
   }
});

metapolatortestApp.service('guiListService', function () {
    var list = {};
    return {
        addGui : function (name, instance) {
            list[name] = instance;
        },
        getGui: function (name){
         return list[name]
     }
    }
});
