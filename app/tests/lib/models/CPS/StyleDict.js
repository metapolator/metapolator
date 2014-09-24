 define([
    'intern!object'
  , 'intern/chai!assert'
  , 'metapolator/errors'
  , 'metapolator/models/Controller'
  , 'metapolator/project/parameters/registry'
  , 'metapolator/models/CPS/parsing/parseRules'
  , 'metapolator/models/CPS/StyleDict'
  , 'metapolator/models/CPS/FailoverStyleDict'
  , 'tests/lib/models/test_data/makeMasterFixture'
], function (
    registerSuite
  , assert
  , errors
  , ModelController
  , parameterRegistry
  , cpsParser
  , StyleDict
  , FailoverStyleDict
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
              , modelController = new ModelController(parameterRegistry)
              , i
              , source
              , master
              , elementStyle
              ;
            // prepare
            for(i=0; i<recursive_cps.length; i++) {
                source = cpsParser.fromString(
                         recursive_cps[i]
                       , 'recursive_cps at '+ i
                       , parameterRegistry
                );
                master = makeMasterFixture('master_'+ i, ['a']);
                modelController.addMaster(master, [source]);
            }
            for(i=0; i<failingSelectors.length;i++) {
                elementStyle = modelController.query(failingSelectors[i])
                                              .getComputedStyle()
                // fails with CPSRecursionError

                assert.throws(
                    elementStyle.get.bind(elementStyle, 'on')
                  , CPSRecursionError
                );
            }
        },
        CPS_StyleDict_test_failover: function() {
            var modelController = new ModelController(parameterRegistry)
              , master = makeMasterFixture('master', ['a'])
              , emptyDict = new StyleDict(modelController, [], master)
              , nonemptyDict
              , failoverStyleDict
              ;
            // prepare
            modelController.addMaster(master, [cpsParser.fromString('*{ onLength: 20 }',
                                                                    'nonemptyDict',
                                                                    parameterRegistry)]);
            nonemptyDict = new StyleDict(modelController, modelController.getMergedRules('master'), master);
            failoverStyleDict = new FailoverStyleDict([emptyDict, nonemptyDict]);
            assert.strictEqual(failoverStyleDict.get('onLength'), 20);
            assert.throws(failoverStyleDict.get.bind(failoverStyleDict, 'foo'), errors.Key);
        }
    });
});
