define([
    'metapolator/project/cps-generators/metapolation'
  , 'metapolator/models/CPS/cpsTools'
], function(
    cpsGenMetapolation
  , cpsTools
) {
    "use strict";

    function registerInstance (project, instance) {
        // Does not get executed when axes length is 0 AFAIK
        var cpsString = _createMultiMasterCPS(project.ruleController, instance.axes.length)
          // TODO: we should probably update skeleton when instance.axis[0]
          // changes, however, that's not straight forward right now.
          // Also, the first release won't need it, because we will make
          // all skeletons to be compatible (it's not enforced yet!)
          // Setting the skeleton here to the one of instance.axis[0] is
          // the most minimal approach in that the user can control which
          // skeleton is used for the instance.
          , skeleton = project.getMasterData(instance.axes[0].master.name, 'skeleton')
          , momMaster
          ;
        momMaster = project.registerMaster(instance.name, instance.cpsFile, cpsString, skeleton);

        // FIXME: sorry for this nasty trick (of writing wildly to instance),
        // we need to clean it up see `update` for the optimization strategy.
        instance.__cpsFileAxesCount = instance.axes.length;
        instance.__momMaster = momMaster;

        _setXPolationMasterProperties(momMaster, instance.axes);
        return momMaster;// could use this to store on instance
    }

    // when instance.axes.length changes, legit.
    // TODO: we should be able to dump the mom and replace it with
    // another one when firstMasterSkeleton changes.
    // but that's not so urgent.
    function update(project, instance) {

        var cpsString;
        if(instance.__cpsFileAxesCount !== instance.axes.length) {
            // We should do this only when instance.axes.length changed.
            // Because this triggers quite expensive re-evaluation of
            // all cps rules for this instance.
            // FIXME: Writing wildly onto `instance` is quite nasty,
            // we should make an official interface for it
            instance.__cpsFileAxesCount = instance.axes.length;
            cpsString = _createMultiMasterCPS(project.ruleController, instance.axes.length);
            project.ruleController.write(false, instance.cpsFile, cpsString);
        }
        project.controller.query('master#' + instance.name);
        // this do always (we could check if it is necessary though)
        // FIXME: need an official API to read instance.__momMaster
        _setXPolationMasterProperties(instance.__momMaster, instance.axes);
    }

    function _createMultiMasterCPS(ruleController, n) {
        var generatedFileName = _getGeneratedCPSFileName(ruleController, n);
        // this is all of the cpsString left!
        return '@import "' + generatedFileName + '";';
    }

    function _setXPolationMasterProperties(momMaster, axesSet) {
        var properties = momMaster.properties
          , r_numbers = /^[0-9]+$/
          , items = properties.items
          , newItems = []
          , i, l, item, key
          , baseMaster = 'baseMaster'
          , baseMasterLen = baseMaster.length
          , proportion = 'proportion'
          , proportionLen = proportion.length
          ;


        // clean up old metapolation properties
        for (i=0,l=items.length;i<l;i++) {
            item = items[i];
            key = item.name;
                 // is baseMaster{[0-9]+}
            if(  (key.slice(0, baseMasterLen) === baseMaster
                            && r_numbers.test(key.slice(baseMasterLen)))
                 // is proportion{[0-9]+}
              || (key.slice(0, proportionLen) === proportion
                        && r_numbers.test(key.slice(proportionLen)))
            )
                // everything that looks like an old property made by this
                // method won't be taken over to newItems.
                continue;
            newItems.push(item);
        }

        // create new metapolation properties
        for (i=0,l=axesSet.length;i<l;i++) {
            item = cpsTools.makeProperty('baseMaster' + i, 'S"master#' + axesSet[i].master.name + '"');
            newItems.push(item);
            item = cpsTools.makeProperty('proportion' + i, axesSet[i].metapolationValue);
            newItems.push(item);
        }
        // making it this way causes less events to be fired
        properties.splice(0, items.length, newItems);
    }

    // good
    function _getGeneratedCPSFileName(ruleController, n) {
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
    }


    return {
        registerInstance: registerInstance
      , update: update
    };
});
