app.directive('draw', function() {
    return {
        restrict : 'AEC',
        link : function postLink(scope, element, attrs) {
            // initialize paper
            paper.install(window);
            paper.setup('canvas');

            window.sliderLine = new Path(new Point(10, 50), new Point(210, 50));
            window.sliderLine.strokeColor = '#000';
            window.sliderKnob = new Path.Circle(new Point(110, 50), 10);
            window.sliderKnob.fillColor = '#000';
        }
    };
});
