 define([
    'intern!object'
  , 'intern/chai!assert'
  , 'metapolator/errors'
  , 'metapolator/models/Controller'
  , 'metapolator/models/CPS/RuleController'
  , 'metapolator/project/parameters/registry'
  , 'metapolator/models/CPS/parsing/parseRules'
  , 'tests/lib/models/test_data/makeMasterFixture'
], function (
    registerSuite
  , assert
  , errors
  , ModelController
  , RuleController
  , parameterRegistry
  , cpsParser
  , makeMasterFixture
) {
    "use strict";


    var CPSRecursionError = errors.CPSRecursion;

    registerSuite({
        name: 'CPS StyleDict',
        CPS_StyleDict_detect_recursion: function() {
            var recursive_cps = [
                    'point{ on: on; }'
                  , 'point>left{ on: parent:on; } point{ on: left:on; }'
                  , '*{ on: customOn; } @dictionary{ point{ customOn: this:on;} }'
                ]
              , failingSelectors = [
                    'master#master_0 point'
                  , 'master#master_1 point>left'
                  , 'master#master_2 point'
              ]
              , modelController = new ModelController(new RuleController(undefined, parameterRegistry, undefined))
              , i=0
              , source
              , master
              , elementStyle
              ;
            // prepare
            for(;i<recursive_cps.length; i++) {
                source = cpsParser.fromString(
                         recursive_cps[i]
                       , 'recursive_cps at '+ i
                       , parameterRegistry
                );
                master = makeMasterFixture('master_'+ i, ['a']);
                modelController.addMaster(master, [source]);
            }
            i=0;
            for(;i<failingSelectors.length;i++) {
                elementStyle = modelController.query(failingSelectors[i])
                                              .getComputedStyle()
                // fails with CPSRecursionError

                assert.throws(
                    elementStyle.get.bind(elementStyle, 'on')
                  , CPSRecursionError
                );
            }
        }
    });
});
