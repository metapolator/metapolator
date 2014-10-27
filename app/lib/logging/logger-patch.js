// Monkey-patches

define(function (require, exports, module) {
"use strict";

var Logger = require("util-logging/logger");

/**
 * Re-log the given {@link LogRecord} (with the original time stamp)
 * @param {LogRecord} record LogRecord to relog
 *
 * Used to reload a saved log.
 *
 * @returns {Logger}
 */
Logger.prototype.relog = function(record) {
  this.getHandlers().forEach(function(handler) {
    if (record.getLevel() >= this.getLevel())
      handler.publish(record);
  }, this);
  return this;
};

var LogRecord = require("util-logging/logrecord");
var Level = require("util-logging/level");

LogRecord.prototype.fromObject = function (obj) {
  obj.level = new Level(obj.level);
  obj.millis = Date.parse(obj.date);
  return new LogRecord(obj);
}

Level.DEBUG = new Level({name: "DEBUG", value: 3});

Logger.prototype.debug = function() {
  return this._log(Level.DEBUG, arguments);
};

});
