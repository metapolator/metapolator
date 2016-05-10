/**
 * Copyright (c) 2014, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * https://raw.github.com/facebook/regenerator/master/LICENSE file. An
 * additional grant of patent rights can be found in the PATENTS file in
 * the same directory.
 */

!(function(global) {
  "use strict";

  var hasOwn = Object.prototype.hasOwnProperty;
  var undefined; // More compressible than void 0.
  var $Symbol = typeof Symbol === "function" ? Symbol : {};
  var iteratorSymbol = $Symbol.iterator || "@@iterator";
  var toStringTagSymbol = $Symbol.toStringTag || "@@toStringTag";

  var inModule = typeof module === "object";
  var runtime = global.regeneratorRuntime;
  if (runtime) {
    if (inModule) {
      // If regeneratorRuntime is defined globally and we're in a module,
      // make the exports object identical to regeneratorRuntime.
      module.exports = runtime;
    }
    // Don't bother evaluating the rest of this file if the runtime was
    // already defined globally.
    return;
  }

  // Define the runtime globally (as expected by generated code) as either
  // module.exports (if we're in a module) or a new, empty object.
  runtime = global.regeneratorRuntime = inModule ? module.exports : {};

  function wrap(innerFn, outerFn, self, tryLocsList) {
    // If outerFn provided, then outerFn.prototype instanceof Generator.
    var generator = Object.create((outerFn || Generator).prototype);
    var context = new Context(tryLocsList || []);

    // The ._invoke method unifies the implementations of the .next,
    // .throw, and .return methods.
    generator._invoke = makeInvokeMethod(innerFn, self, context);

    return generator;
  }
  runtime.wrap = wrap;

  // Try/catch helper to minimize deoptimizations. Returns a completion
  // record like context.tryEntries[i].completion. This interface could
  // have been (and was previously) designed to take a closure to be
  // invoked without arguments, but in all the cases we care about we
  // already have an existing method we want to call, so there's no need
  // to create a new function object. We can even get away with assuming
  // the method takes exactly one argument, since that happens to be true
  // in every case, so we don't have to touch the arguments object. The
  // only additional allocation required is the completion record, which
  // has a stable shape and so hopefully should be cheap to allocate.
  function tryCatch(fn, obj, arg) {
    try {
      return { type: "normal", arg: fn.call(obj, arg) };
    } catch (err) {
      return { type: "throw", arg: err };
    }
  }

  var GenStateSuspendedStart = "suspendedStart";
  var GenStateSuspendedYield = "suspendedYield";
  var GenStateExecuting = "executing";
  var GenStateCompleted = "completed";

  // Returning this object from the innerFn has the same effect as
  // breaking out of the dispatch switch statement.
  var ContinueSentinel = {};

  // Dummy constructor functions that we use as the .constructor and
  // .constructor.prototype properties for functions that return Generator
  // objects. For full spec compliance, you may wish to configure your
  // minifier not to mangle the names of these two functions.
  function Generator() {}
  function GeneratorFunction() {}
  function GeneratorFunctionPrototype() {}

  var Gp = GeneratorFunctionPrototype.prototype = Generator.prototype;
  GeneratorFunction.prototype = Gp.constructor = GeneratorFunctionPrototype;
  GeneratorFunctionPrototype.constructor = GeneratorFunction;
  GeneratorFunctionPrototype[toStringTagSymbol] = GeneratorFunction.displayName = "GeneratorFunction";

  // Helper for defining the .next, .throw, and .return methods of the
  // Iterator interface in terms of a single ._invoke method.
  function defineIteratorMethods(prototype) {
    ["next", "throw", "return"].forEach(function(method) {
      prototype[method] = function(arg) {
        return this._invoke(method, arg);
      };
    });
  }

  runtime.isGeneratorFunction = function(genFun) {
    var ctor = typeof genFun === "function" && genFun.constructor;
    return ctor
      ? ctor === GeneratorFunction ||
        // For the native GeneratorFunction constructor, the best we can
        // do is to check its .name property.
        (ctor.displayName || ctor.name) === "GeneratorFunction"
      : false;
  };

  runtime.mark = function(genFun) {
    if (Object.setPrototypeOf) {
      Object.setPrototypeOf(genFun, GeneratorFunctionPrototype);
    } else {
      genFun.__proto__ = GeneratorFunctionPrototype;
      if (!(toStringTagSymbol in genFun)) {
        genFun[toStringTagSymbol] = "GeneratorFunction";
      }
    }
    genFun.prototype = Object.create(Gp);
    return genFun;
  };

  // Within the body of any async function, `await x` is transformed to
  // `yield regeneratorRuntime.awrap(x)`, so that the runtime can test
  // `value instanceof AwaitArgument` to determine if the yielded value is
  // meant to be awaited. Some may consider the name of this method too
  // cutesy, but they are curmudgeons.
  runtime.awrap = function(arg) {
    return new AwaitArgument(arg);
  };

  function AwaitArgument(arg) {
    this.arg = arg;
  }

  function AsyncIterator(generator) {
    function invoke(method, arg, resolve, reject) {
      var record = tryCatch(generator[method], generator, arg);
      if (record.type === "throw") {
        reject(record.arg);
      } else {
        var result = record.arg;
        var value = result.value;
        if (value instanceof AwaitArgument) {
          return Promise.resolve(value.arg).then(function(value) {
            invoke("next", value, resolve, reject);
          }, function(err) {
            invoke("throw", err, resolve, reject);
          });
        }

        return Promise.resolve(value).then(function(unwrapped) {
          // When a yielded Promise is resolved, its final value becomes
          // the .value of the Promise<{value,done}> result for the
          // current iteration. If the Promise is rejected, however, the
          // result for this iteration will be rejected with the same
          // reason. Note that rejections of yielded Promises are not
          // thrown back into the generator function, as is the case
          // when an awaited Promise is rejected. This difference in
          // behavior between yield and await is important, because it
          // allows the consumer to decide what to do with the yielded
          // rejection (swallow it and continue, manually .throw it back
          // into the generator, abandon iteration, whatever). With
          // await, by contrast, there is no opportunity to examine the
          // rejection reason outside the generator function, so the
          // only option is to throw it from the await expression, and
          // let the generator function handle the exception.
          result.value = unwrapped;
          resolve(result);
        }, reject);
      }
    }

    if (typeof process === "object" && process.domain) {
      invoke = process.domain.bind(invoke);
    }

    var previousPromise;

    function enqueue(method, arg) {
      function callInvokeWithMethodAndArg() {
        return new Promise(function(resolve, reject) {
          invoke(method, arg, resolve, reject);
        });
      }

      return previousPromise =
        // If enqueue has been called before, then we want to wait until
        // all previous Promises have been resolved before calling invoke,
        // so that results are always delivered in the correct order. If
        // enqueue has not been called before, then it is important to
        // call invoke immediately, without waiting on a callback to fire,
        // so that the async generator function has the opportunity to do
        // any necessary setup in a predictable way. This predictability
        // is why the Promise constructor synchronously invokes its
        // executor callback, and why async functions synchronously
        // execute code before the first await. Since we implement simple
        // async functions in terms of async generators, it is especially
        // important to get this right, even though it requires care.
        previousPromise ? previousPromise.then(
          callInvokeWithMethodAndArg,
          // Avoid propagating failures to Promises returned by later
          // invocations of the iterator.
          callInvokeWithMethodAndArg
        ) : callInvokeWithMethodAndArg();
    }

    // Define the unified helper method that is used to implement .next,
    // .throw, and .return (see defineIteratorMethods).
    this._invoke = enqueue;
  }

  defineIteratorMethods(AsyncIterator.prototype);

  // Note that simple async functions are implemented on top of
  // AsyncIterator objects; they just return a Promise for the value of
  // the final result produced by the iterator.
  runtime.async = function(innerFn, outerFn, self, tryLocsList) {
    var iter = new AsyncIterator(
      wrap(innerFn, outerFn, self, tryLocsList)
    );

    return runtime.isGeneratorFunction(outerFn)
      ? iter // If outerFn is a generator, return the full iterator.
      : iter.next().then(function(result) {
          return result.done ? result.value : iter.next();
        });
  };

  function makeInvokeMethod(innerFn, self, context) {
    var state = GenStateSuspendedStart;

    return function invoke(method, arg) {
      if (state === GenStateExecuting) {
        throw new Error("Generator is already running");
      }

      if (state === GenStateCompleted) {
        if (method === "throw") {
          throw arg;
        }

        // Be forgiving, per 25.3.3.3.3 of the spec:
        // https://people.mozilla.org/~jorendorff/es6-draft.html#sec-generatorresume
        return doneResult();
      }

      while (true) {
        var delegate = context.delegate;
        if (delegate) {
          if (method === "return" ||
              (method === "throw" && delegate.iterator[method] === undefined)) {
            // A return or throw (when the delegate iterator has no throw
            // method) always terminates the yield* loop.
            context.delegate = null;

            // If the delegate iterator has a return method, give it a
            // chance to clean up.
            var returnMethod = delegate.iterator["return"];
            if (returnMethod) {
              var record = tryCatch(returnMethod, delegate.iterator, arg);
              if (record.type === "throw") {
                // If the return method threw an exception, let that
                // exception prevail over the original return or throw.
                method = "throw";
                arg = record.arg;
                continue;
              }
            }

            if (method === "return") {
              // Continue with the outer return, now that the delegate
              // iterator has been terminated.
              continue;
            }
          }

          var record = tryCatch(
            delegate.iterator[method],
            delegate.iterator,
            arg
          );

          if (record.type === "throw") {
            context.delegate = null;

            // Like returning generator.throw(uncaught), but without the
            // overhead of an extra function call.
            method = "throw";
            arg = record.arg;
            continue;
          }

          // Delegate generator ran and handled its own exceptions so
          // regardless of what the method was, we continue as if it is
          // "next" with an undefined arg.
          method = "next";
          arg = undefined;

          var info = record.arg;
          if (info.done) {
            context[delegate.resultName] = info.value;
            context.next = delegate.nextLoc;
          } else {
            state = GenStateSuspendedYield;
            return info;
          }

          context.delegate = null;
        }

        if (method === "next") {
          if (state === GenStateSuspendedYield) {
            context.sent = arg;
          } else {
            context.sent = undefined;
          }

        } else if (method === "throw") {
          if (state === GenStateSuspendedStart) {
            state = GenStateCompleted;
            throw arg;
          }

          if (context.dispatchException(arg)) {
            // If the dispatched exception was caught by a catch block,
            // then let that catch block handle the exception normally.
            method = "next";
            arg = undefined;
          }

        } else if (method === "return") {
          context.abrupt("return", arg);
        }

        state = GenStateExecuting;

        var record = tryCatch(innerFn, self, context);
        if (record.type === "normal") {
          // If an exception is thrown from innerFn, we leave state ===
          // GenStateExecuting and loop back for another invocation.
          state = context.done
            ? GenStateCompleted
            : GenStateSuspendedYield;

          var info = {
            value: record.arg,
            done: context.done
          };

          if (record.arg === ContinueSentinel) {
            if (context.delegate && method === "next") {
              // Deliberately forget the last sent value so that we don't
              // accidentally pass it on to the delegate.
              arg = undefined;
            }
          } else {
            return info;
          }

        } else if (record.type === "throw") {
          state = GenStateCompleted;
          // Dispatch the exception by looping back around to the
          // context.dispatchException(arg) call above.
          method = "throw";
          arg = record.arg;
        }
      }
    };
  }

  // Define Generator.prototype.{next,throw,return} in terms of the
  // unified ._invoke helper method.
  defineIteratorMethods(Gp);

  Gp[iteratorSymbol] = function() {
    return this;
  };

  Gp[toStringTagSymbol] = "Generator";

  Gp.toString = function() {
    return "[object Generator]";
  };

  function pushTryEntry(locs) {
    var entry = { tryLoc: locs[0] };

    if (1 in locs) {
      entry.catchLoc = locs[1];
    }

    if (2 in locs) {
      entry.finallyLoc = locs[2];
      entry.afterLoc = locs[3];
    }

    this.tryEntries.push(entry);
  }

  function resetTryEntry(entry) {
    var record = entry.completion || {};
    record.type = "normal";
    delete record.arg;
    entry.completion = record;
  }

  function Context(tryLocsList) {
    // The root entry object (effectively a try statement without a catch
    // or a finally block) gives us a place to store values thrown from
    // locations where there is no enclosing try statement.
    this.tryEntries = [{ tryLoc: "root" }];
    tryLocsList.forEach(pushTryEntry, this);
    this.reset(true);
  }

  runtime.keys = function(object) {
    var keys = [];
    for (var key in object) {
      keys.push(key);
    }
    keys.reverse();

    // Rather than returning an object with a next method, we keep
    // things simple and return the next function itself.
    return function next() {
      while (keys.length) {
        var key = keys.pop();
        if (key in object) {
          next.value = key;
          next.done = false;
          return next;
        }
      }

      // To avoid creating an additional object, we just hang the .value
      // and .done properties off the next function object itself. This
      // also ensures that the minifier will not anonymize the function.
      next.done = true;
      return next;
    };
  };

  function values(iterable) {
    if (iterable) {
      var iteratorMethod = iterable[iteratorSymbol];
      if (iteratorMethod) {
        return iteratorMethod.call(iterable);
      }

      if (typeof iterable.next === "function") {
        return iterable;
      }

      if (!isNaN(iterable.length)) {
        var i = -1, next = function next() {
          while (++i < iterable.length) {
            if (hasOwn.call(iterable, i)) {
              next.value = iterable[i];
              next.done = false;
              return next;
            }
          }

          next.value = undefined;
          next.done = true;

          return next;
        };

        return next.next = next;
      }
    }

    // Return an iterator with no values.
    return { next: doneResult };
  }
  runtime.values = values;

  function doneResult() {
    return { value: undefined, done: true };
  }

  Context.prototype = {
    constructor: Context,

    reset: function(skipTempReset) {
      this.prev = 0;
      this.next = 0;
      this.sent = undefined;
      this.done = false;
      this.delegate = null;

      this.tryEntries.forEach(resetTryEntry);

      if (!skipTempReset) {
        for (var name in this) {
          // Not sure about the optimal order of these conditions:
          if (name.charAt(0) === "t" &&
              hasOwn.call(this, name) &&
              !isNaN(+name.slice(1))) {
            this[name] = undefined;
          }
        }
      }
    },

    stop: function() {
      this.done = true;

      var rootEntry = this.tryEntries[0];
      var rootRecord = rootEntry.completion;
      if (rootRecord.type === "throw") {
        throw rootRecord.arg;
      }

      return this.rval;
    },

    dispatchException: function(exception) {
      if (this.done) {
        throw exception;
      }

      var context = this;
      function handle(loc, caught) {
        record.type = "throw";
        record.arg = exception;
        context.next = loc;
        return !!caught;
      }

      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        var record = entry.completion;

        if (entry.tryLoc === "root") {
          // Exception thrown outside of any try block that could handle
          // it, so set the completion value of the entire function to
          // throw the exception.
          return handle("end");
        }

        if (entry.tryLoc <= this.prev) {
          var hasCatch = hasOwn.call(entry, "catchLoc");
          var hasFinally = hasOwn.call(entry, "finallyLoc");

          if (hasCatch && hasFinally) {
            if (this.prev < entry.catchLoc) {
              return handle(entry.catchLoc, true);
            } else if (this.prev < entry.finallyLoc) {
              return handle(entry.finallyLoc);
            }

          } else if (hasCatch) {
            if (this.prev < entry.catchLoc) {
              return handle(entry.catchLoc, true);
            }

          } else if (hasFinally) {
            if (this.prev < entry.finallyLoc) {
              return handle(entry.finallyLoc);
            }

          } else {
            throw new Error("try statement without catch or finally");
          }
        }
      }
    },

    abrupt: function(type, arg) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.tryLoc <= this.prev &&
            hasOwn.call(entry, "finallyLoc") &&
            this.prev < entry.finallyLoc) {
          var finallyEntry = entry;
          break;
        }
      }

      if (finallyEntry &&
          (type === "break" ||
           type === "continue") &&
          finallyEntry.tryLoc <= arg &&
          arg <= finallyEntry.finallyLoc) {
        // Ignore the finally entry if control is not jumping to a
        // location outside the try/catch block.
        finallyEntry = null;
      }

      var record = finallyEntry ? finallyEntry.completion : {};
      record.type = type;
      record.arg = arg;

      if (finallyEntry) {
        this.next = finallyEntry.finallyLoc;
      } else {
        this.complete(record);
      }

      return ContinueSentinel;
    },

    complete: function(record, afterLoc) {
      if (record.type === "throw") {
        throw record.arg;
      }

      if (record.type === "break" ||
          record.type === "continue") {
        this.next = record.arg;
      } else if (record.type === "return") {
        this.rval = record.arg;
        this.next = "end";
      } else if (record.type === "normal" && afterLoc) {
        this.next = afterLoc;
      }
    },

    finish: function(finallyLoc) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.finallyLoc === finallyLoc) {
          this.complete(entry.completion, entry.afterLoc);
          resetTryEntry(entry);
          return ContinueSentinel;
        }
      }
    },

    "catch": function(tryLoc) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.tryLoc === tryLoc) {
          var record = entry.completion;
          if (record.type === "throw") {
            var thrown = record.arg;
            resetTryEntry(entry);
          }
          return thrown;
        }
      }

      // The context.catch method must only be called with a location
      // argument that corresponds to a known catch block.
      throw new Error("illegal catch attempt");
    },

    delegateYield: function(iterable, resultName, nextLoc) {
      this.delegate = {
        iterator: values(iterable),
        resultName: resultName,
        nextLoc: nextLoc
      };

      return ContinueSentinel;
    }
  };
})(
  // Among the various tricks for obtaining a reference to the global
  // object, this seems to be the most reliable technique that does not
  // use indirect eval (which violates Content Security Policy).
  typeof global === "object" ? global :
  typeof window === "object" ? window :
  typeof self === "object" ? self : this
);
define([
    'Atem-MOM/errors'
  , 'ufojs/errors'
  , 'obtain/obtain'
  , 'Atem-MOM/cpsTools'
  , 'Atem-Math-Tools/Vector'
  , './ufo/SegmentPen'
  , './ufo/ImportOutlinePen'
  , './ufo/StrokeContour'
  , './ufo/contourFromContour'

  , 'Atem-MOM/MOM/Master'
  , 'Atem-MOM/MOM/Glyph'
  , 'Atem-MOM/MOM/PenStroke'
  , 'Atem-MOM/MOM/PenStrokeCenter'
  , 'Atem-MOM/MOM/Contour'
  , 'Atem-MOM/MOM/ContourPoint'
  , 'Atem-MOM/MOM/Component'

], function(
    errors
  , ufojsErrors
  , obtain
  , cpsTools
  , Vector
  , SegmentPen
  , ImportOutlinePen
  , StrokeContour
  , contourFromContour

  , Master
  , Glyph
  , PenStroke
  , PenStrokeCenter
  , Contour
  , ContourPoint
  , Component
) {
    "use strict";
    // jshint esnext:true

    var GlifLibError = ufojsErrors.GlifLib
      , setElementProperties = cpsTools.setElementProperties
      , NotImplementedError = errors.NotImplemented
      , ImportError = errors.Import
      ;

    /**
     * options:
     * {
     *    // String: Set the UFO Layer to import.
     *    // default: undefined (imports the default layer)
     *    layerName: 'aLayerName'
     *
     *    // String: Set the name (id) of the mom master. Usually you want
     *    // this to be present, but in some cases it can be useful not
     *    // setting an id.
     *    // default: undefined
     *    masterName: 'base'
     *
     *    // Dict: glyphs groups as returned by ufoReader.readGroups
     *    // will be used as a source for class names of the glyphs
     *    // if present
     *    // default: undefined
     *    classes: {groupName: ['glyph', 'names' ...] },
     *
     *    // Boolean: use the groups of the source UFO as a source for
     *    // class names of the glyphs
     *    // default:
     *    addSourceGlyphClasses: true,
     *
     *    // Dict: map prefixes of UFO contour identifiers to contour
     *    // import types.
     *    // default:
     *    contourImportTypeIndicators: {
     *         'C:': 'Contour'
     *       , 'P:': 'PenStroke'
     *    },
     *
     *    // String: set the default contour import type in case no
     *    // contourImportTypeIndicator matches.
     *    defaultContourContourImportType: 'PenStroke'
     *
     *    // Dict: Map ImportType to ImportType.
     *    // If a type can't be created from the contour, this maps to
     *    // a fallback type. E.g. if a "PenStroke" type can't be imported
     *    // the default setup tries to import a "Contour"
     *    // default:
     *    contourImportTypeFallbacks: { 'PenStroke': 'Contour' },
     *
     *    // Boolean: import open contours if false.
     *    // This is untested and at the moment probably incompatible with
     *    // the rest of the MOM Tools and maybe even failing in here.
     *    // default:
     *    skipOpenContours: true
     * }
     *
     * Available contour import types: PenStroke, Contour
     */
    function UFOImporter(log, ufoReader, options) {
        var options_ = options || {};
        this._log = log;
        this._ufoReader = ufoReader;
        this._glyphClasses = null;
        this._sourceGlyphClasses = null;

        // falsy means: take the default layer
        this._layerName = options_.layerName || undefined;

        this._masterName = options_.masterName || null;

        if(options_.classes)
            this._glyphClasses = this._reverseGlyphGroups(options_.classes);

        this._addSourceGlyphClasses = 'addSourceGlyphClasses' in options_
                ? !!options_.addSourceGlyphClasses
                : true
                ;

        this._indicatorToContourImportType = options_.contourImportTypeIndicators
                 || {
                          'C': 'Contour'
                        , 'P': 'PenStroke'
                    };

        this._defaultContourImportType = options_.defaultContourContourImportType
                || 'PenStroke';

        this._contourImportTypeFallbacks = options_.contourImportTypeFallbacks
                || { 'PenStroke': 'Contour' };

        this._skipOpenContours = 'skipOpenContours' in options_
                ? !!options_.skipOpenContours
                : true
                ;
    }
    var _p = UFOImporter.prototype;

    _p._reverseGlyphGroups = function(groups) {
        var result = Object.create(null)
          , group, i, l, glyphName
          ;
        for(group in groups) {
            for(i=0,l=groups[group].length;i<l;i++) {
                glyphName = groups[group][i];
                if(!(glyphName in result))
                    result[glyphName] = [];
                result[glyphName].push(group);
            }
        }
        return result;
    };

    _p._getSourceGlyphClasses = function(async) {
        var sourceGroups = this._ufoReader.readGroups(true)
          , onData = (function(sourceGroups) {
                return this._reverseGlyphGroups(sourceGroups);
            }).bind(this)
          ;
        if(async)
            return sourceGroups.then(onData);
        return sourceGroups;
    };

    /**
     * NOTE: This performs IO via ufoReader.getGlyphSet
     */
    _p._getSourceGlyphSet = function(async) {
        var options;
        // tell us about errors
        options = {
            readErrorCallback: function( masterName, metadata ) {
                this._log.warning('ImportController: Got an error loading glyph "'
                                + metadata.glyphName + ' for master '
                                + (masterName ?  '"'+ masterName +'"' : '(unnamed)')
                                + ' reason:' + metadata.message );
                // try to continue
                return true;
            }.bind( this, this._masterName )
        };

        return this._ufoReader.getGlyphSet(
                            async, this._layerName, undefined, options);
    };

    _p.init = obtain.factory(
        {
            init: [function() {
                this._sourceGlyphSet = this._getSourceGlyphSet(false);
                if(this._addSourceGlyphClasses)
                    this._sourceGlyphClasses = this._getSourceGlyphClasses(false);
                return this;
            }]
        }
      , {
            classes: [true, _p._getSourceGlyphClasses]
          , glyphSet: [true, _p._getSourceGlyphSet]

          , init: ['glyphSet', 'classes', function(glyphSet, classes) {
                this._sourceGlyphSet = glyphSet;
                this._sourceGlyphClasses = classes;
                return this;
            }]
        }
      , []
      , function(obtain){ return obtain('init'); }
    );

    UFOImporter.factory = function(async /* , UFOImporter arguments .... */ ) {
        var instance = Object.create(UFOImporter.prototype)
          , args = Array.prototype.slice.call(arguments, 1)
          ;
        UFOImporter.apply(instance, args);
        return instance.init(async);
    };

    /**
     * processCallback is optional.
     * If processCallback is given  and returns `false` we abort.
     * processCallback can be used to display progress it is called like:
     *          processCallback(glyphName, index, numberOfGlyphs);
     *
     * TODO: This should probably become a generator, so that we can
     *       update the display between iterations...
     */


    _p.doImport = function(async, glyphs) {
        var gen = this.importGenerator(async, glyphs), result;
        while(!(result = gen.next()).done);
        return result.value;
    };

    _p.importGenerator = regeneratorRuntime.mark(function callee$1$0(async, glyphs) {
        var missing, i, l, fontinfo, master, glyphName, glyph, carryOn;

        return regeneratorRuntime.wrap(function callee$1$0$(context$2$0) {
            while (1) switch (context$2$0.prev = context$2$0.next) {
            case 0:
                if (!async) {
                    context$2$0.next = 2;
                    break;
                }

                throw new NotImplementedError('doImport currently only supports '
                                                    +'synchronous execution.');
            case 2:
                if (glyphs) {
                    context$2$0.next = 7;
                    break;
                }

                glyphs = this._sourceGlyphSet.keys();
                context$2$0.next = 10;
                break;
            case 7:
                missing = glyphs.filter(function(name) {
                            return !this._sourceGlyphSet.has_key(name);}, this);

                if (!missing.length) {
                    context$2$0.next = 10;
                    break;
                }

                throw new errors.Key('Some glyphs requested for import '
                                    +'are missing in the source GlyphSet: '
                                    + missing.join(', '));
            case 10:
                fontinfo = this._ufoReader.readInfo(false);
                master = this._makeMaster(this._masterName, fontinfo);

                i=0,l=glyphs.length;
            case 13:
                if (!(i < l)) {
                    context$2$0.next = 34;
                    break;
                }

                glyphName = glyphs[i];
                context$2$0.next = 17;
                return {i:i, total:l, 'glyphName':glyphName};
            case 17:
                carryOn = context$2$0.sent;

                if (!(carryOn === false)) {
                    context$2$0.next = 21;
                    break;
                }

                this._log.info('Canceling UFO import of "'
                                            + this._ufoReader.path + '".');
                return context$2$0.abrupt("return", false);
            case 21:
                context$2$0.prev = 21;
                // in the end, getting a glyph from a glyphset can make
                // io, but because of the involved recursion in reading
                // components, there's no async path yet!
                glyph = this.importGlyph(glyphName);
                context$2$0.next = 30;
                break;
            case 25:
                context$2$0.prev = 25;
                context$2$0.t0 = context$2$0["catch"](21);

                if (context$2$0.t0 instanceof GlifLibError) {
                    context$2$0.next = 29;
                    break;
                }

                throw context$2$0.t0;
            case 29:
                return context$2$0.abrupt("continue", 31);
            case 30:
                master.add(glyph);
            case 31:
                i++;
                context$2$0.next = 13;
                break;
            case 34:
                return context$2$0.abrupt("return", master);
            case 35:
            case "end":
                return context$2$0.stop();
            }
        }, callee$1$0, this, [[21, 25]]);
    });

    _p._readGlyphFromSource = function(glyphName) {
            // this does io!
        var glyph = this._sourceGlyphSet.get(glyphName)
          , segmentPen = new SegmentPen()
          , pen = new ImportOutlinePen(segmentPen, true)
          ;

        glyph.drawPoints(false, pen);
        return {data:glyph, contours:segmentPen.flush()};
    };

    _p._makeMaster = function (masterName, fontinfo) {
        var master = new Master();
        if(masterName)
            master.id = masterName;
        if(fontinfo)
            master.attachData('fontinfo', fontinfo);
        return master;
    };

    _p._makeGlyph = function(glyphName, data) {
        var glyph = new Glyph()
          , key
          , properties = {}
          ;
        glyph.id = glyphName;

        // used in CPS:
        //  'width'      the advance with of the glyph
        //  'height'     the advance height of the glyph
        //
        // as data / not used:
        //  'unicodes'   a list of unicode values for this glyph
        //  'note'       a string
        //  'lib'        a dictionary containing custom data
        //  'image'      a dictionary containing image data
        //  'guidelines' a list of guideline data dictionaries
        //  'anchors'    a list of anchor data dictionaries
        //
        // TODO: Maybe we need another layer of MOM elements, analogous
        // to the structure in GLIF: outline, anchors, guidelines ...
        // what to do with lib? there's not much use to have it in cps.
        // The only thing is that it's there.

        if(data.width)
            properties.width = data.width;
        if(data.height)
            properties.height = data.height;
        setElementProperties(glyph, properties);

        for(key in data)
            if(!(key in {width:1, height:1}))
                glyph.attachData(key, data[key]);

        if(this._glyphClasses && glyphName in this._glyphClasses)
            glyph.setClasses(this._glyphClasses[glyphName]);
        if(this._sourceGlyphClasses && glyphName in this._sourceGlyphClasses)
            glyph.setClasses(this._sourceGlyphClasses[glyphName]);
        return glyph;
    };

    _p._makeComponent = function(item) {
        var component = new Component();
        setElementProperties(component, {
            baseGlyphName: '"' + item.glyphName + '"'
          , transformation:  'Transformation ' + item.transformation.join(' ')
        });
        return component;
    };

    _p._makeCPSPointData = function (point, index, length) {
        var left={}, center={}, right={}
          , rightOnIntrinsic
          ;

        // center
        center.on = point.z.on;
        center.in = point.z.in;
        center.out = point.z.out;

        // In cases where the general rules:
        //     inDir: (on - in):angle;
        //     outDir: (out - on):angle;
        // produce worse results
        if(point.z.inLength === 0) {
            center.inDir = point.z.inDir;
        }
        if(point.z.outLength === 0){
            center.outDir = point.z.outDir;
        }

        rightOnIntrinsic = point.r.on['-'](point.z.on);
        // TODO: we could import onLength and onDir in ./tools/StrokeContour?
        // TODO: in rare cases this may be 0, we could still try to create
        //       a meaningful direction. StrokeContour does alredy something
        //        similar in its _findNextDirection function.
        // Don't import these values for left because they are dependent
        // on their right side counterpart in the defaults.cps setup.
        // left.onDir is defined as the inverse of right.onDir (+ deg 180)
        // left.onLength is defined being equal to right.onLength
        right.onLength = rightOnIntrinsic.magnitude();
        right.onDir = rightOnIntrinsic.angle();

        if(index === 0) {
            // opening terminal is not relative to skeleton
            left.inDir = point.l.inDir;
            right.inDir = point.r.inDir;
        }
        else {
            left.inDirIntrinsic = point.l.inDir - point.z.inDir;
            right.inDirIntrinsic = point.r.inDir - point.z.inDir;
        }
        if(index === length-1) {
            // ending terminal is not relative to skeleton
            left.outDir = point.l.outDir;
            right.outDir = point.r.outDir;
        }
        else {
            left.outDirIntrinsic = point.l.outDir - point.z.outDir;
            right.outDirIntrinsic = point.r.outDir - point.z.outDir;
        }

        left.inTension = point.l.inTension;
        right.inTension = point.r.inTension;

        left.inLength = point.l.inLength;
        right.inLength = point.r.inLength;

        if(point.l.inLength === 0)
            left['in'] = 'on';
        if(point.r.inLength === 0)
            right['in'] = 'on';

        left.outTension = point.l.outTension;
        right.outTension = point.r.outTension;

        left.outLength = point.l.outLength;
        right.outLength = point.r.outLength;

        if(point.l.outLength === 0)
            left.out = 'on';
        if(point.r.outLength === 0)
            right.out = 'on';

        return {
            left: left
          , center: center
          , right: right
        };
    };


    /**
     * This is VERY special knowledge about the structure of CPS CompoundValues
     * It knows for example how the CompoundValues are configured, etc.
     * This should be in a package together with the configuration
     * keyword: import plugins
     *
     * For terminals inDir and outDir are imported instead of inDirIntrinsic
     * and outDirIntrinsic, because they cannot be relative to the skeleton.
     *
     * If we can't extract useful values for controls, we create a rule
     * that places the control in question directly on the on-curve point
     * "in: on;" OR "out: on;" thus overriding the general rule here,
     * because we are very specific.
     */

    function isNotEmptyString (item){ return !!item.length;}

    function toPropertyLanguage(data) {
        var k, value, result = {};
        for(k in data) {
            value = data[k];
            if(value instanceof Vector)
                value = 'Vector ' + value.x + ' ' + value.y;
            result[k] = value;
        }

        return result;
    }

    _p._makePenStroke = function (penStrokeData) {
        //jshint unused:vars
        var penstroke = new PenStroke()
          , pointData
          , i, l, point, data, name, identifier
          ;
        for(i=0,l=penStrokeData.length;i<l;i++) {
            pointData = penStrokeData[i];

            data = this._makeCPSPointData(pointData, i, penStrokeData.length);
            point = new PenStrokeCenter();

            // we translate names into classes, because they don't have to be
            // unique
            // not these things are code duplication from MOMPointPen!
            name = pointData.z.on.name;
            if (name)
                (name.match(/\S+/g) || [])
                    .filter(isNotEmptyString)
                    .forEach(point.setClass, point);
            identifier = pointData.z.on.kwargs.identifier;
            if(identifier !== undefined)
                // MOM will have to check validity and uniqueness
                point.id = identifier;


            setElementProperties(point, toPropertyLanguage(data.center));
            setElementProperties(point.left, toPropertyLanguage(data.left));
            setElementProperties(point.right, toPropertyLanguage(data.right));
            penstroke.add(point);
        }
        return penstroke;
    };


    _p._makeCPSContourPoinData = function (point, index, list) {
        //jshint unused:vars
        var data={};
        data.on = point.on;
        data.inDir = point.inDir;
        data.inLength = point.inLength;
        data.outDir = point.outDir;
        data.outLength = point.outLength;

        // In cases where we have no magnitude
        if(point.inLength === 0)
            data['in'] = 'on';
        if(point.outLength === 0)
            data.out = 'on';


        return data;
    };

    _p._makeContour = function (contourData, isOpen) {
        var contour = new Contour()
          , pointData, cpsData
          , i,l,point, name, identifier
          ;
        for(i=0,l=contourData.length;i<l;i++) {
            pointData = contourData[i];
            point = new ContourPoint();

            // Translate names into classes, because they don't have to be
            // unique.
            // NOTE: these things are code duplication from MOMPointPen!
            name = pointData.on.name;
            if (name)
                (name.match(/\S+/g) || [])
                    .filter(isNotEmptyString)
                    .forEach(point.setClass, point);
            identifier = pointData.on.kwargs.identifier;
            if(identifier !== undefined)
                // MOM will have to check validity and uniqueness
                point.id = identifier;


            cpsData = this._makeCPSContourPoinData(pointData, i);
            setElementProperties(point, toPropertyLanguage(cpsData));
            contour.add(point);
        }
        if(isOpen)
            setElementProperties(contour, {open: 1});

        return contour;
    };

    _p._getContourImportType = function(id) {
        var indicatorIndex = id ? id.indexOf(':') : -1
          , indicator
          , type
          ;

        if(indicatorIndex !== -1) {
            indicator = id.slice(0, indicatorIndex);
            type = this._indicatorToContourImportType[indicator];
        }
        return type || this._defaultContourImportType;
    };

    _p._importContour = function(contourImportType, item, id, i, glyphName) {
        var data, node;

        this._log.debug('Glyph "'+glyphName+'" importing contour '
                                            + i +' ' + (id ? ('#' + id + ' ') : '')
                                            + 'as MOM ' + contourImportType + '.');
        switch (contourImportType) {
            case 'Contour':
                if(!item.closed && this._skipOpenContours) {
                    this._log.info('Skipping import as MOM-Contour of outline item '
                                        + i +' ' + (id ? ('#' + id + ' ') : '')
                                        + 'because it is open.');
                    return false;
                }
                // NOTE: I did not test importing open contours and
                // it is not further supported in contourFromContour so far.
                // But the effort to make a valid MOM contour from an open
                // ufo-contour should not be that big.
                // Also, the rendering routines need then to learn about
                // open contours.
                data = contourFromContour(item.commands);
                // no classes available yet (due to ufo not offering names here)
                node = this._makeContour(data, !item.closed);
                break;
            case 'PenStroke':
                // import as penstroke if possible
                // FIXME: should this be item.commands.length < 4?
                // FIXME: import a closed contour of 2 points as a penstroke
                //        with two terminals, no centerline
                if(item.commands.length < 5) {
                    this._log.info('Skipping import as MOM-Penstroke of outline item '
                                        + i +' ' + (id ? ('#' + id + ' ') : '')
                                        +'because it has less '
                                        + 'than 4 on-curve points.');
                    return false;
                }
                if(item.commands.length % 2 === 0) {
                    this._log.info('Skipping import as MOM-Penstroke of outline item '
                                            + i +' ' + (id ? ('#' + id + ' ') : '')
                                            +'because count of '
                                            + 'on-curve points is uneven');
                    return false;
                }
                data = new StrokeContour(item.commands).getPenStroke();
                node = this._makePenStroke(data);
                break;
            default:
                throw new ImportError('Import type of outline item '
                                    + i +' ' + (id ? ('#' + id + ' ') : '')
                                    + '"' + contourImportType + '" is unknown.');
        }

        if(id)
            node.id = id;
        return node;
    };

    /**
     * Todo: it must become much more flexible, to configure how a glyph
     * is imported. It may be wished to make contour the default, when
     * just plain interpolation is the aim, or to go into a MOM-Prepolator
     * or MOM-Editor.
     * contourIndicator should be accompanied by a penstrokeIndicator "P:"
     * Both should be configurable.
     *
     * When a path can't be imported as a penstroke, it should be possible
     * to define a fallback. Probably to import it as a contour (default).
     * or to skip it.
     *
     * What to do with non-closed contours? Can Contour handle that?
     * A simple "closed: 0" property on the contour element could be all
     * it needs.
     * -> also add a switch here "skipOpenContours" : true/false
     */
    _p.importGlyph = function(glyphName) {
        this._log.info('### glyph:', glyphName);
        var sourceGlyph = this._readGlyphFromSource(glyphName)
          , item
          , i,l
            // the index at which the contour will be addressable in CPS
          , glyph
          , id
          , contourImportType
          , outlineItem
          , tried
          ;
        glyph = this._makeGlyph(glyphName, sourceGlyph.data);

        for(i=0,l=sourceGlyph.contours.length;i<l;i++) {
            item = sourceGlyph.contours[i];

            // component
            if(item.type == 'component' ) {
                outlineItem = this._makeComponent(item);
                glyph.add(outlineItem);
                continue;
            }
            // find out how to import

            id = item.kwargs && item.kwargs.identifier || null;
            contourImportType = this._getContourImportType(id);
            outlineItem = false;
            tried = new Set();
            while(contourImportType) {
                tried.add(contourImportType);
                // NOTE: this keeps the indicator (C:) in tact as id, if there
                // is any. It's likely that some of the CPS stuff needs to
                // be touched, to be able to handle colons in an idea.
                // However, it's about time to implement escaping for CPS
                // anyways.
                outlineItem = this._importContour(contourImportType, item, id, i, glyphName);
                if(outlineItem) {
                    glyph.add(outlineItem);
                    break;
                }
                // see if there is a fallback defined
                contourImportType = this._contourImportTypeFallbacks[contourImportType];
                if(tried.has(contourImportType)) {
                    this._log.warning('Don\'t know how to import outline item '
                                    + i + ' ' + (id ? ('#' + id + ' ') : ''));
                    break;
                }
                this._log.info('Try fallback import type MOM-' + contourImportType
                    + 'for outline item ' + i +' ' + (id ? ('#' + id + ' ') : '')
                    );
            }
        }
        return glyph;
    };

    return UFOImporter;
});
