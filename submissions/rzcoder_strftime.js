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

;
(function () {
    "use strict";

    //// Where to export the API
    var namespace;

    // CommonJS / Node module
    if (typeof module !== 'undefined') {
        namespace = module.exports = strftime;
    }

    // Browsers and other environments
    else {
        // Get the global object. Works in ES3, ES5, and ES5 strict mode.
        namespace = (function () {
            return this || (1, eval)('this')
        }());
    }

    function words(s) {
        return (s || '').split(' ');
    }

    var DefaultLocale = {
        days: words('Sunday Monday Tuesday Wednesday Thursday Friday Saturday'),
        shortDays: words('Sun Mon Tue Wed Thu Fri Fri'),
        months: words('January February March April May June July August September October November December'),
        shortMonths: words('Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec'),
        AM: 'AM',
        PM: 'PM',
        am: 'am',
        pm: 'pm',
        formats: {},
        toString: function() {return "";}
    };

    var longCachedDate = {
        ts: 0,
        tsMin: 0,
        tsMax: 0,
        year: 0,
        shortYear: 0,
        month: 0,
        date: 0,
        day: 0
    };

    var shortCachedDateMax = 0;

    var longCachedResults = {};  // minute
    var shortCachedResults = {}; // second

    function cacheDate(d) {
        var maxDate;
        var minDate;

        var ts = d.getTime();

        longCachedDate.ts = ts;
        if(!(ts >= longCachedDate.tsMin && ts <= longCachedDate.tsMax)) {
            maxDate = new Date(d);
            maxDate.setSeconds(59);
            maxDate.setMilliseconds(999);

            minDate = new Date(d);
            minDate.setSeconds(0);

            longCachedDate.tsMax  = maxDate.getTime();
            longCachedDate.tsMin = minDate.getTime();
            longCachedDate.year = d.getFullYear();
            longCachedDate.shortYear = longCachedDate.year % 100;
            longCachedDate.fYear = Math.floor(longCachedDate.year / 100);
            longCachedDate.month = d.getMonth();
            longCachedDate.date = d.getDate();
            longCachedDate.day = d.getDay();
            longCachedDate.hours = d.getHours();
            longCachedDate.minutes = d.getMinutes();

            longCachedResults = {};
        }


        if (ts > shortCachedDateMax ) {
            shortCachedDateMax = Math.floor(ts / 1000 + 1) * 1000 - 1;
            shortCachedResults = {};
        }
    }

    var replaceTable = {

        // 'Thursday'
        '%A': function (d, options, padding, tz, locale) {
            return locale.days[longCachedDate.day];
        },

        // 'Thu'
        '%a': function (d, options, padding, tz, locale) {
            return locale.shortDays[longCachedDate.day];

        },

        // 'January'
        '%B': function (d, options, padding, tz, locale) {
            return locale.months[longCachedDate.month];
        },

        // 'Jan'
        '%b': function (d, options, padding, tz, locale) {
            return locale.shortMonths[longCachedDate.month];
        },

        // '19'
        '%C': function (d, options, padding, tz, locale) {
            var n1 = longCachedDate.fYear;
            if (n1 < 10) return padding + String(longCachedDate.fYear);
            else return n1;
        },

        // '01/01/70'
        '%D': function (d, options, padding, tz, locale) {
            if(!locale.formats.D) {
                //m
                var n2 = longCachedDate.month + 1;
                if (n2 < 10) var res = padding + String(n2) + '/';
                else var res = n2 + '/';

                //d //y
                if ((n2 = longCachedDate.date) < 10) return res + padding + String(n2) + '/' + longCachedDate.shortYear;
                else return res + n2 + '/' + longCachedDate.shortYear;
            } else {
                return JIT(locale.formats.D, d, locale, tz, {replace: false}).res;
            }
        },

        // '01'
        '%d': function (d, options, padding, tz, locale) {
            var n3 = longCachedDate.date;
            if (n3 < 10) return padding + String(n3);
            else return n3;
        },

        // '01'
        '%e': function (d, options, padding, tz, locale) {
            return longCachedDate.date;
        },

        // '1970-01-01'
        '%F': function (d, options, padding, tz, locale) {
            if(!locale.formats.F) {
                //Y-m
                var n4 = longCachedDate.month + 1;
                if (n4 < 10) var res = longCachedDate.year + '-' + padding + String(n4) + '-';
                else var res = longCachedDate.year + '-' + n4 + '-';

                //d
                if ((n4 = longCachedDate.date) < 10) return res + padding + String(n4);
                else return res + n4;
            } else {
                return JIT(locale.formats.F, d, locale, tz, {replace: false}).res;
            }
        },

        // '00'
        '%H': function (d, options, padding, tz, locale) {
            var n5 = longCachedDate.hours;
            if (n5 < 10) return padding + String(n5);
            else return n5;
        },

        // 'Jan'
        '%h': function (d, options, padding, tz, locale) {
            return locale.shortMonths[longCachedDate.month];
        },

        // '12'
        '%I': function (d, options, padding, tz, locale) {
            var n6 = longCachedDate.hours;
            n6 = n6 > 12 ? n6 - 12 : n6 || 12;
            if (n6 < 10) return padding + String(n6);
            else return n6;
        },

        // '000'
        '%j': function (d, options, padding, tz, locale) {
            var y = new Date(longCachedDate.year, 0, 1);
            var day = Math.ceil((d.getTime() - y.getTime()) / (1000 * 60 * 60 * 24));

            var s1 = String(day);
            while (s1.length < 3) s1 = '0' + s1;
            return s1;
        },

        // ' 0'
        '%k': function (d, options, padding, tz, locale) {
            var n7 = longCachedDate.hours;
            if (n7 < 10) return (padding === 0 ? ' ' : padding) + String(n7);
            else return n7;
        },

        // '000'
        '%L': function (d, options, padding, tz, locale) {
            var s2 = String(Math.floor(d.getTime() % 1000));
            while (s2.length < 3) s2 = '0' + s2;
            return s2;
        },

        // '12'
        '%l': function (d, options, padding, tz, locale) {
            var n8 = longCachedDate.hours;
            n8 = n8 > 12 ? n8 - 12 : n8 || 12;
            if (n8 < 10) return  (padding === 0 ? ' ' : padding) + String(n8);
            else return n8;
        },

        // '00'
        '%M': function (d, options, padding, tz, locale) {
            var n9 = longCachedDate.minutes;
            if (n9 < 10) return padding + String(n9);
            else return n9;
        },

        // '01'
        '%m': function (d, options, padding, tz, locale) {
            var n10 = longCachedDate.month + 1;
            if (n10 < 10) return padding + String(n10);
            else return n10;
        },

        // '\n'
        '%n': function (d, options, padding, tz, locale) {
            return '\n';
        },

        // '1st'
        '%o': function (d, options, padding, tz, locale) {
            return String(longCachedDate.date) + ordinal(longCachedDate.date);
        },

        // 'am'
        '%P': function (d, options, padding, tz, locale) {
            return longCachedDate.hours < 12 ? locale.am : locale.pm;
        },

        // 'AM'
        '%p': function (d, options, padding, tz, locale) {
            return longCachedDate.hours < 12 ? locale.AM : locale.PM;
        },

        // '00:00'
        '%R': function (d, options, padding, tz, locale) {
            if(!locale.formats.R) {
                //H
                var n11 = longCachedDate.hours;
                if (n11 < 10) var res = padding + String(n11) + ':';
                else var res = n11 + ':';

                //M
                if ((n11 = longCachedDate.minutes) < 10) return res + padding + String(n11);
                else return res + n11;
            } else {
                return JIT(locale.formats.R, d, locale, tz, {replace: false}).res;
            }
        },

        // '12:00:00 AM'
        '%r': function (d, options, padding, tz, locale) {
            if(!locale.formats.r) {
                //I
                var h1_1 = longCachedDate.hours;
                var h1 = h1_1 > 12 ? h1_1 - 12 : h1_1 || 12;
                if (h1 < 10) var res = padding + String(h1) + ':';
                else var res = h1 + ':';

                //M
                var n12 = longCachedDate.minutes;
                if (n12 < 10) res += padding + String(n12) + ':';
                else res += n12 + ':';

                //S
                if ((n12 = Math.ceil((longCachedDate.ts - longCachedDate.tsMin) / 1000)) < 10) res += padding + String(n12) + ' ';
                else res += n12 + ' ';

                //p
                if (h1_1 < 12)
                    return res + locale.AM;
                else
                    return res + locale.PM;

            } else {
                return JIT(locale.formats.r, d, locale, tz, {replace: false}).res;
            }

        },

        // '00'
        '%S': function (d, options, padding, tz, locale) {
            var n13 = Math.ceil((longCachedDate.ts - longCachedDate.tsMin) / 1000);
            if (n13 < 10) return padding + String(n13);
            else return n13;
        },

        // '0'
        '%s': function (d, options, padding, tz, locale) {
            return Math.floor(d.getTime() / 1000);
        },

        // '00:00:00'
        '%T': function (d, options, padding, tz, locale) {
            if (!locale.formats.T) {
                //H
                var n14 = longCachedDate.hours;
                if (n14 < 10) var res = padding + String(n14) + ':';
                else var res = n14 + ':';

                //M
                if ((n14 = longCachedDate.minutes) < 10) res += padding + String(n14) + ':';
                else res += n14 + ':';

                //S
                if ((n14 = Math.ceil((longCachedDate.ts - longCachedDate.tsMin) / 1000)) < 10) return res + padding + String(n14);
                else return res + n14;
            } else {
                return JIT(locale.formats.T, d, locale, tz, {replace: false}).res;
            }
        },

        // '\t'
        '%t': function (d, options, padding, tz, locale) {
            return '\t';
        },

        // '00'
        '%U': function (d, options, padding, tz, locale) {
            var n15 = weekNumber(d, 'sunday');
            if (n15 < 10) return padding + String(n15);
            else return n15;
        },

        // '4'
        '%u': function (d, options, padding, tz, locale) {
            var day1 = longCachedDate.day;
            return day1 == 0 ? 7 : day1; // 1 - 7, Monday is first day of the week
        },

        // '1-Jan-1970'
        '%v': function (d, options, padding, tz, locale) {
            if(!locale.formats.v) {
                //e-b-Y
                return longCachedDate.date + '-' + locale.shortMonths[longCachedDate.month] + '-' + longCachedDate.year;
            } else {
                return JIT(locale.formats.v, d, locale, tz, {replace: false}).res;
            }
        },

        // '00'
        '%W': function (d, options, padding, tz, locale) {
            var n16 = weekNumber(d, 'monday');
            if (n16 < 10) return padding + String(n16);
            else return n16;
        },

        // '4'
        '%w': function (d, options, padding, tz, locale) {
            return longCachedDate.day; // 0 - 6, Sunday is first day of the week
        },

        // '1970'
        '%Y': function (d, options, padding, tz, locale) {
            return longCachedDate.year;
        },

        // '70'
        '%y': function (d, options, padding, tz, locale) {
            return longCachedDate.shortYear;
        },
        // 'GMT'
        '%Z': function (d, options, padding, tz, locale) {
            if (options.utc) {
                return "GMT";
            } else {
                var tzString = d.toString().match(/\((\w+)\)/);
                return tzString && tzString[1] || '';
            }
        },

        // '+0000'
        '%z': function (d, options, padding, tz, locale) {
            if (options.utc) {
                return "+0000";
            } else {
                var off = typeof tz == 'number' ? tz : -d.getTimezoneOffset();

                var s1_1 = String(Math.abs(off / 60));
                while (s1_1.length < 2) s1_1 = '0' + s1_1;

                var s2_1 = String(off % 60);
                while (s2_1.length < 2) s2_1 = '0' + s2_1;

                return (off < 0 ? '-' : '+') + s1_1 + s2_1;
            }
        }
    };

    var jited = {};

    function JIT(fmt, d, locale, tz, options) {
        var func;
        var jit;
        if(jit = jited[fmt]) {
            return {longCache: jit.longCache, res: jit.func(d, options, tz, locale)}
        }

        var result = '';

        var length = fmt.length;
        var result = '';
        var intoken = false;
        var symbol = '';
        var padding = 0;
        var str = '';

        var newfunc = '(function(d, options, tz, locale){' +
                     'var result = "";';
        var footer = 'return result;})';

        if(options.replace) {
           var fmt_r = fmt.replace('%H:%M:%S', '%T')
                .replace('%m-%d-%y', '%D')
                .replace('%Y-%m-%d', '%F')
                .replace('%H:%M', '%R')
                .replace('%I:%M:%S %p', '%r')
                .replace('%H:%M:%S', '%T')
                .replace('%e-%b-%Y', '%v');
            length = fmt_r.length;
        } else {
            var fmt_r = fmt
        }

        var longCache = true;

        if (fmt.indexOf('%S') > -1 || fmt.indexOf('%T') > -1 || fmt.indexOf('%r') > -1) {
            longCache = false
        }

        for(var i = 0; i < length; i++) {
            symbol = fmt_r[i];
            if (intoken) {
                switch (symbol) {
                    case '-':
                        padding = '';
                        continue;
                    case '_':
                        padding = ' ';
                        continue;
                    case '0':
                        padding = '0';
                        continue;
                    default:
                        func = replaceTable['%' + symbol];

                        if(func) {
                            newfunc += func.toString().slice(45,-1)
                                .replace("(padding === 0 ? ' ' : padding)", padding === 0 ? "' '" : "'" + padding + "'")
                                .replace('padding', padding !== '' ? "'" + padding + "'" : '')
                                .replace(/return/g, 'result +=');
                        } else {
                            str += symbol;
                        }
                        var intoken = false;
                        var padding = 0;
                }
            } else {
                if (symbol === '%') {
                    intoken = true;

                    newfunc += str ? ("\nresult += '" + str + "';") : '';
                    str = '';
                    continue;
                } else {
                    str += symbol;
                }
            }
        }

        newfunc += (str ? ("\nresult += '" + str + "';") : '') + footer;
        var compiled = eval(newfunc);
        jited[fmt] = {longCache: longCache, func: compiled};

        return {longCache: longCache, res: compiled(d, options, tz, locale)};
    }

    namespace.strftime = strftime;
    function strftime(fmt, d, locale, options) {
        options = options || {};

        // d and locale are optional so check if d is really the locale
        if (d && !(d instanceof Date)) {
            locale = d;
            d = undefined;
        } else {
            d = d || new Date();
        }

        var localeID;
        if (locale) {
            locale.formats = locale.formats || {};
            localeID = locale.toString();
        } else {
            locale = DefaultLocale;
            localeID = '';
        }

        var tz = options.timezone;
        if (options.utc || tz) {
            d = dateToUTC(d);
        }

        var cacheKey = localeID + fmt;

        if (tz) {
            var tzType = typeof tz;

            // ISO 8601 format timezone string, [-+]HHMM
            //
            // Convert to the number of minutes and it'll be applied to the date below.
            if (tzType === 'string') {
                var sign = tz[0] === '-' ? -1 : 1;
                var hours = parseInt(tz.slice(1, 3), 10);
                var mins = parseInt(tz.slice(3, 5), 10);
                tz = sign * (60 * hours) + mins;
            }
            d = new Date(d.getTime() + (tz * 60000));

            cacheKey = cacheKey + tz;
        }

        cacheDate(d);
        var length = fmt.length;
        var func;
        var res;
        if(length != 2 || fmt[1] !== 'S' && fmt[1] !== 'T' && fmt[1] !== 'r') { //fmt hasn't seconds
            if (res = (longCachedResults[cacheKey] || shortCachedResults[cacheKey])) {
                return res;
            } else {
                if(func = replaceTable[fmt]) {
                    return longCachedResults[cacheKey] = func(d, options, 0, tz, locale);
                }

                var jitRes = JIT(fmt, d, locale, tz, {replace: true});
                if (jitRes.longCache) {
                    return longCachedResults[cacheKey] = jitRes.res
                } else {
                    return shortCachedResults[cacheKey] = jitRes.res
                }
            }
        } else {
            if (res = shortCachedResults[cacheKey]) {
                return res;
            } else {
                if(func = replaceTable[fmt]) {
                    return shortCachedResults[cacheKey] = func(d, options, 0, tz, locale);
                }

                var jitRes = JIT(fmt, d, locale, tz, {replace: true});
                if (jitRes.longCache) {
                    return longCachedResults[cacheKey] = jitRes.res
                } else {
                    return shortCachedResults[cacheKey] = jitRes.res
                }
            }
        }
    }

    // locale is optional
    namespace.strftimeTZ = strftime.strftimeTZ = strftimeTZ;
    function strftimeTZ(fmt, d, locale, timezone) {
        if ((typeof locale === 'number' || typeof locale === 'string') && timezone == null) {
            timezone = locale;
            locale = undefined;
        }
        return strftime(fmt, d, locale, { timezone: timezone });
    }

    namespace.strftimeUTC = strftime.strftimeUTC = strftimeUTC;
    function strftimeUTC(fmt, d, locale) {
        return strftime(fmt, d, locale, { utc: true });
    }

    namespace.localizedStrftime = strftime.localizedStrftime = localizedStrftime;
    function localizedStrftime(locale) {
        return function (fmt, d, options) {
            return strftime(fmt, d, locale, options);
        };
    }

    function dateToUTC(d) {
        var msDelta = (d.getTimezoneOffset() || 0) * 60000;
        return new Date(d.getTime() + msDelta);
    }

    // Get the ordinal suffix for a number: st, nd, rd, or th
    function ordinal(n) {
        var i = n % 10, ii = n % 100;

        if ((ii >= 11 && ii <= 13) || i === 0 || i >= 4) {
            return 'th';
        }
        switch (i) {
            case 1:
                return 'st';
            case 2:
                return 'nd';
            case 3:
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
        var wday = longCachedDate.day;
        if (firstWeekday === 'monday') {
            if (wday === 0) // Sunday
                wday = 6;
            else
                wday--;
        }
        var firstDayOfYear = new Date(longCachedDate.year, 0, 1);
        var yday = (d - firstDayOfYear) / 86400000;
        var weekNum = (yday + 7 - wday) / 7;
        return Math.floor(weekNum);
    }

}());
