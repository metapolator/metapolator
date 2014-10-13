/*
 * Don't edit this file by hand!
 * This file was generated from a npm-package using gulp. 
 * For more information see gulpfile.js in the project root
 */
define(function (require, exports, module) {
var Complex = function(real, imag){
	Object.defineProperty(this, 'real', {
		value: real !== undefined ? real : 0
		, writable: false
	})
	
	Object.defineProperty(this, 'imag', {
		value: imag !== undefined ? imag : 0
		, writable: false
	})
};

var prototype = Complex.prototype = {
	constructor: Complex,
	fromRect: function(a, b) {
		return new this.constructor(a, b)
	},

	fromPolar: function(r, phi){
		if (typeof r == 'string'){
			var parts = r.split(' ');
			r = parts[0];
			phi = parts[1];
		}
		return new this.constructor(
			r * Math.cos(phi),
			r * Math.sin(phi)
		);
	},

	toPrecision: function(k){
		return new this.constructor(
			this.real.toPrecision(k),
			this.imag.toPrecision(k)
		);
	},

	toFixed: function(k){
		return new this.constructor(
			this.real.toFixed(k),
			this.imag.toFixed(k)
		);
	},

	magnitude: function(){
		var a = this.real, b = this.imag;
		return Math.sqrt(a * a + b * b);
	},

	angle: function(){
		return Math.atan2(this.imag, this.real);
	},

	conjugate: function(){
		return new this.constructor(this.real, -this.imag);
	},

	negate: function(){
		return new this.constructor(-this.real, -this.imag);
	},

	multiply: function(z){
		z = this.constructor.from(z);
		var a = this.real, b = this.imag;
		return new this.constructor(
			z.real * a - z.imag * b,
			b * z.real + z.imag * a
		);
	},

	divide: function(z){
		z = this.constructor.from(z);
		var divident = (Math.pow(z.real, 2) + Math.pow(z.imag, 2)),
			a = this.real, b = this.imag;
		return new this.constructor(
			(a * z.real + b * z.imag) / divident,
			(b * z.real - a * z.imag) / divident
		);
	},

	add: function(z){
		z = this.constructor.from(z);
		return new this.constructor(this.real + z.real, this.imag + z.imag);
	},

	subtract: function(z){
		z = this.constructor.from(z);
		return new this.constructor(this.real - z.real, this.imag - z.imag);
	},

	pow: function(z){
		z = this.constructor.from(z);
		var result = z.multiply(this.clone().log()).exp(); // z^w = e^(w*log(z))
		return new this.constructor(result.real, result.imag);
	},

	sqrt: function(){
		var abs = this.magnitude(),
			sgn = this.imag < 0 ? -1 : 1;
		return new this.constructor(
			Math.sqrt((abs + this.real) / 2),
			sgn * Math.sqrt((abs - this.real) / 2)
		);
	},

	log: function(k){
		if (!k) k = 0;
		return new this.constructor(
			Math.log(this.magnitude()),
			this.angle() + k * 2 * Math.PI
		);
	},

	exp: function(){
		return this.fromPolar(
			Math.exp(this.real),
			this.imag
		);
	},

	sin: function(){
		var a = this.real, b = this.imag;
		return new this.constructor(
			Math.sin(a) * cosh(b),
			Math.cos(a) * sinh(b)
		);
	},

	cos: function(){
		var a = this.real, b = this.imag;
		return new this.constructor(
			Math.cos(a) * cosh(b),
			Math.sin(a) * sinh(b) * -1
		);
	},

	tan: function(){
		var a = this.real, b = this.imag,
			divident = Math.cos(2 * a) + cosh(2 * b);
		return new this.constructor(
			Math.sin(2 * a) / divident,
			sinh(2 * b) / divident
		);
	},

	sinh: function(){
		var a = this.real, b = this.imag;
		return new this.constructor(
			sinh(a) * Math.cos(b),
			cosh(a) * Math.sin(b)
		);
	},

	cosh: function(){
		var a = this.real, b = this.imag;
		return new this.constructor(
			cosh(a) * Math.cos(b),
			sinh(a) * Math.sin(b)
		);
	},

	tanh: function(){
		var a = this.real, b = this.imag,
			divident = cosh(2 * a) + Math.cos(2 * b);
		return new this.constructor(
			sinh(2 * a) / divident,
			Math.sin(2 * b) / divident
		);
	},

	clone: function(){
		return new this.constructor(this.real, this.imag);
	},

	toString: function(polar){
		if (polar) return this.magnitude() + ' ' + this.angle();

		var ret = '', a = this.real, b = this.imag;
		if (a) ret += a;
		if (a && b || b < 0) ret += b < 0 ? '-' : '+';
		if (b){
			var absIm = Math.abs(b);
			if (absIm != 1) ret += absIm;
			ret += 'i';
		}
		return ret || '0';
	},

	equals: function(z) {
		z = this.constructor.from(z);
		return (z.real == this.real && z.imag == this.imag);
	}

};

var alias = {
	abs: 'magnitude'
  , arg: 'angle'
  , phase: 'angle'
  , conj: 'conjugate'
  , '**': 'pow'
  , mult: 'multiply'
  , '*':  'multiply'
  , dev: 'divide'
  , '/': 'divide'
  , '+': 'add'
  , sub: 'subtract'
  , '-': 'subtract'
  , '=': 'equals'
};

for (var a in alias) prototype[a] = prototype[alias[a]];

// factories and constants
var extend = {

	from: function(real, im) {
		if (real instanceof Complex) return new Complex(real.real, real.imag);
		return new Complex(real, im);
	},

	fromString: function(str) {
		var match, real, im;
		if (str == 'i') str = '0+1i';
		match = str.match(/(\d+)?([\+\-]\d*)[ij]/);
		if (match) {
			real = match[1];
			im = (match[2] == '+' || match[2] == '-')
				? match[2] + '1'
				: match[2];
		}
		return new Complex(+real, +im);
	},

	fromPolar: function(r, phi) {
		return new Complex(1, 1).fromPolar(r, phi);
	},

	i: new Complex(0, 1),

	one: new Complex(1, 0)

};

for (var e in extend) Complex[e] = extend[e];

var sinh = function(x){
	return (Math.pow(Math.E, x) - Math.pow(Math.E, -x)) / 2;
};

var cosh = function(x){
	return (Math.pow(Math.E, x) + Math.pow(Math.E, -x)) / 2;
};

module.exports = Complex;


});
