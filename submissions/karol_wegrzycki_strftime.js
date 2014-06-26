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

;(function() {

  //// Where to export the API
  var namespace;

  // CommonJS / Node module
  if (typeof module !== 'undefined') {
    namespace = module.exports = strftime;
  }

  // Browsers and other environments
  else {
    // Get the global object. Works in ES3, ES5, and ES5 strict mode.
    namespace = (function(){ return this || (1,eval)('this') }());
  }

  function words(s) { return (s || '').split(' '); }

  var DefaultLocale =
  { days: words('Sunday Monday Tuesday Wednesday Thursday Friday Saturday')
  , shortDays: words('Sun Mon Tue Wed Thu Fri Sat')
  , months: words('January February March April May June July August September October November December')
  , shortMonths: words('Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec')
  , AM: 'AM'
  , PM: 'PM'
  , am: 'am'
  , pm: 'pm'
  };

  namespace.strftime = strftime;
  function strftime(fmt, d, locale) {
    return _strftime(fmt, d, locale);
  }

  // locale is optional
  namespace.strftimeTZ = strftime.strftimeTZ = strftimeTZ;
  function strftimeTZ(fmt, d, locale, timezone) {
    if ((typeof locale == 'number' || typeof locale == 'string') && timezone == null) {
      timezone = locale;
      locale = undefined;
    }
    return _strftime(fmt, d, locale, { timezone: timezone });
  }

  namespace.strftimeUTC = strftime.strftimeUTC = strftimeUTC;
  function strftimeUTC(fmt, d, locale) {
    return _strftime(fmt, d, locale, { utc: true });
  }

  namespace.localizedStrftime = strftime.localizedStrftime = localizedStrftime;
  function localizedStrftime(locale) {
    return function(fmt, d, options) {
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
    d = d || new Date();

    locale = locale || DefaultLocale;
    locale.formats = locale.formats || {};

    // Hang on to this Unix timestamp because we might mess with it directly below.
    var timestamp = d.getTime();

    var tz = options.timezone;
    var tzType = typeof tz;

    if (options.utc || tzType == 'number' || tzType == 'string') {
      d = dateToUTC(d);
    }

    if (tz) {
      // ISO 8601 format timezone string, [-+]HHMM
      //
      // Convert to the number of minutes and it'll be applied to the date below.
      if (tzType == 'string') {
        var sign = tz[0] == '-' ? -1 : 1;
        var hours = parseInt(tz.slice(1, 3), 10);
        var mins = parseInt(tz.slice(3, 5), 10);
        tz = sign * (60 * hours) + mins;
      }

      if (tzType) {
        d = new Date(d.getTime() + (tz * 60000));
      }
    }

    var time = {};
    time.timestamp = timestamp;
    time.locale = locale;
    time.d = d;
    time.options = options;
    time.tz = tz
    time.usedTable = [{},{},{},{}];
    return parseFormat(fmt, time);
  }
function parseFormat(fmt, time) {
    var i;
    var result = ""
    var ident;
    for (i=0; i<fmt.length; i++) {
        if (fmt[i] == '%') {
            switch (fmt[i+1]) {
                case '-': ident = getIdentifier(fmt[i+2], '', time.usedTable[0], time);
                          result += ident;
                          time.usedTable[0][fmt[i+2]] = ident;
                          i+=2;
                          break;
                case '_': ident = getIdentifier(fmt[i+2], ' ', time.usedTable[1], time);
                          result += ident;
                          time.usedTable[1][fmt[i+2]] = ident;
                          i+=2;
                          break;
                case '0': ident = getIdentifier(fmt[i+2], '0', time.usedTable[2], time);
                          result += ident;
                          time.usedTable[2][fmt[i+2]] = ident;
                          i+=2;
                          break;
                default: ident = getIdentifier(fmt[i+1], undefined, time.usedTable[3], time);
                         result += ident;
                         time.usedTable[3][fmt[i+1]] = ident;
                         i++;
            }
        } else
            result += fmt[i];
    }
    return result;
}
function getIdentifier(c, padding, table, time) {
      if (table[c])
          return table[c];
      switch (c) {

        // Examples for new Date(0) in GMT

        // 'Thursday'
        case 'A': return time.locale.days[time.d.getDay()];

        // 'Thu'
        case 'a': return time.locale.shortDays[time.d.getDay()];

        // 'January'
        case 'B': return time.locale.months[time.d.getMonth()];

        // 'Jan'
        case 'b': return time.locale.shortMonths[time.d.getMonth()];

        // '19'
        case 'C': return pad(Math.floor(time.d.getFullYear() / 100), padding);

        // '01/01/70'
        case 'D': return parseFormat(time.locale.formats.D || '%m/%d/%y', time);
        // '01'
        case 'd': return pad(time.d.getDate(), padding);

        // '01'
        case 'e': return time.d.getDate();

        // '1970-01-01'
        case 'F': return parseFormat(time.locale.formats.F || '%Y-%m-%d', time);
        // '00'
        case 'H': return pad(time.d.getHours(), padding);

        // 'Jan'
        case 'h': return time.locale.shortMonths[time.d.getMonth()];

        // '12'
        case 'I': return pad(hours12(time.d), padding);

        // '000'
        case 'j':
          var y = new Date(time.d.getFullYear(), 0, 1);
          var day = Math.ceil((time.d.getTime() - y.getTime()) / (1000 * 60 * 60 * 24));
          return pad(day, '0', 3);

        // ' 0'
        case 'k': return pad(time.d.getHours(), padding == null ? ' ' : padding);

        // '000'
        case 'L': return pad(Math.floor(time.timestamp % 1000), '0', 3);

        // '12'
        case 'l': return pad(hours12(time.d), padding == null ? ' ' : padding);

        // '00'
        case 'M': return pad(time.d.getMinutes(), padding);

        // '01'
        case 'm': return pad(time.d.getMonth() + 1, padding);

        // '\n'
        case 'n': return '\n';

        // '1st'
        case 'o': return String(time.d.getDate()) + ordinal(time.d.getDate());

        // 'am'
        case 'P': return time.d.getHours() < 12 ? time.locale.am : time.locale.pm;

        // 'AM'
        case 'p': return time.d.getHours() < 12 ? time.locale.AM : time.locale.PM;

        // '00:00'
        case 'R': return parseFormat(time.locale.formats.R || '%H:%M', time);

        // '12:00:00 AM'
        case 'r': return parseFormat(time.locale.formats.r || '%I:%M:%S %p', time);

        // '00'
        case 'S': return pad(time.d.getSeconds(), padding);

        // '0'
        case 's': return Math.floor(time.timestamp / 1000);

        // '00:00:00'
        case 'T': return parseFormat(time.locale.formats.T || '%H:%M:%S', time);

        // '\t'
        case 't': return '\t';

        // '00'
        case 'U': return pad(weekNumber(time.d, 'sunday'), padding);

        // '4'
        case 'u':
          var day = time.d.getDay();
          return day == 0 ? 7 : day; // 1 - 7, Monday is first day of the week

        // '1-Jan-1970'
        case 'v': return parseFormat(time.locale.formats.v || '%e-%b-%Y', time);
        // '00'
        case 'W': return pad(weekNumber(time.d, 'monday'), padding);

        // '4'
        case 'w': return time.d.getDay(); // 0 - 6, Sunday is first day of the week

        // '1970'
        case 'Y': return time.d.getFullYear();

        // '70'
        case 'y':
          var y = String(time.d.getFullYear());
          return y.slice(y.length - 2);

        // 'GMT'
        case 'Z':
          if (time.options.utc) {
            return "GMT";
          }
          else {
            var tzString = time.d.toString().match(/\((\w+)\)/);
            return tzString && tzString[1] || '';
          }

        // '+0000'
        case 'z':
          if (time.options.utc) {
            return "+0000";
          }
          else {
            var off = typeof time.tz == 'number' ? time.tz : -time.d.getTimezoneOffset();
            return (off < 0 ? '-' : '+') + pad(Math.abs(off / 60)) + pad(off % 60);
          }

        case undefined: return '';

        default: return c;
      }
    }
  function dateToUTC(d) {
    var msDelta = (d.getTimezoneOffset() || 0) * 60000;
    return new Date(d.getTime() + msDelta);
  }

  var RequiredDateMethods = ['getTime', 'getTimezoneOffset', 'getDay', 'getDate', 'getMonth', 'getFullYear', 'getYear', 'getHours', 'getMinutes', 'getSeconds'];
  function quacksLikeDate(x) {
    var i = 0
      , n = RequiredDateMethods.length
      ;
    for (i = 0; i < n; ++i) {
      if (typeof x[RequiredDateMethods[i]] != 'function') {
        return false;
      }
    }
    return true;
  }

  // Default padding is '0' and default length is 2, both are optional.
  function pad(n, padding, length) {
    var s = new String(n);
    if (padding == null) {
      padding = '0';
    }
    length = length || 2;

    // padding may be an empty string, don't loop forever if it is

    if (padding) {
      while (s.length < length) s = padding + s;
    }
    return s;
  }

  function hours12(d) {
    var hour = d.getHours();
    if (hour == 0) return 12;
    else if (hour > 12) return hour - 12;
    return hour;
  }

  // Get the ordinal suffix for a number: st, nd, rd, or th
  function ordinal(n) {
    var i = n % 10;
    var ii = n % 100;

    if (ii >= 11 && ii <= 13) {
      return 'th';
    }

    switch (i) {
      case 1: return 'st';
      case 2: return 'nd';
      case 3: return 'rd';
    }
    return 'th'
  }

  // firstWeekday: 'sunday' or 'monday', default is 'sunday'
  //
  // Pilfered & ported from Ruby's strftime implementation.
  function weekNumber(d, firstWeekday) {
    firstWeekday = firstWeekday || 'sunday';

    // This works by shifting the weekday back by one day if we
    // are treating Monday as the first day of the week.
    var wday = d.getDay();
    if (firstWeekday == 'monday') {
      if (wday == 0) // Sunday
        wday = 6;
      else
        wday--;
    }
    var firstDayOfYear = new Date(d.getFullYear(), 0, 1)
      , yday = (d - firstDayOfYear) / 86400000
      , weekNum = (yday + 7 - wday) / 7
      ;
    return Math.floor(weekNum);
  }

}());
