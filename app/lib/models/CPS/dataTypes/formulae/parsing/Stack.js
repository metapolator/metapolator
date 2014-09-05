define([
    'metapolator/errors'
  , './_ValueToken'
], function(
    errors
  , _ValueToken
) {
    "use strict";

    var CPSFormulaError = errors.CPSFormula;

    function Stack(postfixStack) {
        // raises CPSFormulaError
        this._check(postfixStack);
        this._stack = postfixStack;

    }

    var _p = Stack.prototype;
    _p.toString = function() {
        return this._stack.join('|');
    };

    Object.defineProperty(_p, 'items', {
        get: function(){ return this._stack.slice(); }
    });

    _p._check = function(stack) {
        var i=0, stackLen = 0;
        for(; i<stack.length;i++) {
            stackLen -= stack[i].consumes;
            if(stackLen < 0)
                throw new CPSFormulaError('Stack underflow at ('+i+') a '
                    + stack[i] + ' in ' + stack.join('|') + '. '
                    + 'This means an operator consumes more items than '
                    + 'there are on the stack.');
            stackLen += stack[i].ejects;
        }
        if(stackLen > 1)
            throw new CPSFormulaError('Stack too crowded. A stack must '
                        +'eventually resolve to 1 item, the result. This '
                        +'stack has still ' + stackLen + ' items: '
                        + stack.join('|'));
    };

    _p.execute = function(getApi) {
        var commands = this._stack.slice()
          , stack = []
          , args
          , i = 0
          ;
        for(;i<commands.length;i++) {
            if(commands[i] instanceof _ValueToken)
                stack.push(commands[i]);
            else {
                args = [getApi];
                Array.prototype.push.apply(args
                                , stack.splice(-commands[i].consumes));
                // commands always return only one element currently
                stack.push( commands[i].execute.apply(commands[i], args) );
            }
        }
        // stack.length should be 1 at this point
        return stack.pop();
    };

    return Stack;
});
