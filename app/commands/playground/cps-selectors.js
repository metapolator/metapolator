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
      , argumentParser = new ArgumentParser('cps-selectors')
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
        
        var project
          , controller
          ;

        project = new MetapolatorProject(io);
        project.load();
        controller = project.open(args.MasterName);

        console.log('selector:', args.selectors );
        
        var result = controller.queryAll(args.selectors);
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
