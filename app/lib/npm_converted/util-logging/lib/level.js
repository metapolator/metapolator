/*
 * Don't edit this file by hand!
 * This file was generated from a npm-package using gulp. 
 * For more information see gulpfile.js in the project root
 */
define(function (require, exports, module) {var util = require("util/util");

/**
 * This class represents a logging level.
 * @name Level
 * @param {object} [options] If provided, then both "name", and "value" fields must be given, otherwise it uses default values.
 * @param {String} [options.name="INFO"] Logging level name
 * @param {int} [options.value=4] Logging level value
 * @returns {Level}
 * @constructor
 */
var Level = function(options) {
  var self = this;
  (self.super_ = Level.super_).call(self);

  var options = options || {};

  if (options.name == undefined || options.value === undefined) {
    self._name = "INFO";
    self._value = 4;
    return self;
  }

  self._name = options.name;
  self._value = options.value;

  return self;
};

util.inherits(Level, Object);

/**
 * OFF is a special level that can be used to turn off logging.
 * @constant
 */
Level.OFF = new Level({"name": "OFF", "value": 7});
Level.prototype.OFF = Level.OFF;

/**
 * SEVERE is a message level indicating a serious failure.
 * @constant
 */
Level.SEVERE = new Level({"name": "SEVERE", "value": 6});
Level.prototype.SEVERE = Level.SEVERE;

/**
 * WARNING is a message level indicating a potential problem.
 * @constant
 */
Level.WARNING = new Level({"name":"WARNING", "value": 5});
Level.prototype.WARNING = Level.WARNING;

/**
 * INFO is a message level for informational messages.
 * @constant
 */
Level.INFO =  new Level({"name": "INFO", "value": 4});
Level.prototype.INFO = Level.INFO;

/**
 * CONFIG is a message level for static configuration messages.
 * @constant
 */
Level.CONFIG = new Level({"name": "CONFIG", "value": 3});
Level.prototype.CONFIG = Level.CONFIG;

/**
 * FINER indicates a fairly detailed tracing message.
 * @constant
 */
Level.FINE = new Level({"name": "FINE", "value": 2});
Level.prototype.FINE = Level.FINE;

/**
 * FINE is a message level providing tracing information.
 * @constant
 */
Level.FINER = new Level({"name": "FINER", "value": 1});
Level.prototype.FINER = Level.FINER;

/**
 * FINEST indicates a highly detailed tracing message.
 * @constant
 */
Level.FINEST = new Level({"name": "FINEST", "value": 0});
Level.prototype.FINEST = Level.FINEST;

/**
 * ALL indicates that all messages should be logged.
 * @constant
 */
Level.ALL = new Level({"name":"ALL", "value": 0});
Level.prototype.ALL = Level.ALL;



/**
 * This function returns the integer value associated with the level
 * @returns {Number}
 */
Level.prototype.intValue = function() {
  return this._value;
};


/**
 * This function returns the string name associated with the level
 * @returns {String}
 */
Level.prototype.getName = function() {
  return this._name;
};

/**
 * This function checks if the name, and int value of this {@link Level} object matches
 * the name and value of the given [level]{@link Level} object.
 * @param {Level} level The {@link Level} object to compare against
 * @returns {boolean}
 * {@linkcode true} if equal
 * {@linkcode false} if not equal
 */
Level.prototype.equals = function(level) {
  if (!(level instanceof  Level)) {
    return false;
  }
  return (this.intValue() == level.intValue());
};



/**
 * This function compares the int value of this {@link Level} object against the
 * the int value of the given [level]{@link Level} object.
 * @param {Level} level The {@link Level} object to compare against
 * @returns {number | undefined}
 * {@linkcode <0} If this {@link Level} object's int value is less <br />
 * {@linkcode =0} If this {@link Level} object's int value is the same <br />
 * {@linkcode >0} If this {@link Level} object's int value is greater <br />
 * {@linkcode undefined} if the argument is not of {@link Level} type
 */
Level.prototype.compare = function(level) {
  if (!(level instanceof Level)) {
    return undefined;
  }

  var intA = this.intValue();
  var intB = level.intValue();

  if (intA == intB) {
    return 0;
  }

  if (intA > intB) {
    return 1;
  }

  if (intA <  intB) {
    return -1;
  }
};

Level.prototype.toString = function() {
  return this.getName();
};


Level.isValid =  function(level) {
  if (!level || !(level instanceof Level)) {
    return false;
  }
  return typeof (level instanceof Level) &&
      (level.intValue() >= Level.ALL.intValue() || level <= Level.OFF.intValue());
};


Level.prototype.isValid = function() {
  return Level.isValid(this);
};

module.exports = Level;

});
