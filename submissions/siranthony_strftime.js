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
  } else {
    // Browsers and other environments
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
  , formats: {D: '%m/%d/%y', F: '%Y-%m-%d', R: '%H:%M',
              r: '%I:%M:%S %p', T: '%H:%M:%S', v: '%e-%b-%Y'}
  , cache: [[], []]
  };

  var Shortcuts = {
    'day': 'd.getDay()',
    'month': 'd.getMonth()',
    'month1': 'month + 1',
    'fullyear': 'd.getFullYear()',
    'year': '(fullyear / 100) | 0',
    'yearmod': 'fullyear % 100',
    'date': 'd.getDate()',
    'hours': 'd.getHours()',
    'hours12': 'hours == 0 ? 12 : (hours > 12 ? hours - 12 : hours)',
    'time': 'd.getTime()',
    'timemod': 'time % 1000',
    'minutes': 'd.getMinutes()',
    'seconds': 'd.getSeconds()',
    'tzname': '"";\
      var tzi = TZNames[0].length; \
      while(--tzi > 0) if (TZNames[0][tzi] == tz) break; \
      if (tzi < 0) { \
        var dstr = d.toString(); \
        tzi = TZNames[0].push(tz) - 1; \
        TZNames[1].push(dstr.slice(dstr.lastIndexOf("(") + 1, dstr.lastIndexOf(")"))); \
      } \
      tzname = TZNames[1][tzi]',
    'tzval': 'tz === null ? -TZOffset : tz',
    'tzvalabs': 'Math.abs(tzval / 60) | 0',
    'tzvalmod': 'tzval % 60',
    'ord': 'date; var ords = ["th","st","nd","rd"][ \
      (ord =~~ (ord < 0 ? -ord : ord) % 100) > 10 && ord < 14 \
       || (ord %= 10) > 3 ? 0 : ord]',
    'wns': '((dayofyear + 7 - day) / 7) | 0',
    'wnm': '(day === 0 ? wns - 1 : wns)',
    'dayofyear': 'date + DaysToMonth[month]; \
      if (month >= 2 && fullyear % 4 === 0 && (fullyear % 100 !== 0 || fullyear % 400 === 0)) \
        dayofyear++;'
  }

  var FormatChars = 'AaBbCdeHhIjkLlMmnoPpSstUuWwYyZz';
  var Replacers = {
    // Examples for new Date(0) in GMT
    // 'Thursday'
    'A': ['day', 'locale.days[day]'],
    // 'Thu'
    'a': ['day', 'locale.shortDays[day]'],
    // 'January'
    'B': ['month', 'locale.months[month]'],
    // 'Jan'
    'b': ['month', 'locale.shortMonths[month]'],
    // '19'
    'C': ['fullyear', 'year', '$pad2(year, padding)'],
    // '01'
    'd': ['date', '$pad2(date, padding)'],
    // '01'
    'e': ['date', 'date'],
    // '00'
    'H': ['hours', '$pad2(hours, padding)'],
    // 'Jan'
    'h': ['month', 'locale.shortMonths[month]'],
    // '12'
    'I': ['hours', 'hours12', '$pad2(hours12, padding)'],
    // '000' // 86400000 = 1000 * 60 * 60 * 24
    'j': ['date', 'month', 'fullyear', 'daystomonth', 'dayofyear', '$pad3(dayofyear, "0")'],
    // ' 0'
    'k': ['hours', '$pad2(hours, $p(" "))'],
    // '000'
    'L': ['time', 'timemod', '$pad3(timemod, "0")'],
    // '12'
    'l': ['hours', 'hours12', '$pad2(hours12, $p(" "))'],
    // '00'
    'M': ['minutes', '$pad2(minutes, padding)'],
    // '01'
    'm': ['month', 'month1', '$pad2(month1, padding)'],
    // '\n'
    'n': ['"\\n"'],
    // '1st'
    'o': ['date', 'ord', 'date.toString() + ords'],
    // 'am'
    'P': ['hours', '(hours < 12 ? locale.am : locale.pm)'],
    // 'AM'
    'p': ['hours', '(hours < 12 ? locale.AM : locale.PM)'],
    // '00'
    'S': ['seconds', '$pad2(seconds, padding)'],
    // '0'
    's': ['time', '((time / 1000) | 0) + (utc ? -TZOffset * 60 : 0)'],
    't': ['"\t"'],
    // '00'
    'U': ['date', 'month', 'fullyear', 'daystomonth', 'dayofyear',
          'day', 'wns', '$pad2(wns, padding)'],
    // '4'
    'u': ['day', 'day == 0 ? 7 : day;'], // 1 - 7, Monday is first day of the week
    // '00'
    'W': ['date', 'month', 'fullyear', 'daystomonth', 'dayofyear',
          'day', 'wns', 'wnm', '$pad2(wnm, padding)'],
    // '4'
    'w': ['day', 'day'], // 0 - 6, Sunday is first day of the week'
    // '1970'
    'Y': ['fullyear', 'fullyear'],
    // '70'
    'y': ['fullyear', 'yearmod', '$pad2(yearmod, "0")'],
    // 'GMT'
    'Z': ['tzname', '(utc ? "GMT" : tzname)'],
    // '+0000'
    'z': ['tzval', 'tzvalabs', 'tzvalmod', '(utc ? "+0000" : (tzval < 0 ? \
         "-" : "+") + $pad2(tzvalabs, "0") + $pad2(tzvalmod, "0"))']
  }

  var NeedPadding = 'CdHIklMmSUW';
  var ReplacersPrepare = [
    // $pad3(val, padding) -> (val / 100 < 1 ? padding : "") + $pad2(val, padding);
    [new RegExp(/\$pad3\(([^,]+),\s+(.*?)\)/g),
      '($1 / 100 < 1 ? $2 : "") + $pad2($1, $2)'],
    // $pad2(val, padding) -> (val / 10 < 1 ? padding + val : val);
    [new RegExp(/\$pad2\(([^,]+),\s+(.*?)\)/g),
      '($1 / 10 < 1 ? $2 + $1 : $1)']
  ];

  (function advance_replacers() {
    // Replace padding with padding character and p with provided
    // character or padding
    var pdecorator = function(orig, padding, p) {
      var a = [];
      if (orig.length > 1)
        a = orig.slice(0, -1);
      // Replacing:
      // padding -> "padding"
      // $p(default) -> default or padding
      a.push(orig[orig.length - 1].replace(/padding/, '"' + padding + '"').replace(
          /\$p\("(.*?)"\)/, '"' + (p ? '$1' : padding) + '"'));
      return a;
    }

    for (var p = 0; p < NeedPadding.length; ++p) {
      var chr = NeedPadding[p];
      var orig = Replacers[chr];
      Replacers[chr] = pdecorator(orig, '0', 1);
      Replacers['-' + chr] = pdecorator(orig, '', 0);
      Replacers['_' + chr] = pdecorator(orig, ' ', 0);
      Replacers['0' + chr] = pdecorator(orig, '0', 0);
    }

    for (var c in Replacers) {
      var l = Replacers[c].length - 1;
      var str = Replacers[c][l];
      for (var i = 0; i < ReplacersPrepare.length; ++i)
        str = str.replace.apply(str, ReplacersPrepare[i]);
      Replacers[c][l] = str;
    }
  })()

  var TZNames = [[], []];
  var TZOffset = (new Date()).getTimezoneOffset();
  var DaysToMonth = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];

  namespace.strftime = strftime;
  function strftime(fmt, d, locale) {
    return _strftime(fmt, d, locale, null, false);
  }

  // locale is optional
  namespace.strftimeTZ = strftime.strftimeTZ = strftimeTZ;
  function strftimeTZ(fmt, d, locale, timezone) {
    if ((typeof locale == 'number' || typeof locale == 'string') && timezone == null) {
      timezone = tz_min(locale);
      locale = DefaultLocale;
    } else {
      timezone = tz_min(timezone);
    }
    return _strftime(fmt, d, locale, timezone, false);
  }

  namespace.strftimeUTC = strftime.strftimeUTC = strftimeUTC;
  function strftimeUTC(fmt, d, locale) {
    return _strftime(fmt, d, locale, null, true);
  }

  namespace.localizedStrftime = strftime.localizedStrftime = localizedStrftime;
  function localizedStrftime(locale) {
    return function(fmt, d, options) {
      var tz = 0, utc = false;
      if (typeof options === "object") {
        tz = tz_min(options.timezone);
        utc = !!options.utc;
      }
      return _strftime(fmt, d, locale, tz, utc);
    };
  }

  function tz_min(tz) {
    var tzType = typeof tz;
    // ISO 8601 format timezone string, [-+]HHMM
    // Convert to the number of minutes.
    var tz_offset = 0;
    if (tzType == 'string') {
      var sign = tz[0] == '-' ? -1 : 1;
      var hours = parseInt(tz.slice(1, 3), 10);
      var mins = parseInt(tz.slice(3, 5), 10);
      tz_offset = sign * (60 * hours) + mins;
    } else if (tzType == 'number') {
      tz_offset = tz;
    }
    return tz_offset;
  }

  var RequiredDateMethods = ['getTime', 'getTimezoneOffset', 'getDay', 'getDate', 'getMonth', 'getFullYear', 'getYear', 'getHours', 'getMinutes', 'getSeconds'];
  var RequiredDateMethodsCount = RequiredDateMethods.length;

  function _is_date(d) {
    if (d instanceof Date)
      return true;
    if (!d)
      return false;
    for (var i = 0; i < RequiredDateMethodsCount; ++i)
      if (typeof d[RequiredDateMethods[i]] != 'function')
        return false;
    return true;
  }

  function _get_locale(locale) {
    if (locale) {
      if (!locale.formats)
        locale.formats = DefaultLocale.formats;
      if (!locale.cache) {
        // [] - not inlinable, Array slower, but can be inlined
        var c = locale.cache = new Array();
        c.push(new Array()); c.push(new Array());
      }
      return locale;
    }
    return DefaultLocale;
  }


  // d, locale, tz and utc are optional, but you can't leave
  // holes in the argument list. If you pass options you have to pass
  // in all the preceding args as well.
  //
  // options:
  //   - locale   [object] an object with the same structure as DefaultLocale
  //   - tz [number] timezone offset in minutes from GMT
  //   - utc [bool]
  function _strftime(fmt, d, _locale, tz, utc) {
    // d and locale are optional so check if d is really the locale
    var is_date = _is_date(d);
    if (!is_date && d)
      _locale = d;
    var nd = is_date ? d : new Date();
    var locale = _get_locale(_locale);
    var func = _check_cache(fmt, locale);
    var time_offset = 0;
    if (utc || tz !== null)
      time_offset = (tz + TZOffset) * 60000;
    var dt = time_offset ? new Date(nd.getTime() + time_offset) : nd;
    return func(dt, locale, tz, utc, TZNames, TZOffset, DaysToMonth);
  }

  function _check_cache(fmt, locale) {
    var c = locale.cache;
    var fmtidx = c[0].length;
    while (--fmtidx >= 0)
      if (c[0][fmtidx] === fmt)
        break;
    if (fmtidx < 0) {
      fmtidx = c[0].push(fmt) - 1;
      c[1][fmtidx] = _build_func(fmt, locale);
    }
    return c[1][fmtidx];
  }

  var _params = ['d', 'locale', 'tz', 'utc', 'TZNames', 'TZOffset', 'DaysToMonth'];
  function _build_func(fmt, locale) {
    var a = _generate(fmt, locale);
    var func_string = '';
    var args = a[0], str = a[1];
    for (var i = 0; i < args.length; ++i)
      func_string += 'var ' + args[i] + ' = ' + Shortcuts[args[i]] + ';\n';

    var dupes = _dup_expressions(str);
    for (var d = 0; d < dupes.length; ++d)
      func_string += 'var _d' + d + ' = ' + dupes[d] + ';\n';

    func_string += _build_body(str, dupes);
    return Function(_params, func_string);
  }

  function _build_body(str, dupes) {
    var func_string = 'return ';
    for (var elem = 0; elem < str.length; ++elem) {
      if (elem)
        func_string += '+';
      var didx = dupes.indexOf(str[elem]);
      func_string += didx < 0 ? str[elem] : '_d' + didx;
    }
    return func_string;
  }

  function _dup_expressions(array) {
    var dupes = new Array();
    var sorter = new Array();
    for (var i = 0; i < array.length; ++i) {
      var s = array[i];
      if (sorter.indexOf(s) < 0)
        sorter.push(s)
      else if (s.length > 3 && dupes.indexOf(s) < 0)
        dupes.push(s)
    }
    return dupes;
  }

  function _push_unique(args, args_new) {
    for (var i = 0; i < args_new.length; ++i)
      if (args.indexOf(args_new[i]) < 0)
        args.push(args_new[i])
  }

  // Next chars will be considered as format
  // '01/01/70', '1970-01-01', '00:00', '12:00:00 AM', '00:00:00', '1-Jan-1970'
  var Recursive = 'DFRrTv';
  function _generate(fmt, locale) {
    var string = [];
    var args = [];
    var i = 0, n = fmt.length;
    var chr = 0;
    var cachestr = '';
    for (; i < n; ++i) {
      // 37: '%'
      if (fmt.charCodeAt(i) == 37 && (i + 1) < n) {
        var c = fmt[++i];
        if (Recursive.indexOf(c) >= 0) {
          var a = _generate(locale.formats[c], locale);
          _push_unique(args, a[0]);
          string.push.apply(string, a[1]);
          continue;
        }

        chr = fmt.charCodeAt(i);
        cachestr = '';
        if (chr == 45 || chr == 95 || chr == 48) {
          cachestr = fmt[i++];
          c = fmt[i];
        }

        cachestr = cachestr + c;
        if (FormatChars.indexOf(c) >= 0) {
          var r = Replacers[cachestr];
          if (r.length > 1)
            _push_unique(args, r.slice(0, -1));
          string.push(r[r.length - 1]);
          continue;
        }
      }
      string.push('"' + fmt[i] + '"');
    }
    return [args, string];
  }

}());
