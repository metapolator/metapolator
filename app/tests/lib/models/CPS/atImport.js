 define([
    'intern!object'
  , 'intern/chai!assert'
  , 'metapolator/errors'
  , 'metapolator/models/CPS/RuleController'
  , 'metapolator/project/parameters/registry'
  , 'metapolator/models/CPS/parsing/parseRules'
  , 'ufojs/tools/io/TestingIO'
], function (
    registerSuite
  , assert
  , errors
  , RuleController
  , parameterRegistry
  , cpsParser
  , TestingIO
) {
    "use strict";

    var CPSRecursionError = errors.CPSRecursion;

    registerSuite({
        name: 'CPS atImport',
        CPS_atImport_detect_recursion: function() {
            var recursive_cps = {
                    a: '@import "b";'
                  , b: '@import "a";'
                }
              , io = new TestingIO()
              , ruleController = new RuleController(io, parameterRegistry, '')
              , i
              ;
            for(i in recursive_cps) {
                io.writeFile(false, '/'+i, recursive_cps[i]);
            }
            // fails with CPSRecursionError
            assert.throws(
                ruleController.getRule.bind(ruleController, false, 'a')
              , CPSRecursionError
            );
        }
    });
});
