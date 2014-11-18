define([
    'metapolator/errors'
  , './_ValueToken'

], function(
    errors
  , _ValueToken
) {
    "use strict";

    var CPSFormulaError = errors.CPSFormula;

    function Stack(postfixStack, finalizeMethod) {
        // raises CPSFormulaError
        this._check(postfixStack);
        this._stack = postfixStack;
        this._finalizeMethod = finalizeMethod;
        this._compiled = undefined;
    }

    var _p = Stack.prototype;
    _p.toString = function() {
        return this._stack.join('|');
    };

    Object.defineProperty(_p, 'items', {
        get: function(){ return this._stack.slice(); }
    });

    _p._makeDebugMessageStackDetails = function(stack){
        var commands = stack.slice()
         , stck = []
         , i=0
         ;
        for(;i<commands.length;i++) {
            if(commands[i] instanceof _ValueToken)
                stck.push(commands[i]);
             else {
                stck.push('[result of '+commands[i].literal + '('+stck.splice(-commands[i].consumes)+')]');
            }
        }
        return stck.join(' | ');
    };

    _p._check = function(stack) {
        var i=0, stackLen = 0;
        for(; i<stack.length;i++) {
            stackLen -= stack[i].consumes;
            if(stackLen < 0)
                throw new CPSFormulaError('Stack underflow at ('+i+') a '
                    + stack[i] + ' in ' + stack.join('|') + '. '
                    + 'This means an operator consumes more items than '
                    + 'there are on the stack.\n'
                    + 'Execution hints:\n'
                    + this._makeDebugMessageStackDetails(stack));
            stackLen += stack[i].ejects;
        }

        if(stackLen > 1)
            throw new CPSFormulaError('Stack too crowded. A stack must '
                        + 'eventually resolve to 1 item, the result. This '
                        + 'stack has still ' + stackLen + ' items.\n'
                        + 'Stack in postfix notation:\n'
                        +  stack.join(' |\n')
                        + '\nExecution hints:\n'
                        + this._makeDebugMessageStackDetails(stack));
    };

    _p._compile = function() {
        var i=0
          , args
          , stack = []
          , resultCounter = 0
          , resultName = 'commands[0]'
          , body = [
               '"use strict";'
          ];
        for(;i<this._stack.length;i++) {
            if(this._stack[i] instanceof _ValueToken)
                stack.push('commands[' + i +']');
            else {
                args = ['getAPI'];
                Array.prototype.push.apply(args
                                , stack.splice(-this._stack[i].consumes));
                resultName = 'r'+ (resultCounter++);
                body.push('var '+resultName+' = commands['+ i +'].execute('+ args.join(',') +');');
                stack.push(resultName);
            }
        }
        // return the last result
        if(this._finalizeMethod)
            body.push('return finalize(' + resultName + ', getAPI);');
        else
            body.push('return '+ resultName + ';');
        return new Function('getAPI', 'commands', 'finalize', body.slice(1).join('\n'));
    };

    _p.interpret = function(getAPI) {
        var commands = this._stack.slice()
          , stack = []
          , args
          , i = 0
          , result
          , returned
          ;

        for(;i<commands.length;i++) {
            if(commands[i] instanceof _ValueToken)
                stack.push(commands[i]);
            else {
                args = [getAPI];
                Array.prototype.push.apply(args
                                , stack.splice(-commands[i].consumes));
                // commands always return only one element currently
                returned = commands[i].execute.apply(commands[i], args);
                stack.push( returned );
            }
        }

        // stack.length should be 1 at this point
        if(stack.length === 0)
            throw new CPSFormulaError('No result: stack is empty after '
                            + 'execution. ' +  this._stack.join('|'));
        if(stack.length > 1)
            throw new CPSFormulaError('Too many results, stack contains '
                            +'more than one item after execution: '
                            + this._stack.join('|'));

        result = stack.pop();
        return (this._finalizeMethod
            ?  this._finalizeMethod(result, getAPI)
            : result
        );
    };

    _p.execute = function(getAPI) {
        // FIXME: if/how much the complile strategy is faster must be measured
        // the one alternative is interpreting the stack using the following
        // line.
        // return this.interprete(getAPI);
        if(!this._compiled)
            this._compiled = this._compile();
        return this._compiled(getAPI, this._stack, this._finalizeMethod);

    };

    return Stack;
});
