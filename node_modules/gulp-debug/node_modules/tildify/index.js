'use strict';
module.exports = function (str) {
	return process.platform === 'win32' ? str : str.replace(process.env.HOME, '~');
};
