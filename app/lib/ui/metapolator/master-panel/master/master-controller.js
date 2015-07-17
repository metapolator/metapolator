define([], function() {
    "use strict";
    function MasterController($scope, metapolatorModel) {
        this.$scope = $scope;
        this.$scope.name = 'master';
                       
        $scope.getGlyph = function (glyphName) {
            for (var i = $scope.model.children.length - 1; i >= 0; i--) {
                var thisGlyph = $scope.model.children[i];
                if (thisGlyph.name == glyphName) {
                    return thisGlyph;
                }
            }
        };
        
        $scope.selectManager = function (event, master) {
            if (event.ctrlKey || event.metaKey) {
                $scope.toggleSelect(master);
            } else if (event.shiftKey) {
                $scope.selectSet(master);    
            } else {
                $scope.selectThis(master);
            }
            metapolatorModel.masterPanel.updateSelections("master");
            metapolatorModel.specimen1.updateSelectedMasters(metapolatorModel.masterPanel.sequences);
        };
        
        $scope.toggleSelect = function (master) {
            master.edit = !master.edit;
            if (!master.edit) {
                master.deselectAllChildren();
            }
            metapolatorModel.masterPanel.updateSelections("master");
            metapolatorModel.specimen1.updateSelectedMasters(metapolatorModel.masterPanel.sequences);
        };
        
        $scope.selectSet = function (master) {
            var otherMaster = metapolatorModel.masterPanel.lastMasterSelected
              , phase = 0;
            for (var i = metapolatorModel.masterPanel.sequences.length - 1; i >= 0; i--) {
                var sequence = metapolatorModel.masterPanel.sequences[i];
                for (var j = sequence.children.length - 1; j >= 0; j--) {
                    var thisMaster = sequence.children[j]
                      , thisHit = false;
                    if (thisMaster == master || thisMaster == otherMaster) {
                        phase++;
                        thisHit = true;   
                    }
                    if (phase == 1 || (phase == 2 && thisHit)) {
                        thisMaster.edit = true;
                    } else {
                        thisMaster.edit = false;
                        thisMaster.deselectAllChildren();
                    }
                }
            }
        };
        
        $scope.selectThis = function (master) {
            metapolatorModel.masterPanel.lastMasterSelected = master;
            for (var i = metapolatorModel.masterPanel.sequences.length - 1; i >= 0; i--) {
                var sequence = metapolatorModel.masterPanel.sequences[i];
                for (var j = sequence.children.length - 1; j >= 0; j--) {
                    var thisMaster = sequence.children[j];
                    if (thisMaster == master) {
                        thisMaster.edit = true;
                    } else {
                        if (thisMaster.edit) {
                            thisMaster.edit = false;
                            thisMaster.deselectAllChildren();
                        }
                    } 
                }
            }
        };
    }

    MasterController.$inject = ['$scope', 'metapolatorModel'];
    var _p = MasterController.prototype;

    return MasterController;
}); 