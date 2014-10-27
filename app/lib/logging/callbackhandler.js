define(function (require, exports, module) {
"use strict";

var Level = require("util-logging/level");
var Handler = require("util-logging/handler");
var Formatter = require("util-logging/formatter");

var util = require("util/util");

/**
 * The published {@link LogRecord} objects are fed to a callback
 *
 * Internally, the {@link CallbackHandler} uses the {@link Formatter} class to generate the string.
 *
 * @name CallbackHandler
 * @param cb callback to pass each formatted log entry to
 * @returns {CallbackHandler}
 * @constructor
 * @extends Handler
 */
var CallbackHandler = function(cb) {
  var self = this;
  (self.super_ = CallbackHandler.super_).call(self);
  self._defaultFormatter = new Formatter();
  self._callback = cb;
  return self;
};

util.inherits(CallbackHandler, Handler);


CallbackHandler.prototype.getDefaultFormatter = function() {
  return this._defaultFormatter;
};

/**
 * Logs formatted log record to a file.
 *
 * @param {LogRecord} logRecord {@link LogRecord} to be published
 */
CallbackHandler.prototype.publish = function(logRecord) {
  if (!this.isLoggable(logRecord)) {
    return;
  }

  var formatter = this.getFormatter();
  if (!formatter || !(formatter instanceof Formatter)) {
    formatter = this.getDefaultFormatter();
  }

  var message = formatter.formatMessage(logRecord);
  if (!message || typeof message !== "string") {
    return;
  }

  this._callback(message);
};


module.exports = CallbackHandler;
});
