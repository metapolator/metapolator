define([
    'metapolator/errors'
  , 'metapolator/cli/ArgumentParser'
], function (
    errors
  , ArgumentParser
) {
    "use strict";
    var CommandLineError = errors.CommandLine
      , argumentParser = new ArgumentParser('import')
      , module
      ;
    argumentParser.addArgument(
        'UFO-source'
      , 'The path to the source UFO directory'
      , function(args) {
            var ufoDir = args.pop();
            if(ufoDir === undefined)
                throw new CommandLineError('No UFO-source argument found');
            return ufoDir;
        }
      );
    
    argumentParser.addOption(
        'glyphs'
      , ['-g', '--glyphs']
      , ['Set a subset of the glyphs that should be imported into '
        , 'the metapolator project. Use a comma separated list of '
        , 'glyph names to specify the subset. Without this option '
        , 'all glyphs of the UFO are attempted to be imported.'].join('')
      , function(args) {
            var value = args.shift()
              , glyphNames
              ;
            if(value === undefined)
                throw new CommandLineError('The option "glyphs" needs '
                    + 'a value of comma separated glyph names.')
                
            glyphNames = value.split(',')
                .map(function(item){ return item.trim(); })
                .filter(function(item){ return !!item.length; })
            
            if(!glyphNames.length)
                throw new CommandLineError('The value of option "glyphs" '
                    + 'did not produce a list of names, value was: "'
                    + value + '" expected was a comma separated list '
                    + 'of glyph names');
            return glyphNames;
        }
    );
    
    function main(commandName, args) {
            // arguments are mandatory and at the end of the args array
            // readArguments MUST run before readOptions
        var processedArguments = argumentParser.readArguments(args)
            // options are after the command name and berfore the arguments
            // readOptions MUST run after readArguments
          , processedOptions = argumentParser.readOptions(args)
          ;
        
        
        console.log('processedArguments', processedArguments)
        console.log('processedOptions', processedOptions)
        
        // open the ufo
        // for every glyph:
        //      import glyph
        //      save skeleton in apropriate skeleton layer at glyph name
        //      append CPS to local.cps
        
        
        
    }
    
    module = {main: main};
    Object.defineProperty(module, 'help', {
        get: argumentParser.toString.bind(argumentParser)
    });
    return module;
})
