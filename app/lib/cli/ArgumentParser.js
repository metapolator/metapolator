define([
    'metapolator/errors'
], function(
    errors
) {
    
    var CommandLineError = errors.CommandLine
      , ArgumentParserError = errors.Error
      ;
    
    function ArgumentParser(command) {
        this.command = command;
        this._arguments = [];
        this._argumentIndex = {};
        
        this._optionProcessors = {};
        this._optionHelp = {};
        this._optionKeys = {};
        this._keysOfOption = {};
        this._hasOptions = false;
    }
    
    var _p = ArgumentParser.prototype;
    _p.constructor = ArgumentParser;
    
    
    _p.toString = function() {
        var content = []
          , divi =   '\n----------------'
          , name
          ;
        
        content.push('usage:\n    $ metapolator ', this.command, ' [Options...]');
        if(this._arguments.length) {
            content.push(' <'
              , this._arguments
                    .map(function(arg){return arg[0];})
                    .join('> <')
              , '>');
              
            content.push('\n\nArguments (these are mandatory)', divi)
            this._arguments.forEach(function(arg) {
                var name = arg[0]
                  , help = arg[1]
                  ;
                this.push('\n * ', name, ':\n\t',help);
            }, content)
        }
        
        if(this._hasOptions) {
            content.push('\n\nOptions', divi)
            for(name in this._optionHelp) {
                content.push('\n * ', name, ': ',
                    this._keysOfOption[name].join(', ') || '(not accessible)',
                    ':\n\t', this._optionHelp[name]
                );
            }
        }
        return content.join('');
    }
    
    
    _p.addArgument= function(name, help, processor) {
        if(name in this._argumentIndex)
            throw new ArgumentParserError('An argument with the name "'
                    + name + '" is already registered at index '
                    + this._argumentIndex[name]);
        
        this._argumentIndex[name] = this._arguments.length;
        this._arguments.push([name, help, processor]);
    }
    
    _p.addOption = function(name, optionKeys, help, processor) {
        var i=0, key;
        if(name in this._optionProcessors)
            throw new ArgumentParserError('An option with the name "'
                    + name + '" is already registered');
        // only check in the first pass
        for(;i<optionKeys.length;i++) {
            key = optionKeys[i];
            if(key in this._optionKeys)
                throw new ArgumentParserError('Option key "'+ key + '" '
                    +'for option "' +name+ '" is already registered for '
                    + '"' + this._optionKeys[key] + '"')
        }
        
        this._hasOptions = true;
        this._optionProcessors[name] = processor;
        this._optionHelp[name] = help || '(no help defined)';
        for(i=0;i<optionKeys.length;i++)
            this._optionKeys[optionKeys[i]] = name;
        this._keysOfOption[name] = optionKeys;
    }
    
    _p.readArguments = function(args, processedArguments) {
        var i;
        processedArguments = processedArguments || {};
        for(i=this._arguments.length-1; i>=0; i--) {
            // the argument processors consume all values from args that
            // belong to the argument
            processedArguments[this._arguments[i][0]] = this._arguments[i][2](args)
        }
        return processedArguments;
    }
    
    _p.readOptions = function(args, processedOptions) {
        var option
          , optionName
          ;
        processedOptions = processedOptions || {};
        
        
        while(args.length) {
            option = args.shift();
            if (!(option in this._optionKeys))
                throw new CommandLineError('Option:"' + option + '" is unnkown.')
            
            optionName = this._optionKeys[option];
            if(optionName in processedOptions)
                throw new CommandLineError('Option "' + option + '" sets '
                    + 'the value of "' + optionName + '" but '
                    + '"' + optionName + '" is already set.')
            // the option processors consume all values from args that
            // belong to the option
            processedOptions[optionName] = this._optionProcessors[optionName](args);
                
        }
        return processedOptions;
    }
    
    return ArgumentParser;
})
