define([
    'metapolator/errors'
  , 'metapolator/cli/ArgumentParser'
  , 'ufojs/tools/io/staticNodeJS'
  , 'metapolator/project/MetapolatorProject'
  ], function (
    errors
  , ArgumentParser
  , io
  , MetapolatorProject
) {
    "use strict";
    var CommandLineError = errors.CommandLine
      , argumentParser = new ArgumentParser('export')
      , module
      ;
    argumentParser.addArgument(
        'MasterName'
      , 'The master to be exported'
      , function(args) {
            var name = args.pop();
            if(name === undefined)
                throw new CommandLineError('No MasterName argument found');
            return name;
        }
    );
    
    argumentParser.addArgument(
        'InstanceName'
      , 'The name of the instance to export to, a dirname, but the .ufo '
        + 'extension is added by metapolator'
      , function(args) {
            var name = args.pop();
            if(name === undefined)
                throw new CommandLineError('No InstanceName argument found');
            return name;
        }
    );

    // FIXME: Make this argument optional, and default to 0
    argumentParser.addArgument(
        'Precision'
      , 'The precision to use for output coordinates, expressed as the reciprocal of a number to round to the nearest multiple of,' +
            ' or 0 for no rounding (e.g. 1000 to round to 3 decimal places)'
      , function(args) {
            var precision = args.pop();
            if(precision === undefined)
                precision = 0;
            else {
                precision = Number(precision);
                if(Number.isNaN(precision))
                    throw new CommandLineError('Precision must be a number');
            }
            return precision;
        }
    );
    
    function main(commandName, argv) {
            // arguments are mandatory and at the end of the argv array
            // readArguments MUST run before readOptions
        var args = argumentParser.readArguments(argv)
            // options are after the command name and berfore the arguments
            // readOptions MUST run after readArguments
          , options = argumentParser.readOptions(argv)
          , sourceGlyphSet
          // the current working directory + glyphs_imported
          , targetGlyphSetDir = './glyphs_imported'
          , targetGlyphSet
          ;
        
        console.log('processed arguments', args)
        console.log('processed options', options)
        
        var project = new MetapolatorProject(io)
        project.load();
        project.exportInstance(args.MasterName, args.InstanceName, args.Precision);
    }
    
    module = {main: main};
    Object.defineProperty(module, 'help', {
        get: argumentParser.toString.bind(argumentParser)
    });
    return module;
})
