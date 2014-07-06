define([
    'metapolator/errors'
  , 'metapolator/cli/ArgumentParser'
  , 'ufojs/tools/io/staticNodeJS'
  , './ImportController'
  , './MetapolatorProject'
  ], function (
    errors
  , ArgumentParser
  , io
  , ImportController
  , MetapolatorProject
) {
    "use strict";
    var CommandLineError = errors.CommandLine
      , argumentParser = new ArgumentParser('import')
      , module
      ;
    argumentParser.addArgument(
        'SourceUFO'
      , 'The path to the source UFO directory'
      , function(args) {
            var ufoDir = args.pop();
            if(ufoDir === undefined)
                throw new CommandLineError('No SourceUFO argument found');
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
    
    function main(commandName, argv) {
            // arguments are mandatory and at the end of the argv array
            // readArguments MUST run before readOptions
        var args = argumentParser.readArguments(argv)
            // options are after the command name and berfore the arguments
            // readOptions MUST run after readArguments
          , options = argumentParser.readOptions(argv)
          , sourceGlyphSet
          // the current workin directory + glyphs_imported
          , targetGlyphSetDir = './glyphs_imported'
          , targetGlyphSet
          ;
        
        console.log('processed arguments', args)
        console.log('processed options', options)
        
        
        var project = new MetapolatorProject(io)
          , importer
        
        project.load();
        importer = new ImportController(io, project, args.SourceUFO);
        importer.import(options.glyphs);
    }
    
    module = {main: main};
    Object.defineProperty(module, 'help', {
        get: argumentParser.toString.bind(argumentParser)
    });
    return module;
})
