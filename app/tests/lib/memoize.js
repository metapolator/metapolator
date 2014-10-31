define([
    'intern!object'
  , 'intern/chai!assert'
  , 'metapolator/memoize'
  , 'metapolator/errors'
], function (registerSuite, assert, memoize, errors) {
    "use strict";
    function identity(a){ return a;}
    function TestObject(){}
    TestObject.prototype.identity = memoize('identity', identity);
    TestObject.prototype.identity2 = memoize('identity2', identity);

    // Makes all 'b' to 'a' but leaves everything else untouched.
    // returns args.join(',')
    function customKeyFunc() {
        return Array.prototype.slice.call(arguments)
             .map(function(item){ return item === 'b' ? 'a' : item})
             .join(',')
             ;
    }

    TestObject.prototype.identity3 = memoize('identity3', identity, customKeyFunc);
    TestObject.prototype.prune = memoize.prune;

    function TestItem(id){ this.id = id; }
    TestItem.prototype.toString = function(){return this.id;};

    registerSuite({
        name: 'memoize'
      , memoize_basics: function() {
            var item = new TestObject()
              , valueA = new TestItem('a')
              // similarA will create the same key like valueA
              , similarA = new TestItem('a')
              , result
              ;
            assert.notStrictEqual(valueA, similarA, 'Must be different objects.');
            assert.strictEqual(valueA+'', similarA+'', 'Must serialize to the same value.');


            result = item.identity(valueA);
            assert.strictEqual(result, valueA, 'Result is valueA');

            result = item.identity(similarA);
            assert.strictEqual(result, valueA, 'Result is the cached object valueA');

            result = item.identity(valueA);
            assert.strictEqual(result, valueA, 'Result is the cached object valueA');

            // change the resulting serialization
            similarA.id = 'b';
            assert.notStrictEqual(valueA+'', similarA+'', 'Must serialize NOT to the same value anymore.');
            result = item.identity(similarA);
            assert.strictEqual(result, similarA, 'Result is similarA');
        }
      , memoize_prune: function() {
            var item = new TestObject()
              , valueA = new TestItem('a')
              , similarA = new TestItem('a')
              , result
              ;

            result = item.identity(valueA);
            assert.strictEqual(result, valueA, 'Result is valueA');

            result = item.identity(similarA);
            assert.strictEqual(result, valueA, 'Result is the cached object valueA');

            item.prune('identity');
            result = item.identity(similarA);
            assert.strictEqual(result, similarA, 'Result is similarA');

            result = item.identity(valueA);
            assert.strictEqual(result, similarA, 'Result is the cached object similarA');
        }
      , memoize_namespaces: function() {
            var item = new TestObject()
              , valueA = new TestItem('a')
              , similarA = new TestItem('a')
              , result
              ;

            result = item.identity(valueA);
            assert.strictEqual(result, valueA, 'Result is valueA');

            result = item.identity(similarA);
            assert.strictEqual(result, valueA, 'Result is the cached object valueA');

            result = item.identity2(similarA);
            assert.strictEqual(result, similarA, 'Result is similarA');

            result = item.identity2(valueA);
            assert.strictEqual(result, similarA, 'Result is the cached object similarA');

            item.prune('identity');

            result = item.identity(similarA);
            assert.strictEqual(result, similarA, 'Result is similarA');

            result = item.identity(valueA);
            assert.strictEqual(result, similarA, 'Result is the cached object similarA');

            result = item.identity2(valueA);
            assert.strictEqual(result, similarA, 'Result is the cached object similarA');

            item.prune('identity2');

            result = item.identity2(valueA);
            assert.strictEqual(result, valueA, 'Result is similarA');

            result = item.identity2(similarA);
            assert.strictEqual(result, valueA, 'Result is the cached object valueA');

            result = item.identity2(valueA);
            assert.strictEqual(result, valueA, 'Result is the cached object valueA');

            item.prune();

            result = item.identity(valueA);
            assert.strictEqual(result, valueA, 'Result is valueA');

            result = item.identity(similarA);
            assert.strictEqual(result, valueA, 'Result is the cached object valueA');

            result = item.identity2(similarA);
            assert.strictEqual(result, similarA, 'Result is similarA');

            result = item.identity2(valueA);
            assert.strictEqual(result, similarA, 'Result is the cached object similarA');

            result = item.identity2(similarA);
            assert.strictEqual(result, similarA, 'Result is the cached object similarA');
        }
      , memoize_standardKeyFunc: function() {
            var item = new TestObject()
              , valueA = new TestItem('a')
              , similarA = new TestItem('a')
              , result
              ;

            result = item.identity(valueA, 'a');
            assert.strictEqual(result, valueA, 'Result is valueA');

            result = item.identity(similarA, 'a');
            assert.strictEqual(result, valueA, 'Result is the cached object valueA');

            result = item.identity(similarA, 'b');
            assert.strictEqual(result, similarA, 'Result is similarA');

            result = item.identity(valueA, 'b');
            assert.strictEqual(result, similarA, 'Result is the cached object similarA');
        }
      , memoize_customKeyFunc: function() {
            var item = new TestObject()
              , valueA = new TestItem('a')
              , similarA = new TestItem('a')
              , result
              ;

            result = item.identity3(valueA, 'a');
            assert.strictEqual(result, valueA, 'Result is valueA');

            result = item.identity3(similarA, 'a');
            assert.strictEqual(result, valueA, 'Result is the cached object valueA');

            result = item.identity3(similarA, 'b');
            assert.strictEqual(result, valueA, 'Result is the cached object valueA');

            result = item.identity3(valueA, 'b');
            assert.strictEqual(result, valueA, 'Result is the cached object valueA');

            result = item.identity3(similarA, 'c');
            assert.strictEqual(result, similarA, 'Result is similarA');

            result = item.identity3(valueA, 'c');
            assert.strictEqual(result, similarA, 'Result is the cached object similarA');
        }
      , memoize_assertions: function() {
            assert.throw(function(){memoize.prune();}, errors.Assertion);
            assert.throw(function(){memoize(undefined, identity);}, errors.Assertion);
        }
      , memoize_different_hosts: function() {
            var itemA = new TestObject()
              , itemB = new TestObject()
              , valueA = new TestItem('a')
              , similarA = new TestItem('a')
              , result
              ;
            result = itemA.identity(valueA);
            assert.strictEqual(result, valueA, 'Result is valueA');

            result = itemB.identity(similarA);
            assert.strictEqual(result, similarA, 'Result is similarA');

            result = itemB.identity(valueA);
            assert.strictEqual(result, similarA, 'Result is the cached object similarA');

            result = itemA.identity(similarA);
            assert.strictEqual(result, valueA, 'Result is the cached object valueA');
        }
    });
});
