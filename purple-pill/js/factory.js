app.factory("sharedScope", function($rootScope) {
    var scope = $rootScope.$new(true);
    scope.data = {
        projectName : "Untitled document",
        sequences : [{
            id : 0,
            name : "Weight",
            masters : [{
                type : "test",
                id : 0,
                fontFamily : 'Roboto',
                name : 'Roboto Light',
                weight : '100',
                display : false,
                edit : false,
                ag : "Ag"
            }, {
                type : "test",
                id : 1,
                fontFamily : 'Roboto',
                name : 'Roboto Regular',
                weight : '400',
                display : false,
                edit : false,
                ag : "Ag"
            }, {
                type : "test",
                id : 2,
                fontFamily : 'Roboto',
                name : 'Roboto Bold',
                weight : '700',
                display : false,
                edit : false,
                ag : "Ag"
            }, {
                type : "test",
                id : 3,
                fontFamily : 'Roboto',
                name : 'Roboto Ultra-Bold',
                weight : '900',
                display : false,
                edit : false,
                ag : "Ag"
            }, {
                type : "redpill",
                id : 4,
                fontFamily : 'Roboto',
                weight : '400',
                name : "Red Pill Master",
                display : true,
                edit : true,
                ag : "ag",
                parameters : {
                    width : 0,
                    height : 0,
                    xHeight : 0,
                    slant : 0,
                    spacing : 0,
                    sidebearings : 0,
                    tension : 0,
                    weight : 0
                },
                glyphs : [{
                    value : "dvA",
                    edit : false,
                    parameters : {
                        width : 0,
                        height : 0,
                        xHeight : 0,
                        slant : 0,
                        spacing : 0,
                        sidebearings : 0,
                        tension : 0,
                        weight : 0
                    }
                }, {
                    value : "dvI",
                    edit : false,
                    parameters : {
                        width : 0,
                        height : 0,
                        xHeight : 0,
                        slant : 0,
                        spacing : 0,
                        sidebearings : 0,
                        tension : 0,
                        weight : 0
                    }
                }, {
                    value : "dvKHA",
                    edit : false,
                    parameters : {
                        width : 0,
                        height : 0,
                        xHeight : 0,
                        slant : 0,
                        spacing : 0,
                        sidebearings : 0,
                        tension : 0,
                        weight : 0
                    }
                }, {
                    value : "dvBHA",
                    edit : false,
                    parameters : {
                        width : 0,
                        height : 0,
                        xHeight : 0,
                        slant : 0,
                        spacing : 0,
                        sidebearings : 0,
                        tension : 0,
                        weight : 0
                    }
                }, {
                    value : "dvDA",
                    edit : false,
                    parameters : {
                        width : 0,
                        height : 0,
                        xHeight : 0,
                        slant : 0,
                        spacing : 0,
                        sidebearings : 0,
                        tension : 0,
                        weight : 0
                    }
                }, {
                    value : "dvDHA",
                    edit : false,
                    parameters : {
                        width : 0,
                        height : 0,
                        xHeight : 0,
                        slant : 0,
                        spacing : 0,
                        sidebearings : 0,
                        tension : 0,
                        weight : 0
                    }
                }, {
                    value : "dvSSA",
                    edit : false,
                    parameters : {
                        width : 0,
                        height : 0,
                        xHeight : 0,
                        slant : 0,
                        spacing : 0,
                        sidebearings : 0,
                        tension : 0,
                        weight : 0
                    }
                }, {
                    value : "a",
                    edit : false,
                    parameters : {
                        width : 0,
                        height : 0,
                        xHeight : 0,
                        slant : 0,
                        spacing : 0,
                        sidebearings : 0,
                        tension : 0,
                        weight : 0
                    }
                }, {
                    value : "b",
                    edit : false,
                    parameters : {
                        width : 0,
                        height : 0,
                        xHeight : 0,
                        slant : 0,
                        spacing : 0,
                        sidebearings : 0,
                        tension : 0,
                        weight : 0
                    }
                }, {
                    value : "c",
                    edit : false,
                    parameters : {
                        width : 0,
                        height : 0,
                        xHeight : 0,
                        slant : 0,
                        spacing : 0,
                        sidebearings : 0,
                        tension : 0,
                        weight : 0
                    }
                }, {
                    value : "d",
                    edit : false,
                    parameters : {
                        width : 0,
                        height : 0,
                        xHeight : 0,
                        slant : 0,
                        spacing : 0,
                        sidebearings : 0,
                        tension : 0,
                        weight : 0
                    }
                }, {
                    value : "e",
                    edit : false,
                    parameters : {
                        width : 0,
                        height : 0,
                        xHeight : 0,
                        slant : 0,
                        spacing : 0,
                        sidebearings : 0,
                        tension : 0,
                        weight : 0
                    }
                }, {
                    value : "f",
                    edit : false,
                    parameters : {
                        width : 0,
                        height : 0,
                        xHeight : 0,
                        slant : 0,
                        spacing : 0,
                        sidebearings : 0,
                        tension : 0,
                        weight : 0
                    }
                }, {
                    value : "g",
                    edit : false,
                    parameters : {
                        width : 0,
                        height : 0,
                        xHeight : 0,
                        slant : 0,
                        spacing : 0,
                        sidebearings : 0,
                        tension : 0,
                        weight : 0
                    }
                }, {
                    value : "h",
                    edit : false,
                    parameters : {
                        width : 0,
                        height : 0,
                        xHeight : 0,
                        slant : 0,
                        spacing : 0,
                        sidebearings : 0,
                        tension : 0,
                        weight : 0
                    }
                }, {
                    value : "i",
                    edit : false,
                    parameters : {
                        width : 0,
                        height : 0,
                        xHeight : 0,
                        slant : 0,
                        spacing : 0,
                        sidebearings : 0,
                        tension : 0,
                        weight : 0
                    }
                }, {
                    value : "j",
                    edit : false,
                    parameters : {
                        width : 0,
                        height : 0,
                        xHeight : 0,
                        slant : 0,
                        spacing : 0,
                        sidebearings : 0,
                        tension : 0,
                        weight : 0
                    }
                }, {
                    value : "k",
                    edit : false,
                    parameters : {
                        width : 0,
                        height : 0,
                        xHeight : 0,
                        slant : 0,
                        spacing : 0,
                        sidebearings : 0,
                        tension : 0,
                        weight : 0
                    }
                }, {
                    value : "l",
                    edit : false,
                    parameters : {
                        width : 0,
                        height : 0,
                        xHeight : 0,
                        slant : 0,
                        spacing : 0,
                        sidebearings : 0,
                        tension : 0,
                        weight : 0
                    }
                }, {
                    value : "m",
                    edit : false,
                    parameters : {
                        width : 0,
                        height : 0,
                        xHeight : 0,
                        slant : 0,
                        spacing : 0,
                        sidebearings : 0,
                        tension : 0,
                        weight : 0
                    }
                }, {
                    value : "n",
                    edit : false,
                    parameters : {
                        width : 0,
                        height : 0,
                        xHeight : 0,
                        slant : 0,
                        spacing : 0,
                        sidebearings : 0,
                        tension : 0,
                        weight : 0
                    }
                }, {
                    value : "o",
                    edit : false,
                    parameters : {
                        width : 0,
                        height : 0,
                        xHeight : 0,
                        slant : 0,
                        spacing : 0,
                        sidebearings : 0,
                        tension : 0,
                        weight : 0
                    }
                }, {
                    value : "p",
                    edit : false,
                    parameters : {
                        width : 0,
                        height : 0,
                        xHeight : 0,
                        slant : 0,
                        spacing : 0,
                        sidebearings : 0,
                        tension : 0,
                        weight : 0
                    }
                }, {
                    value : "q",
                    edit : false,
                    parameters : {
                        width : 0,
                        height : 0,
                        xHeight : 0,
                        slant : 0,
                        spacing : 0,
                        sidebearings : 0,
                        tension : 0,
                        weight : 0
                    }
                }, {
                    value : "r",
                    edit : false,
                    parameters : {
                        width : 0,
                        height : 0,
                        xHeight : 0,
                        slant : 0,
                        spacing : 0,
                        sidebearings : 0,
                        tension : 0,
                        weight : 0
                    }
                }, {
                    value : "s",
                    edit : false,
                    parameters : {
                        width : 0,
                        height : 0,
                        xHeight : 0,
                        slant : 0,
                        spacing : 0,
                        sidebearings : 0,
                        tension : 0,
                        weight : 0
                    }
                }, {
                    value : "t",
                    edit : false,
                    parameters : {
                        width : 0,
                        height : 0,
                        xHeight : 0,
                        slant : 0,
                        spacing : 0,
                        sidebearings : 0,
                        tension : 0,
                        weight : 0
                    }
                }, {
                    value : "u",
                    edit : false,
                    parameters : {
                        width : 0,
                        height : 0,
                        xHeight : 0,
                        slant : 0,
                        spacing : 0,
                        sidebearings : 0,
                        tension : 0,
                        weight : 0
                    }
                }, {
                    value : "v",
                    edit : false,
                    parameters : {
                        width : 0,
                        height : 0,
                        xHeight : 0,
                        slant : 0,
                        spacing : 0,
                        sidebearings : 0,
                        tension : 0,
                        weight : 0
                    }
                }, {
                    value : "w",
                    edit : false,
                    parameters : {
                        width : 0,
                        height : 0,
                        xHeight : 0,
                        slant : 0,
                        spacing : 0,
                        sidebearings : 0,
                        tension : 0,
                        weight : 0
                    }
                }, {
                    value : "x",
                    edit : false,
                    parameters : {
                        width : 0,
                        height : 0,
                        xHeight : 0,
                        slant : 0,
                        spacing : 0,
                        sidebearings : 0,
                        tension : 0,
                        weight : 0
                    }
                }, {
                    value : "y",
                    edit : false,
                    parameters : {
                        width : 0,
                        height : 0,
                        xHeight : 0,
                        slant : 0,
                        spacing : 0,
                        sidebearings : 0,
                        tension : 0,
                        weight : 0
                    }
                }, {
                    value : "z",
                    edit : false,
                    parameters : {
                        width : 0,
                        height : 0,
                        xHeight : 0,
                        slant : 0,
                        spacing : 0,
                        sidebearings : 0,
                        tension : 0,
                        weight : 0
                    }
                }, {
                    value : " ",
                    edit : false,
                    parameters : {
                        width : 0,
                        height : 0,
                        xHeight : 0,
                        slant : 0,
                        spacing : 0,
                        sidebearings : 0,
                        tension : 0,
                        weight : 0
                    }
                }]
            }]
        }],
        adjustmentMasters : [],
        designSpaces : [{
            trigger : 0,
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
            instances : []
        }],
        currentDesignSpace : null,
        eventHandlers : {
            initialDisplay : null
        },
        localmenu : {
            project : false,
            help : false,
            masters : false,
            instances : false,
        },
        parametersPanel : 0
    };
    return scope;
});

