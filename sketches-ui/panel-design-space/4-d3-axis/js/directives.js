app.directive('slider', function() {
    return {
        restrict: 'E',

        require: 'ngModel',
        link: function (scope, element, attrs, ctrl) {
            var thisAxis = attrs.nr;
            
            
            if (scope.selectedDesignSpaces.axes.length > 1 ) {  
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
            }
            else {
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