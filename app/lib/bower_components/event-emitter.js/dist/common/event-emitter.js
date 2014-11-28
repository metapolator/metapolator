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
  // Remove all events
  if (!name) {
    this.events = {};

  // Remove all handlers for events
  } else if (!handler) {
    delete this.events[name];

  // Remove specific handler for event
  } else {
    this._loopSubscribers(name, function (subscribers, i) {
      if (subscribers[i] === handler)  {
        subscribers.splice(i, 1);
      }
    });
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

  this._loopSubscribers(name, function (subscribers, i) {
    var handler = subscribers[i];
    handler.fn.apply(handler.context, args);
  });

  return this;
};


/**
 * Helper method to call specified fn for each event
 * subscriber.
 *
 * @private
 *
 * @param {string} name - Name of event to remove listener from.
 * @param {function} fn - Name of event to remove listener from.
 */
EventEmitter.prototype._loopSubscribers = function (name, fn) {
  var subscribers = this.events[name] || [],
      l = subscribers.length;

  while (l--) {
    fn(subscribers, l);
  }
};


/* -----------------------------------------------------------------------------
 * export
 * ---------------------------------------------------------------------------*/

module.exports = EventEmitter;


