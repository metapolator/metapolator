define([
    'metapolator/errors'
], function(
    errors
) {
    "use strict";
    
    var CPSAlgebraError = errors.CPSAlgebra;
    
    function AlgebraElement(literal, preConsumes, postConsumes) {
        this._literal = literal;
        
        if(typeof preConsumes !== 'number')
            throw new CPSAlgebraError('preConsumes must be a number, but is "'
                                + preConsumes +'" typeof: '+ typeof preConsumes);
        this._preConsumes = preConsumes;
        if(typeof postConsumes !== 'number')
            throw new CPSAlgebraError('postConsumes must be a number, but is "'
                                + postConsumes +'" typeof: '+ typeof postConsumes);
        this._postConsumes = postConsumes;
        
        // Currently every AlgebraElement is expected to leave exactly one
        // value on the stack after execution. This might change if there
        // is a practical use for it. Especially Algebra.infixToPostfix
        // couldn't handle such a case at the moment!
        // ejects = ejects === undefined ? 1 : ejects;
        // if(ejects !== 1 && ejects !== 0)
        //     throw new CPSAlgebraError('ejects must be 0 or 1, but it is "'
        //                         + ejects +'" typeof: '+ typeof ejects);
        this._ejects = 1;
    }
    AlgebraElement.prototype.constructor = AlgebraElement;
    AlgebraElement.prototype.toString = function() {
        return this.literal;
    }
    
    
    Object.defineProperty(AlgebraElement.prototype, 'literal',{
        get: function(){ return this._literal; }
    })
    Object.defineProperty(AlgebraElement.prototype, 'preConsumes',{
        get: function(){ return this._preConsumes;}
    })
    Object.defineProperty(AlgebraElement.prototype, 'postConsumes',{
        get: function(){ return this._postConsumes;}
    })
    Object.defineProperty(AlgebraElement.prototype, 'consumes',{
        get: function(){ return this.preConsumes + this.postConsumes;}
    })
    Object.defineProperty(AlgebraElement.prototype, 'ejects',{
        get: function(){ return this._ejects;}
    })
    
    /**
     * The amount of entries by which the stack will be changed.
     * Excluding the AlgebraElement itself.
     */
    Object.defineProperty(AlgebraElement.prototype, 'delta',{
        get: function(){ return this.ejects - this.consumes;}
    })
    
    /**
     * The amount of change of this operation.
     * Excluding the AlgebraElement itself.
     * This can be used to check if it does any change to the stack at
     * all. If not it can be omitted, at least in 'optimizing' execution.
     * At the moment a change 0 element would execute. We can maybe use
     * it for debugging in the future. However, since every element has
     * to leave one item on the stack at the moment, this is always at
     * least 1!
     */
    Object.defineProperty(AlgebraElement.prototype, 'change', {
        get: function(){ return this.ejects + this.consumes }
    })
    
    function Operator(literal, precedence, preConsumes, postConsumes, routine) {
        AlgebraElement.call(this, literal, preConsumes, postConsumes);
        if(typeof precedence !== 'number')
            throw new CPSAlgebraError('Precedence must be a number, but is "'
                                + precedence +'" typeof: '+ typeof precedence);
        this._precedence = precedence;
        this._routine = routine;
    }
    
    Operator.prototype = Object.create(AlgebraElement.prototype);
    Operator.prototype.constructor = Operator;
    
    
    Object.defineProperty(Operator.prototype, 'precedence',{
        get: function(){ return this._precedence;}
    })
    
    Operator.prototype.execute = function(/* arguments */) {
        // this could be overidden by an inheriting Class, to do common
        // pre/post execution tasks, like checking or transforming values
        // for example.
        return this._routine.apply(this, Array.prototype.slice.call(arguments));
    }
    
    function Value(literal) {
        AlgebraElement.call(this, literal, 0, 0);
    }
    Value.prototype = Object.create(AlgebraElement.prototype);
    Value.prototype.constructor = Value;
    
    function Engine(ValueConstructor /* operators */) {
        var startOperatorArgs = 1;
        if(ValueConstructor.prototype instanceof Value)
            this.ValueConstructor = ValueConstructor;
        else if (ValueConstructor.prototype instanceof Operator)
            startOperatorArgs = 0;
        this._operators = this._createOperatorsDict(
                Array.prototype.slice.call(arguments, startOperatorArgs));
        this._operatorsByPrecedence = this._createPrecedenceLookup(
                                                        this._operators);
    }
    
    var _p = Engine.prototype;
    
    _p.ValueConstructor = Value;
    _p._createOperatorsDict = function(operators) {
        var i = 0
          , result = {}
          ;
        for(;i<operators.length;i++) {
            if(operators[i].literal in result)
                throw new CPSAlgebraError('An operator with the literal "'
                                + operators[i].literal +'" is defined at '
                                + 'least twice, but it must be unique!');
            
            result[operators[i].literal] = operators[i];
        }
        return result;
    }
    
    /**
     * Creates an array like so:
     * [
     *      {'*': operatorInstance, '/': operatorInstance},
     *      {'+': operatorInstance, '-': operatorInstance},
     * ]
     *
     * The infixToPostfix method uses this to resolve the operators in
     * the right order. This means the first item in the result of this
     * method has the highest precedence, and all its operators are
     * resolved first.
     */
    _p._createPrecedenceLookup = function(operators) {
        var temp = {}
          , k
          , ordered
          ;
        for(k in operators) {
            if(temp[operators[k].precedence] === undefined)
                temp[operators[k].precedence] = {};
            temp[operators[k].precedence][k] = operators[k];
        }
        ordered = Object.keys(temp);
        ordered.sort();
        // highest precedence first
        ordered.reverse();
        return ordered.map(function(key){ return temp[key]; });
    }
    
    
    
    /**
     * Unwrap all elements of nested arrays into one flat array. Keep
     * the depth-first order intact.
     */
    function _flatten(tokens) {
        var result = []
          , item
          ;
        while(item = tokens.shift()) {
            if(item instanceof Array)
                Array.prototype.unshift.apply(tokens, item);
            else
                result.push(item);
        }
        return result;
    }
    
    _p.tokenize = function(string) {
        // tokenizer:
        var i=0
            , tokens=[]
            , value = []
            // uses the 'value' name in this closure
            , flushValue = function() {
                if(!value.length)
                    return;
                var literal = value.join('')
                  , item;
                // multi char operators are found here
                if(literal in this._operators)
                    item = this._operators[literal];
                else {
                    // this is a little dirty hack, to allow negative values
                    // directly as input. The problem is that the - operator
                    // has a kind of a double usage, to create negative
                    // values and to perform subtraction. There would be
                    // another valid way to create a negative value without
                    // this hack: 0 - value ...
                    // But I think people just expect that - works as they
                    // are used to.
                    // I can't auto insert the 0 because this system  is
                    // made to be agnostic of the kind of values to be
                    // used. Inserting  value(-1) and operator (*) could
                    // be an option, too. Maybe this special case could
                    // trigger a callback, too, that could be implemented 
                    // by the calling code...
                    
                    // I don't think that this solution is pretty!
                    // Now the value parsers must be aware that a value can
                    // come in as negative Value ...
                    // only if there is a - operators
                    if('-' in this._operators
                            && tokens.length-1 >= 0
                            && tokens[tokens.length-1] instanceof Operator
                            && tokens[tokens.length-1].literal === '-'
                            && (
                            // it started with an operator
                            tokens.length-2 === -1
                            // or the element before the - operator is an operator
                            || tokens[tokens.length-2] instanceof Operator
                            // or a parenthesis, which is a special kind of
                            // operator in here
                            || '()'.indexOf(tokens[tokens.length-2]) !== -1
                            )) {
                        // remove the minus operator
                        tokens.pop();
                        // and add it to the value literal
                        literal = '-' + literal;
                    }
                    item = new this.ValueConstructor(literal);
                }
                tokens.push(item);
                value = [];
            }.bind(this)
            ;
        for(;i<string.length;i++) {
            if(' \n'.indexOf(string[i]) !== -1)
                flushValue();
            else if('()'.indexOf(string[i]) !== -1) {
                flushValue();
                tokens.push(string[i]);
            }
            // this detects only single char operators, multi char
            // operators are detected in flushValue
            // thus single char operators split multi char operators ...
            // you shouldn't use ' '(space), '(', ')' or your own single
            // char operator literals as part of an operator name.
            else if(string[i] in this._operators) {
                flushValue();
                tokens.push(this._operators[string[i]]);
            }
            else
                value.push(string[i]);
        }
        flushValue();
        return tokens;
    }
    
    /**
     * Take the tokens where the calculations are in a infix notation and
     * return postfix or Reverse Polish notation:
     * this means we got from 2 + 3 to 2 3 +. The operator follows all
     * of its operand. This is easy to calculate at the end, and we get
     * rid of the Parenthesis.
     * 
     * This works as far as my tests went, but it could be more efficient 
     * when implemented using the "Dijkstra shunting yard algorithm" to
     * create this conversion.
     * 
     * The algorithm uses one recursive call to eliminate parentheses
     * and multiple passes to solve all operators in order of precedence.
     */
    _p.infixToPostfix = function infixToPostfix(tokens) {
        var i = 0
            , k
            , open
            , start
            , result = []
            ;
        // find parentheses and call this method recursiveley
        for(;i<tokens.length;i++) {
            if(tokens[i] === '(') {
                //find the matching )
                i += 1;
                start = i;
                open = 1;
                for(;i<tokens.length;i++) {
                    if(tokens[i] === '(')
                        open += 1;
                    else if(tokens[i] === ')') {
                        open -= 1;
                        if(open === 0)
                            break;
                    }
                }
                if(open !== 0 || tokens[i] !== ')')
                    throw new CPSAlgebraError('A closing parenthesis is missing');
                result.push(this.infixToPostfix(tokens.slice(start, i)));
            }
            else
                result.push(tokens[i]);
        }
        tokens = result
        
        // convert all operators to postfix notation
        // operator precedence defines the order of the conversion
        var operators = this._operatorsByPrecedence
            , i
            , j=0
            , k
            , startPre
            , startPost
            , endPost
            , operation
            ;
        for(;j<operators.length;j++) {
            for(i=0;i<tokens.length;i++) {
                // Array and Value don't change the stack, only Operator
                // does. Thus Array and Value stay where they are until
                // they are consumed by an Operator.
                if(tokens[i] instanceof Value || tokens[i] instanceof Array)
                    continue;
                // else tokens[i] is an Operator
                
                if(!(tokens[i].literal in operators[j]))
                    continue;
                
                startPre = i - tokens[i].preConsumes;
                if(startPre < 0)
                    throw new CPSAlgebraError('Stack underun at a "'+tokens[i]+'" '
                                    + 'operator, which pre consumes more items '
                                    + 'than there are on the stack');
                
                startPost = i+1;
                endPost = startPost+tokens[i].postConsumes;
                if(endPost > tokens.length)
                    throw new CPSAlgebraError('Stack underun at a "'+tokens[i]+'" '
                                    + 'operator, which post consumes more items '
                                    + 'than there are on the stack');
                operation = tokens.slice(startPre, i).concat(
                                        tokens.slice(startPost, endPost));
                // check if everything looks alright
                for(k=0; k<operation.length; k++)
                    if(!(operation[k] instanceof Value)
                                    && !(operation[k] instanceof Array))
                        throw new CPSAlgebraError('Malformed stack at a "'
                            + tokens[i].literal+'" operator, which consumes '
                            + (operation[k] instanceof Operator
                                ? 'another operator: "' + operation[k].literal + '"'
                                : 'something that is not a value: "'
                                        + operation[k] + '" typeof: '
                                        + typeof operation[k]
                                        + ' '+operation[k].constructor.name
                                        )
                                        
                            );
                // add the operator
                operation.push(tokens[i])
                
                // change in place, the operation becomes one array
                // and will be handled as a single value in later
                // repetitions.
                tokens.splice(startPre, operation.length, operation);
                i = startPre;
            }
        }
        return _flatten(tokens);
    }
    
    _p.getExecuteableStack = function(string) {
        var tokens = this.tokenize(string);
        tokens = this.infixToPostfix(tokens);
        return new Stack(tokens);
    }
    
    function Stack(postfixStack) {
        // raises CPSAlgebraError
        this._check(postfixStack);
        this._stack = postfixStack;

    }
    
    Stack.prototype.toString = function() {
        return this._stack.join('|')
    }
    
    Object.defineProperty(Stack.prototype, 'items', {
        get: function(){ return this._stack.slice() }
    });
    
    Stack.prototype._check = function(stack) {
        var stackLen = 0;
        for(var i=0; i<stack.length;i++) {
            stackLen -= stack[i].consumes;
            if(stackLen < 0)
                throw new CPSAlgebraError('Stack underrun at ('+i+') a '
                    + stack[i] + ' in ' + stack.join('|'));
            stackLen += stack[i].ejects;
        }
        if(stackLen > 1)
            throw new CPSAlgebraError('Stack overrun. ' + stackLen
                                            + ' in ' + stack.join('|'));
    }
    
    
    Stack.prototype.execute = function() {
        var commands = this._stack.slice()
          , stack = []
          , i = 0
          ;
        for(;i<commands.length;i++) {
            if(commands[i] instanceof Value)
                stack.push(commands[i]);
            else {
                stack.push(
                    commands[i].execute.apply(commands[i],
                                stack.splice(-commands[i].consumes))
                );
            }
        }
        return stack.pop();
    }
    
    return {
        Engine: Engine
      , AlgebraElement: AlgebraElement
      , Operator: Operator
      , Value: Value
      , Stack: Stack
    }
})
