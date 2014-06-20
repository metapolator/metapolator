define([
    'intern!object'
  , 'intern/chai!assert'
  , 'metapolator/errors'
  , 'metapolator/models/MOM/_Node'
], function (
    registerSuite
  , assert
  , errors
  , _Node
) {
    "use strict";
    function TestChildNode() {
        _Node.call(this);
    }
    TestChildNode.prototype = Object.create(_Node.prototype);
    TestChildNode.prototype.constructor = TestChildNode
    
    function NoChildNode() {
        _Node.call(this);
    }
    NoChildNode.prototype = Object.create(_Node.prototype);
    NoChildNode.prototype.constructor = NoChildNode
    
    function TestParentNode() {
        _Node.call(this);
    }
    TestParentNode.prototype = Object.create(_Node.prototype);
    TestParentNode.prototype._acceptedChildren = [TestChildNode];
    TestParentNode.prototype.constructor = TestParentNode;
    
    registerSuite({
        name: 'MOM _Node',
        Node_Constructor: function() {
            
            assert.throws(
                function(){ new _Node(); },
                errors.MOM, 'MOM _Node must not be instanciated directly');
            
            var parent = new TestParentNode();
            assert.instanceOf(parent, _Node, 'parent must be a _Node now.')
            
            // we did not override this
            assert.equal('MOM TestParentNode', parent.type);
        }
      , Node_add:function() {
            var parent = new TestParentNode(),
                child = new TestChildNode();
            
            assert.equal(parent.children.length, 0);
            assert.strictEqual(child.parent, null);
            parent.add(child);
            assert.equal(parent.children.length, 1);
            assert.strictEqual(parent.children[0], child)
            assert.strictEqual(child.parent, parent)
            
            parent.add(new TestChildNode());
            assert.isFalse(parent.children[1] === child)
            // adding child again is possible, it now is the last child
            // of parent.
            parent.add(child);
            assert.strictEqual(parent.children[1], child);
            
            // this calls qualifiesAsChild which is tested later in depth
            assert.throws(
                parent.add.bind(parent, new NoChildNode()),
                errors.MOM,
                '<MOM TestParentNode> doesn\'t accept <MOM NoChildNode> '
                +'as a child object.'
            )
        }
      , Node_find: function() {
            var parent = new TestParentNode()
              , children
              , i=0
              ;
            for(;i<10;i++)
                parent.add(new TestChildNode());
            children = parent.children;
            for(i=0;i<children.length;i++)
                assert.strictEqual(i, parent.find(children[i]));
            assert.strictEqual(false, parent.find(new TestChildNode()));
            
        }
      , Node_remove: function() {
            var parent = new TestParentNode()
              , child
              , i=0
              ;
            for(;i<10;i++)
                parent.add(new TestChildNode());
            
            child = parent.children[9];
            assert.strictEqual(10, parent.children.length);
            assert.strictEqual(parent, child.parent);
            assert.strictEqual(9, parent.find(child));
            parent.remove(child);
            assert.strictEqual(parent.children[9], undefined);
            assert.strictEqual(child.parent, null)
            assert.isFalse(parent.find(child));
            assert.strictEqual(9, parent.children.length);
            
            child = parent.children[4];
            assert.strictEqual(4, parent.find(child));
            parent.remove(parent.children[3]);
            assert.notStrictEqual(4, parent.find(child));
            
            assert.isTrue(parent.remove(child), 'returns true on success');
            assert.throws(
                parent.remove.bind(parent, child)
              , errors.MOM
              , 'because it is not a child'
              , 'throws on fail'
            );
        }
      , Node_qualifiesAsChild: function() {
            var parent = new TestParentNode()
              , child
              , Anything = function(){}
              ;
            // I'll use some internals to test the  method.
            child = new TestChildNode();
            assert.isTrue(parent.qualifiesAsChild(child));
            
            assert.throws(
                parent.add.bind(parent, new NoChildNode()),
                errors.MOM,
                '<MOM TestParentNode> doesn\'t accept <MOM NoChildNode> '
                    +'as a child object.'
            )
            
            function Node(){};
            Node.prototype = Object.create(_Node.prototype);
            Node.prototype._acceptedChildren = [
                TestChildNode, Anything, Node
            ];
            
            parent = new Node();
            
            assert.isTrue(parent.qualifiesAsChild(new TestChildNode()));
            assert.isTrue(parent.qualifiesAsChild(new Node()),
                'Accept it\'s own type');
            assert.isFalse(parent.qualifiesAsChild(parent),
                'Don\'t accept itself');
            assert.isFalse(parent.qualifiesAsChild(new Anything()),
                'Don\'t accept anything that is not a _Node');
        }
      , Node_children: function() {
            var parent = new TestParentNode()
              , i = 0
              , children
              ;
            for(;i<10;i++)
                parent.add(new TestChildNode());
            assert.notStrictEqual(parent.children,
                                parent.children, 'returns a new copy');
                                
            assert.sameMembers(parent.children, parent.children,
                'the contents of the children arrays must equal')
            
            assert.strictEqual(10, parent.children.length);
            children = parent.children;
            children.pop();
            assert.strictEqual(10, parent.children.length);
            assert.strictEqual(9, children.length);
            children = parent.children;
            parent.remove(children[9]);
            assert.strictEqual(9, parent.children.length);
            assert.strictEqual(10, children.length);
        }
      , Node_parent: function() {
            var parent = new TestParentNode()
              , newParent = new TestParentNode()
              , child = new TestChildNode()
              , Anything = function(){}
              ;
            
            assert.strictEqual(null, child.parent);
            // works
            child.parent = null;
            
            assert.throws(
                function(){child.parent = parent;}
              , errors.MOM
              , 'A MOM Node must already be a child of its parent when '
                    +'trying to set its parent property.');
                    
            parent.add(child);
            assert.strictEqual(parent, child.parent);
            
            assert.throws(
                function(){child.parent = newParent;}
              , errors.MOM
              , '<MOM TestChildNode> is still a child of a');
              
            child = new TestChildNode();
            assert.throws(
                function(){child.parent = new Anything();}
              , errors.MOM
              , 'The parent property must be a MOM Node, but it is:');
            
            assert.strictEqual(null, child.parent);
            assert.throws(
                function(){child.parent = parent;}
              , errors.MOM
              , 'A MOM Node must already be a child of its parent when '
                    + 'trying to set its parent property.');
            
            parent.add(child);
            assert.strictEqual(parent, child.parent);
            assert.throws(
                function(){child.parent = null;}
              , errors.MOM
              , 'Can\'t unset the parent property when the parent still '
                    +'has this Node as a child');
            
        }
    });
})
