app.directive('draggable', ['$document',
function($document) {
    return function(scope, element, attr) {
        var startY = 14, y = 14;
        var clone = document.createElement('div');

        element.on('mousedown', function(event) {
            // only dragging if 'diamonddrag'
            // really dirty method for now...
            //console.log($(element).context.className;
            var mystring = $(element).context.className
            var needle = "diamonddrag";
            if (mystring.indexOf(needle) > -1) {
                // create clone
                $(element).parent().append(clone);
                clone.className = 'diamond-clone';
                $(clone).css({
                    top : '14px'
                });
                // Prevent default dragging of selected content
                event.preventDefault();
                startY = event.pageY - y;
                $document.on('mousemove', mousemove);
                $document.on('mouseup', mouseup);
            }
        });

        function mousemove(event) {
            y = event.pageY - startY;
            $(clone).css({
                top : y + 'px'
            });
        }

        function mouseup() {
            $document.off('mousemove', mousemove);
            $document.off('mouseup', mouseup);
            // remove clone
            $('.diamond-clone').remove();
            startY = 14, y = 14;
        }

    };
}]);
