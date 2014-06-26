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

// Modified by Nikolay Kuchumov (kuchumovn@gmail.com)

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
  { id: 'default'
  , days: words('Sunday Monday Tuesday Wednesday Thursday Friday Saturday')
  , shortDays: words('Sun Mon Tue Wed Thu Fri Sat')
  , months: words('January February March April May June July August September October November December')
  , shortMonths: words('Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec')
  , AM: 'AM'
  , PM: 'PM'
  , am: 'am'
  , pm: 'pm'
  };

  var cache = {};

  var Cache_flushing_period = 10 * One_minute;

  // flush the cache periodically
  function clean_cache() {
    var now = Date.now();

    for (var key in cache) {
      if (cache[key].expires <= now) {
        delete cache[key];
      }
    }

    setTimeout(clean_cache, Cache_flushing_period);
  }

  function periodical(action, period) {
    action();
    setTimeout(action, period);
  }

  // do it somehow like this; maybe not the best solution, can be thought over.
  // (hangs the benchmark; exit with Ctrl + C)
  periodical(clean_cache, Cache_flushing_period);

  function format(key, date, locale, options, padding) {
    var lexem = dictionary[key];
    if (!lexem) {
      return { value: key };
    }
    if (!lexem.expires) {
      return { value: lexem.generator(date, options) };
    }
    var padded = lexem.padding;
    if (typeof lexem.padding === 'function') {
      padding = lexem.padding(padding);
    }
    var value = lexem.generator(date, options);
    return { 
      value: (padded ? pad(value, padding) : value), 
      expires: lexem.expires(date.getTime())
    };
  }

  var Expires_max = 8640000000000000; // in milliseconds

  // in milliseconds
  var One_second = 1000;
  var One_minute = 60 * One_second;
  var One_hour = 60 * One_minute;
  var One_day = 24 * One_hour;
  var One_year = 364 * One_day;

  // Date is measured since Jan 1st 1970 00:00
  // (is approximate for years)
  var pure_seconds = function(timestamp) { return timestamp - timestamp % One_second }
  var pure_minutes = function(timestamp) { return timestamp - timestamp % One_minute }
  var pure_hours = function(timestamp) { return timestamp - timestamp % One_hour }
  var pure_days = function(timestamp) { return timestamp - timestamp % One_day }
  var pure_years = function(timestamp) { return timestamp - timestamp % One_year }

  function expires(expires_at, generator, options) {
    var configuration = {
      expires: expires_at,
      generator: generator
    }
    if (options) {
      for (var key in options) {
        configuration[key] = options[key];
      }
    }
    return configuration;
  }

  // Added by Mark: required for other fixes.
  function secondly(generator, options) {
    return expires(function(now) {
      return pure_minutes(now) + One_second;
    },
    generator, options);
  }

  function minutely(generator, options) {
    return expires(function(now) {
      return pure_minutes(now) + One_minute;
    },
    generator, options);
  }

  function hourly(generator, options) {
    return expires(function(now) {
      return pure_hours(now) + One_hour;
    },
    generator, options);
  }

  function daily(generator, options) {
    return expires(function(now) {
      return pure_days(now) + One_day;
    },
    generator, options);
  }

  function monthly(generator, options) {
    return expires(function(now) {
      return pure_days(now) + One_day;
    },
    generator, options);
  }

  function yearly(generator, options) {
    return expires(function(now) {
      return pure_years(now) + One_year;
    },
    generator, options);
  }

  // для каждой локали - свой кеш, потому что дни и месяцы могут быть разными 
  // (не только названия, но и количество дней в месяце и количество месяцев в году)

  // pad(...) - вынести за рамки кеша

  // сделать зависимости между ключами - типа, при пересчёте, чтобы не считать все, а из одного выводить другие
  // мб ещё из мелких собирать большие

  // в кеш помещается - при первом вызове (проверить на memory leak)

  // Added by Mark because ReferenceError: locale is not defined.
  var locale = DefaultLocale;

  var dictionary = {
    // 'Thursday'
    'A': daily(function(date) { return locale.days[date.getDay()] }),

    // 'Thu'
    'a': daily(function(date) { return locale.shortDays[date.getDay()] }),

    // 'January'
    'B': monthly(function(date) { return locale.months[date.getMonth()] }), 

    // 'Jan'
    'b': monthly(function(date) { return locale.shortMonths[date.getMonth()] }),

    // Century: '19'
    'C': yearly(function(date) { return Math.floor(date.getFullYear() / 100) }, { padding: true }), 

    // '01/01/70'
    'D': daily(function(date) { return _strftime(locale.formats.D || '%m/%d/%y', date, locale) }),

    // '01'
    'd': daily(function(date) { return date.getDate() }, { padding: true }),

    // '01'
    'e': daily(function(date) { return date.getDate() }),

    // '1970-01-01'
    'F': daily(function(date) { return _strftime(locale.formats.F || '%Y-%m-%d', date, locale) }),

    // '00'
    'H': hourly(function(date) { return date.getHours() }, { padding: true }),

    // 'Jan'
    'h': monthly(function(date) { return locale.shortMonths[date.getMonth()] }),

    // '12'
    'I': hourly(function(date) { return hours12(date) }, { padding: true }),

    // '000'
    'j': daily(function(date) {
      var y = new Date(date.getFullYear(), 0, 1);
      var day = Math.ceil((date.getTime() - y.getTime()) / (1000 * 60 * 60 * 24));
      return pad(day, 3);
    }),

    // ' 0'
    'k': hourly(function(date) { return date.getHours() }, { padding: function(padding) { return padding == null ? ' ' : padding } }),

    // '000'
    'L': { 
      generator: function(date) { return pad(Math.floor(date.getTime() % 1000), 3) },
      padding: true
    },

    // '12'
    'l': hourly(function(date) { return hours12(date) }, { padding: function(padding) { return padding == null ? ' ' : padding } }),

    // '00'
    'M': minutely(function(date) { return date.getMinutes() }, { padding: true }),

    // '01'
    'm': monthly(function(date) { return date.getMonth() + 1 }, { padding: true }),

    // '\n'
    'n': { 
      generator: function(date) { return '\n' }
    },

    // '1st'
    'o': daily(function(date) { return String(date.getDate()) + ordinal(date.getDate()) }),

    // 'am'
    'P': hourly(function(date) { return date.getHours() < 12 ? locale.am : locale.pm }),

    // 'AM'
    'p': hourly(function(date) { return date.getHours() < 12 ? locale.AM : locale.PM }),

    // '00:00'
    'R': minutely(function(date) { return _strftime(locale.formats.R || '%H:%M', date, locale) }),

    // '12:00:00 AM'
    'r': /*secondly(*/function(date) { return _strftime(locale.formats.r || '%I:%M:%S %p', date, locale) }/*)*/,

    // '00'
    // Changed by Mark: didn't work (bad padding).
    'S': secondly(function(date) { return date.getSeconds() }, { padding: true }),

    // '0'
    's': /*secondly(*/function(date) { return Math.floor(date.getTime() / 1000) }/*)*/,

    // '00:00:00'
    // Changed by Mark: didn't work.
    'T': secondly(function(date) { return _strftime(locale.formats.T || '%H:%M:%S', date, locale) }),

    // '\t'
    't': {
      generator: function(date) { return '\t' }
    },

    // '00'
    'U': daily(function(date) { return weekNumber(date, 'sunday') }, { padding: true }),

    // '4'
    'u': daily(function(date) { 
      var day = date.getDay();
      return day == 0 ? 7 : day; // 1 - 7, Monday is first day of the week
    }),

    // '1-Jan-1970'
    'v': daily(function(date) { return _strftime(locale.formats.v || '%e-%b-%Y', date, locale) }),

    // '00'
    'W': daily(function(date) { return weekNumber(date, 'monday') }, { padding: true }),

    // '4'
    // 0 - 6, Sunday is first day of the week
    'w': daily(function(date) { return date.getDay() }),

    // '1970'
    'Y': yearly(function(date) { return date.getFullYear() }),

    // '70'
    'y': yearly(function(date) { 
      var y = String(date.getFullYear());
      return y.slice(y.length - 2);
    }),

    // 'GMT'
    'Z': {
      generator: function(date, options) { 
        if (options.utc) {
          return "GMT";
        }
        else {
          var tzString = date.toString().match(/\((\w+)\)/);
          return tzString && tzString[1] || '';
        }
      }
    },

    // '+0000'
    'z': {
      generator: function(date, options) { 
        if (options.utc) {
          return "+0000";
        }
        else {
          var off = typeof tz == 'number' ? tz : -date.getTimezoneOffset();
          return (off < 0 ? '-' : '+') + pad(Math.abs(off / 60)) + pad(off % 60);
        }
      }
    }
  }

  namespace.flush = flush;
  function flush() {
    cache = {};
  }

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

    locale = locale || DefaultLocale;
    locale.formats = locale.formats || {};

    // Hang on to this Unix timestamp because we might mess with it directly below.
    var timestamp = d ? d.getTime() : Date.now();

    function date_is_required() {
      d = d || new Date(timestamp);
    }

    var tz = options.timezone;
    var tzType = typeof tz;

    if (options.utc || tzType == 'number' || tzType == 'string') {
      date_is_required();
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
        date_is_required();
        d = new Date(d.getTime() + (tz * 60000));
      }
    }

    // TODO: add options.utc and options.timezone to the cache key (important)

    if (!cache[locale.id]) {
      cache[locale.id] = {};
    }
    var locale_cache = cache[locale.id];

    var cached = locale_cache[fmt];
    if (cached && cached.expires > timestamp) {
      return cached.value;
    }

    // Most of the specifiers supported by C's strftime, and some from Ruby.
    // Some other syntax extensions from Ruby are supported: %-, %_, and %0
    // to pad with nothing, space, or zero (respectively).
    var expires = Expires_max;
    var formatted = fmt.replace(/%([-_0]?.)/g, function(_, c) {
      var mod, padding;

      if (c.length == 2) {
        mod = c[0];
        // omit padding
        if (mod == '-') {
          padding = '';
        }
        // pad with space
        else if (mod == '_') {
          padding = ' ';
        }
        // pad with zero
        else if (mod == '0') {
          padding = '0';
        }
        else {
          // unrecognized, return the format
          return _;
        }
        c = c[1];
      }

      date_is_required();
      var result = format(c, d, locale, options, padding);
      if (result.expires) {
        expires = Math.min(expires, result.expires);
      }
      return result.value;
    });

    //console.log('not from cache')

    if (expires < Expires_max) {
      cache[locale.id][fmt] = {
        value: formatted,
        expires: expires
      };
    }

    return formatted;
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
    // pad(n, <length>)
    if (typeof padding === 'number') {
      length = padding;
      padding = '0';
    }

    // Defaults handle pad(n) and pad(n, <padding>)
    if (padding == null) {
      padding = '0';
    }
    length = length || 2;

    var s = String(n);
    // padding may be an empty string, don't loop forever if it is
    if (padding) {
      while (s.length < length) s = padding + s;
    }
    return s;
  }

  function hours12(d) {
    var hour = d.getHours();
    if (hour == 0) hour = 12;
    else if (hour > 12) hour -= 12;
    return hour;
  }

  // Get the ordinal suffix for a number: st, nd, rd, or th
  function ordinal(n) {
    var i = n % 10
      , ii = n % 100
      ;
    if ((ii >= 11 && ii <= 13) || i === 0 || i >= 4) {
      return 'th';
    }
    switch (i) {
      case 1: return 'st';
      case 2: return 'nd';
      case 3: return 'rd';
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
