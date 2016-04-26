define([
    'jquery'
  , 'metapolator/ui/metapolator/ui-tools/selectionTools'
], function(
    $
  , selection
) {
    "use strict";
    /* globals window:true */

    function AppController($scope, model) {
        this.$scope = $scope;
        this.$scope.model = $scope.model = model;


        $scope.getLandscapeLeft = function() {
            var end = $scope.model.viewState * 2
              , parts = 0;
            for (var i = 0; i < end; i++) {
                parts += $scope.panels[i].share;
            }
            return "calc(" + (parts / -16) + " * 100%)";
        };

        // every click outside a local menu head button
        // collapses the local menu and collapses all parameter / operator adding popup windows
        $scope.releaseLocalMenu = function (event) {
            if (!($(event.target).parents('.lm-head').length || $(event.target).hasClass("lm-head"))) {
                $scope.model.localMenu = null;
            }
            if (!($(event.target).parents('.panel-zone').length) && !$(event.target).hasClass("panel-zone")) {
                selection.closePanel();
            }
        };

        $scope.reAdjustPanels = function (){
            var windowWidth = $(window).outerWidth();
            for (var i = $scope.panels.length - 1; i >= 0; i--) {
                var panel = $scope.panels[i];
                if (panel.restricted) {
                    var width = panel.share / 16 * windowWidth, difference;
                    if (width < panel.min) {
                        difference = width - panel.min;
                    } else if (width > panel.max) {
                        difference = width - panel.max;
                    }
                    if (difference) {
                        panel.share = (width - difference) / windowWidth * 16;
                        for (var j = 0, l = panel.giveTo.length; j < l; j++) {
                            var giveTo = panel.giveTo[j],
                                giveToPanel = $scope.panels[giveTo];
                            giveToPanel.share = ((giveToPanel.share / 16 * windowWidth) + difference) / windowWidth * 16;
                        }
                    }
                }
            }
            $scope.totalPanelParts = $scope.getTotalParts();
        };

        $scope.getTotalParts = function() {
            var parts = 0;
            for (var i = 0, l = $scope.panels.length; i < l; i++) {
                var panel = $scope.panels[i];
                parts += panel.share;
            }
            return parts;
        };

        $scope.panels = [{
            share : 3
            , restricted : true
            , giveTo : [1]
            , min : 180
            , max : 270
        }, {
            share : 10
            , restricted : false
        }, {
            share : 3
            , restricted : true
            , giveTo : [1, 3]
            , min : 180
            , max : 270
        }, {
            share : 10
            , restricted : false
        }, {
            share : 3
            , restricted : true
            , giveTo : [3, 6]
            , min : 180
            , max : 270
        }, {
            share : 1
            , restricted : true
            , giveTo : [6]
            , min : 90
            , max : 90
        }, {
            share : 12
            , restricted : false
        }];
        $scope.totalPanelParts = 42;
        $scope.dividerTrigger = 0;
        $scope.dividers = [{
            add : 0
            , subtract : 1
            , dead : 2
            , mirror : null
            , position : [0]
            , view : 0
            , side : "left"
            , contain : "left"
            , limitMin : 180
            , limitMax : 270
        }, {
            add : 2
            , subtract : 1
            , dead : 0
            , mirror : 3
            , position : [0, 1]
            , view : 0
            , side : "right"
            , contain : "right"
            , limitMin : 180
            , limitMax : 270
        }, {
            add : 2
            , subtract : 3
            , dead : 4
            , mirror : 1
            , position : [2]
            , view : 1
            , side : "left"
            , contain : "left"
            , limitMin : 180
            , limitMax : 270
        }, {
            add : 4
            , subtract : 3
            , dead : 2
            , mirror : 6
            , position : [2, 3]
            , view : 1
            , side : "right"
            , contain : "right"
            , limitMin : 180
            , limitMax : 270
        }, {
            add : 6
            , subtract : 4
            , dead : 5
            , mirror : 3
            , position : [4, 5]
            , view : 2
            , side : "right"
            , contain : "left"
            , limitMin : 260
            , limitMax : 350
        }];

        $scope.reAdjustPanels();
    }

    AppController.$inject = ['$scope', 'metapolatorModel'];
    var _p = AppController.prototype;

    _p.redraw = function() {
        this.$scope.$apply();
    };

    return AppController;
});
