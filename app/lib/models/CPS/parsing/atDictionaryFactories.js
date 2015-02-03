define([
    'metapolator/errors'
  , './curry'
  , './parameterFactories'
  , 'metapolator/models/CPS/elements/Parameter'
  , 'metapolator/models/CPS/elements/AtRuleCollection'
  , 'metapolator/models/CPS/elements/ParameterCollection'
  , 'metapolator/models/CPS/elements/AtRuleName'
  , 'metapolator/models/CPS/dataTypes/CPSDictionaryEntry'

], function (
    errors
  , curry
  , parameterFactories
  , Parameter
  , AtRuleCollection
  , ParameterCollection
  , AtRuleName
  , CPSDictionaryEntry
) {
    "use strict";
    var CPSError = errors.CPS
      , genericNameFactory = parameterFactories.genericNameFactory
      ;


    /**
     * Constructors OR factory functions
     * this can be both because JavaScript allows to call a factory function
     * using the new operator like in `new myfactory()`. The factory must
     * return a new object in this case.
     *
     * all constructors take the following arguments: (node, source)
     * @node: object as created by parserEngine._makeNode and augmented by
     * parserEngine
     * @source: instance of parameters/Source
     *
     * We'll use mostly factories, because the "node" we use as argument
     * is not exactly a nice interface. However, it's called _nodeConstructors
     * because that implies that these functions are beeing called using
     * the `new` keyword.
     *
     * see: https://github.com/css/gonzales/blob/master/doc/AST.CSSP.en.md
     */

    /**
     * override constructors for the purpose of @dictionary.
     * This means for all children of @dictionary we can define other rules.
     * If we don't do so, the regular rules apply. JavaScript Prototype
     * Inheritance.
     *
     * like a module pattern, to not pollute the namespace with
     * temporary variables
     */
    var atDictionaryFactories = Object.create(parameterFactories.factories)
      , atDictionaryParsingSwitch
      , _atDictionaryDeprecationWarning
      ;
    (function(factories) {
            var k;
            for(k in factories) atDictionaryFactories[k] = factories[k];
    })({
        /**
         * Augments the AtRuleCollection created by atrulers with a name.
         */
        'atruler': function(node, source) {
            // this is an @dictionary root node
            var i = 0
              , collection
              , name
              ;
            // FIXME: remove all this ASAP, it will make the codebase
            // much smaller!

            if(!_atDictionaryDeprecationWarning) {
                _atDictionaryDeprecationWarning = true;
                console.warn("@dictionary is deprecated!\n"
                    , 'Remove all occurences of "@dictionary {" and it\'s'
                    , 'closing "}" and you should be good to go.\nThe contents of '
                    , '@dictionary will continue to work as normal parameters.'
                );
            }
            for(;i<node.children.length; i++)
                if(name && collection)
                    break;
                else if(!collection
                        && node.children[i].instance instanceof ParameterCollection)
                    collection = node.children[i].instance;
                else if(!name && node.children[i].instance instanceof AtRuleName)
                    name = node.children[i].instance;
            if(!collection || !name)
                return this['__GenericAST__'](node, source);
            //collection.name = name;
            return collection;
        }
      , 'atkeyword': curry(genericNameFactory, AtRuleName)
      , 'atrulers': function(node, source) {
            var items = []
              , i=0
              ;
            for(;i<node.children.length;i++) {
                if(node.children[i].type === '__GenericAST__'
                                && node.children[i].instance.type === 's')
                    continue;
                items.push(node.children[i].instance)
            }
            //return new AtRuleCollection(undefined, items, source, node.lineNo);
            // We are NOT creating AtRuleCollections anymore!
            return new ParameterCollection(items, source, node.lineNo);
        }
      , 'declaration': function(node, source) {
            // this is an @dictionary declaration
            var name, value, typeDefinition;

            if(node.children[0].type !== 'property')
                throw new CPSError('The first child of "declaration" is '
                + 'expected to be a "property", but got "' + node.children[0].type +'" '
                +'" in a declaration from: ' + source + 'line: '
                + node.lineNo
                +'.', (new Error).stack)

            if(node.children[1].type !== 'value')
                throw new CPSError('The second child of "declaration" is '
                + 'expected to be a "value", but got "' + node.children[1].type +'" '
                +'" in a declaration from: ' + source + 'line: '
                + node.lineNo
                +'.', (new Error).stack)
            name = node.children[0].instance;
            value = node.children[1].instance;
            value.initializeTypeFactory(name.name, CPSDictionaryEntry.factory);
            return new Parameter(name, value, source, node.lineNo);
        }
    });

    function test_switchToAtDictionary(data) {
        return (data[0] === 'atruler'
              && data[1] && data[1][0] === 'atkeyword'
              && data[1][1] && data[1][1][0] === 'ident'
              && data[1][1][1] === 'dictionary'
        );
    }

    atDictionaryParsingSwitch = [test_switchToAtDictionary, atDictionaryFactories];

    return {
        factories: atDictionaryFactories
      , atDictionaryParsingSwitch: atDictionaryParsingSwitch
    };
})
