 define([
    'intern!object'
  , 'intern/chai!assert'
  , 'Atem-MOM/errors'
  , 'Atem-CPS/CPS/SelectorEngine'
  , 'Atem-MOM/cpsTools'
  , 'Atem-CPS/CPS/RuleController'
  , 'Atem-MOM/MOM/Multivers'
  , 'Atem-MOM/MOM/Univers'
  , 'Atem-MOM/Controller'
  , 'Atem-IO/io/TestingIO'
  , 'tests/lib/models/test_data/makeMasterFixture'
], function (
    registerSuite
  , assert
  , errors
  , SelectorEngine
  , cpsTools
  , RuleController
  , Multivers
  , Univers
  , MOMController
  , TestingIO
  , makeMasterFixture
) {
    "use strict";


    var CPSRecursionKeyError = errors.CPSRecursionKey;

    registerSuite({
        name: 'CPS StyleDict',
        CPS_StyleDict_detect_recursion: function() {
            function rootNodeFactory(controller) {
                var root = new Multivers(controller);
                root.add(new Univers());
                return root;
            }
            var recursive_cps = [
                    'center{ on: on; }'
                  , 'center>left{ on: parent:on; } center{ on: left:on; }'
                  , '*{ on: customOn;} center{ customOn: this:on;}'
                ]
              , failingSelectors = [
                    'master#master_0 center'
                  , 'master#master_1 center>left'
                  , 'master#master_2 center'
              ]
              , io = new TestingIO()
              , selectorEngine = new SelectorEngine()
              , ruleController = new RuleController(io, '', cpsTools.initializePropertyValue, selectorEngine)
              , momController = new MOMController(ruleController, rootNodeFactory, selectorEngine)
              , i=0
              , master, cpsFile
              , elementStyle
              ;
            for(;i<recursive_cps.length;i++) {
                cpsFile = 'recursive_cps_'+i+'.cps';
                io.writeFile(false, '/'+cpsFile, recursive_cps[i]);
                master = makeMasterFixture('master_'+ i, ['a']);
                master.attachData('cpsFile', cpsFile);
                momController.rootNode.getChild(0).add(master);
            }
            for(i=0;i<failingSelectors.length;i++) {
                elementStyle = momController.query(failingSelectors[i])
                                              .getComputedStyle();
                // fails with CPSRecursionKeyError
                assert.throws(
                    elementStyle.get.bind(elementStyle, 'on')
                  , CPSRecursionKeyError
                );
            }
        }
    });
});
