define([
    'metapolator/project/cps-generators/metapolation'
], function(
    cpsGenMetapolation
) {
    "use strict";

    function InstanceController(project) {
        this._project = project;
    }

    var _p = InstanceController.prototype;
    _p.constructor = InstanceController;


    _p.registerInstance = function(instance) {
        var cpsString = this.createMultiMasterCPS(instance.axes);
        this._project.ruleController.write(false, instance.cpsFile, cpsString);
        this._project.createMaster(instance.name, instance.cpsFile, 'skeleton.base');
        this._project.open(instance.name);
    };

    _p.createMultiMasterCPS = function(axesSet) {
        var n = axesSet.length
            , cpsString;
        this._createCommonCPSfile(n);
        // import the common file
        cpsString = '@import "generated/metapolation-' + n + '.cps";';
        // add the metapolation values as last item
        cpsString += '* { ';
        for (var i = 0; i < n; i++) {
            cpsString += 'baseMaster' + i + ': S"master#' + axesSet[i].master.name + '";';
            cpsString += 'proportion' + i + ': ' + axesSet[i].metapolationValue + ';';
        }
        cpsString += '}';
        return cpsString;
    };

    _p._createCommonCPSfile = function(n) {
        // we create a common cps file which can be reused for every instance with n masters.
        // here we check if such exist, otherwise it is created
        // the file is @imported in createMultiMasterCPS, and the metapolationValues are in
        // the unique cps file of the instance itself
        var commonCPSfile = 'generated/metapolation-' + n + '.cps'
          , commonCPSString;
        try {
            this._project.ruleController.getRule(false, commonCPSfile);
        } catch(error) {
            if (error.name !== 'IONoEntry') {
                throw error;
            } else {
                commonCPSString = cpsGenMetapolation(n);
                this._project.ruleController.write(false, commonCPSfile, commonCPSString);
            }
        }
    };

    return InstanceController;
});
