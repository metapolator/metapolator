define([
    'metapolator/errors'
  , './_ValueToken'
  , './NumberToken'
  , './StringToken'
  , './SelectorToken'
], function(
    errors
  , _ValueToken
  , NumberToken
  , StringToken
  , SelectorToken
) {
    "use strict";

    var CPSFormulaError = errors.CPSFormula
      , stackCache = Object.create(null)
      ;


    function Stack(postfixStack, finalizeMethod) {
        // raises CPSFormulaError
        this._check(postfixStack);
        this._finalizeMethod = finalizeMethod;
        var sig;
        this._signature = sig = this._makeSignature(postfixStack);
        this._stack = this._unwrap(postfixStack);

        this.execute = stackCache[sig] || (stackCache[sig] = this._compile(postfixStack));
        // this.execute = this._compile();
    }

    var _p = Stack.prototype;
    _p.toString = function() {
        return this._stack.join('|');
    };

    Object.defineProperty(_p, 'items', {
        get: function(){ return this._stack.slice(); }
    });

    _p._unwrap = function(stack) {
        var result = [], i,l, token;
        for(i=0,l=stack.length;i<l;i++) {
            token = stack[i];
            result.push((token instanceof NumberToken || token instanceof StringToken
                                                      || token instanceof SelectorToken
                ? token.getValue()
                : token
                ));
        }
        return result;
    };

    _p._makeSignature = function (stack) {
        var i,l, result = [], c=0;
        for(i=0,l=stack.length;i<l;i++) {
            if(stack[i] instanceof _ValueToken)
                c++;
            else {
                if(c) {
                    result.push('c', c);
                    c = 0;
                }
                result.push('e', stack[i].consumes);
            }
        }
        if(c) result.push('c', c);
        if(this._finalizeMethod) result.push('f');
        return result.join('');
    };

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

    _p._compile = function(_stack) {
        var i, l
          , args
          , stack = []
          , resultCounter = 0
          , resultName = 'commands[0]'
          , body = [
               '"use strict";'
              , 'var commands = this._stack;'
          ];
        for(i=0,l=this._stack.length;i<l;i++) {
            if(_stack[i] instanceof _ValueToken)
                stack.push('commands[' + i +']');
            else {
                args = [];
                Array.prototype.push.apply(args
                                , stack.splice(-_stack[i].consumes));
                resultName = 'r'+ (resultCounter++);
                body.push('var '+resultName+' = commands['+ i +'].execute(getAPI, ['+ args.join(',') +']);');
                stack.push(resultName);
            }
        }
        // return the last result
        if(this._finalizeMethod)
            body.push('return this._finalizeMethod(' + resultName + ', getAPI);');
        else
            body.push('return '+ resultName + ';');
        return new Function('getAPI', body.slice(1).join('\n'));
    };

    // This is replaced with a compiled version on initialisation.
    // It remains here because the algorithm is more obvious.
    _p.execute = function(getAPI) {
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

    return Stack;
});
