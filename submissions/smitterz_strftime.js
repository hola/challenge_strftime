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

  var DefaultLocale =
  { days: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  , shortDays: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  , months: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
  , shortMonths: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  , AM: 'AM'
  , PM: 'PM'
  , am: 'am'
  , pm: 'pm'
  };
  
  namespace.strftime = strftime;

  // locale is optional
  namespace.strftimeTZ = strftime.strftimeTZ = strftimeTZ;
  function strftimeTZ(fmt, d, locale, timezone) {
	var t = typeof locale;
    if ((t === 'number' || t === 'string') && timezone == null) {
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
    return function(fmt, d, options) {
      return strftime(fmt, d, locale, options);
    };
  }
	//Hours to 1-12 format
	var h12t = [12,1,2,3,4,5,6,7,8,9,10,11,12,1,2,3,4,5,6,7,8,9,10,11];
	//Ordinal prefixes 0-3
	var otable = ['th', 'st', 'nd', 'rd'];
	
	var cache = [[0, '', ''],[0, '', ''],[0, '', ''],[0, '', ''],[0, '', '']];
	var cachePtr = 0;
	
	var FuncMmap = [];
	FuncMmap.length = 255;
	
	FuncMmap[45] = function() {return '';};										//-
	FuncMmap[48] = function() {return '0';};										//0
	FuncMmap[95] = function() {return ' ';};										//_

	FuncMmap[65] = function(locale, d) {return locale.days[d.getDay()];};								//A
	FuncMmap[66] = function(locale, d) {return locale.months[d.getMonth()];};							//B
	FuncMmap[67] = function(locale, d, padding) {return pad(Math.floor(d.getFullYear() / 100), padding, 2);};		//C
	FuncMmap[72] = function(locale, d, padding) {return pad(d.getHours(), padding, 2);};							//H
	FuncMmap[73] = function(locale, d, padding) {return pad(h12t[d.getHours()], padding, 2);};								//I
	FuncMmap[76] = function(locale, d, padding, timestamp) {return pad(Math.floor(timestamp % 1000), '0', 3);};					//L
	FuncMmap[77] = function(locale, d, padding) {return pad(d.getMinutes(), padding, 2);};							//M
	FuncMmap[80] = function(locale, d) {return d.getHours() < 12 ? locale.am : locale.pm;};				//P
	FuncMmap[83] = function(locale, d, padding) {return pad(d.getSeconds(), padding, 2);};							//S
	FuncMmap[85] = function(locale, d, padding) {return pad(weekNumber(d, 'sunday'), padding, 2);};					//U
	FuncMmap[87] = function(locale, d, padding) {return pad(weekNumber(d, 'monday'), padding, 2);};					//W
	FuncMmap[89] = function(locale, d) {return d.getFullYear();};										//Y
	FuncMmap[90] = function(locale, d, padding, timestamp, options) {if (options.utc) {
		return "GMT";
	  }
	  else {
		var tzString = d.toString().match(/\((\w+)\)/);
		return tzString && tzString[1] || '';
	  }};																				//Z
	FuncMmap[97] = function(locale, d) {return locale.shortDays[d.getDay()];};							//a
	FuncMmap[98] = function(locale, d) {return locale.shortMonths[d.getMonth()];};						//b
	FuncMmap[100] = function(locale, d, padding) {return pad(d.getDate(), padding, 2);};							//d
	FuncMmap[101] = function(locale, d) {return d.getDate();};											//e
	FuncMmap[104] = function(locale, d) {return locale.shortMonths[d.getMonth()];};						//h
	FuncMmap[106] = function(locale, d) {var y = new Date(d.getFullYear(), 0, 1);
	  var day = Math.ceil((d.getTime() - y.getTime()) / (1000 * 60 * 60 * 24));
	  return pad(day, '0', 3);};																//j
	FuncMmap[107] = function(locale, d, padding) {return pad(d.getHours(), padding === null ? ' ' : padding, 2);};	//k
	FuncMmap[108] = function(locale, d, padding) {return pad(h12t[d.getHours()], padding === null ? ' ' : padding, 2);};		//l
	FuncMmap[109] = function(locale, d, padding) {return pad(d.getMonth() + 1, padding, 2);};						//m
	FuncMmap[110] = function() {return '\n';};													//n
	FuncMmap[111] = function(locale, d) {return String(d.getDate()) + ordinal(d.getDate());};			//o
	FuncMmap[112] = function(locale, d) {return d.getHours() < 12 ? locale.AM : locale.PM;};			//p
	FuncMmap[115] = function(locale, d, padding, timestamp) {return Math.floor(timestamp / 1000);};							//s
	FuncMmap[116] = function() {return '\t';};													//t
	FuncMmap[117] = function(locale, d) {var day = d.getDay();return day === 0 ? 7 : day;};				//u
	FuncMmap[119] = function(locale, d) {return d.getDay();};											//w
	FuncMmap[121] = function(locale, d) {var y = String(d.getFullYear());return y.slice(y.length - 2);};//y
	FuncMmap[122] = function(locale, d, padding, timestamp, options, tz) {if (options.utc) {
		return "+0000";
	  }
	  else {
		var off = typeof tz == 'number' ? tz : -d.getTimezoneOffset();
		return (off < 0 ? '-' : '+') + pad(Math.abs(off / 60), '0', 2) + pad(off % 60, '0', 2);
	  }};																				//z
	
  function strftime(fmt, d, locale, options) {
	  
	if (!d) {
		d = new Date();
	}
    if (!locale && typeof d.days !== "undefined") {
		locale = d;
		d = new Date();
	}
	var timestamp = d.getTime();
	
	if (!locale && !options) {
		var l = cache.length;
		for (var i = 0; i < l; i++) {
			if (cache[i][0] === timestamp && cache[i][1] === fmt) {
				return cache[i][2];
			}
		}
	}
	options = options || {};
	
	var cacheNew = [timestamp, fmt, ''];

    locale = locale || DefaultLocale;
    locale.formats = locale.formats || {};

    var tz = options.timezone;
    var tzType = typeof tz;

    if (options.utc || tzType === 'number' || tzType === 'string') {
      d = new Date(timestamp + (parseInt(d.getTimezoneOffset())) * 60000);
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
	
	var padding;
	
	var tfmt = '';
	var ti = 0;
	var tl = fmt.length;
	var tc, tc2;
	//Remove slow recursion calls
	while (ti < tl) {
		tc = fmt[ti++];
		if (tc === '%' && ti < tl) {
			tc2 = fmt[ti++];
			if (tc2 === "D") {
				tc = (locale.formats.D || '%m/%d/%y');
			} else if (tc2 === "F") {
				tc = (locale.formats.F || '%Y-%m-%d');
			} else if (tc2 === "R") {
				tc = (locale.formats.R || '%H:%M');
			} else if (tc2 === "T") {
				tc = (locale.formats.T || '%H:%M:%S');
			} else if (tc2 === "r") {
				tc = (locale.formats.r || '%I:%M:%S %p');
			} else if (tc2 === "v") {
				tc = (locale.formats.v || '%e-%b-%Y');
			} else {
				tc += tc2;
			}
		}
		tfmt += tc;
	}
	fmt = tfmt;
	
	var p = 0;
	var l = fmt.length;
	var result = "";
	var c;
	while (p < l) {
		var c = fmt[p++];
		if (c === '%' && p < l) {
			c = fmt[p++];
			padding = null;
			var code = c.charCodeAt(0);
			c = (FuncMmap[code] ? FuncMmap[code](locale, d, padding, timestamp, options, tz) : c);
			if ((code === 45 || code === 48 || code === 95) && p < l) {
				padding = c;
				c = fmt[p++];
				code = c.charCodeAt(0);
				c = (FuncMmap[code] ? FuncMmap[code](locale, d, padding, timestamp, options, tz) : c);
			}
		}
		result += c;
	}
	cacheNew[2] = result;
	cache[cachePtr] = cacheNew;
	cachePtr = (cachePtr === 9 ? 0 : cachePtr+1); 
	return result;
  }

  // Default padding is '0' and default length is 2, both are optional.
  function pad(n, padding, length) {
    
	var s = String(n);
	padding = (padding === null ? '0' : padding);
    // padding may be an empty string, don't loop forever if it is
    if (padding) {
		var i = s.length;
		while (i < length) {
			s = padding + s;
			i++;
		}
    }
    return s;
  }
	
  // Get the ordinal suffix for a number: st, nd, rd, or th
  function ordinal(n) {
    var i = n % 10
      , ii = n % 100
      ;
    if ((ii >= 11 && ii <= 13) || i >= 4) {
      return 'th';
    }
    return otable[i];
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
      if (wday === 0) // Sunday
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
