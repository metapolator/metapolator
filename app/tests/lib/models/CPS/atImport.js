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
       , CPS_atImport_detect_recursion_false_positives: function() {
            var io = new TestingIO()
              , ruleController = new RuleController(io, parameterRegistry, '')
              ;
            io.writeFile(false, '/a', '/* not recursive CPS */');
            // The second call fails with CPSRecursionError, but it shouldn't,
            // because this is not recursion, but paralell.
            // The error is: 'CPSRecursionError: a @imports itself'
            // This is not correct and not desired. Instead the promise
            // should not fail.
            // A failing promise itself marks a failing test, this metric
            // should be enough in this case.
            ruleController.getRule(true, 'a');
            return ruleController.getRule(true, 'a');
        }
    });
});
