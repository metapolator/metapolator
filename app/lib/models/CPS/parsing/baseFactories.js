define([
    'metapolator/errors'
  , 'metapolator/models/CPS/elements/ParameterCollection'
  , 'metapolator/models/CPS/elements/Comment'
  , 'metapolator/models/CPS/elements/GenericCPSNode'

], function (
    errors
  , ParameterCollection
  , Comment
  , GenericCPSNode
) {
    "use strict";
    var CPSError = errors.CPS;
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
     * is not exactly a nice interface. However, its called _nodeConstructors
     * because that implies that these functions are beeing called using
     * the `new` keyword.
     *
     * see: https://github.com/css/gonzales/blob/master/doc/AST.CSSP.en.md
     */
    return {
        /**
         * stylesheet:
         *
         * A list of rulesets, comments and __GenericAST__
         * We will delete __GenericAST__ of type 's'
         *
         * From the docs:
         * Consists of ruleset (a set of rules with selectors),
         * atrules (single-line at-rule),
         * atruleb (block at-rule)
         * and atruler (at-rule with ruleset).
         *
         * Also there are s (whitespace) and comment (comments).
         */
        'stylesheet': function(node, source) {
            var items = []
              , i=0
              , child
              ;

            if(node.children)
                for(;i<node.children.length;i++) {
                    if(node.children[i].type === '__GenericAST__'
                                    && node.children[i].instance.type === 's')
                        continue;
                    child = node.children[i].instance;
                    if(child instanceof ParameterCollection && !child.name)
                        // This is to compensate the ParameterCollection created
                        // by the deperecated @dictionary rule. A ParameterCollection
                        // without a name is a plain ParameterCollection, it
                        // can be flattened into the list of children.
                        // FIXME: remove @dictionary for good and then this code.
                        Array.prototype.push.apply(items, child.items)
                    else
                        items.push(child);
                }

            return new ParameterCollection(items, source, node.lineNo);
        }
        /**
         * comment:
         *
         * A comment. We keep comments in the most cases around.
         *
         * Nodes aware of comments are:
         *
         * stylesheet
         * simpleselector
         * block
         * property
         * value
         */
      , 'comment': function (node, source) {
            return new Comment(node.data, source, node.lineNo);
        }
      /**
       * Everything we refuse to understand at this point or later.
       *
       * We use this constructor to keep alien data around and to be able
       * to reproduce it upon serialization.
       */
      , '__GenericAST__': function (node, source) {
            return new GenericCPSNode(node.rawData, source, node.lineNo);
        }
    };
});
