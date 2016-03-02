var app = angular.module('Slider', []);

app.service('instanceListService', function() {
    var list = {};
    return {
        addInstance : function(instance) {
            list[instance.name] = instance;

        },
        getInstance : function(name) {
            return list[name];
        }
    };
});

app.controller('glyphController', function($scope, instanceListService) {
    var fontSize = getFontsize();

    $scope.metapValue = 0;

    $scope.glyphConfig = {
        name : 'glyphConfig',
        canvas : '#glyph',
        fontslist : ['app/fonts/RobotoSlab_Thin.otf', 'app/fonts/RobotoSlab_Bold.otf', 'app/fonts/RobotoSlab_Thin.otf'],
        text : 'Metapolator',
        lib : 'opentype',
        fontSize : fontSize,
        lineHeight : fontSize,
        interpolationValueAB : $scope.metapValue
    };

    $scope.setMetapolation = function (m) {
        glyphInstance.interpolationValueAB = m;
        glyphInstance.interpolate();
    };

    function getFontsize() {
        var ww = $(window).outerWidth();
        if (ww < 1200) {
            return ww / 10;
        } else {
            return 140;
        }
    }

    var glyphInstance = Instance($scope.glyphConfig);
});

app.directive('glyphslider', function() {
    return {
        restrict : 'E',
        controller : 'glyphController',
        link : function(scope, element, attrs, ctrl) {
            var svg = d3.select(element[0]).append('svg'),
                settings = {
                    padding : {
                        left : 50,
                        top : 30
                    },
                    axis : {
                        width : 200,
                        distance : 50,
                        tab : 10,
                        tabLeft : 60
                    },
                    indent : {
                        right: 30,
                        left : 40
                    },
                    label : {
                        padding : 25
                    }
                },
                data = {
                axes : [{value: 0}],
                masters : [{master : {name: "Roboto Slab Light"}}, {master : {name: "Roboto Slab Bold"}}]
            };



            // create drag events
            var drag = d3.behavior.drag().on('dragstart', function() {
                d3.select(this).attr('stroke', '#f85c37').attr('stroke-width', '4');
            }).on('drag', function() {
                d3.select(this).attr('cx', limitX(d3.event.x));
                var thisIndex = d3.select(this).attr('index');
                var thisValue = (limitX(d3.event.x) - settings.indent.left) / (settings.axis.width / 100) / 100;
                scope.setMetapolation(thisValue);
                scope.$apply();
            }).on('dragend', function() {
                d3.select(this).attr('stroke', 'none');
            });

            var animationTime = 0;
            var animationTimer = null;

            function initAnimation() {
                setTimeout(function(){
                    d3.select(".slider-handle").attr('stroke', '#f85c37').attr('stroke-width', '4');
                    firstAnimation();
                }, 500);
            }

            function firstAnimation() {
                var step = 0.05;
                var interval = 20;
                var end = 1;
                animationTimer = setInterval(function(){
                    animate(animationTime);
                    animationTime += step;
                    if (animationTime > end) {
                        clearInterval(animationTimer);
                        animationTime = end;
                        secondAnimation();
                    }
                }, interval);
            }

            function secondAnimation() {
                var step = 0.05;
                var interval = 20;
                var end = 0;
                animationTimer = setInterval(function(){
                    animate(animationTime);
                    animationTime -= step;
                    if (animationTime < end) {
                        clearInterval(animationTimer);
                        thirdAnimation();
                    }
                }, interval);
            }

            function thirdAnimation() {
                var step = 0.02;
                var interval = 40;
                var end = 0.5;
                animationTimer = setInterval(function(){
                    animate(animationTime);
                    animationTime += step;
                    if (animationTime > end) {
                        clearInterval(animationTimer);
                        finishAnimation();
                    }
                }, interval);
            }

            function finishAnimation() {
                d3.select(".slider-handle").attr('stroke', 'none');
            }

            function animate(value) {
                var left = setLeft(value);
                d3.select(".slider-handle").attr("cx", left);
                scope.setMetapolation(value);
                scope.$apply();
                function setLeft (x) {
                    return x * settings.axis.width + settings.indent.left;
                }
            }


            function limitX(x) {
                if (x < settings.indent.left) {
                    x = settings.indent.left;
                }
                if (x > (settings.axis.width + settings.indent.left)) {
                    x = settings.axis.width + settings.indent.left;
                }
                return x;
            }

            // create slider containers
            var axes = svg.selectAll('g').data(data.axes).enter().append('g').attr('transform', function(d, i) {
                var x = settings.padding.left - settings.indent.left,
                    y = i * settings.axis.distance + settings.padding.top;
                return "translate(" + x + "," + y + ")";
            }).attr('class', 'slider-container');

            // append axis itself
            axes.append('path').attr('d', function(d, i) {
                // prevent last axis from having the vertical offset
                var offset;
                if (i != (data.axes.length - 1)) {
                    offset = 1;
                } else {
                    offset = 0;
                }
                return 'M' + settings.indent.left + ' ' + (settings.axis.tab + offset * settings.axis.tabLeft) + ' L' + settings.indent.left + ' 0  L' + (settings.indent.left + settings.axis.width) + ' 0 L' + (settings.indent.left + settings.axis.width) + ' ' + settings.axis.tab;
            }).attr('class', 'slider-axis');

            // append slider handles
            axes.append('circle').attr('r', 8).attr('cx', function(d) {
                return d.value * (settings.axis.width / 100) + settings.indent.left;
            }).attr('cy', '0').attr('index', function(d, i) {
                return i;
            }).attr('class', 'slider-handle').call(drag);

            // create left label
            if (data.masters.length < 3) {
                svg.append('text').attr('x', settings.padding.left - settings.indent.left).attr('y', (settings.padding.top + settings.label.padding + (data.axes.length - 1) * settings.axis.distance)).text(data.masters[0].master.name).attr('class', 'slider-label-left slider-label');
            }

            // create rigth label
            var rightlabels = axes.append('g').attr('transform', function(d, i) {
                var x = settings.indent.left + settings.axis.width - settings.indent.right;
                return "translate(" + x + "," + settings.label.padding + ")";
            }).attr('class', 'slider-label-right-container');


            rightlabels.append('text').text(function(d, i) {
                return data.masters[i + 1].master.name;
            }).attr('class', 'slider-label-right slider-label');

            $(document).ready(function() {
                initAnimation();
            });
        }
    };
});



