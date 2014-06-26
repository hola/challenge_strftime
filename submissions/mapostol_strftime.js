/*
Copyright (c) 2014 Petr Shalkov
*/


(function() {
	"use strict";
	// constants
	var DEFAULT_LOCALE =
	{	days: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
		shortDays: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
		months: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
		shortMonths: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
		AM: "AM",
		PM: "PM",
		am: "am",
		pm: "pm"
	};
	// you can change this parameter to achieve best performance
	var FAST_CACHE_LEN = 10;

	// caching variables
	// cache
	var fastCacheP = 0;
	var fastCache = new Array(FAST_CACHE_LEN);

	(function createFastCache() {
		for (var i =0; i < FAST_CACHE_LEN; ++i) {
			fastCache[i] = { fmt: null, ts: null, locale: null, opt: null, res: null};
		}
	})();

	// formatting functions cache
	var fmtCache = [];

	// cached date
	var utcDate = new Date();
	var tmId = null;
	var cachedDate;
	var cachedTime;
	var curTimestamp;

	function dateTimeout() {
		tmId = null;
	};
	function getCachedDate() {
		if (tmId === null) {
			cachedDate = new Date();
			cachedTime = cachedDate.getTime();
			// if you need accurate timestamp then you can comment this line
			tmId = setTimeout(dateTimeout, 1);
		}
		return cachedDate;
	}

	// cached ordinal
	var cachedOrd = new Array(31);
	(function createCachedOrd() {
		for (var i = 0; i< cachedOrd.length; ++i) {
			cachedOrd[i] = '' + (i + 1) + "th";
		}
		cachedOrd[0] = "1st";
		cachedOrd[1] = "2nd";
		cachedOrd[2] = "3rd";
		cachedOrd[20] = "21st";
		cachedOrd[21] = "22nd";
		cachedOrd[22] = "23rd";
		cachedOrd[30] = "31st";
	})();

	// cached timezones from -1200 to +1400
	var cachedTZ = new Array(1561);
	// minimal cached timezones
	(function createMinCachedTZ() {
		for (var i =0; i < cachedTZ.length; ++i) {
			cachedTZ[i] = null;
		}
		// -1200
		cachedTZ[-12*60+720] = "-1200";
		// -1100
		cachedTZ[-11*60+720] = "-1100";
		// -1000
		cachedTZ[-10*60+720] = "-1000";
		// -0930
		cachedTZ[-9*60-30+720] = "-0930";
		// -0900
		cachedTZ[-9*60+720] = "-0900";
		// -0800
		cachedTZ[-8*60+720] = "-0800";
		// -0700
		cachedTZ[-7*60+720] = "-0700";
		// -0600
		cachedTZ[-6*60+720] = "-0600";
		// -0500
		cachedTZ[-5*60+720] = "-0500";
		// -0400
		cachedTZ[-4*60+720] = "-0400";
		// -0300
		cachedTZ[-3*60-30+720] = "-0330";
		// -0300
		cachedTZ[-3*60+720] = "-0300";
		// -0200
		cachedTZ[-2*60+720] = "-0200";
		// -0100
		cachedTZ[-1*60+720] = "-0100";
		// +0000
		cachedTZ[0+720] = "+0000";
		// +0100
		cachedTZ[1*60+720] = "+0100";
		// +0200
		cachedTZ[2*60+720] = "+0200";
		// +0300
		cachedTZ[3*60+720] = "+0300";
		// +0330
		cachedTZ[3*60+30+720] = "+0330";
		// +0400
		cachedTZ[4*60+720] = "+0400";
		// +0430
		cachedTZ[4*60+30+720] = "+0430";
		// +0500
		cachedTZ[5*60+720] = "+0500";
		// +0530
		cachedTZ[5*60+30+720] = "+0530";
		// +0545
		cachedTZ[5*60+45+720] = "+0545";
		// +0600
		cachedTZ[6*60+720] = "+0600";
		// +0630
		cachedTZ[6*60+30+720] = "+0630";
		// +0700
		cachedTZ[7*60+720] = "+0700";
		// +0800
		cachedTZ[8*60+720] = "+0800";
		// +0845
		cachedTZ[8*60+45+720] = "+0845";
		// +0900
		cachedTZ[9*60+720] = "+0900";
		// +0930
		cachedTZ[9*60+30+720] = "+0930";
		// +1000
		cachedTZ[10*60+720] = "+1000";
		// +1030
		cachedTZ[10*60+30+720] = "+1030";
		// +1100
		cachedTZ[11*60+720] = "+1100";
		// +1130
		cachedTZ[11*60+30+720] = "+1130";
		// +1200
		cachedTZ[12*60+720] = "+1200";
		// +1245
		cachedTZ[12*60+45+720] = "+1245";
		// +1300
		cachedTZ[13*60+720] = "+1300";
		// +1400
		cachedTZ[14*60+720] = "+1400";

	})();

	// formatting elements
	var elements = new Array(128);
	var dummyObj = {};
	(function createFmtElements() {
		for (var i=0; i < elements.length; ++i) {
			elements[i] = { val: null, pad: false };
		}
		// setup padding
		// '19'
		// C
		elements[0x43].pad = 
		// '01/01/70'
		// D
		elements[0x44].pad =
      // '01'
	   // d
		elements[0x64].pad = 
		// '1970-01-01'
		// F
		elements[0x46].pad =
		// '00'
		// H
		elements[0x48].pad = 		
		// '12'
		// I
		elements[0x49].pad = 
		// ' 0'
		// k
		// controlled padding
		elements[0x6B].pad = 
		// '12'
		// l
		// controlled padding
		elements[0x6C].pad =
		// '00'
		// M
		elements[0x4D].pad =		
		// '01'
		// m
		elements[0x6D].pad =		
		// '00:00'
		// R
		elements[0x52].pad =
		// '12:00:00 AM'
		// r
		elements[0x72].pad =
		// '00'
		// S
		elements[0x53].pad =		
		// '00:00:00'
		// T
		elements[0x54].pad =
		// '00'
		// U
		elements[0x55].pad =
		// '00'
		// W
		elements[0x57].pad = true;		


		// formatting code
		// 'Thursday'
		// A
		elements[0x41].val = "( locale.days[d.getDay()] )\n";

		// 'Thu'
		// a
		elements[0x61].val= "( locale.shortDays[d.getDay()] )\n";

		// 'January'
		// B
		elements[0x42].val  = "( locale.months[d.getMonth()] )\n";

		// 'Jan'
		// b
		elements[0x62].val = "( locale.shortMonths[d.getMonth()] )\n";

		// '19'
		// C
		// use padding
		elements[0x43].val = "( ($1 =(d.getFullYear() / 100 | 0)), ($1 > 9) ? $1 : ( ";

		// '01/01/70'
		// D
		// use padding
		elements[0x44].val = "( (formats.D !== void 0) ? this.strftime(formats.D, d, locale): ";

		// '01'
		// d
		// use padding
		elements[0x64].val = "( ($1 = d.getDate()), ($1 > 9) ? $1 : ( ";

		// '01'
		// e
		elements[0x65].val = "( d.getDate() )\n";

		// '1970-01-01'
		// F
		// use padding
		elements[0x46].val = "( (formats.F !== void 0) ? this.strftime(formats.F, d, locale): ";

		// '00'
		// H
		// use padding
		elements[0x48].val = "( ($1=d.getHours()), ($1 > 9) ? $1 : ( ";

		// 'Jan'
		// h
		elements[0x68].val = "( locale.shortMonths[d.getMonth()] )\n";

		// '12'
		// I
		// use padding
//		elements[0x49].val = "( ($1 =this.hours12(d)), ($1 > 9) ? $1 : ( ";

		elements[0x49].val = "((($1=d.getHours()),($1===0)? $1=12:(($1>12)?($1=$1-12):$1)), ($1 > 9) ? $1 : ( ";
		// '000'
		// j
		elements[0x6A].val = "( ($1=new Date(d.getFullYear(), 0, 1)), $1=Math.ceil((d.getTime() - $1.getTime())/86400000), ($1 < 100 ? ($1 < 10 ? ('00' + $1) : ('0' + $1) ) : $1) )\n";

		// ' 0'
		// k
		// control padding
		// use padding
		elements[0x6B].val = "( ($1 =d.getHours()), ($1 > 9) ? $1 : ( ";

		// '000'
		// L
		elements[0x4C].val = "( ($1 = ((ts % 1000) | 0)), $1 < 100 ? ($1 < 10 ? ('00' + $1) : ('0' + $1)) : $1)";

		// '12'
		// l
		// control padding
		// use padding
		elements[0x6C].val = "( (($1=d.getHours()),($1===0)? $1=12:(($1>12)?($1=$1-12):$1)), ($1 > 9) ? $1 : ( ";

		// '00'
		// M
		// use padding
		elements[0x4D].val = "( ($1=d.getMinutes()), ($1 > 9) ? $1 : ( ";

		// '01'
		// m
		// use padding
		elements[0x6D].val = "( ($1=d.getMonth() + 1), ($1 > 9) ? $1 : ( ";

		// '\n'
		// n
		elements[0x6E].val = "'\\n'";

		// '1st'
		// o
		elements[0x6F].val = "( this.cachedOrd[d.getDate() - 1] )\n";

		// 'am'
		// P
		elements[0x50].val = "( d.getHours() < 12 ? locale.am : locale.pm )\n";

		// 'AM'
		// p
		elements[0x70].val = "( d.getHours() < 12 ? locale.AM : locale.PM )\n";

		// '00:00'
		// R
		// use padding
		elements[0x52].val = "( (formats.R !== void 0) ? this.strftime(formats.R, d, locale) : ";

		// '12:00:00 AM'
		// r
		// use padding
		elements[0x72].val = "( (formats.r !== void 0) ? this.strftime(formats.r, d, locale) : ";

		// '00'
		// S
		// use padding
		elements[0x53].val = "( ($1=d.getSeconds()), ($1 > 9) ? $1 : ( ";

		// '0'
		// s
		elements[0x73].val = "( (ts / 1000) | 0 )\n";

		// '00:00:00'
		// T
		// use padding
		elements[0x54].val = "( (formats.T !== void 0) ? this.strftime(formats.T, d, locale) : ";

		// '\t'
		// t
		elements[0x74].val = "'\\t'";

		// '00'
		// U
		// use padding
		elements[0x55].val = "( ($1=this.weekNumber(d, 'sunday')), ($1 > 9) ? $1 : ( ";

		// '4'
		// u
		elements[0x75].val = " ( ($1=d.getDay()), ($1 === 0) ? 7 : $1 )\n"; // 1 - 7, Monday is first day of the week

		// '1-Jan-1970'
		// v
		// use padding
		elements[0x76].val = "( (formats.v !== void 0) ? this.strftime(locale.formats.v, d, locale) : ('' + d.getDate() + '-' + locale.shortMonths[d.getMonth()] + '-' + d.getFullYear()) ) ";
		// '00'
		// W
		// use padding
		elements[0x57].val = "( ($1=this.weekNumber(d, 'monday')), ($1 > 9) ? $1 : ( ";

		// '4'
		// w
		elements[0x77].val = "( d.getDay() )\n"; // 0 - 6, Sunday is first day of the week

		// '1970'
		// Y
		elements[0x59].val = "( d.getFullYear() )\n";

		// '70'
		// y 
		elements[0x79].val = "( $1=String(d.getFullYear()), $1.slice($1.length - 2)  )\n";

		// 'GMT'
		// Z
		elements[0x5A].val = "( utc ? 'GMT' : ( $1 = d.toString().match(\/\\((\\w+)\\)\/), $1 && $1[1] || ''\n ) )";

		// '+0000'
		// z
		elements[0x7A].val = "( utc ? '+0000' : this.computeTZ(tz !== void 0 ? tz : -d.getTimezoneOffset() ) )\n";
	})();

	// could be used prototype but I limited 'this' context 
	var strftimeContext = {
		"strftime"  : strftime,
		"cachedOrd" : cachedOrd,
		"computeTZ" : computeTZ,
		"weekNumber": weekNumber,
	};

	// servant functions
	// '01/01/70'
	// D
	function opt0x44(pad)
	{
		return "(($1=d.getMonth() + 1), ($1 > 9) ? $1 : "+pad+"+$1) + '/' + (($1=d.getDate()), ($1 > 9) ? $1 : "+pad+"+$1) + '/' + ((d.getFullYear() % 100) |0)";

	}
	// '1970-01-01'
	// F
	function opt0x46(pad)
	{
		return "(d.getFullYear() + '-' + (($1=d.getMonth()+1), ($1 > 9)?$1: "+pad+"+$1) + '-' + (($1=d.getDate()), ($1 > 9)?$1: "+pad+"+$1))";
	}
	// '00:00'
	// R
	function opt0x52(pad)
	{
		return "((($1 = d.getHours()), ($1 > 9)? $1: "+pad+"+$1) + ':' + (($1=d.getMinutes()), ($1 > 9)?$1: "+pad+"+$1))";
	}
	// '12:00:00 AM'
	// r
	function opt0x72(pad)
	{
		return "(((($1=d.getHours()),($1===0)? $1=12:(($1>12)?($1=$1-12):$1)), ($1>9)?$1:"+pad+"+$1) + ':' + (($1=d.getMinutes()), ($1>9)?$1:"+pad+"+$1) + ':' +(($1=d.getSeconds()), ($1>9)?$1:"+pad+"+$1) + ' ' + (d.getHours() < 12 ? locale.AM : locale.PM))";
	}
	// '00:00:00'
	// T
	function opt0x54(d, pad)
	{
                pad = pad || '0'; // Added by Mark to pass sanity.
		return "((($1=d.getHours()), ($1>9)?$1:'"+pad+"'+$1) + ':' + (($1=d.getMinutes()), ($1>9)?$1:'"+pad+"'+$1) + ':' + (($1=d.getSeconds()), ($1>9)?$1:'"+pad+"'+$1))";
	}

	function computeTZ(offsetTZ)
	{
		var id = (offsetTZ + 720) | 0;
		var val = cachedTZ[id];
		if (val === null) {
			var	hours = Math.abs(offsetTZ / 60) | 0,
					minutes = offsetTZ % 60 | 0;
			val = (offsetTZ < 0 ? '-' : '+') + (hours < 10 ? "0" + hours: hours) + (minutes < 10 ?  "0" + minutes: minutes);
			cachedTZ[id] = val;
		}
		return val;
	}

	function dateToUTC(d) {
		var msDelta = (d.getTimezoneOffset() || 0) * 60000;
		utcDate.setTime(d.getTime() + msDelta);
		return utcDate;
//		return new Date(d.getTime() + msDelta);
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
		//    return Math.floor(weekNum);
		return weekNum | 0;
	}

	// formatter
	function buildFormatter(fmt) {
		var element;
		var body = "";
		var fmtPos = 0, ch;
		var len = fmt.length;
		var str = "";
		var padding = "'0'";
		var fmtFound = false;

		function pushBodyElement(code, pad) {
			element = elements[code];
			if (element !== null) {
				if (element.pad) {
					switch(code) {
						// optimized elements
						case 0x44: 
							body += element.val + opt0x44(pad) + ")\n";
							break;
						case 0x46:
							body += element.val + opt0x46(pad) + ")\n";
							break;
						case 0x52:
							body += element.val + opt0x52(pad) + ")\n";
							break;
						case 0x72:
							body += element.val + opt0x72(pad) + ")\n";
							break;
						case 0x54:
							body += element.val + opt0x54(pad) + ")\n";
							break;
						default:
							body += element.val + pad + "+ $1))\n";
					}
				}
				else {
					body += element.val;
				}
			}
			else {
				str += String.fromCharCode(code);
			}
		}
	
		while (fmtPos < len) {
			ch = fmt.charCodeAt(fmtPos);
			//%
			if (ch === 0x25) {
				if (str.length > 0) {
					body += "'" + str + "'+";
					str = "";
				}
				padding = "'0'";
				// found %% symbol
				if (fmtFound) {
					body += "'%'";
				}
				fmtFound = true;
				++fmtPos;
				continue;
			}
			if (fmtFound) {
				switch (ch) {
					//"-"
					case 0x2D:
						// ''
						padding = "''";
					break;
					// "_"
					case 0x5F:
						// ' '
						padding = "' '";
					break;
					// "0"
					case 0x30:
						// '0'
						// microhack
						padding = " '0'";
					break;
					default:
						fmtFound = false;
						if (((ch === 0x6B) || (ch === 0x6C)) && padding === "'0'") {
							padding = "' '";
						}
						pushBodyElement(ch, padding);	
						if (fmtPos !== len - 1) {
							body += "+";
						}
					break;
				}
			}
			// ' and \
			else if (ch === 0x27 || ch === 0x5C) {
				str += "\\" + String.fromCharCode(ch);
			}
			else {
				str += String.fromCharCode(ch);
			}

			++fmtPos;
			if (fmtPos === len) {
				if (str.length > 0) {
					body += "'"+str + "';";
				}
				else {
					body += ";";
				}
			}
		}

//		console.log("BODY:" + body);

		return new Function("tz", "d", "locale", "formats", "ts", "utc", "var $1; \n return '' +" + body);
	}
	// main function
	// d, locale, and options are optional, but you can't leave
	// holes in the argument list. If you pass options you have to pass
	// in all the preceding args as well.
	//
	// options:
	//   - locale   [object] an object with the same structure as DefaultLocale
	//   - timezone [number] timezone offset in minutes from GMT
	function strftime(fmt, d, locale, options) {

		// d and locale are optional so check if d is really the locale
		if ((d !== void 0) && !(d instanceof Date)) {
			locale = d;
			d = void 0;
		}
		if (d !== void 0) {
			curTimestamp = d.getTime();	
		}
		else {
			curTimestamp = cachedTime;
			d = getCachedDate();
		}

		// fast caching
		var cache;
		for (var i=0; i < FAST_CACHE_LEN; ++i) {
			cache = fastCache[i];	
			if ((cache.fmt === fmt) && (cache.ts === curTimestamp) && (cache.locale === locale) && (cache.opt === options)) {
				return cache.res;	
			}
		}
		if (fastCacheP === FAST_CACHE_LEN) {
			fastCacheP = 0;
		}
		cache = fastCache[fastCacheP];
		cache.fmt = fmt;
		// save real options and locale in cache
		cache.opt = options;
		cache.locale = locale;
		fastCacheP++;

		options = (options !== void 0) ? options : dummyObj;

		locale = (locale) ? locale : DEFAULT_LOCALE;

		locale.formats = (locale.formats !== void 0) ? locale.formats : dummyObj;

		var tz = options.timezone;
		var utc = options.utc;
		if (options.utc || tz !== void 0) {
			d = dateToUTC(d);
		}

		if (tz !== void 0) {
			var tzType = typeof tz;
			var tzIsString = (tzType === 'string');
			if (tz) {
				// ISO 8601 format timezone string, [-+]HHMM
				//
				// Convert to the number of minutes and it'll be applied to the date below.
				if (tzIsString) {
					var hours = (tz.charCodeAt(1)-0x30)*10 + (tz.charCodeAt(2)-0x30);
					var mins = (tz.charCodeAt(3)-0x30)*10 + (tz.charCodeAt(4)-0x30);
					if (tz.charCodeAt(0) === 0x2D) {
						tz = -( (60 * hours) + mins);
					}
					else {
						tz =  (60 * hours) + mins;
					}
				}
				d.setTime(d.getTime() + (tz * 60000));
			}
		}

		// slow cache 
		if ((locale === DEFAULT_LOCALE)) {
			var func = fmtCache[fmt];
			if (func !== void 0) {
				cache.res = func.call(strftimeContext, tz, d, locale, locale.formats, curTimestamp, options.utc);
				cache.ts = curTimestamp;
				return cache.res;
//				return func.call(strftimeContext, tz, d, locale, locale.formats, curTimestamp, options.utc);
			}
		}

		var buildedFmt = buildFormatter.call(strftimeContext, fmt);

		fmtCache[fmt] = buildedFmt;

		cache.res = buildedFmt.call(strftimeContext, tz, d, locale, locale.formats, curTimestamp, options.utc);
		cache.ts = curTimestamp;
		return cache.res;
//		return buildedFmt.call(strftimeContext, tz, d, locale, locale.formats, curTimestamp, options.utc);
	}

	// compatibility with original javascript strftime
	strftime.strftimeUTC = function(fmt, d, locale) {
		return strftime(fmt, d, locale, { utc: true });
	};
		
	strftime.strftimeTZ= function(fmt, d, locale, timezone) {
		var tLoc = typeof locale;
		if ((tLoc === "number" || tLoc === "string") && timezone === void 0) {
			timezone = locale;
			locale = DEFAULT_LOCALE;
		}
		else if (locale === void 0) 
			locale = DEFAULT_LOCALE;
		return strftime(fmt, d, locale, { timezone: timezone });
	};
	strftime.localizedStrftime = function(locale) {
		return function(fmt, d, options) {
			return strftime(fmt, d, locale, options);
		}
	}

	strftime.strftime = strftime;
	module.exports = strftime;

}());
