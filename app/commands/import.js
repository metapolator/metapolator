define([
    'metapolator/errors'
  , 'metapolator/cli/ArgumentParser'
  , 'ufojs/tools/io/staticNodeJS'
  , 'metapolator/importer/MetapolatorProject'
  ], function (
    errors
  , ArgumentParser
  , io
  , MetapolatorProject
) {
    "use strict";
    var CommandLineError = errors.CommandLine
      , argumentParser = new ArgumentParser('import')
      , module
      ;
    argumentParser.addArgument(
        'SourceUFO'
      , 'The path to the source UFO directory.'
      , function(args) {
            var ufoDir = args.pop();
            if(ufoDir === undefined)
                throw new CommandLineError('No SourceUFO argument found');
            return ufoDir;
        }
    );
    
    argumentParser.addArgument(
        'TargetMaster'
      , 'The name of the master to import into.'
      , function(args) {
            var masterName = args.pop();
            if(masterName === undefined)
                throw new CommandLineError('No TargetMaster argument found');
            // FIXME: very simple input validation, we'll need more I think
            if(masterName.indexOf('/') !== -1 || masterName.indexOf('\\') !== -1)
                throw new CommandLineError('/ and \\ are not allowed in a '
                                        + 'Master name: ' + masterName);
            return masterName;
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
        
        var project = new MetapolatorProject(io);
        project.load();
        project.import(args.TargetMaster, args.SourceUFO, options.glyphs);
    }
    
    module = {main: main};
    Object.defineProperty(module, 'help', {
        get: argumentParser.toString.bind(argumentParser)
    });
    return module;
})
