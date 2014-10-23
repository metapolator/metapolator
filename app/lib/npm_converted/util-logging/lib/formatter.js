/*
 * Don't edit this file by hand!
 * This file was generated from a npm-package using gulp. 
 * For more information see gulpfile.js in the project root
 */
define(function (require, exports, module) {"use strict";

var util = require("util/util");
var LogRecord = require("./logrecord");
var Level = require("./level");
var path = require("path");


/**
 * This class us equivalent to java.util.logging.Formatter. <br />
 * <br />
 * It provides support for formatting LogRecord objects.
 *
 * @name Formatter
 * @constructor
 */
var Formatter = function() {
  var self = this;
  (self.super_ = Formatter.super_).call(self);
  return self;
};

util.inherits(Formatter, Object);


/**
 * This function formats a {@link LogRecord} object as follows:<br />
 * <br />
 * <pre>
 * {datetime} - [{logger-name}] [{level}] [{stack-location}] - {formatted-params}
 * </pre>
 * <br />
 * Internally it makes use of Node.js [util.format]{@link http://nodejs.org/api/util.html#util_util_format_format} to create the {formatted-params} section.
 *
 * @param  {LogRecord} logRecord Record to be formatted
 */
Formatter.prototype.formatMessage = function(logRecord) {
  if (!logRecord || !(logRecord instanceof  LogRecord)) {
    return;
  }


  var message = logRecord.getMessage() || "";

  //log errors as strings
  if (util.isError(message)) {
    message =  message.message || message.toString();
  }

  //for the message to be a string
  if (typeof message !== "string") {
    message = "\n" + JSON.stringify(message, null, 2);
  }

  var millis = logRecord.getMillis();
  var date = new Date();
  if (millis && (typeof  millis === "number")){
    date.setTime(millis);
  }

  var level = logRecord.getLevel();
  var levelName = (level)? level.getName():undefined;
  var loggerName = logRecord.getLoggerName();


  var prefix =  date.toISOString() + " - [" + levelName + "] ";
  if (levelName && typeof loggerName == "string") {
    prefix = prefix +   "[" + loggerName + "] ";
  }

  var stack =  logRecord.getSourceStackFrame();
  if (stack) {
    var actualFile = stack.getFileName();
    var baseFile = path.basename(actualFile);
    var info = stack.toString();
    info = info.replace(actualFile, baseFile);
    prefix = prefix + "[" + info + "] ";
  }

  var parameters = logRecord.getParameters();
  if (parameters &&  parameters instanceof Array) {
    parameters.unshift(message);
    message = util.format.apply(this, parameters);
    parameters.shift();
  }

  message = prefix + message;

  var thrown = logRecord.getThrown();
  if (thrown && util.isError(thrown)) {

    if (thrown.message) {
      message += thrown.message;
    }

    if (thrown.stack) {
      message += "\n" + thrown .stack;
    }
  }

  return message;
};

module.exports = Formatter;
});
