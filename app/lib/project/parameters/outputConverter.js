define([
    'metapolator/errors'
  , 'metapolator/models/CPS/parsing/Source'
  , 'metapolator/models/CPS/elements/ParameterCollection'
  , 'metapolator/models/CPS/elements/AtRuleCollection'
  , 'metapolator/models/CPS/elements/AtRuleName'
  , 'metapolator/models/CPS/elements/Rule'
  , 'metapolator/models/CPS/elements/ParameterDict'
  , 'metapolator/models/CPS/elements/Parameter'
  , 'metapolator/models/CPS/elements/ParameterName'
  , 'metapolator/models/CPS/elements/ParameterValue'
  , 'metapolator/models/CPS/elements/Comment'
  , 'metapolator/models/CPS/parsing/parseSelectorList'
], function(
    errors
  , Source
  , ParameterCollection
  , AtRuleCollection
  , AtRuleName
  , Rule
  , ParameterDict
  , Parameter
  , ParameterName
  , ParameterValue
  , Comment
  , parseSelectorList
) {
    "use strict";

    var items = []
      , source = new Source('(generated/default parameters)')
      , rules = []
      ;


    function parameterDictFromObject(obj, source) {
        var items = []
          , k
          , name
          , value
          ;

        for(k in obj) {
            name = new ParameterName(k, [], source);
            value = new ParameterValue([obj[k]], [], source);
            items.push(new Parameter(name, value, source));
        }
        return new ParameterDict(items);
    }

    rules.push(
        new Rule(
            parseSelectorList.fromString('*', source.name)
          , parameterDictFromObject({
            // let's see what is still needed here.
            //      on: 'onIntrinsic'
            //    , in: 'inIntrinsic'
            //    , out: 'outIntrinsic'
            //    , inDir: 'inDirIntrinsic'
            //    , outDir: 'outDirIntrinsic'
            //    , inTension: '0'
            //    , outTension: '0'
            //    , inIntrinsic: 'Vector 0 0'
            //    , outIntrinsic: 'Vector 0 0'
            //    , inDirIntrinsic: '0'
            //    , outDirIntrinsic: '0'
              })
          , source
      )
      , new Rule(
            parseSelectorList.fromString('point>center', source.name)
          , parameterDictFromObject({
                  on: 'parent:skeleton:on'
                , 'in': 'parent:skeleton:in'
                , out: 'parent:skeleton:out'
                // the dirs are defined by the importer if this calculations
                // would not produce a good result
                , inDir: '(on - in):angle'
                , outDir: '(out - on):angle'
              })
          , source
        )
        // @dict
      , new AtRuleCollection(
            new AtRuleName('dictionary', [])
          , [
                new Rule(
                    parseSelectorList.fromString('point>*', source.name)
                  , parameterDictFromObject({
                        pointBefore: 'parent:parent:children[parent:index - 1][this:type]'
                      , pointAfter: 'parent:parent:children[parent:index+1][this:type]'
                    })
                  , source
                )
            ]
          , source
        )
      , new Rule(
            parseSelectorList.fromString('point>left, point>right', source.name)
          , parameterDictFromObject({
                  on: 'Polar onLength onDir + parent:center:on'
                // this makes it possible to *JUST* use a Vector creation
                // for pure beziers as well:
                //, 'in': 'Polar inLength inDir + on'
                //, out: 'Polar outLength outDir + on'
                // , 'in': 'Polar (tension2magnitude pointBefore:on pointBefore:outDir pointBefore:outTension inTension inDir on)[0] inDir + on'
                // , out:  'Polar (tension2magnitude on outDir outTension  pointAfter:inTension pointAfter:inDir pointAfter:on)[1] outDir + on'
                , 'in': 'tension2controlIn pointBefore:on pointBefore:outDir inTension inDir on'
                , out: 'tension2controlOut on outDir outTension pointAfter:inDir pointAfter:on'

                , inDir: 'inDirIntrinsic + parent:center:inDir'
                , outDir: 'outDirIntrinsic + parent:center:outDir'
            })
           , source
        )
      , new Rule(
            parseSelectorList.fromString('point>left', source.name)
          , parameterDictFromObject({
                  onDir: 'deg 180 + parent:right:onDir'
                , onLength: 'parent:right:onLength'
            })
          , source
        )
      // opening terminal; drawn from left to right using both 'in' values
      , new Comment('opening terminal')
      , new Rule(
            parseSelectorList.fromString('point:i(0)>left', source.name)
          , parameterDictFromObject({
                'in': 'tension2controlOut on (inDir + deg 180) inTension parent:right:inDir parent:right:on'
              })
          , source
        )
      , new Rule(
            parseSelectorList.fromString('point:i(0)>right', source.name)
          , parameterDictFromObject({
                  'in': 'tension2controlIn parent:left:on (parent:left:inDir  + deg 180) inTension inDir on'
              })
          , source
        )
      // closing terminal; drawn from right to left using both 'out' values
      , new Comment('closing terminal')
      , new Rule(
            parseSelectorList.fromString('point:i(-1)>right', source.name)
          , parameterDictFromObject({
                  out: 'tension2controlOut on outDir outTension (parent:left:outDir + deg 180) parent:left:on'
              })
          , source
        )
      , new Rule(
            parseSelectorList.fromString('point:i(-1)>left', source.name)
          , parameterDictFromObject({
                out: 'tension2controlIn parent:right:on parent:right:outDir outTension (outDir + deg 180) on'
              })
          , source
        )
    );
    return new ParameterCollection(rules, source);
});
