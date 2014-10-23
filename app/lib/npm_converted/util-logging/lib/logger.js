/*
 * Don't edit this file by hand!
 * This file was generated from a npm-package using gulp. 
 * For more information see gulpfile.js in the project root
 */
define(function (require, exports, module) {"use strict";


var path = require("path");
var util = require("util/util");
var Level = require("./level");
var Handler = require("./handler");
var LogRecord = require("./logrecord");

/**
 * This class is the equivalent of java.util.logging.Logger
 * @name Logger
 * @param {object} [options]
 * @param {String} [options.name=null] Name to describe this logger
 * @param {Level} [options.level=Level.SEVERE] Default logging level
 *
 * @returns {Logger}
 * @constructor
 */
var Logger = function(options) {
  var self = this;
  (self.super_ = Logger.super_).call(self);

  var options = options || {};
  this._level = (Level.isValid(options.level))? options.level: Level.SEVERE;
  this._name = options.name;

  this._handlers = [];
  return this;
};

util.inherits(Logger, Object);

var fillStackInfo = function(/** LogRecord */ record) {
  var orig = Error.prepareStackTrace;
  try {
    var err = new Error();
    var caller;

    Error.prepareStackTrace = function (err, stack) {
      return stack;
    };

    var parentFrame = err.stack.shift();
    var current = parentFrame.getFileName();
    while (err.stack.length) {
      var currentFrame = err.stack.shift();
      caller = currentFrame.getFileName();
      if(current!==caller) {
        var info = currentFrame.toString();
        record.setSourceFileName(currentFrame.getFileName());
        record.setSourceMethodName(currentFrame.getMethodName());
        record.setSourceStackFrame(currentFrame);
        return info;
      }
    }
  } catch (err) {}
  finally {
    Error.prepareStackTrace = orig;
  }
  return undefined;
};


/**
 * Sets the logging {@link Level} for this {@link Logger}
 * @param {Level} level Logging level
 *
 * @returns {Logger}
 */
Logger.prototype.setLevel = function(level) {
  if (!Level.isValid(level)) {
    return this;
  }

  this._level = level;
  return this;
};

/**
 * Retrieves the logging {@link Level} for this {@link Logger}
 * @returns {Level} Logging level
 */
Logger.prototype.getLevel = function() {
  return this._level;
};

/**
 * Set the name of the logger
 * @param {string} name Logger name
 * @returns {Logger}
 */
Logger.prototype.setName = function(name) {
  if (!name || typeof "name" !== "string") {
    return this;
  }

  this._name = name;
  return this;
};

/**
 * Retrieves the name of the logger
 * @returns {string} Logger name
 */
Logger.prototype.getName = function() {
  return this._name;
};

/**
 * Adds a handler to the the logger
 * @param {Handler} handler The {@link Handler} to add
 * @returns {Logger}
 */
Logger.prototype.addHandler = function(handler) {
  if (!handler || !(handler instanceof  Handler)) {
    return this;
  }
  this._handlers.push(handler);
  return this;
};

/**
 * Removes the specified handler from the logger
 * @param {Handler} handler The {@link Handler} to remove
 * @returns {Logger}
 */
Logger.prototype.removeHandler = function(handler) {
  if (!handler || !(handler instanceof  Handler)) {
    return this;
  }

  var index = this._handlers.indexOf(handler);
  if (index < 0) {
    return this;
  }

  this._handlers.splice(index,1);
  return this;
};

/**
 * Retrieves the {@link Handler}s associated with the {@link Logger}
 * @returns {Array}
 */
Logger.prototype.getHandlers =  function() {
  return  this._handlers;
};


/**
 * Logs the given {@linkcode message} at the specified {@linkcode level}
 * @param {Level} level Logging level
 * @param {string} message Message to log
 *
 * @returns {Logger}
 */
Logger.prototype.log = function() {};
/**
 * Logs the given {@linkcode message}, and error at the specified {@linkcode level}
 * @param {Level} level Logging level
 * @param {string} message Message to log
 * @param {Error} error Error object to log
 *
 * @returns {Logger}
 */
Logger.prototype.log = function() {};
/**
 * Logs the formatted message ({@linkcode format}), with the given {@linkcode params}
 * array as input to the {@linkcode format}, at the specified {@linkcode level}
 * @param {Level} level Logging level
 * @param {string} format Format to use for the message
 * @param {...*} params Variable number of parameters as input to the {@linkcode format}
 *
 * @returns {Logger}
 */
/**
 * Logs the given {@linkcode object}, at the specified {@linkcode level}
 * @param {Level} level Logging level
 * @param {object} object Object to log
 *
 * @returns {Logger}
 */
Logger.prototype.log = function() {};
Logger.prototype.log = function() {};
/**
 * Logs the formatted message ({@linkcode format}), with the given variable {@linkcode params}
 * as input to the {@linkcode format}, at the specified {@linkcode level}
 * @param {Level} level Logging level
 * @param {string} format Format to use for the message
 * @param {...*} params Variable number of parameters as input to the {@linkcode format}
 *
 * @returns {Logger}
 */
Logger.prototype.log = function() {

  var args = Array.prototype.splice.call(arguments,0);

  if (args.length < 2) {
    return this;
  }

  var level = args.shift();
  var message = args.shift();
  var thrown;
  var parameters = [];

  if (util.isError(message) && args.length == 0) {
    thrown = message;
    message = "";
  }

  else if (args.length == 1 && util.isError(args[0])) {
    thrown = args[0];
  }
  else if (args.length == 1 && args[0] instanceof Array) {
    parameters = args[0];
  }
  else {
    parameters = args;
  }


  if (!Level.isValid(level) || message === undefined) {
    return this;
  }

  var handlers = this.getHandlers();

  if (level < this.getLevel()) {
    return this;
  }

  var logRecord = new LogRecord();
  logRecord.setLevel(level);
  logRecord.setLoggerName(this.getName());
  logRecord.setMessage(message);
  logRecord.setMillis(new Date().getTime());
  logRecord.setParameters(parameters);
  logRecord.setThrown(thrown);
  fillStackInfo(logRecord);

  handlers.forEach(function(handler) {
    handler.publish(logRecord);
  });

  return this;
};


Logger.prototype._log = function(level, args) {
  args = Array.prototype.splice.call(args, 0);
  args.unshift(level);
  this.log.apply(this, args);
  return this;
};


/**
 * Logs the given message, at {@linkCode Level.SEVERE} level
 * @param {string} message Message to log
 * @returns {Logger}
 */
Logger.prototype.severe =  function() {};
/**
 * Logs the given formatted message ({@linkcode format}) using the variable {@linkcode params} as input,
 * at {@linkCode Level.SEVERE} level
 * @param {string} format Format to use for the message
 * @param {...*} params Variable number of parameters as input to the {@linkcode format}
 * @returns {Logger}
 */
Logger.prototype.severe =  function() {};
/**
 * Logs the given {@linkcode object}, at {@linkCode Level.SEVERE} level
 * @param {object} object Object to log
 *
 * @returns {Logger}
 */
Logger.prototype.severe = function() {};
/**
 * Logs the given message, and error at {@linkCode Level.SEVERE} level
 * @param {string} message Message to log
 * @param {Error} error Error object to log
 * @returns {Logger}
 */
Logger.prototype.severe =  function() {
  return this._log(Level.SEVERE, arguments);
};

/**
 * Logs the given message, at {@linkCode Level.WARNING} level
 * @param {string} message Message to log
 * @returns {Logger}
 */
Logger.prototype.warning =  function() {};
/**
 * Logs the given formatted message ({@linkcode format}) using the variable {@linkcode params} as input,
 * at {@linkCode Level.WARNING} level
 * @param {string} format Format to use for the message
 * @param {...*} params Variable number of parameters as input to the {@linkcode format}
 * @returns {Logger}
 */
Logger.prototype.warning =  function() {};
/**
 * Logs the given {@linkcode object}, at {@linkCode Level.WARNING} level
 * @param {object} object Object to log
 *
 * @returns {Logger}
 */
Logger.prototype.warning =  function() {};

/**
 * Logs the given message, and error at {@linkCode Level.WARNING} level
 * @param {string} message Message to log
 * @param {Error} error Error object to log
 * @returns {Logger}
 */
Logger.prototype.warning =  function() {
  return this._log(Level.WARNING, arguments);
};

/**
 * Logs the given message, at {@linkCode Level.CONFIG} level
 * @param {string} message Message to log
 * @returns {Logger}
 */
Logger.prototype.config =  function() {};
/**
 * Logs the given formatted message ({@linkcode format}) using the variable {@linkcode params} as input,
 * at {@link Level.CONFIG} level
 * @param {string} format Format to use for the message
 * @param {...*} params Variable number of parameters as input to the {@linkcode format}
 * @returns {Logger}
 */
Logger.prototype.config =  function() {};
/**
 * Logs the given {@linkcode object}, at {@linkCode Level.CONFIG} level
 * @param {object} object Object to log
 *
 * @returns {Logger}
 */
Logger.prototype.config =  function() {};
/**
 * Logs the given message, and error at {@linkCode Level.CONFIG} level
 * @param {string} message Message to log
 * @param {Error} error Error object to log
 * @returns {Logger}
 */
Logger.prototype.config =  function() {
  return this._log(Level.CONFIG, arguments);
};

/**
 * Logs the given message, at {@linkCode Level.INFO} level
 * @param {string} message Message to log
 * @returns {Logger}
 */
Logger.prototype.info =  function() {}
/**
 * Logs the given formatted message ({@linkcode format}) using the variable {@linkcode params} as input,
 * at {@linkCode Level.INFO} level
 * @param {string} format Format to use for the message
 * @param {...*} params Variable number of parameters as input to the {@linkcode format}
 * @returns {Logger}
 */
Logger.prototype.info =  function() {}
/**
 * Logs the given {@linkcode object}, at {@linkCode Level.INFO} level
 * @param {object} object Object to log
 *
 * @returns {Logger}
 */
Logger.prototype.info =  function() {};
/**
 * Logs the given message, and error at {@linkCode Level.INFO} level
 * @param {string} message Message to log
 * @param {Error} error Error object to log
 * @returns {Logger}
 */
Logger.prototype.info =  function() {
  return this._log(Level.INFO, arguments);
};

/**
 * Logs the given message, at {@linkCode Level.FINE} level
 * @param {string} message Message to log
 * @returns {Logger}
 */
Logger.prototype.fine =  function() {}
/**
 * Logs the given formatted message ({@linkcode format}) using the variable {@linkcode params} as input,
 * at {@linkCode Level.FINE} level
 * @param {string} format Format to use for the message
 * @param {...*} params Variable number of parameters as input to the {@linkcode format}
 * @returns {Logger}
 */
Logger.prototype.fine =  function() {}
/**
 * Logs the given {@linkcode object}, at {@linkCode Level.FINE} level
 * @param {object} object Object to log
 *
 * @returns {Logger}
 */
Logger.prototype.fine =  function() {};
/**
 * Logs the given message, and error at {@linkCode Level.FINE} level
 * @param {string} message Message to log
 * @param {Error} error Error object to log
 * @returns {Logger}
 */
Logger.prototype.fine =  function() {
  return this._log(Level.FINE, arguments);
};

/**
 * Logs the given message, at {@linkCode Level.FINER} level
 * @param {string} message Message to log
 * @returns {Logger}
 */
Logger.prototype.finer =  function() {}
/**
 * Logs the given formatted message ({@linkcode format}) using the variable {@linkcode params} as input,
 * at {@linkCode Level.FINER} level
 * @param {string} format Format to use for the message
 * @param {...*} params Variable number of parameters as input to the {@linkcode format}
 * @returns {Logger}
 */
Logger.prototype.finer =  function() {}
/**
 * Logs the given {@linkcode object}, at {@linkCode Level.FINER} level
 * @param {object} object Object to log
 *
 * @returns {Logger}
 */
Logger.prototype.finer =  function() {};
/**
 * Logs the given message, and error at {@linkCode Level.FINER} level
 * @param {string} message Message to log
 * @param {Error} error Error object to log
 * @returns {Logger}
 */
Logger.prototype.finer =  function() {
  return this._log(Level.FINER, arguments);
};



/**
 * Logs the given message, at {@linkCode Level.FINEST} level
 * @param {string} message Message to log
 * @returns {Logger}
 */
Logger.prototype.finest = function() {};
/**
 * Logs the given formatted message ({@linkcode format}) using the variable {@linkcode params} as input,
 * at {@link Level.FINEST} level
 * @param {string} format Format to use for the message
 * @param {...*} params Variable number of parameters as input to the {@linkcode format}
 * @returns {Logger}
 */
Logger.prototype.finest = function() {};
/**
 * Logs the given {@linkcode object}, at {@linkCode Level.FINEST} level
 * @param {object} object Object to log
 *
 * @returns {Logger}
 */
Logger.prototype.finest =  function() {};
/**
 * Logs the given message, and error at {@linkCode Level.FINEST} level
 * @param {string} message
 * @param {Error} error Error object to log
 * @returns {Logger}
 */
Logger.prototype.finest =  function() {
  return this._log(Level.FINEST, arguments);
};

module.exports = Logger;


});
