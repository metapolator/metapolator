app.factory("sharedScope", function($rootScope) {
    var scope = $rootScope.$new(true);
    scope.data = {
        projectName : "Untitled document",
        sequences : [{
            id: 0,
            name : "Weight",
            masters : [{
                id: 0,
                fontFamily : 'Roboto',
                name : 'Roboto Light',
                weight : '100',
                display : true,
                edit : true,
                glyphs : [{value:"A", edit: false}, {value:"B", edit: false}, {value:"C", edit: false}, {value:"D", edit: false}, {value:"E", edit: false}, {value:"F", edit: false}, {value:"G", edit: false}, {value:"H", edit: false}, {value:"I", edit: false}, {value:"J", edit: false}, {value:"K", edit: false}, {value:"L", edit: false}, {value:"M", edit: false}, {value:"N", edit: false}, {value:"O", edit: false}, {value:"P", edit: false}, {value:"Q", edit: false}, {value:"R", edit: false}, {value:"S", edit: false}, {value:"T", edit: false}, {value:"U", edit: false}, {value:"V", edit: false}, {value:"W", edit: false}, {value:"X", edit: false}, {value:"Y", edit: false}, {value:"Z", edit: false}, {value:"a", edit: false}, {value:"b", edit: false}, {value:"c", edit: false}, {value:"d", edit: false}, {value:"e", edit: false}, {value:"f", edit: false}, {value:"g", edit: false}, {value:"h", edit: false}, {value:"i", edit: false}, {value:"j", edit: false}, {value:"k", edit: false}, {value:"l", edit: false}, {value:"m", edit: false}, {value:"n", edit: false}, {value:"o", edit: false}, {value:"p", edit: false}, {value:"q", edit: false}, {value:"r", edit: false}, {value:"s", edit: false}, {value:"t", edit: false}, {value:"u", edit: false}, {value:"v", edit: false}, {value:"w", edit: false}, {value:"x", edit: false}, {value:"y", edit: false}, {value:"z", edit: false}, {value:" ", edit: false}, {value:",", edit: false}, {value:".", edit: false}]
            }, {
                id: 1,
                fontFamily : 'Roboto',
                name : 'Roboto Regular',
                weight : '400',
                display : false,
                edit : true,
                glyphs : [{value:"A", edit: false}, {value:"B", edit: false}, {value:"C", edit: false}, {value:"D", edit: false}, {value:"E", edit: false}, {value:"F", edit: false}, {value:"G", edit: false}, {value:"H", edit: false}, {value:"I", edit: false}, {value:"J", edit: false}, {value:"K", edit: false}, {value:"L", edit: false}, {value:"M", edit: false}, {value:"N", edit: false}, {value:"O", edit: false}, {value:"P", edit: false}, {value:"Q", edit: false}, {value:"R", edit: false}, {value:"S", edit: false}, {value:"T", edit: false}, {value:"U", edit: false}, {value:"V", edit: false}, {value:"W", edit: false}, {value:"X", edit: false}, {value:"Y", edit: false}, {value:"Z", edit: false}, {value:"a", edit: false}, {value:"b", edit: false}, {value:"c", edit: false}, {value:"d", edit: false}, {value:"e", edit: false}, {value:"f", edit: false}, {value:"g", edit: false}, {value:"h", edit: false}, {value:"i", edit: false}, {value:"j", edit: false}, {value:"k", edit: false}, {value:"l", edit: false}, {value:"m", edit: false}, {value:"n", edit: false}, {value:"o", edit: false}, {value:"p", edit: false}, {value:"q", edit: false}, {value:"r", edit: false}, {value:"s", edit: false}, {value:"t", edit: false}, {value:"u", edit: false}, {value:"v", edit: false}, {value:"w", edit: false}, {value:"x", edit: false}, {value:"y", edit: false}, {value:"z", edit: false}, {value:" ", edit: false}, {value:",", edit: false}, {value:".", edit: false}]
            }, {
                id: 2,
                fontFamily : 'Roboto',
                name : 'Roboto Bold',
                weight : '700',
                display : false,
                edit : false,
                glyphs : [{value:"A", edit: false}, {value:"B", edit: false}, {value:"C", edit: false}, {value:"D", edit: false}, {value:"E", edit: false}, {value:"F", edit: false}, {value:"G", edit: false}, {value:"H", edit: false}, {value:"I", edit: false}, {value:"J", edit: false}, {value:"K", edit: false}, {value:"L", edit: false}, {value:"M", edit: false}, {value:"N", edit: false}, {value:"O", edit: false}, {value:"P", edit: false}, {value:"Q", edit: false}, {value:"R", edit: false}, {value:"S", edit: false}, {value:"T", edit: false}, {value:"U", edit: false}, {value:"V", edit: false}, {value:"W", edit: false}, {value:"X", edit: false}, {value:"Y", edit: false}, {value:"Z", edit: false}, {value:"a", edit: false}, {value:"b", edit: false}, {value:"c", edit: false}, {value:"d", edit: false}, {value:"e", edit: false}, {value:"f", edit: false}, {value:"g", edit: false}, {value:"h", edit: false}, {value:"i", edit: false}, {value:"j", edit: false}, {value:"k", edit: false}, {value:"l", edit: false}, {value:"m", edit: false}, {value:"n", edit: false}, {value:"o", edit: false}, {value:"p", edit: false}, {value:"q", edit: false}, {value:"r", edit: false}, {value:"s", edit: false}, {value:"t", edit: false}, {value:"u", edit: false}, {value:"v", edit: false}, {value:"w", edit: false}, {value:"x", edit: false}, {value:"y", edit: false}, {value:"z", edit: false}, {value:" ", edit: false}, {value:",", edit: false}, {value:".", edit: false}]
            }, {
                id : 3,
                fontFamily : 'Roboto',
                name : 'Roboto Ultra-Bold',
                weight : '900',
                display : true,
                edit : true,
                glyphs : [{value:"A", edit: false}, {value:"B", edit: false}, {value:"C", edit: false}, {value:"D", edit: false}, {value:"E", edit: false}, {value:"F", edit: false}, {value:"G", edit: false}, {value:"H", edit: false}, {value:"I", edit: false}, {value:"J", edit: false}, {value:"K", edit: false}, {value:"L", edit: false}, {value:"M", edit: false}, {value:"N", edit: false}, {value:"O", edit: false}, {value:"P", edit: false}, {value:"Q", edit: false}, {value:"R", edit: false}, {value:"S", edit: false}, {value:"T", edit: false}, {value:"U", edit: false}, {value:"V", edit: false}, {value:"W", edit: false}, {value:"X", edit: false}, {value:"Y", edit: false}, {value:"Z", edit: false}, {value:"a", edit: false}, {value:"b", edit: false}, {value:"c", edit: false}, {value:"d", edit: false}, {value:"e", edit: false}, {value:"f", edit: false}, {value:"g", edit: false}, {value:"h", edit: false}, {value:"i", edit: false}, {value:"j", edit: false}, {value:"k", edit: false}, {value:"l", edit: false}, {value:"m", edit: false}, {value:"n", edit: false}, {value:"o", edit: false}, {value:"p", edit: false}, {value:"q", edit: false}, {value:"r", edit: false}, {value:"s", edit: false}, {value:"t", edit: false}, {value:"u", edit: false}, {value:"v", edit: false}, {value:"w", edit: false}, {value:"x", edit: false}, {value:"y", edit: false}, {value:"z", edit: false}, {value:" ", edit: false}, {value:",", edit: false}, {value:".", edit: false}]
            }]
        }],
        adjustmentMasters : [],
        designSpaces : [{
            name : "Space 0",
            id : 0,
            type : "Control",
            masters : [],
            axes : [],
            triangle : false,
            mainMaster : "0"
        }],
        families : [{
            id : 0,
            instances: [] 
        }],
        currentDesignSpace : null,
        eventHandlers : {
            initialDisplay : null
        },
        localmenu : {
            project: false
        }
    };
    return scope;
});

