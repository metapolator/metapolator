/*
 * Don't edit this file by hand!
 * This file was generated from a npm-package using gulp. 
 * For more information see gulpfile.js in the project root
 */
define(function (require, exports, module) {"use strict";

/**
 * This module exports all the classes that make up the util-logging package.
 * @module util-logging
 * @exports LogRecord
 * @exports Logger
 */
module.exports = {
  /**
   * {@link Logger} class
   */
  "Logger" :  require("./lib/logger"),
  /**
   * {@link Level} class
   */
  "Level" : require("./lib/level"),
  /**
   * {@link ConsoleHandler} class
   */
  "ConsoleHandler" : require("./lib/consolehandler"),
  /**
   * {@link ConsoleLogger} class
   */
  "ConsoleLogger" : require("./lib/consolelogger"),
  /**
   * {@link Handler} class
   */
  "Handler" :  require("./lib/handler"),
  /**
   * {@link LogRecord} class
   */
  "LogRecord" : require("./lib/logrecord"),
  /**
   * @{link Formatter} class
   */
  "Formatter": require("./lib/formatter")
}

});
