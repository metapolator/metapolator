function PaperController($scope){

    var path;
    var drag = false;

    $scope.mouseUp = function(){
        //Clear Mouse Drag Flag
        drag = false;
    };

    $scope.mouseDrag = function(event){
        if(drag){
            path.add(new paper.Point(event.x, event.y));
            path.smooth();
        }
    };

    $scope.mouseDown = function(event){
        //Set  flag to detect mouse drag
        drag = true;
        path = new paper.Path();
        path.strokeColor = 'black';
        path.add(new paper.Point(event.x, event.y));
    };

    init();
    function init(){
        paper.install(window);
        paper.setup('canvas');          
    }
}