app.directive('control', function() {
    return {
        restrict : 'E',

        require : 'ngModel',
        link : function(scope, element, attrs, ctrl) {
            var thisAxis = attrs.nr;

            if (scope.selectedDesignSpaces.axes.length > 1) {
                // hide first slider
                $(".drop-area li:first-child").hide();

                // D3: create sliderline and sliderhandle
                var width = 200;
                var dispatch = d3.dispatch("sliderChange");
                var x = d3.scale.linear().domain([1, 100]).range([0, width]).clamp(true);
                var slider = d3.select(element[0]);
                var sliderTray = slider.append("div").attr("class", "slider-tray");
                var sliderHandle = slider.append("div").attr("class", "slider-handle").style("left", 2 * scope.selectedDesignSpaces.axes[thisAxis] + "px");
                sliderHandle.append("div").attr("class", "slider-handle-icon");
                var outputLabel = slider.append("div").attr("class", "slider-label-middle");
                var output = scope.selectedDesignSpaces.axes[thisAxis];
                outputLabel.html(output);

                // make slider slide
                slider.call(d3.behavior.drag().on("dragstart", function() {
                    dispatch.sliderChange(x.invert(d3.mouse(sliderTray.node())[0]));
                    d3.event.sourceEvent.preventDefault();
                }).on("drag", function() {
                    dispatch.sliderChange(x.invert(d3.mouse(sliderTray.node())[0]));
                }));

                // mode sliderhandle and update scope
                dispatch.on("sliderChange.slider", function(value) {
                    sliderHandle.style("left", x(value) + "px");
                    var slidePosition = Math.round(x(value) / 2);
                    outputLabel.html(slidePosition);
                    scope.selectedDesignSpaces.axes[thisAxis] = slidePosition;
                    scope.$apply();
                });
            } else {
                var width = 200;
                var dispatch = d3.dispatch("sliderChange");
                var x = d3.scale.linear().domain([1, 100]).range([0, width]).clamp(true);
                var slider = d3.select(element[0]);
                var sliderTray = slider.append("div").attr("class", "slider-hidden");
                var sliderHandle = slider.append("div").attr("class", "slider-handle").style("left", 2 * scope.selectedDesignSpaces.axes[thisAxis] + "px");
                sliderHandle.append("div").attr("class", "slider-handle-icon");
            }

        }
    };
});

app.directive('explore', ['$document',
function($document) {
    return {
        restrict : 'A',
        link : function(scope, element, attrs, ctrl) {
            var thisAxis = attrs.nr;
            var x = scope.selectedDesignSpaces.masters[thisAxis].coordinates[0];
            var y = scope.selectedDesignSpaces.masters[thisAxis].coordinates[1];
            var startX = 0, startY = 0;

            // place element
            $(element).css("left", x);
            $(element).css("top", y);

            // drag functions
            element.on('mousedown', function(event) {
                event.preventDefault();
                startX = event.pageX - x;
                startY = event.pageY - y;
                $document.on('mousemove', mousemove);
                $document.on('mouseup', mouseup);
            });
            function mousemove(event) {
                y = event.pageY - startY;
                x = event.pageX - startX;
                element.css({
                    top : y + 'px',
                    left : x + 'px'
                });
                // update scope
                scope.selectedDesignSpaces.masters[thisAxis].coordinates[0] = x;
                scope.selectedDesignSpaces.masters[thisAxis].coordinates[1] = y;
                scope.$apply();
            }

            function mouseup() {
                $document.off('mousemove', mousemove);
                $document.off('mouseup', mouseup);
            }

            // show/hide label
            element.on('mouseenter', function() {
                element.addClass("show-name-full");
            });
            element.on('mouseleave', function() {
                element.removeClass("show-name-full");
            });

        }
    };
}]);
