define([
    'd3'
], function(
    d3
) {
    "use strict";
    function strictDirective() {
        return {
            restrict : 'E'
          , controller : 'StrictController'
          , replace : false
          , scope : {
                model : '=mtkModel'
            }
          , link : function(scope, element, attrs, ctrl) {
                var sizes = {
                    buttonW : 10,
                    spacing : 6,
                    margin : 2
                  }
                  , buttonW = sizes.buttonW, spacing = sizes.spacing, margin = sizes.margin
                  , svg = d3.select(element[0]).append('svg').attr('width', '110px').attr('height', '20px')
                  , x
                  , drag = d3.behavior.drag().on('dragstart', function() {
                    }).on('drag', function() {
                        x = d3.event.x;
                        d3.select(this).attr('x', limitX(x));
                    }).on('dragend', function() {
                        d3.select(this).attr('x', positionX(x).x);
                        scope.setStrict(positionX(x).strict);
                        scope.$apply();
                        redraw();
                    })
                  , strictLabels = ["Sprinkled", "50–50", "Exclusive"];
    
                // create line and slider
                // centers at 7, 26 and 42
                function redraw() {
                    svg.selectAll('*').remove();
                    var strict = scope.model.strict;
                    svg.append('text').attr('class', 'slider-label').attr('x', 54).attr('y', 14).text(function(){
                        return strictLabels[strict];
                    }).attr('class', 'standard-text-svg');
                    var slider = svg.append('rect').attr('width', buttonW).attr('height', buttonW).attr('x', (strict * (buttonW + spacing) + margin)).attr('y', (0.5 * buttonW)).attr('class', 'standard-style-svg').call(drag);
                    var line = svg.append('line').attr('x1', (0.5 * buttonW + margin)).attr('y1', buttonW).attr('x2', (2.5 * buttonW + 2 * spacing + margin)).attr('y2', buttonW).attr('class', 'standard-line-svg');
                    var container = svg.append('g');
                    // append hidden buttons
                    container.selectAll('rect').data(strictLabels).enter().append('rect').attr('width', (buttonW + spacing)).attr('height', buttonW).attr('x', function(d, i) {
                        return i * (buttonW + spacing) + margin - (0.5 * spacing);
                    }).style('display', function(d,i) {
                        if (i == strict) {
                            return 'none';
                        } else {
                            return 'block';
                        }
                    }).attr('y', (0.5 * buttonW)).style('fill', 'transparent').on("click", function(d, i) {
                        scope.setStrict(i);
                        scope.$apply();
                        redraw();
                    });
                }
    
                redraw();

                function limitX(x) {
                    var limitLeft = sizes.margin,
                        limitRight = limitLeft + 2 * (sizes.buttonW + sizes.spacing);
                    if (x < limitLeft) {
                        x = limitLeft;
                    } else if (x > limitRight) {
                        x = limitRight;
                    }
                    return x;
                }

                function positionX(x) {
                    var pos0 = sizes.margin
                        , pos1 = sizes.margin + sizes.buttonW + sizes.spacing
                        , pos2 = sizes.margin + 2 * (sizes.buttonW + sizes.spacing)
                        , strict;
                    if (x < (pos1 - 0.5 * sizes.buttonW)) {
                        x = pos0;
                        strict = 0;
                    } else if (x < (pos2 - 0.5 * sizes.buttonW)) {
                        x = pos1;
                        strict = 1;
                    } else {
                        x = pos2;
                        strict = 2;
                    }
                    return {
                        x : x,
                        strict : strict
                    };
                }
            }
        };
    }


    strictDirective.$inject = [];
    return strictDirective;
});
