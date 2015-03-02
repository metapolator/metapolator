define(function (require, exports, module) {
"use strict";

var util = require("util/util");
var Formatter = require("util-logging/formatter");
var LogRecord = require("util-logging/logrecord");
var yaml = require("yaml");


/**
 * This class formats LogRecord objects as YAML.
 *
 * @name YAMLFormatter
 * @constructor
 */
var YAMLFormatter = function() {
  var self = this;
  (self.super_ = Formatter.super_).call(self);
  return self;
};

util.inherits(YAMLFormatter, Formatter);


/**
 * This function formats a {@link LogRecord} object in YAML as follows:
 *
 * time: {datetime}
 * message: {message}
 * [logger-name]: {string}
 * [level]: {level}
 * [parameters]: {parameters} (if more than 0)
 *
 * Each entry is returned as an array of length 1, which can be appended to
 * a log file (see FileLogger) as part of an "infinite" array.
 *
 * @param {LogRecord} logRecord Record to be formatted
 */
YAMLFormatter.prototype.formatMessage = function(logRecord) {
  if (!logRecord || !(logRecord instanceof LogRecord))
    return {};

  var record = {};
  record.message = logRecord.getMessage() || "";

  //log errors as strings
  if (util.isError(record.message))
    record.message = record.message.message || record.message.toString();

  var date = new Date();
  var millis = logRecord.getMillis();
  if (millis && (typeof millis === "number"))
    date.setTime(millis);
  record.date = date;

  var loggerName = logRecord.getLoggerName();
  if (loggerName && typeof loggerName == "string")
    record.name = loggerName;

  var level = logRecord.getLevel();
  if (level)
    record.level = {name: level.getName(), value: level.intValue()};

  var parameters = logRecord.getParameters();
  if (parameters && parameters instanceof Array && parameters.length > 0)
    record.parameters = parameters;

  // FIXME: dumping [stack-location]: {stack-location} makes YAML dumper recurse
  // var stack = logRecord.getSourceStackFrame();
  // if (stack)
  //   record.stack = stack;

  var thrown = logRecord.getThrown();
  if (thrown && util.isError(thrown))
    record.thrown = {message: thrown.message, stack: thrown.stack};

  return yaml.safeDump([record]);
};

module.exports = YAMLFormatter;
});
