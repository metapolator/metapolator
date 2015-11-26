define([
    'metapolator/project/cps-generators/metapolation'
], function(
    cpsGenMetapolation
) {
    "use strict";
    var registerInstance
      , updateCPSfile
      , _getGeneratedCPSFileName
      , _createMultiMasterCPS;

    registerInstance = function(project, instance) {
        var generatedFileName = _getGeneratedCPSFileName(project.ruleController, instance.axes.length)
          , cpsString = _createMultiMasterCPS(instance.axes, generatedFileName);
        project.ruleController.write(false, instance.cpsFile, cpsString);
        project.createMaster(instance.name, instance.cpsFile, 'skeleton.base');
        project.open(instance.name);
    };

    updateCPSfile = function(project, instance) {
        var generatedFileName = _getGeneratedCPSFileName(project.ruleController, instance.axes.length)
          , cpsString = _createMultiMasterCPS(instance.axes, generatedFileName);
        project.ruleController.write(false, instance.cpsFile, cpsString);
    };

    _createMultiMasterCPS = function(axesSet, generatedFileName) {
        var n = axesSet.length
            , cpsString;
        // import the common file
        cpsString = '@import "' + generatedFileName + '";';
        // add the metapolation values as last item
        cpsString += '* { ';
        for (var i = 0; i < n; i++) {
            cpsString += 'baseMaster' + i + ': S"master#' + axesSet[i].master.name + '";';
            cpsString += 'proportion' + i + ': ' + axesSet[i].metapolationValue + ';';
        }
        cpsString += '}';
        return cpsString;
    };

    _getGeneratedCPSFileName = function(ruleController, n) {
        // we create a common cps file which can be reused for every instance with n masters.
        // here we check if such exist, otherwise it is created
        // the file is @imported in createMultiMasterCPS, and the metapolationValues are in
        // the unique cps file of the instance itself
        var fileName = 'generated/metapolation-' + n + '.cps'
            , string;
        try {
            ruleController.getRule(false, fileName);
        } catch(error) {
            if (error.name !== 'IONoEntryError') {
                throw error;
            } else {
                string = cpsGenMetapolation(n);
                ruleController.write(false, fileName, string);
            }
        }
        return fileName;
    };


    return {
        registerInstance: registerInstance
      , updateCPSfile: updateCPSfile
    };
});
