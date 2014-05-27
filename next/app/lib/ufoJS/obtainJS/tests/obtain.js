"use strict";
define([
    'intern!object',
    'intern/chai!assert',
    'lib/obtain',
    'lib/Promise'
], function (registerSuite, assert, obtain, Promise) {
    
    var echo_job = obtain.factory({},{},[], function(obtain, input){ return input; })
      , exception_job = obtain.factory({},{},[], function(obtain, input){throw new input(); })
      , get_callbacks = function(Err, input) {
            var dfd = this.async(1000);
            return {
                callback_should_run: dfd.callback(function (result) {
                    assert.equal(result, input, 'Result should be echoed input.');
                })
                , errback_should_run: dfd.callback(function(error) {
                    assert.instanceOf(error, Err, 'Error should be an Err.');
                })
                , callback_dont_run: dfd.callback(function (result) {
                    // this shouldn't run here ever
                    throw new Error('This shouldn\'t run here ever.');
                })
                , errback_dont_run: dfd.callback(function(error) {
                    // this shouldn't run here ever
                    throw new Error('This shouldn\'t run here ever.');
                })
            };
        }
      , getter_callbacks_job = obtain.factory(
            {}//no need for sync getters
          , {
                // if there is an error raise it, otherwise echo the echo value
                unified: ['_callback', 'echo', 'Error'
                    , function(_callback, echo, Error) {
                        setTimeout(function() {
                            if(Error)
                                _callback(new Error('rejected'), undefined)
                            else
                                _callback(undefined, echo)
                        }, 0);
                    }
                ]
              , divided: ['_callback', '_errback', 'echo', 'Error'
                    , function(_callback, _errback, echo, Error) {
                        setTimeout(function() {
                            if(Error)
                                _errback(new Error('rejected'))
                            else
                                _callback(echo)
                        }, 0);
                    }
                ]
              , promise: ['echo', 'Error'
                    , function(echo, Error) {
                        return new Promise(function(resolve, reject){
                            setTimeout(function() {
                                if(Error)
                                    reject(new Error('rejected'))
                                else
                                    resolve(echo)
                            }, 0)
                        })
                    }
                ]
            }
            , ['getter', 'echo', 'Error']
            , function(obtain, getter) {
                return obtain(getter);
            }
        )
      ;
        
    
    registerSuite({
        name: 'obtain',

        echo_sync: function () {
            var input = 'hello echo';
            assert.strictEqual(echo_job(false, input), input, 'Result should be echod input.');
        }
      , echo_async_divided: function() {
            var dfd = this.async(1000)
              , input = 'hello echo'
              // dfd.callback resolves the promise as long as no errors
              // are thrown from within the callback function
              , callbacks = {
                    callback: dfd.callback(function (result) {
                        assert.equal(result, input, 'Result should be echod input.');
                    })
                  , errback: dfd.callback(function(error) {
                    // this shouldn't run here ever
                    throw error;
                    })
                }
              ;
            echo_job(callbacks, input);
            // no need to return the promise; calling `async` makes the test async
        }
      , echo_async_unified: function() {
            var dfd = this.async(1000)
              , input = 'hello echo'
              , callback = {
                    unified: dfd.callback(function(error, result) {
                        if(error)
                            // this shouldn't run here ever
                            throw error;
                        else
                            assert.equal(result, input, 'Result should be echod input.');
                    })
                }
              ;
            echo_job(callback, input);
            // no need to return the promise; calling `async` makes the test async
        }
        , echo_async_promise: function() {
            var dfd = this.async(1000)
              , input = 'hello echo'
              , callback = dfd.callback(function (result) {
                    assert.equal(result, input, 'Result should be echoed input.');
                })
              , errback = dfd.callback(function(error) {
                    // this shouldn't run here ever
                    throw error;
                })
              ;
            echo_job(true, input).then(callback, errback);
        }
      , except_sync: function() {
            var Err = function(){};
            assert.throws(exception_job.bind(null, false, Err), Err,
                                    undefined, 'Err should be raised.');
        }
      , except_async_divided: function() {
            var dfd = this.async(1000)
              , Err = function(){}
              , callbacks = {
                    callback: dfd.callback(function(result) {
                        // this shouldn't run here ever
                        throw new Error('This shouldn\'t run here ever.');
                    })
                  , errback: dfd.callback(function(error) {
                        assert.instanceOf(error, Err, 'Error should be an Err.');
                    })
                }
              ;
            exception_job(callbacks, Err);
        }
      , except_async_unified: function() {
            var dfd = this.async(1000)
              , Err = function(){}
              , callback = {
                    unified: dfd.callback(function(error, result) {
                        if(error)
                            assert.instanceOf(error, Err, 'Error should be an Err.');
                        else
                            // this shouldn't run here ever
                            throw new Error('This shouldn\'t run here ever.');
                    })
                }
              ;
            exception_job(callback, Err);
        }
      , except_async_promise: function() {
            var dfd = this.async(1000)
              , Err = function(){}
              , callback = dfd.callback(function (result) {
                    // this shouldn't run here ever
                    throw new Error('This shouldn\'t run here ever.');
                })
              , errback = dfd.callback(function(error) {
                    assert.instanceOf(error, Err, 'Error should be an Err.');
                })
              ;
            exception_job(true, Err).then(callback, errback)
        }
      , allsync_job: function() {
            var concatinating_sync_job = obtain.factory(
                    {
                       A: ['B', function(B) {
                            return ['sync A'].concat(B);
                       }]
                     , B: ['C', 'D', function(C, D) {
                           return ['sync B'].concat(C, D);
                       }]
                     , C: [function(){return ['sync C'];}]
                     , D: [['static E'] /* as an array-value */
                          , function(E){return ['sync D'].concat(E);}]
                    }
                  , {} // no async getters
                  , ['end']
                  , function(obtain, end) {
                        // this is a var of the closure
                        execution_indicator = true;
                        return obtain('A').concat(obtain('end')).join(', ');
                    }
                )
              , expect = 'sync A, sync B, sync C, sync D, static E, End'
              // even if async execution is made, there are only sync getters defined
              , expect_async = 'sync A, sync B, sync C, sync D, static E, async End'
              , result
              // test for delayed execution, too:
              , execution_indicator = false
              , promise
              ;
            result = concatinating_sync_job(false, 'End');
            assert.isTrue(execution_indicator, 'This must be true when job already executed.');
            assert.equal(expect, result, 'getters execute, a "static" getter does so, too');
            
            // reset indicator
            execution_indicator = false;
            promise = concatinating_sync_job(true, 'async End');
            assert.isFalse(execution_indicator, 'The execution of job is expected to be deffered to later.');
            
            return promise.then(function(result_b) {
                assert.isTrue(execution_indicator, 'Job indicates that it was executed (at least once).');
                assert.equal(expect_async, result_b)
            });
        }
      , mixed_sync_async_job: function() {
            var concatinating_job = obtain.factory(
                    {
                        A: ['B', function(B) {
                            return ['sync A'].concat(B);
                        }]
                      , B: ['C', 'D', function(C, D) {
                           return ['sync B'].concat(C, D);
                        }]
                      , C: [function(){return ['sync C'];}]
                      , D: [new obtain.Argument('static E') /* as an generic Argument-value */
                          , function(E){return ['sync D'].concat([E]);}]
                    }
                  , {  // some async getters
                        B: ['C', 'D', '_callback', function(C, D, callback) {
                            setTimeout(function(){
                                callback(null, ['async B'].concat(C, D));
                            }, 0)
                        }]
                      , C: ['_errback', '_callback', function(errback, callback) {
                            setTimeout(function(){
                                callback(['async C']);
                            }, 0);
                        }]
                    }
                  , ['end']
                  , function(obtain, end) {
                        return obtain('A').concat(obtain('end')).join(', ');
                    }
                )
              , expect = 'sync A, sync B, sync C, sync D, static E, End'
              , expect_async = 'sync A, async B, async C, sync D, static E, async End'
              , result
              , promise
              ;
            result = concatinating_job(false, 'End');
            assert.equal(expect, result, 'getters execute, a "static" getter does so, too');
            
            promise = concatinating_job(true, 'async End');
            return promise.then(function(result_b) {
                assert.equal(expect_async, result_b)
            });
        }
      , all_async_job: function() {
            var concatinating_async_job = obtain.factory(
                    {}
                  , {
                        A: ['B' , , function(B) {
                            return new Promise(function(resolve, _) {
                                resolve(['async A'].concat(B))
                            })}
                        ]
                      
                      , B: ['C', 'D', '_callback', function(C, D, callback) {
                            setTimeout(function(){
                                callback(null, ['async B'].concat(C, D));
                            }, 0)}
                        ]
                      , C: ['_errback', '_callback', function(errback, callback) {
                            setTimeout(function(){
                                callback(['async C']);
                            }, 0);}
                        ]
                      , D: [
                                new String('static E') /* as a static string value */
                              , '_callback', '_errback'
                              , function(E, _callback, _errback) {
                                    setTimeout(function(){
                                        _callback(['async D'].concat([E]))
                                    }, 0);
                                }
                        ]
                    }
                  , ['end']
                  , function(obtain, end) {
                        return obtain('A').concat(obtain('end')).join(', ');
                    }
                )
              , expect = 'async A, async B, async C, async D, static E, async End'
              , promise
              ;
              
              
            assert.throw(
                concatinating_async_job.bind(null, false, 'sync End')
              , obtain.DependencyGraphError, undefined, 'Not found in DependencyGraph');
            
            promise = concatinating_async_job(true, 'async End');
            return promise.then(function(result) {
                assert.equal(expect, result)
            });
        }
      , getter_callbacks_unified_error: function() {
            var Err = function(){}
              , input = {generic: 'input object'}
              , cbs = get_callbacks.call(this, Err, input)
              ;
            getter_callbacks_job(true, 'unified', undefined, Err)
                .then(cbs.callback_dont_run, cbs.errback_should_run)
                ;
        }
      , getter_callbacks_unified_echo: function() {
            var Err = function(){}
              , input = {generic: 'input object'}
              , cbs = get_callbacks.call(this, Err, input)
              ;
            getter_callbacks_job(true, 'unified', input, undefined)
                .then(cbs.callback_should_run, cbs.errback_dont_run)
                ;
        }
      , getter_callbacks_divided_error: function() {
            var Err = function(){}
              , input = {generic: 'input object'}
              , cbs = get_callbacks.call(this, Err, input)
              ;
            getter_callbacks_job(true, 'divided', undefined, Err)
                .then(cbs.callback_dont_run, cbs.errback_should_run)
                ;
        }
      , getter_callbacks_divided_echo: function() {
            var Err = function(){}
              , input = {generic: 'input object'}
              , cbs = get_callbacks.call(this, Err, input)
              ;
            getter_callbacks_job(true, 'divided', input, undefined)
                .then(cbs.callback_should_run, cbs.errback_dont_run)
                ;
        }
      , getter_callbacks_promise_error: function() {
            var Err = function(){}
              , input = {generic: 'input object'}
              , cbs = get_callbacks.call(this, Err, input)
              ;
            getter_callbacks_job(true, 'promise', undefined, Err)
                .then(cbs.callback_dont_run, cbs.errback_should_run)
                ;
        }
      , getter_callbacks_promise_echo: function() {
            var Err = function(){}
              , input = {generic: 'input object'}
              , cbs = get_callbacks.call(this, Err, input)
              ;
            getter_callbacks_job(true, 'promise', input, undefined)
                .then(cbs.callback_should_run, cbs.errback_dont_run)
                ;
        }
    });
});
