app.controller('glyphController', ['$scope', 'instanceListService',
function($scope, instanceListService) {
    $scope.metapValue = 0;
    $scope.glyphConfig = {
        name : 'glyphConfig',
        canvas : '#glyph',
        fontslist : ['app/fonts/RobotoSlab_Thin.otf', 'app/fonts/RobotoSlab_Bold.otf', 'app/fonts/RobotoSlab_Thin.otf'],
        text : 'Metapolator',
        lib : 'opentype',
        fontSize : 145,
        lineHeight : 145,
        interpolationValueAB : $scope.metapValue,
    };
    
    $scope.setMetap = function (m) {
        glyphInstance.interpolationValueAB = m;
        glyphInstance.interpolate();
    }

    var glyphInstance = Instance($scope.glyphConfig);
}]);

app.service('instanceListService', function() {
    var list = {};
    return {
        addInstance : function(instance) {
            list[instance.name] = instance;

        },
        getInstance : function(name) {
            console.log(list[name]);
            return list[name]
        }
    }
});

