/*
 * Don't edit this file by hand!
 * This file was generated from a npm-package using gulp. 
 * For more information see gulpfile.js in the project root
 */
define(function (require, exports, module) {"use strict";

var Level = require("./level");
var LogRecord = require("./logrecord");

var util = require("util/util");

/**
 * This class is equivalent to java.util.logging.Handler.
 *
 * It stores all the pushed {@link LogRecord} objects in memory, until flushed.
 *
 * @name Handler
 * @returns {Handler}
 * @constructor
 */
var Handler = function() {
  var self = this;
  (self.super_ = Handler.super_).call(self);
  self._level = Level.FINEST;
  self._formatter = undefined;
  self._logRecords = [];
  return self;
};


util.inherits(Handler, Object);
/**
 * Sets the logging {@link Level} for this {@link Handler}
 * @param {Level} level Logging level
 * @returns {Handler}
 */
Handler.prototype.setLevel = function(level) {
  if (!Level.isValid(level)) {
    return this;
  }
  this._level = level;
  return this;
};

/**
 * Retrieves the logging {@link Level} for this {@link Handler}
 * @returns {Level}
 */
Handler.prototype.getLevel = function() {
  return this._level;
};

/**
 * Checks if the specified {@link LogRecord} object can be logged given the current logging {@link Level} of this {@link Handler}
 * @param {LogRecord} logRecord {@link LogRecord} to be checked
 * @returns {boolean}
 * {@Linkcode true} if the {@link LogRecord} can be logged <br />
 * {@linkcode false} if the {@link LogRecord} cannot be logged
 */
Handler.prototype.isLoggable = function(logRecord) {
  if (!logRecord || !(logRecord instanceof  LogRecord)) {
    return false;
  }

  var level = logRecord.getLevel();

  return Level.isValid(level) && level >= this.getLevel();
};

/**
 * This function stores the given {@link LogRecord} object internally in memory. <br />
 * <br />
 * Note that this function will not print the record. If you want to actually do something useful
 * with the {@link LogRecord} object, you must extend this class, and override this method. <br />
 * <br />
 * {@link ConsoleHandler} is an example of a class that extends this class.
 *
 * @param {LogRecord} logRecord {@link LogRecord} to be published
 * @returns {Handler}
 */
Handler.prototype.publish = function(logRecord) {
  if (!this.isLoggable(logRecord)) {
    return this;
  }
  //default-handler, store records in memory
  this._logRecords.push(logRecord);
  return this;
};

/**
 * This function clears the internal array of log records.
 * @returns {Handler}
 *
 */
Handler.prototype.flush = function() {
  this._logRecords = [];
  return this;
};

/**
 * This function sets the {@link Formatter} to use for this {@link LogRecord} {@link Handler}
 * @param {Formatter} formatter The {@link Formatter} object
 * @returns {Handler}
 */
Handler.prototype.setFormatter = function(formatter) {
  this._formatter = formatter;
  return this;
};

/**
 * This function retrieves the {@link Formatter} for this {@link LogRecord} {@link Handler}
 * @returns {Formatter}
 */
Handler.prototype.getFormatter = function() {
  return this._formatter;
};


module.exports = Handler;
});
