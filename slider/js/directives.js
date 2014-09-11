app.directive('uiSelectable', function () {
    return function (scope, el, attrs) {
        el.selectable({
            stop: function(evt,ui) {
               
                var selected = el.find('.ui-selected').map(function() {
                    var idx = $(this).index();
                    var kind = this.value;
                    if (kind == 1) {
	                    return {
	                    	fontFamily: scope.masters[idx].fontFamily, 
	                    	weight: scope.masters[idx].weight, 
	                    	index: idx
	                    }
	            	}
	            	 // if it is an adjustment master
	            	if (kind == 2) {
	            		 return {
	                    	name: scope.adjustmentMasters[idx].name, 
	                    	fontFamily: scope.adjustmentMasters[idx].fontFamily, 
	                    	weight: scope.adjustmentMasters[idx].weight, 
	                    	index: idx
	                   }
	            	}
                    

                }).get();
                console.log (selected);
              
                scope.adjustmentMastersInView = selected;
                scope.$apply()
            }
        });
    };
});