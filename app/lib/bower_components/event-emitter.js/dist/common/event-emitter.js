/*!
 * event-emitter.js
 * 
 * Copyright (c) 2014
 */





/* -----------------------------------------------------------------------------
 * scope
 * ---------------------------------------------------------------------------*/

var root = this;


/* -----------------------------------------------------------------------------
 * EventEmitter
 * ---------------------------------------------------------------------------*/

/**
 * Lightweight EventEmitter Class.
 *
 * @example
 * var emitter = new EventEmitter(settings);
 *
 * @public
 * @constructor
 */
var EventEmitter = function () {
  this.events = {};
};


/**
 * Add event listener and handler to emitter isntance.
 *
 * @example
 * emitter.on('event', this.doSomething, this);
 *
 * @public
 *
 * @param {string} name - Name of event to listen for.
 * @param {function} handler - Function to call when event is triggered.
 * @param {object} context - Context in which to execute handler. 
 *
 * @returns emitter instance (allows chaining).
 */
EventEmitter.prototype.on = function (name, handler, context) {
  (this.events[name] = this.events[name] || []).unshift({
    fn: handler,
    context: context || root
  });

  return this;
};


/**
 * Remove event lister from instance. If no arguments are passed,
 * all events will be remove from the instance. If only name is
 * passed, all handlers will be remove from the specified event.
 * If name and handler are passed, only the handler will be
 * removed from the specified event.
 *
 * @example
 * emitter.off('event');
 * // removes all handlers from `event`
 *
 * @public
 *
 * @param {string} name - Name of event to remove listener from.
 * @param {function} handler - Function handler to remove from event.
 *
 * @returns emitter instance (allows chaining).
 */
EventEmitter.prototype.off = function (name, handler) {
  var subscribers = this.events[name] || [];
  var l = subscribers.length;

  // Remove all events
  if (!name) {
    this.events = {};

  // Remove all handlers for events
  } else if (!handler) {
    delete this.events[name];

  // Remove specific handler for event
  } else {
    while (l--) {
      if (subscribers[l].fn === handler)  {
        subscribers.splice(l, 1);
      }
    }
  }

  return this;
};

/**
 * Calls handler for all event subscribers.
 *
 * @example
 * emitter.trigger('event');
 * // removes all handlers from `event`
 *
 * @public
 *
 * @param {string} name - Name of event to remove listener from.
 *
 * @returns emitter instance (allows chaining).
 */
EventEmitter.prototype.trigger = function (name) {
  var args = Array.prototype.slice.call(arguments, 1);
  var subscribers = this.events[name] || [];
  var l = subscribers.length;

  // fixes bug where handler could be called twice when handler
  // is responsible for moving event handlers. Now all handlers will
  // execute, regardless if they are removed during another handler.
  var copy = [];
  for (var i = 0; i < l; i++) {
    copy.push(subscribers[i]);
  }

  while (l--) {
    copy[l].fn.apply(copy[l].context, args);
  }

  return this;
};


/* -----------------------------------------------------------------------------
 * export
 * ---------------------------------------------------------------------------*/

module.exports = EventEmitter;


