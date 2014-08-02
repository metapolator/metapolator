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
      , argumentParser = new ArgumentParser('init')
      , module
      ;
    argumentParser.addArgument(
        'name'
      , 'The name of the Metapolator project'
      , function(args) {
            var name = args.pop();
            if(name === undefined)
                throw new CommandLineError('No Metapolator project name argument found');
            return name;
        }
      );

    function main(commandName, argv) {
            // arguments are mandatory and at the end of the argv array
            // readArguments MUST run before readOptions
        var args = argumentParser.readArguments(argv)
            // options come after the command name and before the arguments
            // readOptions MUST run after readArguments
          , options = argumentParser.readOptions(argv)
          ;

        console.log('processed arguments', args)
        console.log('processed options', options)

        var project = new MetapolatorProject.init(io, args.name);
    }

    module = {main: main};
    Object.defineProperty(module, 'help', {
        get: argumentParser.toString.bind(argumentParser)
    });
    return module;
})

