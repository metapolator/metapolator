define([
    'metapolator/errors'
  , 'gonzales/gonzales'
  , 'metapolator/cli/ArgumentParser'
  , 'metapolator/models/CPS/dataTypes/algebra'
], function (
    errors
  , gonzales
  , ArgumentParser
  , algebra
) {
    "use strict";
    var CommandLineError = errors.CommandLine
      , argumentParser = new ArgumentParser('cps-algebra')
      , module
      ;
    argumentParser.addArgument(
        'equation'
      , 'insert a linear equation, best use quotation marks for shell escaping'
      , function(args) {
            var path = args.pop();
            if(path === undefined)
                throw new CommandLineError('equation not found');
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
        
        function Operator() {
            algebra.Operator.apply(this, Array.prototype.slice.call(arguments));
        }
        Operator.prototype = Object.create(algebra.Operator.prototype);
        Operator.prototype.execute = function(a, b) {
            var aNum = typeof a !== 'number' ? parseFloat(a.literal) : a
              , bNum = typeof b !== 'number' ? parseFloat(b.literal) : b
              ;
            if(aNum !== aNum)
                throw new Error('Got NaN from: ' + a);
            if(bNum !== bNum)
                throw new Error('Got NaN from: ' + b);
            return this._routine(aNum, bNum);
        }
        
        var algebraParser = new algebra.Engine(
                new Operator('+',1, 1, 1, function(a, b){ return a+b; })
              , new Operator('-',1, 1, 1, function(a, b){ return a-b; })
              , new Operator('*',2, 1, 1, function(a, b){ return a*b; })
              , new Operator('/',2, 1, 1, function(a, b){ 
                    if(b === 0)
                        throw new Error('Division by Zero.');
                    return a/b; })
              , new Operator('^',3, 1, 1, function(a, b){ return Math.pow(a, b);})
            )
          , stack = algebraParser.getExecuteableStack(args.equation)
          ;
        console.log('stack: ' + stack);
        console.log('calculated: ', stack.execute());
        console.log('evaled: ', eval(args.equation));
    }
    
    
    module = {main: main};
    Object.defineProperty(module, 'help', {
        get: argumentParser.toString.bind(argumentParser)
    });
    return module;
})
