// Copyright Dmitriy Ashurov 2014

;(function() {
	var undefined = void 0;

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
	
	// Cache storage
	var timezoneCache = {}, // '+0400' -> 240
		timezoneStringCache = {}, // 240 -> '+0400'
		formatsCache = {},
		localeDependentFormatsCache = {};
		
	function cache() {}
	cache.prototype = formatsCache;
		
	// Manage locales
	var defaultLocale = {
		// en_US
		  days: words('Sunday Monday Tuesday Wednesday Thursday Friday Saturday')
		, shortDays: words('Sun Mon Tue Wed Thu Fri Sat')
		, months: words('January February March April May June July August September October November December')
		, shortMonths: words('Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec')
		, AM: 'AM'
		, PM: 'PM'
		, am: 'am'
		, pm: 'pm'
		, formats: {
			D: '%m/%d/%y',		// '01/01/70'
			F: '%Y-%m-%d',		// '1970-01-01'
			R: '%H:%M',			// '00:00'
			r: '%I:%M:%S %p',	// '12:00:00 AM'
			T: '%H:%M:%S',		// '00:00:00'
			v: '%e-%b-%Y'		// '1-Jan-1970'
		}
	};
	
	var locales = [undefined];
	locales.add = function(locale) {
		var id = this.length;
		
		this[id] = locale;
		localeDependentFormatsCache[id] = new cache;
		
		return id;
	}
	
	locales.add(defaultLocale);
	
	namespace.localizedStrftime = strftime.localizedStrftime = localizedStrftime;
	function localizedStrftime(locale) {
		var localeID = locales.indexOf(locale);
		
		if (localeID < 1) {
			localeID = locales.add(locale);
		}
	
		return function(fmt, d, timezone) {
			return strftime(fmt, d, locale, timezone, localeID);
		};
	}
	
	// Timezone & UTC helpers - locale is optional
	namespace.strftimeTZ = strftime.strftimeTZ = strftimeTZ;
	function strftimeTZ(fmt, d, locale, timezone) {
		return (typeof locale === 'object')
			? strftime(fmt, d, locale, timezone)
			: strftime(fmt, d, undefined, locale);
	}
	
	namespace.strftimeUTC = strftime.strftimeUTC = strftimeUTC;
	function strftimeUTC(fmt, d, locale) {
		return strftime(fmt, d, locale, 0);
	}
	
	// Base strftime
	namespace.strftime = strftime;
	function strftime(fmt, d, locale, tz, localeID) {
		// Check if we have date
		d = d || new Date;
		
		// Check locale
		if (typeof localeID === 'undefined') {
			if (typeof locale === 'undefined') {
				locale = defaultLocale;
				localeID = 1;
			} else {
				localeID = locales.indexOf(locale);
				
				if (localeID === -1) {
					localeID = locales.add(locale);
				}
			}
		}
		
		// Check timezone
		if (typeof tz !== 'undefined') {
			var utcTimestamp = d.getTime();
		
			if (typeof tz === 'string') {
				if (tz in timezoneCache) {
					tz = timezoneCache[tz];
				} else {
					tz = timezoneCache[tz] = (tz[0] === '-' ? -1 : 1) * (60 * parseInt(tz[1] + tz[2], 10)) + parseInt(tz[3] + tz[4], 10);
				}
			}
			
			return (localeDependentFormatsCache[localeID][fmt] || parseRawFormat(fmt, locale, localeID))(
				new Date(utcTimestamp + (d.getTimezoneOffset() + tz) * 60000), 
				tz, 
				utcTimestamp
			);
		}
		
		return (localeDependentFormatsCache[localeID][fmt] || parseRawFormat(fmt, locale, localeID))(d);
	}
	
	// Padding modifiers
	var paddingModifiers = {
		'-': '-',	// omit padding
		'_': ' ',	// pad with space
		'0': '0',	// pad with zero
	};
	
	// Format declarations (examples for new Date(0) in GMT)
	var formatDeclarations = {
		// Locale-dependent
		A: {cmd: 'getDay', dict: 'days', useLocale: true}, // 'Thursday'
		a: {cmd: 'getDay', dict: 'shortDays', useLocale: true}, // 'Thu'
		B: {cmd: 'getMonth', dict: 'months', useLocale: true}, // 'January'
		b: {cmd: 'getMonth', dict: 'shortMonths', useLocale: true}, // 'Jan'
		h: {cmd: 'getMonth', dict: 'shortMonths', useLocale: true}, // 'Jan', "%h" is the same as "%b"
		P: {cmd: 'getampm', useLocale: true}, // 'am' or 'pm'
		p: {cmd: 'getAMPM', useLocale: true}, // 'AM' or 'PM'
		
		// Numeric
		d: {cmd: 'getDate', pad: '0', padLength: 2}, // 01
		e: {cmd: 'getDate'}, // 1
		H: {cmd: 'getHours', pad: '0', padLength: 2}, // 00
		I: {cmd: 'getHours12', pad: '0', padLength: 2}, // 12
		k: {cmd: 'getHours', pad: ' ', padLength: 2}, // ' 0'
		l: {cmd: 'getHours12', pad: ' ', padLength: 2}, // 12
		M: {cmd: 'getMinutes', pad: '0', padLength: 2}, // 00
		S: {cmd: 'getSeconds', pad: '0', padLength: 2}, // 00
		L: {cmd: 'getMilliseconds', pad: '0', padLength: 3, noCache: true}, // 000
		s: {cmd: 'getTimestamp', useTimezone: true}, // 0
		w: {cmd: 'getDay'}, // 0 - 6, Sunday is first day of the week
		u: {cmd: 'getDayMonday'}, // 1 - 7, Monday is first day of the week
		m: {cmd: 'getMonthNumeric', pad: '0', padLength: 2}, // 1
		Y: {cmd: 'getFullYear'}, // 1970
		C: {cmd: 'getCentury', pad: '0', padLength: 2},  // 19
		y: {cmd: 'getYear', pad: '0', padLength: 2},  // 70
		j: {cmd: 'getDayOfYear', pad: '0', padLength: 3}, // 001
		U: {cmd: 'getWeekNumber', pad: '0', padLength: 2}, // 00
		W: {cmd: 'getWeekNumberMonday', pad: '0', padLength: 2}, // 00
		
		// Others
		o: {cmd: 'getOrdinalDate'}, // '1st'
		Z: {cmd: 'getTimezone', useTimezone: true}, // GMT
		z: {cmd: 'getTimezoneOffsetString', useTimezone: true}, // +0000
	};
	
	function parseRawFormat(fmt, locale, localeID) {
		var origFormat = fmt,
			formatHandler,
			items = [],
			options = {},
			padModifier,
			format,
			specIndex,
			localeFormats = locale.formats || {};
			
		for (var s, i = 0; i < fmt.length; i++) {
			s = fmt[i];
			
			if (typeof specIndex === 'undefined') {
				if (s === '%') {
					specIndex = i;
					padModifier = undefined;
				} else {
					items[items.length] = s;
				}
			} else {
				switch (s) {
					// Padding modifiers
					case '-':
					case '_':
					case '0':
					padModifier = paddingModifiers[s];
					continue; // go to the spec itself
					break;	
				
					// Complex (locale-dependent)
					case 'D':
					case 'F':
					case 'R': case 'r':
					case 'T':
					case 'v':
					format = localeFormats[s] || defaultLocale.formats[s];
					options.isLocaleDependent = true;
					
					fmt = fmt.slice(0, specIndex) + format + fmt.slice(i + 1);
					
					i = specIndex - 1;
					specIndex = undefined;

					continue; // go to the first spec in complex format
					break;
					
					// Chars
					case 't': format = '\\t'; break;
					case 'n': format = '\\n'; break;
					
					default:
					format = formatDeclarations[s] || s;
				}
				
				if (typeof format === 'object') {
					//Check options
					if (format.useLocale) {
						options.isLocaleDependent = true;
					}
					
					if (format.useTimezone) {
						options.useTimezone = true;
					}
					
					if (format.noCache) {
						options.noCache = true;
					}
				
					// Check padding modifier
					if (padModifier && format.padLength) {
						// Clone format object through prototyping
						emptyConstructor.prototype = format;
						format = new emptyConstructor;
						
						if (padModifier === '-') {
							format.padLength = 0;
						} else {
							format.pad = padModifier;
						}
					}
				}
				
				items[items.length] = format;
				
				specIndex = undefined;
			}
		}
		
		formatHandler = makeFormatHandler(items, locale, options);
		
		// Store in cache
		if (options.isLocaleDependent) {
			localeDependentFormatsCache[localeID][origFormat] = formatHandler;
		} else {
			formatsCache[origFormat] = formatHandler;
		}
		
		return formatHandler;
	}
	
	function makeFormatHandler(items, locale, options) {
		var chunks = [],
			value = '"',
			code = '',
			func;
		
		for (var i = 0; i < items.length; i++) {
			format = items[i];
			
			if (typeof format === 'object') {
				// Add non-empty chunks only
				if (value.length > 1) {
					chunks[chunks.length] = value + '"';
				}
			
				// Calc format value
				switch(format.cmd) {
					// Time
					case 'getHours12':
					value = '(d.getHours() % 12 || 12)';
					break;
				
					case 'getampm':
					value = '(d.getHours() < 12 ? "am" : "pm")';
					break;
					
					case 'getAMPM':
					value = '(d.getHours() < 12 ? "AM" : "PM")';
					break;
					
					// Date
					case 'getDayMonday':
					value = '(d.getDay() || 7)';
					break;
					
					case 'getOrdinalDate':
					value = 'ordinal(d.getDate())';
					break;
					
					case 'getMonthNumeric':
					value = '(d.getMonth() + 1)';
					break;
					
					case 'getYear':
					value = '(d.getFullYear() % 100)';
					break;	

					case 'getCentury':
					value = '~~(d.getFullYear() / 100)';
					break;
					
					case 'getDayOfYear':
					value = 'getDayOfYear(d)';
					break;
					
					case 'getWeekNumber':
					value = '~~((getDayOfYear(d) + 7 - d.getDay()) / 7)';
					break;
					
					case 'getWeekNumberMonday':
					value = '~~((getDayOfYear(d) + 8 - (d.getDay() || 7)) / 7)';
					break;
					
					// TimeZone-dependent (we have additional "tz" and "utcTimestamp" func arguments for these commands)
					case 'getTimestamp':
					value = '(typeof tz !== "undefined" ? ~~(utcTimestamp/1000) : (self.timestamp || ~~(d.getTime()/1000)))';
					break;
					
					case 'getTimezone':
					value = '(tz === 0 ? "GMT" : (d.toString().match(/\((\w+)\)/) || [,""])[1])';
					break;
					
					case 'getTimezoneOffsetString':
					value = '(timezoneStringCache[tz] || getTimezoneOffsetString(d, tz))';
					break;
					
					// Native
					default:
					value = 'd.' + format.cmd + '()';
				}
				
				if (format.padLength) {
					value = 'pad' + format.padLength + '(' + value + ', "' + format.pad + '")';
				}
				
				if (format.useLocale) {
					value = (format.dict ? 'locale.' + format.dict : 'locale') + '[' + value + ']';
				}
				
				chunks[chunks.length] = value;
				
				// Start new string chunk
				value = '"';
			} else {
				// escape double quotes
				if (format === '"') {
					value += '\\'; 
				}
				
				value += format;
				
				if (i === items.length - 1) {
					chunks[chunks.length] = value + '"';
				}
			}
		}
		
		// Func code generation
		code = 'func = function self(d';
		if (options.useTimezone) {
			code += ', tz, utcTimestamp';
		}
		code += ') {';
		
		if (options.noCache) {
			code += 'return ' + chunks.join(' + ');
		} else {
			code += 'var timestamp = ~~(d.getTime()/1000); ';
			
			if (options.useTimezone) {
				code += 'if (timestamp === self.timestamp && tz === self.tz) {return self.cache} ';
				code += 'self.timestamp = timestamp; self.tz = tz; return self.cache = ' + chunks.join(' + ');
			} else {
				code += 'if (timestamp === self.timestamp) {return self.cache} ';
				code += 'self.timestamp = timestamp; return self.cache = ' + chunks.join(' + ');
			}
		}
				
		code += '}';
		
		eval(code);
		func.timestamp = func.cache = func.tz = undefined;

		return func;		
	}
	
	// === Utils ===

	// Empty constructor for fast prototyping
	function emptyConstructor() {} 
	
	// Split string to array
	function words(s) { return (s || '').split(' '); }

	// Get the ordinal suffix for a number: st, nd, rd, or th
	function ordinal(n) {
		var ten = n % 100,
			unit = ten % 10;
			
		if ((ten >= 11 && ten <= 13) || unit === 0 || unit >= 4) {
			return n + 'th';
		}
		
		switch (unit) {
			case 1: return n + 'st';
			case 2: return n + 'nd';
			case 3: return n + 'rd';
		}
	}
	
	// String padding
	function pad2(value, pad) {
		return value < 10 ? pad + value : value;
	}
	
	function pad3(value, pad) {
		if (value >= 100) return value;
		return (value < 10) ? pad + pad + value : pad + value;
	}
	
	// Date helpers
	function getDayOfYear(d) {
		return ~~((d.getTime() - new Date(d.getFullYear(), 0, 1).getTime()) / 86400000) + 1;
	}
	
	function getTimezoneOffsetString(d, tz) {
		if (tz === undefined) {
			tz = -d.getTimezoneOffset();
		}
		
		if (!timezoneStringCache[tz]) {
			var sign = tz >= 0 ? '+' : '-',
				hours = String(~~Math.abs(tz / 60)),
				minutes = String(Math.abs(tz) % 60);
			
			if (hours.length == 1) hours = '0' + hours;
			if (minutes.length == 1) minutes = '0' + minutes;
			
			timezoneStringCache[tz] = sign + hours + minutes;
		}
		
		return timezoneStringCache[tz];
	}
}());