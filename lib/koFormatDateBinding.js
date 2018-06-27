import {ko, $, moment} from './libs.js';

/**
 * Knockout-Binding for outputting a formatted date.
 * The given date can be a JS `Date` object or a timestamp.
 * If an invalid date is given, "" is output as a fallback.
 * The fallback value can be overridden.
 *
 * Examples:
 *    <div data-bind="formatDate: someDate">
 *    <div data-bind="formatDate: {date: someDate, withTime: true}">
 *    <div data-bind="formatDate: {date: someDate, format: 'YYYY-MM-DD'}">
 *    <div data-bind="formatDate: {date: someNullableDate, fallback: '-'}'}">
 *
 * (!) Using timezone requires moment-timezone to be loaded additionally to moment,
 *     see https://momentjs.com/timezone/
 *
 *    <div data-bind="formatDate: {date: someNullableDate, fallback: '-', asLondonTime: true}'}">
 *    <div data-bind="formatDate: {date: someNullableDate, fallback: '-', asBerlinTime: true}'}">
 *
 * License: MIT - https://github.com/justlep/knockout-toolbox/LICENSE
 */
const TIMEZONE_LONDON = 'Europe/London',
    TIMEZONE_BERLIN = 'Europe/Berlin',
    DEFAULT_FALLBACK = '';

let _defaultFormat = 'YYYY-MM-DD',
    _defaultFormatWithTime = _defaultFormat + ' h:mm:ss';

/**
 *
 * @param dateOnlyFormat
 * @param dateWithTimeFormat
 */
function setDefaults(dateOnlyFormat, dateWithTimeFormat) {
    if (!dateOnlyFormat || typeof dateOnlyFormat !== 'string') {
        throw 'Invalid dateOnlyFormat';
    }
    if (!dateWithTimeFormat || typeof dateWithTimeFormat !== 'string') {
        throw 'Invalid dateWithTimeFormat format';
    }
    _defaultFormat = dateOnlyFormat;
    _defaultFormatWithTime = dateWithTimeFormat;
}

/**
 * @param {Date} date
 * @param {String} format
 * @param {String} [timeZone]
 * @returns {string}
 */
function formatDate(date, format, timeZone) {
    let momentDate = date && (timeZone ? moment.tz(date, timeZone) : moment(date));
    return momentDate ? momentDate.format(format) : date;
}

function onInitOrUpdate(element, valueAccessor) {
    let dateOrOpts = ko.unwrap(valueAccessor()),
        isOptsObject = dateOrOpts && (typeof dateOrOpts === 'object') && !(dateOrOpts instanceof Date),
        fallback = (isOptsObject && typeof dateOrOpts.fallback !== 'undefined') ? dateOrOpts.fallback : false,
        date = isOptsObject ? ko.unwrap(dateOrOpts.date) : dateOrOpts,
        format = !isOptsObject ? _defaultFormat :
                                 (dateOrOpts.format || (dateOrOpts.withTime ? _defaultFormatWithTime : _defaultFormat)),
        isValidDate = (typeof date === 'number') || (date instanceof Date),
        dateToDisplay;

    if (isValidDate) {
        let asLondonTime = isOptsObject && dateOrOpts.asLondonTime,
            asBerlinTime = isOptsObject && dateOrOpts.asBerlinTime,
            timeZone = asLondonTime ? TIMEZONE_LONDON : asBerlinTime ? TIMEZONE_BERLIN : null;
        dateToDisplay = formatDate(date, format, timeZone);
    } else if (fallback !== false) {
        dateToDisplay = fallback;
    } else {
        dateToDisplay = DEFAULT_FALLBACK;
    }

    $(element).text(dateToDisplay);
}

ko.bindingHandlers.formatDate = {
    setDefaults,
    update: onInitOrUpdate
};
