app.directive('uiSelectable', function () {
    return function (scope, el, attrs) {
        el.selectable({
            stop: function(evt,ui) {
               
               //needs some freshing up...
                var masters = el.find('.ui-selected').map(function() {
                    var idx = $(this).index();
                    var kind = this.value;
                    if (kind == 1) {
	                    return {
	                    	fontFamily: scope.masters[idx].fontFamily, 
	                    	weight: scope.masters[idx].weight, 
	                    	index: idx
	                    }
	            	}
                }).get();
                
                var adjustmentMasters = el.find('.ui-selected').map(function() {
                    var idx = $(this).index();
                    var kind = this.value;
	            	if (kind == 2) {
	            		 return {
	                    	name: scope.adjustmentMasters[idx].name, 
	                    	fontFamily: scope.adjustmentMasters[idx].fontFamily, 
	                    	weight: scope.adjustmentMasters[idx].weight, 
	                    	index: idx
	                   }
	            	}
                    

                }).get();
                
                console.log (masters.length);
                console.log (adjustmentMasters.length);
              	
              	// als je bewust alles uitklikt (dus 0), dan pikt hij dat nu niet op.
            	if (masters.length > 0 ) { scope.mastersInView = masters; }
                if (adjustmentMasters.length > 0 ) { scope.adjustmentMastersInView = adjustmentMasters; }
                scope.$apply()
            }
        });
    };
});