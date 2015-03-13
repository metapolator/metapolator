app.factory("sharedScope", function($rootScope) {
    var scope = $rootScope.$new(true);
    scope.data = {
        projectName : "Untitled document",
        sequences : [{
            id: 0,
            name : "Weight",
            masters : [{
                type: "test",
                id: 0,
                fontFamily : 'Roboto',
                name : 'Roboto Light',
                weight : '100',
                display : false,
                edit : false,
                ag : "Ag"
            }, {
                type: "test",
                id: 1,
                fontFamily : 'Roboto',
                name : 'Roboto Regular',
                weight : '400',
                display : false,
                edit : false,
                ag : "Ag"
            }, {
                type: "test",
                id: 2,
                fontFamily : 'Roboto',
                name : 'Roboto Bold',
                weight : '700',
                display : false,
                edit : false,
                ag : "Ag"
            }, {
                type: "test",
                id : 3,
                fontFamily : 'Roboto',
                name : 'Roboto Ultra-Bold',
                weight : '900',
                display : false,
                edit : false,
                ag : "Ag"
            }, {
                type: "redpill",
                id : 4,
                fontFamily : 'Roboto',
                weight : '400',
                name : "Red Pill Master",
                display: true,
                edit : true,
                ag : "ag",
                parameters: {
                    width: 0,
                    height: 0,
                    xHeight: 0,
                    slant: 0,
                    spacing: 0,
                    sidebearings: 0,
                    tension: 0,
                    weight: 0
                },
                glyphs : [{value:"dvA", edit: false}, {value:"dvI", edit: false}, {value:"dvKHA", edit: false},{value:"dvBHA", edit: false}, {value:"dvDA", edit: false}, {value:"dvDHA", edit: false}, {value:"dvSSA", edit: false}, {value:"a", edit: false}, {value:"b", edit: false}, {value:"c", edit: false}, {value:"d", edit: false}, {value:"e", edit: false}, {value:"f", edit: false}, {value:"g", edit: false}, {value:"h", edit: false}, {value:"i", edit: false}, {value:"j", edit: false}, {value:"k", edit: false}, {value:"l", edit: false}, {value:"m", edit: false}, {value:"n", edit: false}, {value:"o", edit: false}, {value:"p", edit: false}, {value:"q", edit: false}, {value:"r", edit: false}, {value:"s", edit: false}, {value:"t", edit: false}, {value:"u", edit: false}, {value:"v", edit: false}, {value:"w", edit: false}, {value:"x", edit: false}, {value:"y", edit: false}, {value:"z", edit: false}, {value:" ", edit: false}]
            }]
        }],
        adjustmentMasters : [],
        designSpaces : [{
            trigger: 0,
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
            project: false,
            help: false,
            masters: false,
            instances: false
        }
    };    
    return scope;
});

