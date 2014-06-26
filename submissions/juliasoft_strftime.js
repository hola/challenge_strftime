//
// strftime
// github.com/samsonjs/strftime
// @_sjs
//
// Copyright 2010 - 2013 Sami Samhuri <sami@samhuri.net>
//
// MIT License
// http://sjs.mit-license.org
//
/*jslint node: true */
;
(function () {
    'use strict';
    //// Where to export the API
    var namespace;

    var TOK_NONE = 0,
        TOK_PREFIX = 1,
        TOK_PAD = 2,
//
        DAY_SECS = 86400000, //(1000 * 60 * 60 * 24);
//
        CH_PERCENT = '%'.charCodeAt(0),
        CH_MINUS = '-'.charCodeAt(0),
        CH_LODASH = '_'.charCodeAt(0),
        CH_ZERO = '0'.charCodeAt(0);

    // CommonJS / Node module
    if (typeof module !== undefined) {
        namespace = module.exports = strftime;
    } else { // Browsers and other environments
        // Get the global object. Works in ES3, ES5, and ES5 strict mode.
        namespace = (function () {
            return this || (1, eval)('this');
        }());
    }

    function words(s) {
        return (s || '').split(' ');
    }

    var DefaultLocale = {
        days: words('Sunday Monday Tuesday Wednesday Thursday Friday Saturday'),
        shortDays: words('Sun Mon Tue Wed Thu Fri Sat'),
        months: words('January February March April May June July August September October November December'),
        shortMonths: words('Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec'),
        AM: 'AM',
        PM: 'PM',
        am: 'am',
        pm: 'pm'
    };

    namespace.strftime = strftime;
    function strftime(fmt, d, locale) {
        return _strftime(fmt, d, locale);
    }

    // locale is optional
    namespace.strftimeTZ = strftime.strftimeTZ = strftimeTZ;
    function strftimeTZ(fmt, d, locale, timezone) {
        if (timezone === undefined || timezone === null) {
            var v = typeof locale;
            if (v === 'number' || v === 'string') {
                timezone = locale;
                locale = undefined;
            }
        }
        return _strftime(fmt, d, locale, {timezone: timezone});
    }

    namespace.strftimeUTC = strftime.strftimeUTC = strftimeUTC;
    function strftimeUTC(fmt, d, locale) {
        return _strftime(fmt, d, locale, {utc: true});
    }

    namespace.localizedStrftime = strftime.localizedStrftime = localizedStrftime;
    function localizedStrftime(locale) {
        return function (fmt, d, options) {
            return strftime(fmt, d, locale, options);
        };
    }

    // d, locale, and options are optional, but you can't leave
    // holes in the argument list. If you pass options you have to pass
    // in all the preceding args as well.
    //
    // options:
    //   - locale   [object] an object with the same structure as DefaultLocale
    //   - timezone [number] timezone offset in minutes from GMT
    function _strftime(fmt, d, locale, options) {
        options = options || {};

        // d and locale are optional so check if d is really the locale
        if (d && !quacksLikeDate(d)) {
            locale = d;
            d = undefined;
        }
        d = d || now;

        locale = locale || DefaultLocale;
        locale.formats = locale.formats || {};

        // Hang on to this Unix timestamp because we might mess with it directly below.
        var timestamp = d.getTime();

        var tz = options.timezone;
        var tzType = typeof tz;

        if (options.utc || tzType === 'number' || tzType === 'string') {
            d = dateToUTC(d);
        }

        if (tz) {
            // ISO 8601 format timezone string, [-+]HHMM
            //
            // Convert to the number of minutes and it'll be applied to the date below.
            if (tzType === 'string') {
                var sign = tz[0] === '-' ? -1 : 1;
                var hours = parseInt(tz.slice(1, 3), 10);
                var mins = parseInt(tz.slice(3, 5), 10);
                tz = sign * (60 * hours) + mins;
            }

            if (tzType) {
                d = new Date(d.getTime() + (tz * 60000));
            }
        }

        if (!fmt) {
            return fmt;
        } else {
            var s = '';
            var p = null;
            var tok = TOK_NONE;
            for (var i = 0, len = fmt.length; i < len; i++) {
                var x = fmt[i].charCodeAt(0);
                if (x === CH_PERCENT) {
                    if (tok === TOK_NONE) {
                        tok = TOK_PREFIX;
                        p = null;
                    } else {
                        s += fmt[i];
                    }
                } else if (x === CH_MINUS && tok === TOK_PREFIX) {
                    tok = TOK_PAD;
                    p = '';
                } else if (x === CH_LODASH && tok === TOK_PREFIX) {
                    tok = TOK_PAD;
                    p = ' ';
                } else if (x === CH_ZERO && tok === TOK_PREFIX) {
                    tok = TOK_PAD;
                    p = '0';
                } else if (tok === TOK_PREFIX || tok === TOK_PAD) {
                    var f = resolvers[x];
                    if (f !== undefined) {
                        s += f(d, locale, p, options, timestamp, tz);
                    } else {
                        s += fmt[i];
                    }
                    tok = TOK_NONE;
                    //p = null;
                } else {
                    s += fmt[i];
                    tok = TOK_NONE;
                    //p = null;
                }
            } // for
            return s;
        }
    }

    //--- resolvers ----------------------------------------------------------------------------------------------------
    // f(s, d, locale, padchar, options, timestamp, tz)
    var resolvers = [];

    resolvers['A'.charCodeAt(0)] = function (d, locale) {
        return locale.days[d.getDay()];
    };
    resolvers['a'.charCodeAt(0)] = function (d, locale) {
        return locale.shortDays[d.getDay()];
    };
    // 'January'
    resolvers['B'.charCodeAt(0)] = function (d, locale) {
        return locale.months[d.getMonth()];
    };
    resolvers['b'.charCodeAt(0)] = function (d, locale) {
        return locale.shortMonths[d.getMonth()];
    };
    resolvers['C'.charCodeAt(0)] = function (d, locale, padchar) {
        //return pad(Math.floor(d.getFullYear() / 100), padchar);
        return pad(Math.floor(d.getFullYear() / 100), padchar);
    };
    // '01/01/70'
    resolvers['D'.charCodeAt(0)] = function (d, locale) {
        return _strftime(locale.formats.D || '%m/%d/%y', d, locale);
    };
    // '01'
    resolvers['d'.charCodeAt(0)] = function (d, locale, padchar) {
        return pad(d.getDate(), padchar);
    };
    // '01'
    resolvers['e'.charCodeAt(0)] = function (d) {
        return d.getDate();
    };
    // '1970-01-01'
    resolvers['F'.charCodeAt(0)] = function (d, locale) {
        return _strftime(locale.formats.F || '%Y-%m-%d', d, locale);
    };
    // '00'
    resolvers['H'.charCodeAt(0)] = function (d, locale, padchar) {
        return pad(d.getHours(), padchar);
    };
    // 'Jan'
    resolvers['h'.charCodeAt(0)] = function (d, locale) {
        return locale.shortMonths[d.getMonth()];
    };
    // '12'
    resolvers['I'.charCodeAt(0)] = function (d, locale, padchar) {
        return pad(hours12(d), padchar);
    };
    resolvers['j'.charCodeAt(0)] = function (d) {
        fake.setFullYear(d.getFullYear());
        fake.setMonth(0, 1);
        var day = Math.ceil((d.getTime() - fake.getTime()) / DAY_SECS); // (1000 * 60 * 60 * 24));
        return pad(day, 3);
    };
    // ' 0'
    resolvers['k'.charCodeAt(0)] = function (d, locale, padchar) {
        return pad(d.getHours(), padchar === null ? ' ' : padchar);
    };
    // '000'
    resolvers['L'.charCodeAt(0)] = function (d, locale, padchar, options, timestamp) {
        //return pad(Math.floor(timestamp % 1000), 3);
        return pad(Math.floor(timestamp % 1000), 3);
    };
    // '12'
    resolvers['l'.charCodeAt(0)] = function (d, locale, padchar) {
        return pad(hours12(d), padchar === null ? ' ' : padchar);
    };
    // '00'
    resolvers['M'.charCodeAt(0)] = function (d, locale, padchar) {
        return pad(d.getMinutes(), padchar);
    };
    // '01'
    resolvers['m'.charCodeAt(0)] = function (d, locale, padchar) {
        return pad(d.getMonth() + 1, padchar);
    };
    // '\n'
    resolvers['n'.charCodeAt(0)] = function () {
        return '\n';
    };
    // '1st'
    resolvers['o'.charCodeAt(0)] = function (d) {
        return '' + d.getDate() + ordinal(d.getDate());
    };
    // 'am'
    resolvers['P'.charCodeAt(0)] = function (d, locale) {
        return (d.getHours() < 12 ? locale.am : locale.pm);
    };
    // 'AM'
    resolvers['p'.charCodeAt(0)] = function (d, locale) {
        return (d.getHours() < 12 ? locale.AM : locale.PM);
    };
    // '00:00'
    resolvers['R'.charCodeAt(0)] = function (d, locale) {
        return _strftime(locale.formats.R || '%H:%M', d, locale);
    };
    // '12:00:00 AM'
    resolvers['r'.charCodeAt(0)] = function (d, locale) {
        return _strftime(locale.formats.r || '%I:%M:%S %p', d, locale);
    };
    // '00'
    resolvers['S'.charCodeAt(0)] = function (d, locale, padchar) {
        return pad(d.getSeconds(), padchar);
    };
    // '0'
    resolvers['s'.charCodeAt(0)] = function (d, locale, padchar, options, timestamp) {
        //return Math.floor(timestamp / 1000);
        return Math.floor(timestamp / 1000); // >> 0;
    };
    // '00:00:00'
    resolvers['T'.charCodeAt(0)] = function (d, locale) {
        return _strftime(locale.formats.T || '%H:%M:%S', d, locale);
    };
    // '\t'
    resolvers['t'.charCodeAt(0)] = function () {
        return '\t';
    };
    // '00'
    resolvers['U'.charCodeAt(0)] = function (d, locale, padchar) {
        return pad(weekNumber(d, 'sunday'), padchar);
    };
    // '4'
    resolvers['u'.charCodeAt(0)] = function (d) {
        var day = d.getDay();
        return (day === 0 ? 7 : day); // 1 - 7, Monday is first day of the week
    };
    // '1-Jan-1970'
    resolvers['v'.charCodeAt(0)] = function (d, locale) {
        return _strftime(locale.formats.v || '%e-%b-%Y', d, locale);
    };
    // '00'
    resolvers['W'.charCodeAt(0)] = function (d, locale, padchar) {
        return pad(weekNumber(d, 'monday'), padchar);
    };
    // '4'
    resolvers['w'.charCodeAt(0)] = function (d) {
        return d.getDay(); // 0 - 6, Sunday is first day of the week
    };
    // '1970'
    resolvers['Y'.charCodeAt(0)] = function (d) {
        return d.getFullYear();
    };
    // '70'
    resolvers['y'.charCodeAt(0)] = function (d) {
        var y = '' + d.getFullYear();
        return y.slice(y.length - 2);
    };
    // 'GMT'
    resolvers['Z'.charCodeAt(0)] = function (d, locale, padchar, options) {
        if (options.utc) {
            return "GMT";
        } else {
            var tzString = ('' + d).match(/\((\w+)\)/);
            return (tzString && tzString[1] || '');
        }
    };
    // '+0000'
    resolvers['z'.charCodeAt(0)] = function (d, locale, padchar, options, timestamp, tz) {
        if (options.utc) {
            return "+0000";
        } else {
            var off = typeof tz === 'number' ? tz : -d.getTimezoneOffset();
            return (off < 0 ? '-' : '+') + pad(Math.abs(off / 60)) + pad(off % 60);
        }
    };


    //--- resolvers ----------------------------------------------------------------------------------------------------

    function dateToUTC(d) {
        var msDelta = (d.getTimezoneOffset() || 0) * 60000;
        return new Date(d.getTime() + msDelta);
    }

    var now = new Date();
    var fake = new Date();
    //var RequiredDateMethods = ['getTime', 'getTimezoneOffset', 'getDay', 'getDate', 'getMonth', 'getFullYear', 'getYear', 'getHours', 'getMinutes', 'getSeconds'];
    //var n = RequiredDateMethods.length;

    function quacksLikeDate(x) {
        return x && (typeof x['getDate'] === 'function');
//        return (Object.prototype.toString.call(x) === '[object Date]');
    }

// Default padding is '0' and default length is 2, both are optional.
    function pad(n, padding, length) {
        // Defaults handle pad(n) and pad(n, <padding>)
        if (padding === undefined || padding === null) {
            padding = '0';
        } else if (typeof padding === 'number') {
            length = padding;
            padding = '0';
        }
        length = length || 2;

        var s = '' + n;
        // padding may be an empty string, don't loop forever if it is
        var k = length - s.length;
        if (padding && k > 0) {
            if (k === 1) {
                s = padding + s;
            } else if (k === 2) {
                s = padding + padding + s;
            } else {
                var p = '';
                while (k--) {
                    p += padding;
                }
                s = p + s;
            }
        }
        return s;
    }

    function hours12(d) {
        var hour = d.getHours();
        if (hour === 0) {
            hour = 12;
        } else if (hour > 12) {
            hour -= 12;
        }
        return hour;
    }

// Get the ordinal suffix for a number: st, nd, rd, or th
    function ordinal(n) {
        var i = n % 10, ii = n % 100;
        if ((ii >= 11 && ii <= 13) || i === 0 || i >= 4) {
            return 'th';
        } else if (i === 1) {
            return 'st';
        } else if (i === 2) {
            return 'nd';
        } else if (i === 3) {
            return 'rd';
        }
    }

// firstWeekday: 'sunday' or 'monday', default is 'sunday'
//
// Pilfered & ported from Ruby's strftime implementation.
    function weekNumber(d, firstWeekday) {
        firstWeekday = firstWeekday || 'sunday';

        // This works by shifting the weekday back by one day if we
        // are treating Monday as the first day of the week.
        var wday = d.getDay();
        if (firstWeekday === 'monday') {
            if (wday === 0) {// Sunday
                wday = 6;
            } else {
                wday--;
            }
        }

//        var firstDayOfYear = new Date(d.getFullYear(), 0, 1);

//        fake.setTime(0);
        fake.setFullYear(d.getFullYear());
        fake.setMonth(0, 1);
        var firstDayOfYear = fake;

        var yday = (d - firstDayOfYear) / DAY_SECS; // 86400000;
        var weekNum = (yday + 7 - wday) / 7;
        return Math.floor(weekNum); // >> 0; // Math.floor(weekNum);
    }

}())
;
