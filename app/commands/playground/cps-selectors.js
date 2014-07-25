define([
    'metapolator/errors'
  , 'gonzales/gonzales'
  , 'metapolator/cli/ArgumentParser'
  , 'ufojs/tools/io/staticNodeJS'
  , 'metapolator/models/CPS/selectorEngine'
  , 'metapolator/models/MOM/Univers'
  , 'metapolator/models/MOM/Master'
  , 'metapolator/models/MOM/Glyph'
  , 'metapolator/models/MOM/PenStroke'
  , 'metapolator/models/MOM/PenStrokePoint'
  , 'metapolator/models/CPS/Registry'
  , 'metapolator/models/CPS/StyleDict'
  , 'metapolator/models/Controller'
], function (
    errors
  , gonzales
  , ArgumentParser
  , io
  , selectorEngine
  , Univers
  , Master
  , Glyph
  , PenStroke
  , PenStrokePoint
  , Registry
  , StyleDict
  , Controller
) {
    "use strict";
    var CommandLineError = errors.CommandLine
      , argumentParser = new ArgumentParser('cps-selectors')
      , module
      ;
    argumentParser.addArgument(
        'selectors'
      , 'a comma separated list of selectors, best use quotation marks for shell escaping'
      , function(args) {
            var path = args.pop();
            if(path === undefined)
                throw new CommandLineError('selectors not found');
            return path;
        }
      );
    
    function main(commandName, argv) {
            // arguments are mandatory and at the end of the argv array
            // readArguments MUST run before readOptions
        var args = argumentParser.readArguments(argv)
            // options are after the command name and berfore the arguments
            // readOptions MUST run after readArguments
          , options = argumentParser.readOptions(argv)
          ;
        
        console.log('processed arguments', args)
        console.log('processed options', options)
        
        var ralph = new Master()
          , heidi = new Master()
            /* we don't read values here, just selecting elements*/
          , controller = new Controller(undefined)
          , univers = controller.query('univers')
          , mastersOfTheUnivers
          , data = {}
          ;
        ralph.id = 'ralph';
        heidi.id = 'heidi';
        univers.add(ralph);
        univers.add(heidi);
        
        mastersOfTheUnivers = univers.children
        
        data[ralph.id] = {
            glyphs: [
                      ['a',[//strokes
                        Array(3),Array(4),Array(8)
                      ]]
                    , ['b',[//strokes
                        Array(4),Array(10),Array(14)
                    ]]
                    , ['c',[//strokes
                        Array(12),Array(5),Array(24)
                    ]]
            ]
        }
        data[heidi.id] = {
            glyphs: [
                      ['x',[//strokes
                        Array(3),Array(4),Array(8)
                        
                      ]]
                    , ['y',[//strokes
                        Array(4),Array(10),Array(14)
                    ]]
                    , ['z',[//strokes
                        Array(12),Array(5),Array(24)
                    ]]
            ]
            
        }
        
        for(var h=0; h<mastersOfTheUnivers.length; h++) {
            var glyphs = data[mastersOfTheUnivers[h].id].glyphs;
            for(var i=0;i<glyphs.length;i++) {
                var glyph = new Glyph();
                glyph.id = glyphs[i][0];
                mastersOfTheUnivers[h].add(glyph);
                for(var j=0;j<glyphs[i][1].length;j++) {
                    var stroke = new PenStroke();
                    glyph.add(stroke);
                    for(var k=0;k<glyphs[i][1][j].length;k++) {
                        var point = new PenStrokePoint();
                        stroke.add(point);
                    }
                }
            }
        }
        
        
        
        var scope = controller.query('penstroke:i(1)')
          , result
          ;
        
        console.log('selector:', args.selectors, 'scope: ' + scope + ' ' + scope.particulars );
        
        //result = selectorEngine.query(multivers, args.selectors)
        result = scope.queryAll(args.selectors);
        
        console.log('result:')
        console.log(result.map(function(item){ return item +' '+item.particulars }).join(',\n'));
        console.log('_______________');
    }
    
    
    module = {main: main};
    Object.defineProperty(module, 'help', {
        get: argumentParser.toString.bind(argumentParser)
    });
    return module;
})
