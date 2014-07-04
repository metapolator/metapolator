define([
    'metapolator/errors'
  , 'gonzales/gonzales'
  , 'metapolator/cli/ArgumentParser'
  , 'ufojs/tools/io/staticNodeJS'
  , 'metapolator/models/CPS/parsing/parseRules'
  , 'metapolator/models/Controller'
  , 'metapolator/models/MOM/Univers'
  , 'metapolator/models/MOM/Master'
  , 'metapolator/models/MOM/Glyph'
  , 'metapolator/models/MOM/PenStroke'
  , 'metapolator/models/MOM/PenStrokePoint'
  , 'metapolator/models/CPS/Registry'
], function (
    errors
  , gonzales
  , ArgumentParser
  , io
  , parseRules
  , Controller
  , Univers
  , Master
  , Glyph
  , PenStroke
  , PenStrokePoint
  , Registry
) {
    "use strict";
    var CommandLineError = errors.CommandLine
      , argumentParser = new ArgumentParser('import')
      , module
      ;
    argumentParser.addArgument(
        'CPSFile'
      , 'A path to a cps file'
      , function(args) {
            var path = args.pop();
            if(path === undefined)
                throw new CommandLineError('No CPSFile argument found');
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
        
        var cpsString = io.readFile(false, args.CPSFile)
        var parameterRegistry = new Registry();
        
        // fixme: a ParameterDescription class/interface definition could
        // be the point here. So we can ensure a consistent api and
        // pin point programming errors
        parameterRegistry.register('value', {
                    type: 'string'
                  , description: 'this is a stub for the parameter description!'
        });
        
        parameterRegistry.register('height', {
                    type: 'CompoundReal'
                  , description: 'the relative value of height'
        });
        
        parameterRegistry.register('heightIntrinsic', {
                    type: 'real'
                  , description: 'the intrinsic value of the height'
        });
        
        parameterRegistry.register('width', {
                    type: 'CompoundReal'
                  , description: 'the relative value of width'
        });
        
        parameterRegistry.register('widthIntrinsic', {
                    type: 'real'
                  , description: 'the intrinsic value of the width'
        });
        
        parameterRegistry.register('zon', {
                    type: 'CompoundVector'
                  , description: 'The center on curve point of a skeleton point'
        })
        parameterRegistry.register('zonIntrinsic', {
                    type: 'vector'
                  , description: 'the intrinsic value of the zon'
        })
        
        var result = parseRules.fromString(cpsString, args.CPSFile, parameterRegistry);
        
        var univers = new Univers()
          , ralph = new Master()
          , heidi = new Master()
          , mastersOfTheUnivers 
          , data = {}
          ;
        ralph.id = 'ralph';
        heidi.id = 'heidi';
        univers.add(ralph);
        univers.add(heidi);
        mastersOfTheUnivers = univers.children;
        
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
    
        var controller = new Controller(univers, [result], parameterRegistry)
          , element = controller.query('master#ralph glyph point:i(23)')
          ;
        
        console.log('element:', element.particulars);
        var computed = controller.getComputedStyle(element)
          , valueInstance = computed.get('width')
          ;
        
        
        console.log('result ' + valueInstance.value, valueInstance._components.join('|'));
    }
    
    
    module = {main: main};
    Object.defineProperty(module, 'help', {
        get: argumentParser.toString.bind(argumentParser)
    });
    return module;
})
