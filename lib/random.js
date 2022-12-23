'use strict';
const crypto = require('crypto');
const opts = require('./option-manager').options;
const charPreset = require('./char-preset');

// const randomInt = function (min, max) {
// 	return Math.round(min + (Math.random() * (max - min)));
// };

const {randomInt} = crypto;

const randomNum = function() {
    return parseInt(crypto.randomBytes(6).toString('hex'), 16)/Math.pow(2, 48);
}

const stripCharsFromString = function (string, chars) {
	return string.split('').filter(char => chars.indexOf(char) === -1);
};

exports.int = randomInt;
exports.randomNum = randomNum;

exports.greyColor = function (min, max) {
	min = min || 1;
	max = max || 9;
	const int = randomInt(min, max+1).toString(16);

	return `#${int}${int}${int}`;
};

exports.captchaText = function (options) {
	if (typeof options === 'number') {
		options = {size: options};
	}
	options = options || {};

	const size = options.size || 4;
	const ignoreChars = options.ignoreChars || '';
	let i = -1;
	let out = '';
	let chars = options.charPreset || opts.charPreset;

	if (ignoreChars) {
		chars = stripCharsFromString(chars, ignoreChars);
	}

	const len = chars.length - 1;

	while (++i < size) {
		out += chars[randomInt(0, len)];
	}

	return out;
};

const mathExprPlus = function(leftNumber, rightNumber){
	const text = (leftNumber + rightNumber).toString();
	const equation = leftNumber + '+' + rightNumber;
	return {text, equation}
}

const mathExprMinus = function(leftNumber, rightNumber){
	const text = (leftNumber - rightNumber).toString();
	const equation = leftNumber + '-' + rightNumber;
	return {text, equation}
}

/**
 * Creates a simple math expression using either the + or - operator
 * @param {number} [min] - The min value of the math expression defaults to 1
 * @param {number} [max] - The max value of the math expression defaults to 9
 * @param {string} [operator] - The operator(s) to use
 * @returns {{equation: string, text: string}}
 */
exports.mathExpr = function (min, max, operator) {
	min = min || 1;
	max = max || 9;
    max += 1;
	operator = operator || '+';
	const left = randomInt(min, max);
	const right = randomInt(min, max);
	switch(operator){
		case '+':
			return mathExprPlus(left, right)
		case '-':
			return mathExprMinus(left, right)
		default:
			return (randomInt(1, 3) % 2) ? mathExprPlus(left, right) : mathExprMinus(left, right);
	}
};

// https://github.com/jquery/jquery-color/blob/master/jquery.color.js#L432
// The idea here is generate color in hsl first and convert that to rgb color
exports.color = function (bgColor) {
	// Random 24 colors
	// or based on step
	const hue = randomInt(0, 25) / 24;

	const saturation = randomInt(60, 81) / 100;
	const bgLightness = bgColor ? getLightness(bgColor) : 1.0;
	let minLightness;
	let maxLightness;
	if (bgLightness >= 0.5) {
		minLightness = Math.round(bgLightness * 100) - 45;
		maxLightness = Math.round(bgLightness * 100) - 25;
	} else {
		minLightness = Math.round(bgLightness * 100) + 25;
		maxLightness = Math.round(bgLightness * 100) + 45;
	}
	const lightness = randomInt(minLightness, maxLightness+1) / 100;

	const q = lightness < 0.5 ?
		lightness * (lightness + saturation) :
		lightness + saturation - (lightness * saturation);
	const p = (2 * lightness) - q;

	const r = Math.floor(hue2rgb(p, q, hue + (1 / 3)) * 255);
	const g = Math.floor(hue2rgb(p, q, hue) * 255);
	const b = Math.floor(hue2rgb(p, q, hue - (1 / 3)) * 255);
	/* eslint-disable no-mixed-operators */
	const c = ((b | g << 8 | r << 16) | 1 << 24).toString(16).slice(1);

	return '#' + c;
};

function getLightness(rgbColor) {
	if (rgbColor[0] !== '#') {
		return 1.0; // Invalid color ?
	}
	rgbColor = rgbColor.slice(1);
	if (rgbColor.length === 3) {
		rgbColor = rgbColor[0] + rgbColor[0] +
			rgbColor[1] + rgbColor[1] + rgbColor[2] + rgbColor[2];
	}

	const hexColor = parseInt(rgbColor, 16);
	const r = hexColor >> 16;
	const g = hexColor >> 8 & 255;
	const b = hexColor & 255;
	const max = Math.max(r, g, b);
	const min = Math.min(r, g, b);

	return (max + min) / (2 * 255);
}

function hue2rgb(p, q, h) {
	h = (h + 1) % 1;
	if (h * 6 < 1) {
		return p + (q - p) * h * 6;
	}
	if (h * 2 < 1) {
		return q;
	}
	if (h * 3 < 2) {
		return p + (q - p) * ((2 / 3) - h) * 6;
	}
	return p;
}

const range_from_0 = (n) => [...Array(n).keys()]

// const getCharList = () => {
//     const ucase = range_from_0(26).map(n => String.fromCharCode(65+n));
//     const lcase = range_from_0(26).map(n => String.fromCharCode(97+n));
//     const digs = range_from_0(10).map(n => String.fromCharCode(48+n));
//     return [...ucase, ...lcase, ...digs];
// }

// const charList = getCharList();

const getRandomText = (num = 4) => {
    return range_from_0(num).map(n => charPreset[crypto.randomInt(0, charPreset.length)]).join("");
}

//exports.charList = charList;
exports.getRandomText = getRandomText;
