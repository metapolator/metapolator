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

    argumentParser.addOption(
        'Precision'
      , ['-p', '--precision']
      , 'The precision to use for output coordinates, '
        + ' e.g. 3 to round to 3 decimal places or -1 for no rounding'
      , function(args) {
            var precision = args.shift();
            if(precision === undefined)
                return undefined;
            else {
                precision = parseInt(precision, 10);
                if(precision !== precision)
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
        project.exportInstance(args.MasterName, args.InstanceName,
                               options.Precision);
    }

    module = {main: main};
    Object.defineProperty(module, 'help', {
        get: argumentParser.toString.bind(argumentParser)
    });
    return module;
})
