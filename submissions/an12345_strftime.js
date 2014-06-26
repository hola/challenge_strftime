;(function() {

  //// Where to export the API
  var namespace;

  // Added by Mark because didn't work.
  var strftime = _strftime;

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

  var data_cache = {};
 
  namespace.strftime = _strftime;

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

  namespace.localizedstrftime = strftime.localizedstrftime = localizedstrftime;
  function localizedstrftime(locale) {
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

	if(d && d.obj)
    d = d.obj || d;

    // d and locale are optional so check if d is really the locale
    if (d && ((typeof d['getTime'] != 'function') || (typeof d['getTimezoneOffset'] != 'function'))) {
      locale = d;
      d = undefined;
    }
    d = d || new Date();

	if (data_cache.obj != d)
		data_cache = {};   
		 
    locale = locale || DefaultLocale;
    locale.formats = locale.formats || {};

    // Hang on to this Unix timestamp because we might mess with it directly below.
    data_cache.timestamp = d.getTime();

    var tz = options.timezone;
    var tzType = typeof tz;

    if (options.utc || tzType == 'number' || tzType == 'string') 
    {
      d = new Date(d.getTime() + (d.getTimezoneOffset() || 0) * 60000);
    }

	data_cache.obj = d;
	data_cache.time = d.getTime();

    if (tz) {
      // ISO 8601 format timezone string, [-+]HHMM
      //
      // Convert to the number of minutes and it'll be applied to the date below.
      if (tzType == 'string') {
        var sign = tz[0] == '-' ? -1 : 1;
        var hours = parseInt(tz.slice(1, 3), 10);
        var mins = parseInt(tz.slice(3, 5), 10);
        data_cache.timezone = sign * (60 * hours) + mins;
      }

      if (tzType) {
        data_cache.time = data_cache.time + (data_cache.timezone * 60000);
      }
    }
    
    // Most of the specifiers supported by C's strftime, and some from Ruby.
    // Some other syntax extensions from Ruby are supported: %-, %_, and %0
    // to pad with nothing, space, or zero (respectively).
	var isSym = false;
	var padding;
	var pad = '';
	var z4 = "";
	
	//fill_calendar(data_cache);
	
	for(var i = 0; i < fmt.length; i++)
	{
		if( fmt[i] == '%' )
		{
			isSym = true;
			pad = '';
			continue;
		}
		else if( isSym )
		{
			if('0' == fmt[i])
			{
				pad = '0';
				padding = '0';
				continue;
			}
			else if('_' == fmt[i])
			{
				pad = '_';
				padding = ' ';
				continue;
			}
			else if('-' == fmt[i])
			{
				pad = '_'
				padding = '';
				continue;
			}
			else
			{
				isSym = false;
				//z4 = z4 + namespace[fmt[i]]('%'+pad+fmt[i], padding, locale, d);
				z4 = z4 + format('%'+pad+fmt[i], fmt[i], padding, locale, data_cache);
				padding = null;
			}
		}
		else
			z4 = z4 + fmt[i]; 
	} 
	return z4;
  }
  
  function format(_, c, padding, locale, d) {
      switch (c) {

        // Examples for new Date(0) in GMT

        // 'Thursday'
        case 'A':
			d.day = d.obj.getDay();
			return locale.days[d.day];

        // 'Thu'
        case 'a': 
			d.day = d.obj.getDay();
			return locale.shortDays[d.day];

        // 'January'
        case 'B': 
			d.month = d.month || d.obj.getMonth();
			return locale.months[d.month];
        // 'Jan'
        case 'b': 
			d.month = d.month || d.obj.getMonth();
			return locale.shortMonths[d.month];
			
        // '19'
        case 'C': 
			d.year = d.year || d.obj.getFullYear();
			return pad(((d.year - d.year%100)/100), padding);       
        
        // '01/01/70'
        case 'D': return _strftime(locale.formats.D || '%m/%d/%y', d, locale);

        // '01'
        case 'd': 
			d.date = d.date || d.obj.getDate();
			return pad(d.date, padding);

        // '01'
        case 'e': 
			d.date = d.date || d.obj.getDate();
			return d.date;

        // '1970-01-01'
        case 'F': return _strftime(locale.formats.F || '%Y-%m-%d', d, locale);

        // '00'
        case 'H': 
			d.hours = d.hours || d.obj.getHours();
			return pad(d.hours, padding);
			
        // 'Jan'
        case 'h': 
			d.month = d.month || d.obj.getMonth();
			return locale.shortMonths[d.month];
			
        // '12'
        case 'I': return pad(hours12(d), padding);

        // '000'
        case 'j':
          d.year = d.year || d.obj.getFullYear();
          if(d.day_no == undefined)
          {
			  var y = d.time- new Date(d.year, 0, 1).getTime();
			  d.day_no = ((y%86400000) == 0?0:1) + (y - y%86400000) / 86400000;
		  }
          return pad(d.day_no, padding, 3);

        // ' 0'
        case 'k': 
			d.hours = d.hours || d.obj.getHours();
			return pad(d.hours, padding == null ? ' ' : padding);

        // '000'
        case 'L': // Error On default
			d.milliseconds = d.milliseconds || d.obj.getMilliseconds();
			return pad(d.milliseconds, padding, 3);

        // '12'
        case 'l': return pad(hours12(d), padding == null ? ' ' : padding);

        // '00'
        case 'M': 
			d.minutes = d.minutes || d.obj.getMinutes();
			return pad(d.minutes, padding);

        // '01'
        case 'm': 
			d.month = d.month || d.obj.getMonth();
			return pad(d.month + 1, padding);

        // '\n'
        case 'n': return '\n';

        // '1st'
        case 'o': 
			d.date = d.date || d.obj.getDate();
			return '' + d.date + ordinal(d.date);

        // 'am'
        case 'P': 
			d.hours = d.hours || d.obj.getHours();
			return d.hours < 12 ? locale.am : locale.pm;

        // 'AM'
        case 'p': 
        	d.hours = d.hours || d.obj.getHours();
			return d.hours < 12 ? locale.AM : locale.PM;

        // '00:00'
        case 'R': return _strftime(locale.formats.R || '%H:%M', d, locale);

        // '12:00:00 AM'
        case 'r': return _strftime(locale.formats.r || '%I:%M:%S %p', d, locale);

        // '00'
        case 'S': 
			d.seconds = d.seconds || d.obj.getSeconds();
			return pad(d.seconds, padding);

        // '0'
        case 's': 
			d.unix_time = d.unix_time || (d.timestamp - d.timestamp%1000) / 1000;
			return d.unix_time;

        // '00:00:00'
        case 'T': return _strftime(locale.formats.T || '%H:%M:%S', d, locale);

        // '\t'
        case 't': return '\t';

        // '00'
        case 'U': return pad(weekNumber(d, 'sunday'), padding);

        // '4'
        case 'u':
			d.day = d.day || d.obj.getDay();
			return d.day == 0 ? 7 : d.day; // 1 - 7, Monday is first day of the week

        // '1-Jan-1970'
        case 'v': return _strftime(locale.formats.v || '%e-%b-%Y', d, locale);

        // '00'
        case 'W': return pad(weekNumber(d, 'monday'), padding);

        // '4'
        case 'w': 
			d.day = d.day || d.obj.getDay()
			return d.day; // 0 - 6, Sunday is first day of the week

        // '1970'
        case 'Y': 
			d.year = d.year || d.obj.getFullYear();
			return d.year;

        // '70'
        case 'y':
          d.year = d.year || d.obj.getFullYear();
		  return pad(d.year % 100, padding, 2);

        // 'GMT'
        case 'Z':
          if (options.utc) {
            return "GMT";
          }
          else {
            var tzString = d.obj.toString().match(/\((\w+)\)/);
            return tzString && tzString[1] || '';
          }

        // '+0000'
        case 'z':
          if (options.utc) {
            return "+0000";
          }
          else {
            var off = typeof tz == 'number' ? tz : -d.timezone;
            return (off < 0 ? '-' : '+') + pad(Math.abs(off / 60)) + pad(off % 60);
          }

        default: return c;
      }
  }

  // Default padding is '0' and default length is 2, both are optional.
  function pad(n, padding, length) {
    // Defaults handle pad(n) and pad(n, <padding>)
    if (padding == null) {
      padding = '0';
    }
    if(length == undefined)
    length = 2;

    var s = '' + n;
    // padding may be an empty string, don't loop forever if it is
    if (padding) {
      while (s.length < length) s = padding + s;
    }
    return s;
  }

  function hours12(d) {
    d.hours = d.hours || d.obj.getHours();
    if (d.hours == 0) return 12;
    else if (d.hours > 12) return d.hours - 12;
    return d.hours;
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
	d.day = d.day || d.obj.getDay();
    var wday = d.day;
    if (firstWeekday == 'monday') {
      if (wday == 0) // Sunday
        wday = 6;
      else
        wday--;
    }

	d.year = d.year || d.obj.getFullYear();
    var firstDayOfYear = new Date(d.year, 0, 1)
      , yday = ((d.time - firstDayOfYear))/ 86400000
      , firstDayNo = (yday + 7 - wday)
      ;
    return (firstDayNo - firstDayNo % 7) / 7;
  }

}());
