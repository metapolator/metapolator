define([
    'jquery'
], function(
    $
) {
    "use strict";
    function AppController($scope, model, registerFrontend, controller) {
        registerFrontend(this);
        this.$scope = $scope;
        this.$scope.name = 'app';
        this.$scope.model = this.model = model;

        // load initial MOMmasters with MOMglyphs into model
        var MOMmasters = controller.queryAll("master");
        for (var i = 0, l = MOMmasters.length; i < l; i++) {
            var MOMmaster = MOMmasters[i]
              , masterName = MOMmaster.id;
            // skip base for the ui
            if (masterName !== "base") {
                var MOMglyphs = MOMmaster.children
                  , master = model.masterPanel.sequences[0].addMaster(masterName, MOMmaster);
                for (var j = 0, jl = MOMglyphs.length; j < jl; j++) {
                    var MOMglyph = MOMglyphs[j]
                      , glyphName = MOMglyph.id
                      , MOMpenstrokes = MOMglyph.children
                      , glyph = master.addGlyph(glyphName, MOMglyph);
                    for (var k = 0, kl = MOMpenstrokes.length; k < kl; k++) {
                          var MOMpenstroke = MOMpenstrokes[k]
                              , penstrokeName = "penstroke:i(" + k + ")"
                              , MOMpoints = MOMpenstroke.children
                              , penstroke = glyph.addPenstroke(penstrokeName, MOMpenstroke);
                          for (var m = 0, ml = MOMpoints.length; m < ml; m++) {
                              var pointName = "point:i(" + m + ")";
                              penstroke.addPoint(pointName, MOMpoints[m]);
                          }
                      }
                }
            }
        }

        $scope.getLandscapeLeft = function() {
            var end = $scope.model.display.panel.viewState * 2
              , parts = 0;
            for (var i = 0; i < end; i++) {
                parts += $scope.model.display.panel.panels[i].share;
            }
            return "calc(" + (parts / -16) + " * 100%)";
        };
        
        // every click outside a local menu head button
        // collapses the local menu
        $scope.releaseLocalMenu = function (event) {
            //console.log($(event.target).parents('.lm-head').length);
            if (!($(event.target).parents('.lm-head').length || $(event.target).hasClass("lm-head"))) {
                $scope.model.display.localMenu = null;
            }
        };
        
        $scope.reAdjustPanels = function (){
            var windowWidth = $(window).outerWidth();
            for (var i = $scope.model.display.panel.panels.length - 1; i >= 0; i--) {
                var panel = $scope.model.display.panel.panels[i];
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
                                giveToPanel = $scope.model.display.panel.panels[giveTo];
                            giveToPanel.share = ((giveToPanel.share / 16 * windowWidth) + difference) / windowWidth * 16;
                        }
                    }
                }
            }
            $scope.model.display.panel.totalPanelParts = $scope.getTotalParts();
        };
        
        $scope.getTotalParts = function() {
            var parts = 0;
            for (var i = 0, l = $scope.model.display.panel.panels.length; i < l; i++) {
                var panel = $scope.model.display.panel.panels[i];
                parts += panel.share;
            }
            return parts;
        };
        
        $scope.reAdjustPanels();
    }

    AppController.$inject = ['$scope', 'metapolatorModel', 'registerFrontend', 'modelController'];
    var _p = AppController.prototype;

    _p.redraw = function() {
        this.$scope.$apply();
    };

    return AppController;
});
