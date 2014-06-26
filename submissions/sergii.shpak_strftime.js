/***********************************************************
 * Tools
 * strftime
 * Copyright 2014 Sergii Shpak <sergii.shpak.web@gmail.com>
 * MIT License
 * http://shps.mit-license.org
 ************************************************************/

// Export
(function (root, mod) {

    if (typeof exports == "object" && typeof module == "object") return mod(exports); // CommonJS
    if (typeof define == "function" && define.amd) return define(["exports"], mod); // AMD
    mod(root.tools || (root.tools = {})); // Plain browser env

// Module
})((function () {
    return this || (1, eval)('this')
}()), function (exports) {

    'use strict'

    var proto = Date.prototype;

    proto.locale = {
        'days': ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        'shortDays': ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
        'months': ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
        'shortMonths': ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        'AM': 'AM',
        'PM': 'PM',
        'am': 'am',
        'pm': 'pm'
    };

    proto.getFormatHour = function (hour) {
        if (hour == 0) hour = 12;
        return (hour > 12) ? hour -= 12 : hour;
    };

    proto.getFormatAm = function (type) {
        return this.getHours() < 12 ?
            ( type == 'am' ? this.locale['am'] : this.locale['AM']) :
            ( type == 'am' ? this.locale['pm'] : this.locale['PM'])
    };

    proto.getFormatDay = function (short) {
        return this.locale[ short ? 'shortDays' : 'days'][this.getDay()];
    };

    proto.getFormatDayOfWeek = function (firstWeekday, short) {
        var wday = this.getDay();
        if (short)
            return  wday == 0 ? 7 : wday
        if (firstWeekday == 'monday')
            wday = (wday === 0) ? 6 : wday - 1;
        return Math.floor(( (this - new Date(this.getFullYear(), 0, 1)) / 86400000 + 7 - wday) / 7);
    };

    proto.getFormatDayOfYear = function () {
        var y = new Date(this.getFullYear(), 0, 1);
        return Math.ceil((this.getTime() - y.getTime()) / (1000 * 60 * 60 * 24));
    };

    proto.getFormatMonth = function (short) {
        return this.locale[ short ? 'shortMonths' : 'months'][this.getMonth()];
    };

    proto.formatPad = function (n, length, symb) {
        n = String(n)
        while (n.length < length)
            n = symb + n;
        return n;
    };

    proto.formatSuffix = function (n) {
        var d = n % 10;
        return (~~(n % 100 / 10) === 1) ? 'th' :
            (d === 1) ? 'st' :
                (d === 2) ? 'nd' :
                    (d === 3) ? 'rd' : 'th'
    };

    proto.getformatTimeZone = function (callback) {
        if (callback) {
            if (this.utc)
                return "+0000";
            else {
                var off = typeof this.timezone == 'number' ? this.timezone : -this.getTimezoneOffset();
                return (off < 0 ? '-' : '+') + callback(Math.abs(off / 60), 2, "0") + callback(off % 60, "2", 0);
            }
        }
        else {
            if (this.utc)
                return "GMT";
            else {
                var tzString = this.toString().match(/\((\w+)\)/);
                return tzString && tzString[1] || '';
            }
        }
    };

    var map = {
            // Seconds
            'L': 'this.formatPad(this.getMilliseconds(),3,"0")', // 'the milliseconds, padded to 3 digits [Ruby extension]',
            'S': 'this.formatPad(this.getSeconds(),2,"0")', //'the second, padded to 2 digits (00-60)',
            's': 'Math.round(this.getTime()/1000)', //'the number of seconds since the Epoch, UTC',
            // Minute
            'M': 'this.formatPad(this.getMinutes(),2,"0")', //'the minute, padded to 2 digits (00-59)',
            // Hour
            'H': 'this.formatPad(this.getHours(),2,"0")', //'the hour (24-hour clock), padded to 2 digits (00-23)',
            'I': 'this.formatPad(this.getFormatHour(this.getHours()),2,"0")', //'the hour (12-hour clock), padded to 2 digits (01-12)',
            'k': 'this.formatPad(this.getHours(),2," ")', //'the hour (24-hour clock), padded with a leading space for single digit values (0-23)',
            'l': 'this.formatPad(this.getFormatHour(this.getHours()),2," ")', //'the hour (12-hour clock), padded with a leading space for single digit values (1-12)',
            'P': 'this.getFormatAm("am")', // '"am" or "pm" in lowercase [Ruby extension]',
            'p': 'this.getFormatAm("AM")', // '"am" or "pm" in lowercase [Ruby extension]',
            // Day
            'A': 'this.getFormatDay()',//'full weekday name'
            'a': 'this.getFormatDay("shortDays")', //'abbreviated weekday name'
            'd': 'this.formatPad(this.getDate(),2,"0")', //'day of the month, padded to 2 digits (01-31)',
            'e': 'this.formatPad(this.getDate(),2," ")', //'day of the month, padded with a leading space for single digit values (1-31)',
            'j': 'this.formatPad(this.getFormatDayOfYear(),2," ")',//'day of the year, padded to 3 digits (001-366)',
            'o': 'this.getDate() + this.formatSuffix(this.getDate())',//'day of the month as an ordinal (without padding), e.g. 1st, 2nd, 3rd, 4th, ...',
            'w': 'this.getDay()', //'the weekday, Sunday as the first day of the week (0-6)',
            'u': 'this.getFormatDayOfWeek("",true)', //'the weekday, Monday as the first day of the week (1-7)',
            // Week
            'U': 'this.formatPad(this.getFormatDayOfWeek(),2,"0")', //'week number of the year, Sunday as the first day of the week, padded to 2 digits (00-53)',
            'W': 'this.formatPad(this.getFormatDayOfWeek("monday"),2,"0")', // 'week number of the year, Monday as the first day of the week, padded to 2 digits (00-53)',
            // Month
            'B': 'this.getFormatMonth()', //'full month name',
            'b': 'this.getFormatMonth("shortMonths")', //'abbreviated month name',
            'h': 'this.getFormatMonth("shortMonths")', //'the same as %b (abbreviated month name)',
            'm': 'this.formatPad(this.getMonth()+1,2,"0")', //'the month, padded to 2 digits (01-12)',
            //Year
            'C': 'this.formatPad(Math.floor(this.getFullYear() / 100) ,2,"0")', //'AD century (year / 100), padded to 2 digits',
            'Y': 'this.getFullYear()',//'the year with the century',
            'y': 'String(this.getFullYear()).substring(2)', //'the year without the century (00-99)',
            // Other equivalents, timezones, etc
            'D': 'this.formatPad(this.getMonth()+1,2,"0")+"/"+this.formatPad(this.getDate(),2,"0")+"/"+String(this.getFullYear()).substring(2)',//'equivalent to %m/%d/%y',
            'F': 'this.getFullYear()+"-"+this.formatPad(this.getMonth()+1,2,"0")+"-"+this.formatPad(this.getDate(),2,"0")', //'equivalent to %Y-%m-%d',
            'n': '"\\n"', //'newline character',
            'R': 'this.formatPad(this.getHours(),2,"0") + ":"+this.formatPad(this.getMinutes(),2,"0")', //'equivalent to %H:%M',
            'r': 'this.formatPad(this.getFormatHour(this.getHours()),2,"0")+":"+this.formatPad(this.getMinutes(),2,"0")+":"+this.formatPad(this.getSeconds(),2,"0") +" "+this.getFormatAm("AM")',//'equivalent to %I:%M:%S %p',
            'T': 'this.formatPad(this.getHours(),2,"0") + ":"+this.formatPad(this.getMinutes(),2,"0") +":"+this.formatPad(this.getSeconds(),2,"0")', //'equivalent to %H:%M:%S',
            't': '"\\t"', //'tab character',
            'v': 'this.formatPad(this.getDate(),2," ")+"-"+this.getFormatMonth("shortMonths")+"-"+this.getFullYear()', //'equivalent to %e-%b-%Y',
            'Z': 'this.getformatTimeZone()', //'the time zone name, replaced with an empty string if it is not found',
            'z': 'this.getformatTimeZone(this.formatPad)' //'the time zone offset from UTC, with a leading plus sign for UTC and zones east of UTC and a minus sign for those west of UTC, hours and minutes follow each padded to 2 digits and with no delimiter between them'
        },

        dateToUtc = function (date) {
            var msDelta = (date.getTimezoneOffset() || 0) * 60000,
                newDate = new Date(date.getTime() + msDelta);
            newDate.utc = true;
            return newDate;
        },

        dateTimeZone = function (date, tz) {
            var sign = tz[0] == '-' ? -1 : 1,
                hours = parseInt(tz.slice(1, 3), 10),
                mins = parseInt(tz.slice(3, 5), 10),
                newDate = new Date(date.getTime() + ((sign * (60 * hours) + mins) * 60000));
            newDate.timezone = tz;
            return newDate;
        },

        strftime = function (fmt, date, locale, options) {

            var date = date || new Date();

            if (options) {
                if (options.timezone)
                    date = dateTimeZone(date, options.timezone);
                if (options.utc && (!date.utc))
                    date = dateToUtc(date);
            }

            if (typeof date[fmt] == 'string')
                return date[fmt];
            else if (typeof proto[fmt] != 'function') {
                if (locale) date.locale = locale;
                proto[fmt] = new Function("obj", "return '" + fmt.replace(/%(.)/g, function (str, key) {
                    return map[key] ? "'+" + map[key] + "+'" : str;
                }) + "'");
            }
            return date[fmt] = date[fmt]();
        };


    exports.strftime = strftime;

    exports.strftimeTZ = function (fmt, date, locale, timezone) {

        if ((typeof locale == 'number' || typeof locale == 'string') && timezone == null) {
            timezone = locale;
            locale = undefined;
        }
        return strftime(fmt, date, locale, { timezone: timezone });
    };

    exports.strftimeUTC = function (fmt, date, locale) {
        return strftime(fmt, date, locale, { utc: true })
    }
})