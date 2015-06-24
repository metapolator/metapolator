define([
'../_BaseModel'
], function(_BaseModel) {
    "use strict";
    function PanelModel() {
        this.menuItems = ["Form", "Mix", "Export"];
        this.viewState = 0;
        this.panels = [{
            share : 3,
            restricted : true,
            giveTo : [1],
            min : 180,
            max : 270
        }, {
            share : 10,
            restricted : false
        }, {
            share : 3,
            restricted : true,
            giveTo : [1, 3],
            min : 180,
            max : 270
        }, {
            share : 10,
            restricted : false
        }, {
            share : 3,
            restricted : true,
            giveTo : [3, 6],
            min : 180,
            max : 270
        }, {
            share : 1,
            restricted : true,
            gitTo : [6],
            min : 90,
            max : 90
        }, {
            share : 12,
            restricted : false
        }];
        this.totalPanelParts = 42;
        this.dividerTrigger = 0;
        this.dividers = [{
            add : 0,
            subtract : 1,
            dead : 2,
            mirror : null,
            position : [0],
            view : 0,
            side : "left",
            contain : "left",
            limitMin : 180,
            limitMax : 270
        }, {
            add : 2,
            subtract : 1,
            dead : 0,
            mirror : 3,
            position : [0, 1],
            view : 0,
            side : "right",
            contain : "right",
            limitMin : 180,
            limitMax : 270
        }, {
            add : 2,
            subtract : 3,
            dead : 4,
            mirror : 1,
            position : [2],
            view : 1,
            side : "left",
            contain : "left",
            limitMin : 180,
            limitMax : 270
        }, {
            add : 4,
            subtract : 3,
            dead : 2,
            mirror : 6,
            position : [2, 3],
            view : 1,
            side : "right",
            contain : "right",
            limitMin : 180,
            limitMax : 270
        }, {
            add : 6,
            subtract : 4,
            dead : 5,
            mirror : 3,
            position : [4, 5],
            view : 2,
            side : "right",
            contain : "left",
            limitMin : 260,
            limitMax : 350
        }];
    }

    var _p = PanelModel.prototype = Object.create(_BaseModel.prototype);

    return PanelModel;
}); 