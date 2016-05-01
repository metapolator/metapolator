define([
    'Atem-MOM/cpsGenerators/metapolation'
  , 'Atem-MOM/cpsTools'
], function(
    cpsGenMetapolation
  , cpsTools
) {
    "use strict";

    function registerInstance (project, instance) {
        // Does not get executed when axes length is 0 AFAIK
        var cpsString = _createMultiMasterCPS(project.ruleController, instance.axes.length)
          , momMaster
          ;

        // FIXME: it's strange that instance.cpsFile is defined somewhere else
        // project.getMasterData(instance.axes[0].master.name, 'skeleton')
        // that's the donor of the essence. We should clone it! including
        // ids and classes, but without properties and attachments

        momMaster = project.createDerivedMaster(false, instance.axes[0].master.name
                                              , instance.name, cpsString);
        project.addMasterToSession(momMaster);

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

        var cpsString, cpsFile;
        if(instance.__cpsFileAxesCount !== instance.axes.length) {
            // We should do this only when instance.axes.length changed.
            // Because this triggers quite expensive re-evaluation of
            // all cps rules for this instance.
            // FIXME: Writing wildly onto `instance` is quite nasty,
            // we should make an official interface for it
            instance.__cpsFileAxesCount = instance.axes.length;
            cpsString = _createMultiMasterCPS(project.ruleController, instance.axes.length);

            // FIXME! instance.cpsFile is a bad choice.
            // We should probably abandon it completely and prefer
            // controller.getCPSName as single source of truth
            cpsFile = project.controller.getCPSName(instance.__momMaster);

            // FIXME! a rulecontroller.update(cpsFile, cpsString)
            // would be better here! It's enough to change the rule just
            // in memory. Thus, this would parse, set and mark dirty
            // In fact, I think write is bad here!
            // FIXME: Not going via ruleController at all would be
            // nice, too! while ruleController.generateCPS seems OK
            // this thing could maybe be handled differently.
            // How does the CPS-Panel approach this? Controller?
            project.ruleController.write(false, cpsFile, cpsString);
            project.ruleController.reloadRule(false, cpsFile);
        }
        // project.controller.query('master#' + instance.name);
        // this do always (we could check if it is necessary though)
        // FIXME: need an official API to read instance.__momMaster
        // we can also use univers.getById(instance.name) if instance.name
        // is correct!
        _setXPolationMasterProperties(instance.__momMaster, instance.axes);
    }

    function _createMultiMasterCPS(ruleController, n) {
        var generatedFileName = ruleController.generateCPS('metapolation', [n]);
        // this is all of the cpsString left!
        return '@import "' + generatedFileName + '";';
    }

    function _setXPolationMasterProperties(momMaster, axesSet) {
        var properties = momMaster.properties
          , numbersRegex = /^[0-9]+$/
          , items = properties.items
          , newItems = [], requiredMasters = []
          , i, l, item, key
          , baseMaster = 'baseMaster'
          , baseMasterLen = baseMaster.length
          , proportion = 'proportion'
          , proportionLen = proportion.length
          ;

        // create new metapolation properties
        for (i=0,l=axesSet.length;i<l;i++) {
            requiredMasters.push(axesSet[i].master);
            item = cpsTools.makeProperty(baseMaster + i, 'S"master#' + axesSet[i].master.name + '"');
            newItems.push(item);
            item = cpsTools.makeProperty(proportion + i, axesSet[i].metapolationValue);
            newItems.push(item);
        }

        // At the next loading of the master into the project, this
        // will make sure that all base masters are loaded as well
        momMaster.attachData('requiredMasters', requiredMasters);

        // clean up old metapolation properties
        for (i=0,l=items.length;i<l;i++) {
            // only copy properties from old to new that are not as made
            // by this method
            item = items[i];
            key = item.name;
                 // is baseMaster{[0-9]+}
            if(  (key.slice(0, baseMasterLen) === baseMaster
                            && numbersRegex.test(key.slice(baseMasterLen)))
                 // is proportion{[0-9]+}
              || (key.slice(0, proportionLen) === proportion
                        && numbersRegex.test(key.slice(proportionLen)))
            )
                // everything that looks like an old property made by this
                // method won't be taken over to newItems.
                continue;
            newItems.push(item);
        }

        // making it this way causes less events to be fired
        properties.splice(0, items.length, newItems);
    }


    return {
        registerInstance: registerInstance
      , update: update
    };
});
