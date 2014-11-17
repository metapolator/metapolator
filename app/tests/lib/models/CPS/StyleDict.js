 define([
    'intern!object'
  , 'intern/chai!assert'
  , 'metapolator/errors'
  , 'metapolator/models/Controller'
  , 'metapolator/project/parameters/registry'
  , 'metapolator/models/CPS/parsing/parseRules'
  , 'ufojs/tools/io/TestingIO'
  , 'tests/lib/models/test_data/makeMasterFixture'
], function (
    registerSuite
  , assert
  , errors
  , ModelController
  , parameterRegistry
  , cpsParser
  , TestingIO
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
              , io = new TestingIO()
              , modelController = new ModelController(io, parameterRegistry, '')
              , i=0
              , source
              , master
              , elementStyle
              ;
            for(;i<recursive_cps.length;i++) {
                io.writeFile(false, '/recursive_cps_'+i, recursive_cps[i]);
                master = makeMasterFixture('master_'+ i, ['a']);
                modelController.addMaster(master, [modelController.getCPSRules('recursive_cps_'+i)]);
            }
            i=0;
            for(;i<failingSelectors.length;i++) {
                elementStyle = modelController.query(failingSelectors[i])
                                              .getComputedStyle();
                // fails with CPSRecursionError
                assert.throws(
                    elementStyle.get.bind(elementStyle, 'on')
                  , CPSRecursionError
                );
            }
        }
    });
});
