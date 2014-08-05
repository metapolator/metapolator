define([
    'metapolator/errors'
  , 'metapolator/cli/ArgumentParser'
  , 'ufojs/tools/io/staticNodeJS'
  , 'metapolator/project/MetapolatorProject'
  , 'metapolator/models/CPS/parsing/parseRules'
  , 'metapolator/models/CPS/Registry'
  ], function (
    errors
  , ArgumentParser
  , io
  , MetapolatorProject
  , parseRules
  , Registry
) {
    "use strict";
    var CommandLineError = errors.CommandLine
      , argumentParser = new ArgumentParser('interpolate')
      , module
      ;

    argumentParser.addArgument(
        'Masters'
      , 'a comma-separated list of masters to interpolate'
      , function(args) {
            var names = args.pop().split(',');
            if(names === undefined)
                throw new CommandLineError('No Masters argument found');
            // FIXME: very simple input validation, we'll need more I think
            // FIXME: factor out this validation (see import.js)
            for(var n in names) {
                if(n.indexOf('/') !== -1 || n.indexOf('\\') !== -1)
                    throw new CommandLineError('/ and \\ are not allowed in a '
                                               + 'Master name: ' + n);
            }
            return names;
        }
    );

    argumentParser.addArgument(
        'Interpolators'
      , 'a list of rules, i.e. some CPS'
      , function(args) {
            var rules = args.pop();
            if(rules === undefined)
                throw new CommandLineError('Interpolators not found');
            return parseRules.fromString(rules, 'InterpolatorArgument', new Registry());
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

        var project
          , controllers = []
          , results = []
          ;

        project = new MetapolatorProject(io);
        project.load();
        for(var i in args.Masters)
            controllers.push(project.open(args.Masters[i]));

        console.log('interpolators:', args.Interpolators);

        project.interpolate(controllers, args.Interpolators);
    }

    module = {main: main};
    Object.defineProperty(module, 'help', {
        get: argumentParser.toString.bind(argumentParser)
    });
    return module;
})
