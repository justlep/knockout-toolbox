import {ko} from './libs.js';

// License: MIT - https://github.com/justlep/knockout-toolbox/LICENSE

let _defaultDecimals = 0,
    _defaultThousandSeparator = '.',
    _defaultDecimalSeparator = ',';

/**
 * @param {number} decimals
 * @param {String} thousandSeparator
 * @param {String} decimalSeparator
 */
function setDefaults(decimals, thousandSeparator, decimalSeparator) {
    _defaultDecimals = decimals;
    _defaultThousandSeparator = thousandSeparator;
    _defaultDecimalSeparator = decimalSeparator;
}

/**
 * Origin: https://developer.mozilla.org/de/docs/Web/JavaScript/Reference/Global_Objects/Math/round
 * Decimal adjustment of a number.
 *
 * @param {string} type - the type of adjustment
 * @param {number} num - the number
 * @param {number} expon - the exponent (the 10 logarithm of the adjustment base), e.g. -2 for 2 digits precision
 * @returns (Number) The adjusted value.
 */
function decimalAdjust(type, num, expon) {
    // If the exp is undefined or zero...
    if (typeof expon === 'undefined' || +expon === 0) {
        return Math[type](num);
    }
    let value = +num,
        exp = +expon;
    // If the value is not a number or the exp is not an integer...
    if (isNaN(value) || !(typeof exp === 'number' && exp % 1 === 0)) {
        return NaN;
    }
    // Shift
    value = value.toString().split('e');
    value = Math[type](+(value[0] + 'e' + (value[1] ? (+value[1] - exp) : -exp)));
    // Shift back
    value = value.toString().split('e');
    return +(value[0] + 'e' + (value[1] ? (+value[1] + exp) : exp));
}

/**
 * Formats a given number.
 * Inspired by: http://stackoverflow.com/questions/149055/how-can-i-format-numbers-as-money-in-javascript
 *
 * @param numberToFormat (number) the number to format
 * @param [decimals] (number) length of decimal part (default: 2)
 * @param [thousandSeparator] (String) sections delimiter (default: {@link _defaultThousandSeparator})
 * @param [commaOrPoint] (String) decimal delimiter (default: {@link _defaultDecimalSeparator})
 */
function formatNumber(numberToFormat, decimals, thousandSeparator, commaOrPoint) {
    let _decimals = (typeof decimals === 'number') ? decimals : 2,
        re = '\\d(?=(\\d{3})+' + (_decimals > 0 ? '\\D' : '$') + ')',
        decimalsDelimiter = commaOrPoint || _defaultDecimalSeparator,
        effectiveGroupDelimiter = (thousandSeparator === '') ? '' : (thousandSeparator || _defaultThousandSeparator),
        num = decimalAdjust('round', numberToFormat, -(_decimals||0)).toFixed(_decimals);

    return num.replace('.', decimalsDelimiter).replace(new RegExp(re, 'g'), '$&' + (effectiveGroupDelimiter));
}

/**
 * Outputs a formatted number.
 * Examples:
 *  <div data-bind="formatNumber: someNumber">  --> 1.234.567.890
 *  <div data-bind="formatNumber: {value: someNumber, decimals: 2}">  --> 1.234.567.890,00
 *  <div data-bind="formatNumber: {value: someNumber, asCurrency: true}" --> 1.234.567.890,00
 *  <div data-bind="formatNumber: {value: someNumber, appendUnit: 'EUR'}"> --> 1.234.567.890,00 EUR
 *  <div data-bind="formatNumber: {value: someNumber, prependUnit: 'EUR'}"> --> EUR 1.234.567.890,00
 *  <div data-bind="formatNumber: {value: null, fallback: '-'}"> --> -
 */
ko.bindingHandlers.formatNumber = {
    setDefaults,
    update: function (element, valueAccessor) {
        let numberOrObject = ko.unwrap(valueAccessor()) || 0,
            isObject = (typeof numberOrObject === 'object'),
            num = (isObject) ? ko.unwrap(numberOrObject.value) : numberOrObject,
            fallback = (isObject && typeof numberOrObject.fallback !== 'undefined') ? numberOrObject.fallback : false,
            decimals = _defaultDecimals,
            unitPrefix = '',
            unitSuffix = '',
            isNumber = (typeof num === 'number') && !isNaN(num),
            formattedNumberToDisplay;

        if (!isNumber && fallback === false) {
            throw 'formatNumber binding expects number value but got ' + num;
        }

        if (isObject) {
            if (numberOrObject.asCurrency) {
                decimals = 2;
            } else if (typeof numberOrObject.decimals === 'number') {
                decimals = numberOrObject.decimals;
            }
            if (numberOrObject.prependUnit) {
                unitPrefix = numberOrObject.prependUnit + ' ';
            } else if (numberOrObject.appendUnit) {
                unitSuffix = ' ' + numberOrObject.appendUnit;
            }
        }

        formattedNumberToDisplay = (isNumber) ? formatNumber(num||0, decimals) : fallback;

        element.textContent = unitPrefix + formattedNumberToDisplay + unitSuffix;
    }
};