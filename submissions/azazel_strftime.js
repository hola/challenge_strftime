var defaultLocale = require('./lib/locales/en_US'),
    assemble = require('./lib/assemble');

var DATE_VARIABLE_NAME = '__D';
var LOCALE_VARIABLE_NAME = '__L';
var STRING_FORMAT_NAME = '__S';
var OPTIONS_NAME = '__O';
var CACHE_MAX_LENGTH = 5;
var OBJECT_UTC_TRUE = { utc: true };

var formatCache = {};
var defaultOptions = {};
var cache = new Array(CACHE_MAX_LENGTH + 1).join().split('').map(function () {
    return {
        format: null,
        ts: null,
        value: null
    };
});
var cachePointer = 0;

/**
 * Creates factory function
 *
 * @param {String} format
 * @returns {Function}
 */
function compile(format) {
    return new Function(DATE_VARIABLE_NAME, LOCALE_VARIABLE_NAME, STRING_FORMAT_NAME, OPTIONS_NAME, assemble(format));
}

/**
 * Date formatter
 *
 * @param {String} format
 * @param {Date} [date]
 * @param {Object} [locale]
 * @param {Object} [options]
 * @param {Boolean} [options.utc]
 * @param {String|Number} [options.timezone]
 *
 * @see locales/en_US.js
 *
 * @returns {String}
 */
function _strftime(format, date, locale, options) {
    date = date || new Date();

    if (!formatCache.hasOwnProperty(format)) {
        formatCache[format] = compile(format);
    }

    return formatCache[format](date, locale || defaultLocale, _strftime, options || defaultOptions);
}

/**
 * Cached date formatter. Endpoint
 *
 * @param {String} format
 * @param {Date} [date]
 * @param {Object} [locale]
 * @param {Object} [options]
 * @param {Boolean} [options.utc]
 * @param {String|Number} [options.timezone]
 *
 * @see locales/en_US.js
 *
 * @returns {String}
 */
function strftime(format, date, locale, options) {
    // Disable cache if custom locale passed
    if ((typeof locale !== 'undefined' && locale !== defaultLocale) || typeof options !== 'undefined') {
        return _strftime(format, date, locale, options);
    }

    date = date || new Date();

    var ts = date.getTime();

    for (var i = 0, item; i < CACHE_MAX_LENGTH; i++) {
        item = cache[i];
        if (item.format === format && item.ts === ts) {
            return item.value;
        }
    }

    var value = _strftime(format, date);

    if (cachePointer > CACHE_MAX_LENGTH - 1) {
        cachePointer = 0;
    }

    var cacheItem = cache[cachePointer];
    cacheItem.format = format;
    cacheItem.ts = ts;
    cacheItem.value = value;

    cachePointer++;
    return value;
}

/**
 * UTC based sprintf
 *
 * @param {String} format
 * @param {Date} [date]
 * @param {Object} [locale]
 * @returns {String}
 */
function strftimeUTC(format, date, locale) {
    return strftime(format, date, locale || defaultLocale, OBJECT_UTC_TRUE);
}

/**
 * Localized strftime factory
 *
 * var strftime = require('strftime')
 * var it_IT = { ... };
 * var strftime_IT = strftime.localizedStrftime(it_IT)
 * console.log(strftime_IT('%B %d, %Y %H:%M:%S'))
 *
 * @param {Object} locale
 *
 * @see locales/en_US.js
 *
 * @returns {Function}
 */
function localizedStrftime(locale) {
    /**
     * @param {String} format
     * @param {Date} [date]
     * @param {Object} [options]
     * @param {Boolean} [options.utc]
     * @param {String|Number} [options.timezone]
     */
    return function(format, date, options) {
        return _strftime(format, date, locale, options);
    };
}

/**
 * Timezone-based sprintf
 *
 * @example
 *
 * strftimeTZ('%F %T', new Date(1307472705067), '+0200')
 *
 * @param {String} format
 * @param {Date} [date]
 * @param {Object} [locale]
 * @param {String|Number} [timezone]
 */
function strftimeTZ(format, date, locale, timezone) {
    if ((typeof locale == 'number' || typeof locale == 'string') && timezone == null) {
      timezone = locale;
      locale = undefined;
    }
    return strftime(format, date, locale, { timezone: timezone });
}

module.exports = strftime;
module.exports.strftime = strftime;
module.exports.strftimeUTC = strftimeUTC;
module.exports.strftimeTZ = strftimeTZ;
module.exports.localizedStrftime = localizedStrftime;
module.exports.assemble = assemble;
module.exports.compile = compile;
