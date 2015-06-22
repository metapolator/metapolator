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
            window.logCall("toggleSelect");
            master.edit[0] = !master.edit[0]; 
            if (!master.edit[0]) {
                master.deselectAllChildren();
            }
            metapolatorModel.masterPanel.updateSelections("master");
            metapolatorModel.specimen1.updateSelectedMasters(metapolatorModel.masterPanel.sequences);
        };
        
        $scope.selectSet = function (master) {
            window.logCall("selectSet");
            var otherMaster = metapolatorModel.masterPanel.lastMasterSelected;           
            var phase = 0;
            for (var i = metapolatorModel.masterPanel.sequences.length - 1; i >= 0; i--) {
                var sequence = metapolatorModel.masterPanel.sequences[i];
                for (var j = sequence.children.length - 1; j >= 0; j--) {
                    var thisMaster = sequence.children[j];
                    var thisHit = false;
                    if (thisMaster == master || thisMaster == otherMaster) {
                        phase++;
                        thisHit = true;   
                    }
                    if (phase == 1 || (phase == 2 && thisHit)) {
                        thisMaster.edit[0] = true;
                    } else {
                        thisMaster.edit[0] = false;
                        thisMaster.deselectAllChildren();
                    }
                }
            }
        };
        
        $scope.selectThis = function (master) {
            window.logCall("selectThis");
            metapolatorModel.masterPanel.lastMasterSelected = master;
            for (var i = metapolatorModel.masterPanel.sequences.length - 1; i >= 0; i--) {
                var sequence = metapolatorModel.masterPanel.sequences[i];
                for (var j = sequence.children.length - 1; j >= 0; j--) {
                    var thisMaster = sequence.children[j];
                    if (thisMaster == master) {
                        thisMaster.edit[0] = true;    
                    } else {
                        if (thisMaster.edit[0]) {
                            thisMaster.edit[0] = false;
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