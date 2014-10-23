/*
 * Don't edit this file by hand!
 * This file was generated from a npm-package using gulp. 
 * For more information see gulpfile.js in the project root
 */
define(function (require, exports, module) {var inherits = require('./inherits')
var assert = require('assert')

function test(c) {
  assert(c.constructor === Child)
  assert(c.constructor.super_ === Parent)
  assert(Object.getPrototypeOf(c) === Child.prototype)
  assert(Object.getPrototypeOf(Object.getPrototypeOf(c)) === Parent.prototype)
  assert(c instanceof Child)
  assert(c instanceof Parent)
}

function Child() {
  Parent.call(this)
  test(this)
}

function Parent() {}

inherits(Child, Parent)

var c = new Child
test(c)

console.log('ok')

});
