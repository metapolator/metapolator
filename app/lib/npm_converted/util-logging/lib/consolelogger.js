/*
 * Don't edit this file by hand!
 * This file was generated from a npm-package using gulp. 
 * For more information see gulpfile.js in the project root
 */
define(function (require, exports, module) {"use strict";


var Logger = require("./logger");
var ConsoleHandler = require("./consolehandler");
var Level = require("./level");
var util = require("util/util");

/**
 * This is a sample class that makes use of the of both {@link ConsoleHandler}, and {@link Logger}
 * to create a logger that prints messages to the console.
 *
 * @name ConsoleLogger
 * @param  {object} [options] Optional arguments to build the logger. See the parent class [constructor]{@link Logger} for more details.
 * @returns {ConsoleLogger}
 * @constructor
 * @extends Logger
 */
var ConsoleLogger = function(options) {
  var self = this;
  (self.super_ = ConsoleLogger.super_).call(self, options);

  var handler = new ConsoleHandler();
  handler.setLevel(Level.FINEST);
  self.addHandler(handler);
  self.setLevel(Level.SEVERE);
  return this;
};

util.inherits(ConsoleLogger, Logger);


module.exports = ConsoleLogger;
});
