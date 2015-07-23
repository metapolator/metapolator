define([
    'metapolator/ui/metapolator/services/selection'
], function(
    selection
) {
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
                toggleSelect(master);
            } else if (event.shiftKey) {
                selectSet(master);
            } else {
                selectThis(master);
            }
            selection.updateSelection('master');
        };
        
        function toggleSelect(master) {
            if (master.edit) {
                master.edit = false;
                selection.removeFromSelection('master', master);
            } else {
                master.edit = true;
                selection.addToSelection('master', master);
            }
            if (!master.edit) {
                master.deselectAllChildren();
            }
        }

        function selectSet(master) {
            var otherMaster = metapolatorModel.lastMasterSelected
              , phase = 0;
            for (var i = metapolatorModel.masterSequences.length - 1; i >= 0; i--) {
                var sequence = metapolatorModel.masterSequences[i];
                for (var j = sequence.children.length - 1; j >= 0; j--) {
                    var thisMaster = sequence.children[j]
                      , thisHit = false;
                    if (thisMaster == master || thisMaster == otherMaster) {
                        phase++;
                        thisHit = true;   
                    }
                    if (phase == 1 || (phase == 2 && thisHit)) {
                        thisMaster.edit = true;
                        selection.addToSelection('master', master);
                    } else {
                        thisMaster.edit = false;
                        selection.removeFromSelection('master', master);
                        thisMaster.deselectAllChildren();
                    }
                }
            }
        }

        function selectThis(master) {
            metapolatorModel.lastMasterSelected = master;
            for (var i = metapolatorModel.masterSequences.length - 1; i >= 0; i--) {
                var sequence = metapolatorModel.masterSequences[i];
                for (var j = sequence.children.length - 1; j >= 0; j--) {
                    var thisMaster = sequence.children[j];
                    if (thisMaster == master) {
                        thisMaster.edit = true;
                        selection.addToSelection('master', master);
                    } else {
                        if (thisMaster.edit) {
                            thisMaster.edit = false;
                            selection.removeFromSelection('master', master);
                            thisMaster.deselectAllChildren();
                        }
                    } 
                }
            }
        }
    }

    MasterController.$inject = ['$scope', 'metapolatorModel'];
    var _p = MasterController.prototype;

    return MasterController;
}); 