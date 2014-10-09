(function(
  // Reliable reference to the global object (i.e. window in browsers).
  global,

  // Dummy constructor that we use as the .constructor property for
  // functions that return Generator objects.
  GeneratorFunction
) {
  var hasOwn = Object.prototype.hasOwnProperty;
  var undefined; // More compressible than void 0.

  try {
    // Make a reasonable attempt to provide a Promise polyfill.
    var Promise = global.Promise || (global.Promise = require("promise"));
  } catch (ignored) {}

  if (global.regeneratorRuntime) {
    return;
  }

  var runtime = global.regeneratorRuntime =
    typeof exports === "undefined" ? {} : exports;

  function wrap(innerFn, outerFn, self, tryList) {
    return new Generator(innerFn, outerFn, self || null, tryList || []);
  }
  runtime.wrap = wrap;

  var GenStateSuspendedStart = "suspendedStart";
  var GenStateSuspendedYield = "suspendedYield";
  var GenStateExecuting = "executing";
  var GenStateCompleted = "completed";

  // Returning this object from the innerFn has the same effect as
  // breaking out of the dispatch switch statement.
  var ContinueSentinel = {};

  var Gp = Generator.prototype;
  var GFp = GeneratorFunction.prototype = Object.create(Function.prototype);
  GFp.constructor = GeneratorFunction;
  GFp.prototype = Gp;
  Gp.constructor = GFp;

  runtime.mark = function(genFun) {
    genFun.__proto__ = GFp;
    genFun.prototype = Object.create(Gp);
    return genFun;
  };

  runtime.async = function(innerFn, self, tryList) {
    return new Promise(function(resolve, reject) {
      var generator = wrap(innerFn, self, tryList);
      var callNext = step.bind(generator.next);
      var callThrow = step.bind(generator.throw);

      function step(arg) {
        try {
          var info = this(arg);
          var value = info.value;
        } catch (error) {
          return reject(error);
        }

        if (info.done) {
          resolve(value);
        } else {
          Promise.resolve(value).then(callNext, callThrow);
        }
      }

      callNext();
    });
  };

  // Ensure isGeneratorFunction works when Function#name not supported.
  if (GeneratorFunction.name !== "GeneratorFunction") {
    GeneratorFunction.name = "GeneratorFunction";
  }

  runtime.isGeneratorFunction = function(genFun) {
    var ctor = genFun && genFun.constructor;
    return ctor ? GeneratorFunction.name === ctor.name : false;
  };

  function Generator(innerFn, outerFn, self, tryList) {
    var generator = outerFn ? Object.create(outerFn.prototype) : this;
    var context = new Context(tryList);
    var state = GenStateSuspendedStart;

    function invoke(method, arg) {
      if (state === GenStateExecuting) {
        throw new Error("Generator is already running");
      }

      if (state === GenStateCompleted) {
        throw new Error("Generator has already finished");
      }

      while (true) {
        var delegate = context.delegate;
        if (delegate) {
          try {
            var info = delegate.iterator[method](arg);

            // Delegate generator ran and handled its own exceptions so
            // regardless of what the method was, we continue as if it is
            // "next" with an undefined arg.
            method = "next";
            arg = undefined;

          } catch (uncaught) {
            context.delegate = null;

            // Like returning generator.throw(uncaught), but without the
            // overhead of an extra function call.
            method = "throw";
            arg = uncaught;

            continue;
          }

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
          if (state === GenStateSuspendedStart &&
              typeof arg !== "undefined") {
            // https://people.mozilla.org/~jorendorff/es6-draft.html#sec-generatorresume
            throw new TypeError(
              "attempt to send " + JSON.stringify(arg) + " to newborn generator"
            );
          }

          if (state === GenStateSuspendedYield) {
            context.sent = arg;
          } else {
            delete context.sent;
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

        try {
          var value = innerFn.call(self, context);

          // If an exception is thrown from innerFn, we leave state ===
          // GenStateExecuting and loop back for another invocation.
          state = context.done
            ? GenStateCompleted
            : GenStateSuspendedYield;

          var info = {
            value: value,
            done: context.done
          };

          if (value === ContinueSentinel) {
            if (context.delegate && method === "next") {
              // Deliberately forget the last sent value so that we don't
              // accidentally pass it on to the delegate.
              arg = undefined;
            }
          } else {
            return info;
          }

        } catch (thrown) {
          state = GenStateCompleted;

          if (method === "next") {
            context.dispatchException(thrown);
          } else {
            arg = thrown;
          }
        }
      }
    }

    generator.next = invoke.bind(generator, "next");
    generator.throw = invoke.bind(generator, "throw");
    generator.return = invoke.bind(generator, "return");

    return generator;
  }

  Gp[typeof Symbol === "function"
     && Symbol.iterator
     || "@@iterator"] = function() {
    return this;
  };

  Gp.toString = function() {
    return "[object Generator]";
  };

  function pushTryEntry(triple) {
    var entry = { tryLoc: triple[0] };

    if (1 in triple) {
      entry.catchLoc = triple[1];
    }

    if (2 in triple) {
      entry.finallyLoc = triple[2];
    }

    this.tryEntries.push(entry);
  }

  function resetTryEntry(entry, i) {
    var record = entry.completion || {};
    record.type = i === 0 ? "normal" : "return";
    delete record.arg;
    entry.completion = record;
  }

  function Context(tryList) {
    // The root entry object (effectively a try statement without a catch
    // or a finally block) gives us a place to store values thrown from
    // locations where there is no enclosing try statement.
    this.tryEntries = [{ tryLoc: "root" }];
    tryList.forEach(pushTryEntry, this);
    this.reset();
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
    var iterator = iterable;
    var Symbol = global.Symbol;
    if (Symbol && Symbol.iterator in iterable) {
      iterator = iterable[Symbol.iterator]();
    } else if (!isNaN(iterable.length)) {
      var i = -1;
      iterator = function next() {
        while (++i < iterable.length) {
          if (i in iterable) {
            next.value = iterable[i];
            next.done = false;
            return next;
          }
        };
        next.done = true;
        return next;
      };
      iterator.next = iterator;
    }
    return iterator;
  }
  runtime.values = values;

  Context.prototype = {
    constructor: Context,

    reset: function() {
      this.prev = 0;
      this.next = 0;
      this.sent = undefined;
      this.done = false;
      this.delegate = null;

      this.tryEntries.forEach(resetTryEntry);

      // Pre-initialize at least 20 temporary variables to enable hidden
      // class optimizations for simple generators.
      for (var tempIndex = 0, tempName;
           hasOwn.call(this, tempName = "t" + tempIndex) || tempIndex < 20;
           ++tempIndex) {
        this[tempName] = null;
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

    _findFinallyEntry: function(finallyLoc) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.tryLoc <= this.prev &&
            hasOwn.call(entry, "finallyLoc") && (
              entry.finallyLoc === finallyLoc ||
              this.prev < entry.finallyLoc)) {
          return entry;
        }
      }
    },

    abrupt: function(type, arg) {
      var entry = this._findFinallyEntry();
      var record = entry ? entry.completion : {};

      record.type = type;
      record.arg = arg;

      if (entry) {
        this.next = entry.finallyLoc;
      } else {
        this.complete(record);
      }

      return ContinueSentinel;
    },

    complete: function(record) {
      if (record.type === "throw") {
        throw record.arg;
      }

      if (record.type === "break" ||
          record.type === "continue") {
        this.next = record.arg;
      } else if (record.type === "return") {
        this.rval = record.arg;
        this.next = "end";
      }

      return ContinueSentinel;
    },

    finish: function(finallyLoc) {
      var entry = this._findFinallyEntry(finallyLoc);
      return this.complete(entry.completion);
    },

    "catch": function(tryLoc) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.tryLoc === tryLoc) {
          var record = entry.completion;
          if (record.type === "throw") {
            var thrown = record.arg;
            resetTryEntry(entry, i);
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
}).apply(this, Function("return [this, function GeneratorFunction(){}]")());
define([
    'metapolator/errors'
  , 'metapolator/math/hobby'
  , 'metapolator/math/Vector'
], function(
    errors
  , hobby
  , Vector
) {
    "use strict";

    function ExportController(master, model, glyphSet, precision, projectMaster, dirName) {
        this._master = master;
        this._projectMaster = projectMaster;
        this._model = model;
        this._glyphSet = glyphSet;
        this._precision = precision;
        this._dirName = dirName;
    }
    var _p = ExportController.prototype;

    // FIXME: "export" is a future reserved keyword
    _p.export = function() {
        var glyphs = this._master.children
          , glyph
          , drawFunc
          ;
        console.warn('exporting ...');
        try {
            this._projectMaster.writeFontInfoToFile(this._dirName+'/fontinfo.plist');
        }
        catch(error) {
            console.log('Export of fontinfo.plist failed. reason:\n' + error);
        }

        for(var i = 0;i<glyphs.length;i++) {
            glyph = glyphs[i];
            console.warn('exporting', glyph.id);
            drawFunc = this.drawGlyphToPointPen.bind(this, this._model, glyph)

            this._glyphSet.writeGlyph(false, glyph.id, glyph.getUFOData(), drawFunc,
                                      undefined, {precision: this._precision})
        }
        this._glyphSet.writeContents(false);
    }

    /**
     * Get control point vectors from (MOM Point) StyleDicts.
     * try to use hobby splines but fall back to the control point values
     * of the points if hobbys would fail when there are no good tensions
     * or directions.
     *
     * The terminal parameter is a switch used to draw the penstroke terminals
     * for the start terminal of the stroke all controls are from the incoming
     * control points. p0 in in p1
     * for the end terminal of the stroke all controls are from the outgoing
     * control points. p0 out out p1
     * Without terminal beeing set or having a value of "start" or "end"
     * the default behavior is: p0 out in p1
     *
     * See the comment of drawPenstrokeToPointPen for more detail.
     */

    function getControlsFromStyle(p0, p1, terminal) {
        var outTension = p0.get(terminal === 'start' ? 'inTension' :'outTension')
          , inTension = p1.get(terminal === 'end' ? 'outTension' : 'inTension')
          , on0
          , on1
          , outDirAngle
          , inDirAngle
          , outDir
          , inDir
          ;

        if(outTension && inTension) {
            on0 = p0.get('on')
            on1 = p1.get('on')
            outDirAngle = p0.get(terminal === 'start' ? 'inDir' : 'outDir')
            inDirAngle = p1.get(terminal === 'end' ? 'outDir' :'inDir')
            outDir = Vector.fromPolar(1, outDirAngle)
            inDir = Vector.fromPolar(1, inDirAngle)
            return hobby.hobby2cubic(on0, outDir, outTension,
                                            inTension, inDir, on1);
        }
        // fallback to control points is always possible. Although,
        // depending on the cps setup the value may not be useful
        // does this affect outline quality?
        return [
              p0.get(terminal === 'start' ? 'in': 'out')
            , p1.get(terminal === 'end' ? 'out' :'in')
        ];
    }

    /**
     * The translation from Metapolator Penstrokes to Outlines:
     *
     * The example uses a penstroke with 7 points indexed from 0 to 6
     *
     *  Penstroke       Outline
     *
     *  ending
     *  terminal
     *    ___              7___
     *   | 6 |           8 |   | 6
     *   | 5 |           9 |   | 5
     *   | 4 |          10 |   | 4
     *   | 3 |          11 |   | 3
     *   | 2 |          12 |   | 2
     *   |_1_|          13 |___| 1
     *     0                 14/0
     *  starting
     *  terminal
     *
     *
     *
     * We draw first the right side from 0 to 6,
     * then the left side from 6 to 0.
     *
     * In each iteration only one on-curve point is drawn; in the
     * following example, that is always the last point of the four-
     * point tuples. Also, the out and in controls are drawn.
     * The first point of the tuples is needed to calculate the control
     * point position when we use hobby splines.
     *
     * for i=0;i<n;i++;
     *      i===0:
     *          //starting terminal segment:
     *          on0.left in in on0.right
     *              => out in 0
     *      i!==0:
     *          // segments right side:
     *          // here i=1
     *          on0.right out in on1.right
     *              => out in 1
     * for i=n-1;i>0;i--;
     *      i===n-1
     *          // ending terminal segmnet
     *          // here i=6
     *          on6.right out out on6.left
     *              => out in 7
     *      i!===n-1
     *          // segments left side
     *          // here i=5
     *          on6.left in out on5.left
     *              => out in 8
     */
     _p._drawPenstrokeOutline = regeneratorRuntime.mark(function callee$1$0(model, pen, penstroke) {
         var points, point, prePoint, segmentType, terminal, ctrls, vector, i, t$2$0, t$2$1, t$2$2, t$2$3;

         return regeneratorRuntime.wrap(function callee$1$0$(context$2$0) {
             while (1) switch (context$2$0.prev = context$2$0.next) {
             case 0:
                 points = penstroke.children;
                 pen.beginPath();
                 i = 0;
             case 4:
                 if (!(i < points.length)) {
                     context$2$0.next = 26;
                     break;
                 }

                 point = model.getComputedStyle(points[i].right);

                 if (!true /* always curve */) {
                     context$2$0.next = 19;
                     break;
                 }

                 segmentType = 'curve';
                 if(i === 0) {
                     // this reproduces the starting terminal
                     prePoint = model.getComputedStyle(points[i].left);
                     terminal = 'start'
                 }
                 else {
                     terminal = false;
                     prePoint = model.getComputedStyle(points[i-1].right);
                 }
                 ctrls = getControlsFromStyle(prePoint, point, terminal);
                 t$2$0 = regeneratorRuntime.values(ctrls);
             case 11:
                 if ((t$2$1 = t$2$0.next()).done) {
                     context$2$0.next = 17;
                     break;
                 }

                 vector = t$2$1.value;
                 context$2$0.next = 15;
                 return pen.addPoint(vector.valueOf(), undefined, undefined, undefined);
             case 15:
                 context$2$0.next = 11;
                 break;
             case 17:
                 context$2$0.next = 21;
                 break;
             case 19:
                 segmentType =  'line';
                 console.warn('implicit line segment, right side, this should be explicit in CPS');
             case 21:
                 context$2$0.next = 23;
                 return pen.addPoint(point.get('on').valueOf(), segmentType, undefined, undefined);
             case 23:
                 i++;
                 context$2$0.next = 4;
                 break;
             case 26:
                 i=points.length-1;
             case 27:
                 if (!(i >= 0)) {
                     context$2$0.next = 50;
                     break;
                 }

                 point = model.getComputedStyle(points[i].left);

                 if (!true/*always curve*/) {
                     context$2$0.next = 43;
                     break;
                 }

                 segmentType = 'curve';
                 if(i === points.length-1) {
                     // this reproduces the ending terminal
                     terminal = 'end';
                     prePoint = model.getComputedStyle(points[i].right);
                 }
                 else {
                     terminal = false;
                     // the left side is of the outline is drawn from the
                     // end to the beginning. This reverses the point order
                     // for getComputedStyle
                     prePoint = point;
                     point = model.getComputedStyle(points[i+1].left);
                 }
                 ctrls = getControlsFromStyle(prePoint, point, terminal);
                 if(!terminal) {
                     // reverse on curve and of curve points, prePoint
                     // is no longer needed.
                     ctrls.reverse();
                     point = prePoint;
                 }
                 t$2$2 = regeneratorRuntime.values(ctrls);
             case 35:
                 if ((t$2$3 = t$2$2.next()).done) {
                     context$2$0.next = 41;
                     break;
                 }

                 vector = t$2$3.value;
                 context$2$0.next = 39;
                 return pen.addPoint(vector.valueOf(), undefined, undefined, undefined);
             case 39:
                 context$2$0.next = 35;
                 break;
             case 41:
                 context$2$0.next = 45;
                 break;
             case 43:
                 segmentType = 'line';
                 console.warn('implicit line segment, left side, this should be explicit in CPS');
             case 45:
                 context$2$0.next = 47;
                 return pen.addPoint(point.get('on').valueOf(), segmentType, undefined, undefined);
             case 47:
                 i--;
                 context$2$0.next = 27;
                 break;
             case 50:
                 pen.endPath();
             case 51:
             case "end":
                 return context$2$0.stop();
             }
         }, callee$1$0, this);
     })

    _p._drawPenstrokeCenterline = regeneratorRuntime.mark(function callee$1$1(model, pen, penstroke) {
        var points, point, prePoint, segmentType, ctrls, vector, i, t$2$0, t$2$1;

        return regeneratorRuntime.wrap(function callee$1$1$(context$2$0) {
            while (1) switch (context$2$0.prev = context$2$0.next) {
            case 0:
                points = penstroke.children;
                // center line
                pen.beginPath();
                i = 0;
            case 4:
                if (!(i < points.length)) {
                    context$2$0.next = 25;
                    break;
                }

                point = model.getComputedStyle(points[i].center);

                if (!(i !== 0)) {
                    context$2$0.next = 19;
                    break;
                }

                segmentType = 'curve';
                prePoint = model.getComputedStyle(points[i-1].center);
                ctrls = getControlsFromStyle(prePoint, point);
                t$2$0 = regeneratorRuntime.values(ctrls);
            case 11:
                if ((t$2$1 = t$2$0.next()).done) {
                    context$2$0.next = 17;
                    break;
                }

                vector = t$2$1.value;
                context$2$0.next = 15;
                return pen.addPoint(vector.valueOf(), undefined, undefined, undefined);
            case 15:
                context$2$0.next = 11;
                break;
            case 17:
                context$2$0.next = 20;
                break;
            case 19:
                // this contour is not closed, the first point is a move
                segmentType = 'move';
            case 20:
                context$2$0.next = 22;
                return pen.addPoint(point.get('on').value.valueOf(), segmentType, undefined, undefined);
            case 22:
                i++;
                context$2$0.next = 4;
                break;
            case 25:
                pen.endPath();
            case 26:
            case "end":
                return context$2$0.stop();
            }
        }, callee$1$1, this);
    })

    _p.drawGlyphToPointPenGenerator = function (model, glyph, /*method*/ pen) {
        return regeneratorRuntime.mark(function callee$2$0() {
            var stroke, t$3$0, t$3$1;

            return regeneratorRuntime.wrap(function callee$2$0$(context$3$0) {
                while (1) switch (context$3$0.prev = context$3$0.next) {
                case 0:
                    t$3$0 = regeneratorRuntime.values(glyph.children);
                case 1:
                    if ((t$3$1 = t$3$0.next()).done) {
                        context$3$0.next = 6;
                        break;
                    }

                    stroke = t$3$1.value;
                    return context$3$0.delegateYield(this._drawPenstrokeOutline(model, pen, stroke), "t0", 4);
                case 4:
                    context$3$0.next = 1;
                    break;
                case 6:
                case "end":
                    return context$3$0.stop();
                }
            }, callee$2$0, this);
        }).call(this);
    }

    _p.drawGlyphToPointPen = function(model, glyph, /*method,*/ pen) {
        // method may be tensions/control-points/metafont/native-js
        // the possibilities are a lot.
        // I'm starting with tensions/native-js
        // then I add a tensions/metafont implementation
        // eventually we should be able to control this via CPS!
        // The parameter could be set for all levels from univers to
        // penstroke, this would be a good test of inhertance;
        // also, it should be possible to render just one penstroke
        // of a glyph using metafont, for example.
        // Maybe we can combine all metafont strokes into one job, to
        // reduce the overhead. The needed parameters would of course
        // be in every job for metafont.
        var v;

        for (var t$2$0 = regeneratorRuntime.values(this.drawGlyphToPointPenGenerator(model, glyph, pen)), t$2$1; !(t$2$1 = t$2$0.next()).done; ) {
            v = t$2$1.value;
        }
    }

    return ExportController;
});
