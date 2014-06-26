// strftime
// github.com/samsonjs/strftime
// @_sjs
//
// Copyright 2010 - 2013 Sami Samhuri <sami@samhuri.net>
// Copyright 2014 Thomas Baquet <me at lordblackfox dot net>
//
// MIT License
// http://sjs.mit-license.org
//

;(function() {
  /**
   *  properties that can be attached to the generated function, depending on
   *  the needs
   */
  var thisObject = {
    defaultLocale: {
      days: ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'],
      shortDays: ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'],
      months: ['January','February','March','April','May','June',
                'July','August','September','October','November','December'],
      shortMonths: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
      AM: 'AM' , PM: 'PM' , am: 'am' , pm: 'pm'
    },

    hours12: function (d) {
      var hour = d.getHours();
      if (hour == 0) hour = 12;
      else if (hour > 12) hour -= 12;
      return hour;
    },

    ordinal: function (n) {
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
    },

    weekNumber: function(d, firstWeekday) {
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
    },

    pad: function(n, padding, length) {
      padding = padding || '0';

      // we know that length will never be bigger than 3
      var r = '';
      switch(length) {
        case 4:
          if(n < 1000)
            r += padding;
        case 3:
          if(n < 100)
            r += padding;
        case 2:
          if(n < 10)
            r += padding;
      }
      return r + n;
    }
  }



  /**
   *  this function generates the return statement for the generated strftime
   *  function, and set _require properties to tell makeStrftime function which
   *  code to add to the function.
   *
   *  the arguments 'fmt' and 'options' are similar to the original strftime
   *  function.
   *
   *  = Note
   *  since some operations that are set with _require must be executed before
   *  others, we just leave theses to makeStrftime.
   */
  function makeOps (fmt, options, _require) {
    var ops = [];

    // since padding can be passed as null in pad(), we need it to appear as
    // "null" in the source code of the function, so we make it as a string
    // and adapt it
    var padding   = "null";

    var i = 0,
        j = 0;
    // regexps are bad for performances so we use the good old method
    while ((i = fmt.indexOf('%', i)) != -1) {
      if(i > j)
        ops.push("'" + fmt.substring(j, i) + "'");

      i++;
      var c = fmt[i];
      switch (c) {
        case 'A':
          ops.push('locale.days[d.getDay()]');
          break;

        case 'a':
          ops.push('locale.shortDays[d.getDay()]');
          break;

        case 'B':
          ops.push('locale.months[d.getMonth()]');
          break;

        case 'h':
        case 'b':
          ops.push('locale.shortMonths[d.getMonth()]');
          break;

        case 'C':
          ops.push('this.pad(Math.floor(d.getFullYear() / 100),' + padding + ', 2)');
          break;

        case 'D':
          ops.push(makeOps('%m/%d/%y', options, _require));
          break;

        case 'd':
          ops.push('this.pad(d.getDate(),'+ padding + ', 2)');
          break;

        case 'e':
          ops.push('d.getDate()');
          break;

        case 'F':
          _require.localeFormats = true;
          ops.push('(locale.formats.F || ' + makeOps('%Y-%m-%d', options, _require) + ')');
          break;

        case 'H':
          ops.push('this.pad(d.getHours(),'+ padding + ', 2)');
          break;

        case 'I':
          ops.push('this.pad(this.hours12(d),'+ padding + ', 2)');
          break;

        case 'j':
          _require.dayOfYear = true;
          ops.push('this.pad(dayOfYear, "0", 3)');
          break;

        case 'k':
          ops.push('this.pad(d.getHours(),'+ (padding == 'null' ? '" "' : padding) + ', 2)');
          break;

        case 'L':
          _require.timestamp = true;
          ops.push('this.pad(Math.floor(timestamp % 1000), "0", 3)');
          break;

        case 'l':
          ops.push('this.pad(this.hours12(d),'+ (padding == 'null' ? '" "' : padding) + ', 2)');
          break;

        case 'M':
          ops.push('this.pad(d.getMinutes(),'+ padding + ', 2)');
          break;

        case 'm':
          ops.push('this.pad(d.getMonth() + 1,'+ padding + ', 2)');
          break;

        case 'n':
          ops.push('"\\n"');
          break;

        case 'o':
          ops.push('String(d.getDate()) + this.ordinal(d.getDate())');
          break;

        case 'P':
          ops.push('(d.getHours() < 12 ? locale.am : locale.pm)');
          break;

        case 'p':
          ops.push('(d.getHours() < 12 ? locale.AM : locale.PM)');
          break;

        case 'R':
          _require.localeFormats = true;
          ops.push('(locale.formats.R || ' + makeOps('%H:%M', options, _require) + ')');
          break;

        case 'r':
          _require.localeFormats = true;
          ops.push('(locale.formats.r || ' + makeOps('%I:%M:%S %p', options, _require) + ')');
          break;

        case 'S':
          ops.push('this.pad(d.getSeconds(),'+ padding + ', 2)');
          break;

        case 's':
          _require.timestamp = true;
          ops.push('Math.floor(timestamp / 1000)');
          break;

        case 'T':
          _require.localeFormats = true;
          ops.push('(locale.formats.T || ' + makeOps('%H:%M:%S', options, _require) + ')');
          break;

        case 't':
          ops.push('"\\t"');
          break;

        case 'U':
        case 'W':
          _require.weekNumber = true;
          var c = (c == 'U') ? 'sunday' : 'monday';
          ops.push('this.pad(this.weekNumber(d, "' + c + '"),'+ padding + ', 2)');
          break;

        case 'u':
          _require.day = true;
          //var day = d.getDay();
          ops.push('(day == 0 ? 7 : day)');
          break;

        case 'v':
          _require.localeFormats = true;
          ops.push('(locale.formats.v || ' + makeOps('%e-%b-%Y', options, _require) + ')');
          break;

        case 'w':
          ops.push('d.getDay()');
          break;

        case 'Y':
          ops.push('d.getFullYear()');
          break;

        case 'y':
          _require.year = true;
          ops.push('year.slice(year.length - 2)');
          break;

        // 'GMT'
        case 'Z':
          if (options.utc)
            ops.push('"GMT"');
          else {
            _require.tzString = true;
            ops.push('(tzString && tzString[1] || "")');
          }
          break;

        // '+0000'
        case 'z':
          if (options.utc)
            ops.push('"+0000"');
          else {
            _require.off = true;
            ops.push('(off < 0 ? "-" : "+") + this.pad(Math.abs(off/60), "0", 2) ' +
                      '+ this.pad(off%60, "0", 2)');
          }
          break;

        ///'+ padding + ':
        //  omit
        case '-':
          padding = '';
          break;

        //  space
        case '-':
          padding = ' ';
          break;

        //  0
        case '0':
          padding = '0';
          break;

        default:
          ops.push('"' + c + '"');
      }

      i++;
      j = i;
    } // while

    // ensure result is a string with ""
    return '("" + ' + ops.join('+') + ')';
  }



  /**
   *  This is the principal function that generates the static version of
   *  strftime ( static_strftime ) and return it.
   *
   *    static_strftime([d = new Date() [, locale = defaultLocale]])
   *
   *  "options" and "fmt" from the normal version are used statically to
   *  generate the function, so it is no more needed in static_strftime.
   *
   *  "locale" argument is not statically used because it won't make much
   *  difference (and even can be seen as heavier -- but need a profile);
   *  so we prefer to dynamic version.
   */
  function makeStrftime(fmt, options) {
    // todo: verify with default init
    var src= [
      "var padding = null",                       // padding, mod
      "d = d || new Date()",                      // date
      "locale = locale || this.defaultLocale",    // locale
      "options = locale || {}"                    // options
    ];

    var _require = {}
    options = options || {};

    var ops = makeOps(fmt, options, _require);

    /// options.{locale,timestamp}
    if(_require.localeFormats)
      src.push('locale.formats = locale.formats || {}');
    if(_require.timestamp)
      src.push('var timestamp = d.getTime()');

    /// timezones
    var tz = _require.timezone;
    var tzType = typeof tz;

    // dateToUTC()
    if(options.utc || tzType == 'number' || tzType == 'string') {
      src.push('d = new Date(d.getTime() + (d.getTimezoneOffset() || 0) * 60000)');
    }

    // if we've got a timezone
    if(tz) {
        // ISO 8601 format timezone string, [-+]HHMM
        // Convert to the number of minutes and it'll be applied to the date below.
        if (tzType == 'string') {
          var sign = tz[0] == '-' ? -1 : 1;
          var hours = parseInt(tz.slice(1, 3), 10);
          var mins = parseInt(tz.slice(3, 5), 10);
          tz = sign * (60 * hours) + mins;
        }

        if (tzType) {
          src.push('d = new Date(d.getTime() + ' + Math.floor(tz * 60000) + ')');
        }
    }


    /// options.* from makeOps
    if(_require.off)
      src.push('var off = ' + (typeof tz == "number" ? tz : '-d.getTimezoneOffset()'));
    if(_require.day)
      src.push('var day = d.getDay()');
    if(_require.year)
      src.push('var year = String(d.getFullYear())');
    if(_require.dayOfYear) {
      var y = '(new Date(d.getFullYear(), 0, 1))';
      var n = 86400000; // = (1000 * 60 * 60 * 24))
      src.push('var dayOfYear = Math.ceil((d.getTime() - ' + y + '.getTime()) / 86400000)');
    }
    if(_require.tzString)
      src.push('var tzString = d.toString().match(/\\((\\w+)\\)/)');

    /// finalize function
    src.push('return ' + ops);

    var func = Function('d', 'locale', src.join(';'));

    return func.bind(thisObject);
  }


  ///
  /// Where to export the API
  ///
  var namespace;

  // CommonJS / Node module
  if (typeof module !== 'undefined') {
    namespace = module.exports = makeStrftime;
  }

  // Browsers and other environments
  else {
    // Get the global object. Works in ES3, ES5, and ES5 strict mode.
    namespace = (function(){ return this || (1,eval)('this') }());
  }



  namespace.makeStrftime = makeStrftime;

  // Added by Mark because bench.js expects other API.
  var _cache = {};
  namespace.strftime = function(fmt, d){
      return (_cache[fmt]||(_cache[fmt] = makeStrftime(fmt)))(d); };
}());
