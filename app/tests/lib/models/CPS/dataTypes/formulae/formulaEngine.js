 define([
    'intern!object'
  , 'intern/chai!assert'
  , 'Atem-Property-Language/flavours/MOM/parser'
], function (
    registerSuite
  , assert
  , formulaEngine
) {
    "use strict";

    registerSuite({
        name: 'CPS dataTypes formulaEngine',
        CPS_formulaEngine_vs_eval: function() {
            // Note, not everything you can solve with eval can be solved
            // with this engine. But it should be enough to solve some
            // easy expressions.
            // There are also a lot of things this engine can do, that eval
            // couldn't do.
            // The aim of these tests is to see that the order of precedence
            // of algebraic expressions is obeyed.
            var tests = [
                    '1+1'
                  , '1+-1'
                  , '1+2*3'
                  , '(1+2)*3'
                  , '1 - 2 * 3 + 4 * 7 / (8 + 2)'
                  // the spaces are needed in the current version
                  // having 1+1-1+1-1+1-1+1-1+1-1+1 working would be
                  // favorable however
                  , '1+1 - 1+1 - 1+1 - 1+1 - 1+1'
                  , '((((((1)))))) + 1'
                  , '-1+1'
                  , '3*(3+4)*-4'
                  , '1/(3+2)*9'
                  , '(2 - 1) + 2 * 3'
                  , '(1 + 2 * 3) + (1 + 2 * 3)'
                  , '(1 + 2 * (1 + 2 * 3)) + 3'
                  , '(1 + 2 * (1 + 2 * 3)) * 3'
                ]
              , i, stack
              ;
            for(i=0;i<tests.length;i++) {
                stack = formulaEngine.parse(tests[i]);
                assert.strictEqual(
                    stack.execute(),
                    eval(tests[i]),
                    'The results of calculating :"'+tests[i]+'" are not strict equal'
                );
            }
        }
    });
});
