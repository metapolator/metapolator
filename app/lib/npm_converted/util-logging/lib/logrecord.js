/*
 * Don't edit this file by hand!
 * This file was generated from a npm-package using gulp. 
 * For more information see gulpfile.js in the project root
 */
define(function (require, exports, module) {"use strict";


var Level = require("./level");
var util = require("util/util");

/**
 * This class is equivalent to java.util.logging.LogRecord
 * @name LogRecord
 * @param {object} [options] Options used to initialize this {@link LogRecord}
 * @param {Level} [options.level=Level.INFO] logging {@link Level}
 * @param {string} [options.message=null] message string
 * @param {number} [options.millis=new Date().getTime()] time in milliseconds
 * @param {string} [options.loggerName=null] logger name
 * @param {Array} [options.parameters=null] {@link Array} of parameters
 * @param {Error} [options.thrown=null] {@link Error} object
 * @param {string} [options.sourceMethodName=null] source method name
 * @param {string} [options.sourceFileName=null] source file name
 * @constructor
 *
 */
var LogRecord = function(options) {
  var self = this;
  (self.super_ = LogRecord.super_).call(self);

  options = options || {};

  self._sourceStack = options._sourceStack || null;

  self._level = options.level || Level.INFO;
  self._message = options.message || null;
  self._millis = options.millis || (new Date()).getTime();
  self._loggerName = options.loggerName || null;
  self._parameters = options.parameters || null;
  self._thrown = options.thrown || null;
  self._sourceMethodName = options._sourceMethodName || null;
  self._sourceFileName = options._sourceFileName || null;

  return self;
};

util.inherits(LogRecord, Object);



/**
 * Sets the logging {@link Level} associated with this {@link LogRecord}
 * @param {Level} level Logging level
 * @returns {LogRecord}
 */
LogRecord.prototype.setLevel = function(level) {
  this._level = level;
  return this;
};

/**
 * Retrieves the logging {@link Level} associated with this {@link LogRecord}
 * @returns {Level}
 */
LogRecord.prototype.getLevel = function() {
  return this._level;
};

/**
 * Sets the message associated with this {@link LogRecord}
 * @param {string} message Message string
 * @returns {LogRecord}
 */
LogRecord.prototype.setMessage = function(message) {
  this._message = message;
  return this;
};

/**
 * Retrieves the message associated with this {@link LogRecord}
 * @returns {string}
 */
LogRecord.prototype.getMessage = function() {
  return this._message;
};

/**
 * Sets the time (in milliseconds) associated with this {@link LogRecord}
 * @param {number} millis Time in milliseconds
 * @returns {LogRecord}
 */
LogRecord.prototype.setMillis = function(millis) {
  this._millis = millis;
};

/**
 * Retrieves the time (in milliseconds) associated with this {@link LogRecord}
 * @returns {number}
 */
LogRecord.prototype.getMillis = function() {
  return this._millis;
};

/**
 * Sets the logger name associated with this {@link LogRecord}
 * @param {string} loggerName Logger name
 * @returns {LogRecord}
 */
LogRecord.prototype.setLoggerName = function(loggerName) {
  this._loggerName = loggerName;
  return this;
};

/**
 * Retrieves the logger name associated with this {@link LogRecord}
 * @returns {String}
 */
LogRecord.prototype.getLoggerName = function() {
  return this._loggerName;
};

/**
 * Sets the parameters array associated with this {@link LogRecord}
 * @param {Array} parameters Array of parameters
 * @returns {LogRecord}
 */
LogRecord.prototype.setParameters = function(parameters) {
  this._parameters = parameters;
  return this;
};

/**
 * Retrieves the parameters array associated with this {@link LogRecord}
 * @returns {Array}
 */
LogRecord.prototype.getParameters = function() {
  return this._parameters;
};

/**
 * Sets the thrown {@link Error} associated with this {@link LogRecord}
 * @param {Error} thrown Error object
 * @returns {LogRecord}
 */
LogRecord.prototype.setThrown = function(thrown) {
  if (!util.isError(thrown)) {
    return this;
  }

  this._thrown = thrown;

  return this;
};

/**
 * Retrieves the thrown {@link Error} associated with this {@link LogRecord}
 * @returns {Error}
 */
LogRecord.prototype.getThrown = function() {
  return this._thrown;
};

/**
 * Sets the source method name associated with this {@link LogRecord}
 * @param {string} methodName Method name
 * @returns {LogRecord}
 */
LogRecord.prototype.setSourceMethodName = function(methodName) {
  this._sourceMethodName = methodName;
  return this;
};

/**
 * Retrieves the source method name associated with this {@link LogRecord}
 * @returns {string}
 */
LogRecord.prototype.getSourceMethodName = function() {
  return this._sourceMethodName;
};

/**
 * Sets the source file name associated with this {@link LogRecord}
 * @param {string} fileName File name
 * @returns {LogRecord}
 */
LogRecord.prototype.setSourceFileName = function(fileName) {
  this._sourceFileName = fileName
  return this;
};

/**
 * Retrieves the source file name associated with this {@link LogRecord}
 * @return {String}
 */
LogRecord.prototype.getSourceFileName = function() {
  return this._sourceFileName;
};



LogRecord.prototype.setSourceStackFrame = function(sourceStack) {
  this._sourceStack = sourceStack
};


LogRecord.prototype.getSourceStackFrame = function() {
  return this._sourceStack;
};

module.exports = LogRecord;
});
