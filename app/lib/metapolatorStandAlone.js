// This file is meant to export a stand alone version of the metapolator,
// model and it's apis, that can be included as almost a single file.

require([
    'webAPI/document'
  , 'metapolator/errors'
  , 'metapolator/project/MetapolatorProject'
  , 'ufojs/tools/io/staticBrowserREST'
  , 'metapolator/io/InMemory'
  , 'metapolator/ui/services/GlyphRendererAPI'
  , 'metapolator/project/parameters/registry'
  , 'metapolator/models/CPS/elements/ParameterValue'
  , 'metapolator/models/CPS/elements/Parameter'
  , 'metapolator/models/CPS/elements/ParameterDict'
  , 'metapolator/models/CPS/elements/Rule'
  , 'metapolator/models/CPS/elements/AtImportCollection'
  , 'metapolator/models/CPS/parsing/parseSelectorList'
],
function (
    document
  , errors
  , MetapolatorProject
  , ioREST
  , InMemory
  , GlyphRendererAPI
  , parameterRegistry
  , ParameterValue
  , Parameter
  , ParameterDict
  , Rule
  , AtImportCollection
  , parseSelectorList
) {
    "use strict";
    /*global setTimeout window*/
    document.body.classList.add('dependencies-ready');
    var exports = {};
    function metapolatorReady(callback) {
        // make sure that the execution of a callback is asynchronous
        setTimeout(callback, 0, exports);
    }


    // This pattern is used by google analytics, for example, to execute
    // api calls "before" the api is available. The calling code does:
    // if(!window.metapolatorReady)
    //     window.metapolatorReady = [];
    // window.metapolatorReady.push(callback) // <= could be an array or our api
    var callbacks;
    if(window.metapolatorReady instanceof Array)
        callbacks = window.metapolatorReady;
    // call it like this: window.metapolatorReady.push(myCallback)
    window.metapolatorReady = {push: metapolatorReady};
    // if there are already registered callbacks
    if(callbacks) callbacks.map(metapolatorReady);

    // export the modules that will be needed
    exports.initProject = function(projectPath) {
        // InMemory is its own event emitter
        var fsEvents, io, promise;
        io = fsEvents = new InMemory();
        io.mkDir(false, 'project');
        // copy the project into memory
        promise = ioREST.copyRecursive(true, projectPath, io, 'project');
        return promise.then(function(){
            var project, glyphRendererAPI;
            project = new MetapolatorProject(io, 'project');
            project.load();
            // load all masters, because right now it is very confusing
            // when some masters are missing from the MOM
            project.masters.forEach(project.open, project);
            glyphRendererAPI = new GlyphRendererAPI(document, project.controller);
            glyphRendererAPI = glyphRendererAPI;

            // initialized/stateful
            return {
                 project: project
               , glyphRendererAPI: glyphRendererAPI
               , controller: project.controller // shortcut
            };
        });
    };

    // TODO: let this grow into a useful collection of tools, then make
    // a module out of it.
    // It's hard to know in advance what's going to be needed
    exports.cpsAPITools = {
        /**
         * Set `value` to the parameter `name` of `parameterDict`.
         *
         * Arguments:
         * parameterDict: an instance of ParameterDict as returned
         *                by Rule.parameters
         * name: a string with the parameter name
         * value: a string (of cps-formulae-language¹)
         *
         * return value: nothing.
         * raises: potentially a lot.
         *
         * ¹ Actually this depends on which type is registered for `name`
         *   but at the time of this writing there is only cps-formulae-language.
         *   There are, however, parameters that check their return type,
         *   after evaluation of the cps-formulae-language.
         */
        setParameter: function setParameter(parameterDict, name, value) {
            var _value = new ParameterValue([value], [])
                , parameter
                , factory = parameterRegistry.getFactory(name)
                ;
            _value.initializeTypeFactory(name.name, factory);
            parameter = new Parameter({name:name}, _value);
            parameterDict.setParameter(parameter);
        }
      , addNewRule: function addNewRule(parameterCollection, index, selectorListString) {
            var source = 'generated'
              , selectorList = parseSelectorList.fromString(selectorListString)
              , parameterDict = new ParameterDict([], source, 0)
              , rule = new Rule(selectorList, parameterDict, source, 0)
              ;
            // returns the actual index at which the rule was created
            return parameterCollection.splice(index, 0, rule)[0];
        }
        /**
         * CAUTION: Here an intersting dependency to ruleController emerges.
         * Probably this method should be part of the stateful interface,
         * because this way a ruleController from a different project can
         * be used which is not intended right now and was never tested!
         */
      , addNewAtImport: function addNewAtImport(async, parameterCollection
                                    , index, ruleController, resourceName) {
            var collection = new AtImportCollection(ruleController, 'generated')
                // it's only a promise if `async` is true
              , promise = collection.setResource(async, resourceName)
              ;

            function resolve() {
                return parameterCollection.splice(index, 0, collection)[0];
            }

            return async
                 ? promise.then(resolve, errors.unhandledPromise)
                 : resolve()
                 ;
        }
    };
});
