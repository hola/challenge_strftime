/* jshint undef: true, unused: false */
/* globals module */
(function () {
	'use strict';

	// Локаль по умолчанию
	var defaultLocale = {
			days: 'Sunday Monday Tuesday Wednesday Thursday Friday Saturday'.split(' '),
			shortDays: 'Sun Mon Tue Wed Thu Fri Sat'.split(' '),
			months: 'January February March April May June July August September October November December'.split(' '),
			shortMonths: 'Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec'.split(' '),
			AM: 'AM',
			PM: 'PM',
			am: 'am',
			pm: 'pm',

			formats: {
				D: '%m/%d/%y',
				F: '%Y-%m-%d',
				e: '%e-%b-%Y',
				R: '%H:%M',
				r: '%I:%M:%S %p',
				T: '%H:%M:%S'
			}
		},

		// Кеш последнего вызова
		cache = { ts: null, format: null, value: null },

		cachedDate,
		cachedDateId,
		cachedDateReset = function () {
			cachedDateId = void 0;
		}
	;


	/**
	 * Форматирование даты
	 * @param   {String}  format    формат даты
	 * @param   {Date}    [date]    время или локаль
	 * @param   {Object}  [locale]  локаль
	 * @param   {Object}  [options] опции
	 * @returns {String}
	 */
	var strftime = function strftime(format, date, locale, options) {
		var ts, useCache;

		if (!(date instanceof Date)) {
			locale = date;

			if (cachedDateId === void 0) {
				cachedDate = new Date();
				cachedDate.time = cachedDate.getTime();
				cachedDateId = setTimeout(cachedDateReset, 1);
			}

			date = cachedDate;
			ts = cachedDate.time
		}
		else {
			ts = date.getTime();
		}


		// Нужен ли кеш?
		useCache = locale == void 0 && options == void 0


		// Кеширование работает только если не переданна локаль и опции
		if (useCache) {
			if (cache.ts === ts && cache.format === format) {
				return cache.value;
			}
			else {
				var cached = cache[format];
				if (cached !== void 0 && cached[0] === ts) {
					return cached[1];
				}
			}
		}


		// Определяем локаль
		if (locale == void 0) {
			locale = defaultLocale;
		}


		var char,
			val,
			tz,
			utc,
			result = '',
			padding,

			days = locale.days,
			shortDays = locale.shortDays,
			months = locale.months,
			shortMonths = locale.shortMonths
		;


		if (options) {
			tz = options.timezone;
			utc = options.utc;

			if (utc || tz !== void 0) { // slow
				date = new Date(ts + date.getTimezoneOffset() * 6e4);
			}

			if (tz !== void 0) { // slow
				if (tz.substr !== void 0) {
					tz = (tz[0] === '-' ? -1 : 1) * (60 * tz.substr(1, 2)) + (tz.substr(3, 2)|0);
				}
				date = new Date(date.getTime() + (tz * 6e4));
			}
		}


		// Парсим формат
		for (var i = 0, n = format.length; i < n; i++) {
			char = format.charAt(i);

			if (char === '%') { // %[0_-][a-zA-Z]
				char = format.charAt(++i);

				// Определяем padding-символ и переходим к следующему
				if (char === '-') {
					char = format.charAt(++i);
					padding = '';
				} else if (char === '_') {
					char = format.charAt(++i);
					padding = ' ';
				} else if (char === '0') {
					char = format.charAt(++i);
					padding = '0';
				} else {
					// Для `%k` и `%l` делаем исключение
					padding = (char === 'k' || char === 'l') ? ' ' : '0';
				}

				// Подстановка
				/*formats*/
			}
			else {
				result += char;
			}
		}


		if (useCache) {
			cache.ts = ts;
			cache.format = format;
			cache.value = result;
			cache[format] = [ts, result];
		}


		return result;
	};


	// Генерируем правила форматирования
	var ifs = [];
	var formats = {
		'A': { val: 'days[getDay]' },
		'a': { val: 'shortDays[getDay]' },

		'B': { val: 'months[getMonth]' },
		'b': { val: 'shortMonths[getMonth]' },

		'C': { val: 'Math.floor(getFullYear / 100)', pad: 2 },
		'D': { val: 'strftime(locale.formats.D || "%m/%d/%y", date, locale)' },

		'd': { val: 'getDate', pad: 2 },
		'e': { val: 'getDate' },

		'F': { val: 'strftime(locale.formats.F || "%Y-%m-%d", date, locale)' },

		'H': { val: 'getHours', pad: 2 },
		'h': { val: 'shortMonths[getMonth]' },
		'I': { val: '(val = getHours, val === 0) ? 12 : (val > 12 ? val - 12 : val)', pad: 2 },

		'j': {
			code: function (date, val) { // slow
				var firstDayOfYear = new Date(date.getFullYear(), 0, 1);
				val = Math.ceil((date.getTime() - firstDayOfYear.getTime()) / (1000 * 60 * 60 * 24));
			},
			pad: 3
		},

		'k': { val: 'getHours', pad: 2 },

		'L': { val: 'Math.floor(ts % 1000)', pad: 3 },
		'l': { val: '(val = getHours, val === 0) ? 12 : (val > 12 ? val - 12 : val)', pad: 2 },

		'M': { val: 'getMinutes', pad: 2 },
		'm': { val: 'getMonth + 1', pad: 2 },

		'n': { val: '"\\n"' },
		'o': function (date, val) { // slow
			val = date.getDate();
			var x = val % 10, y = val % 100;

			if ((y >= 11 && y <= 13) || x === 0 || x >= 4) {
				val += 'th';
			} else if (x === 1) {
				val += 'st';
			} else if (x === 2) {
				val += 'nd';
			} else if (x === 3) {
				val += 'rd';
			}
		},

		'P': { val: 'getHours < 12 ? locale.am : locale.pm' },
		'p': { val: 'getHours < 12 ? locale.AM : locale.PM' },

		'R': { val: 'strftime(locale.formats.R || "%H:%M", date, locale)' },
		'r': { val: 'strftime(locale.formats.r || "%I:%M:%S %p", date, locale)' },

		'S': { val: 'getSeconds', pad: 2 },
		's': { val: 'Math.floor(ts / 1000)' },

		'T': { val: 'strftime(locale.formats.T || "%H:%M:%S", date, locale)' },
		't': { val: '"\\t"' },

		'U': function (date, ts, val) {
			var wday = date.getDay(),
				firstDayOfYear = new Date(date.getFullYear(), 0, 1),
				yday = (ts - firstDayOfYear.getTime()) / 86400000,
				weekNum = (yday + 7 - wday) / 7
			;

			val = Math.floor(weekNum);
		},

		'u': { val: '(val = getDay, val === 0) ? 7 : val' },

		'v': { val: 'strftime(locale.formats.v || "%e-%b-%Y", date, locale)' },

		'W': function (date, ts, val) {
			var wday = date.getDay();
			wday = (wday === 0) ? 6 : wday - 1;

			var firstDayOfYear = new Date(date.getFullYear(), 0, 1),
				yday = (ts - firstDayOfYear) / 86400000,
				weekNum = (yday + 7 - wday) / 7
			;
			val = Math.floor(weekNum);
		},

		'w': { val: 'getDay' },

		'Y': { val: 'getFullYear' },
		'y': { val: '(getFullYear + "").substr(-2, 2)' },

		'Z': { val: 'utc ? "GMT" : date.toString().match(/\\((\\w+)\\)/) && RegExp.$1 || ""' },
		'z': function (date, utc, tz, val) {
			if (utc) {
				val = "+0000";
			} else {
				var off = typeof tz === 'number' ? tz : -date.getTimezoneOffset(),
					hours = Math.abs(off / 60),
					mins = off % 60
				;
				val = (off < 0 ? '-' : '+') + (hours > 9 ? hours : '0' + hours) + (mins > 9 ? mins : '0' + mins);
			}
		}
	};


	for (var mod in formats) {
		var format = formats[mod],
			code = format.code || format,
			val = format.val,
			pad = format.pad,
			body = ''
		;

		if (code instanceof Function) {
			body += code.toString().match(/\{([\s\S]+)\}/)[1];
			val = "val";
		}
		else {
			val = format.val.replace(/\b(get\w+)/i, 'date.$1()');
		}


		/* jshint laxbreak:true */
		body += (pad === 3
			? ("val = " + val + ";result += val > 99 ? val : (val > 9 ? padding + val : padding + padding + val);")
			: (pad === 2
				? ("val = " + val + ";result += val > 9 ? val : padding + val;")
				: "result += " + val + ";"
			)
		);


		ifs.push("if (char === '" + mod + "') {" + body + "}");
	}


	ifs.push("{ result += char; }");


	// Мутируем
	/* jshint evil:true */
	strftime = (new  Function(
		'cache,defaultLocale,cachedDate,cachedDateId,cachedDateReset',
		'return ' + strftime.toString().replace('/*formats*/', ifs.join(' else '))
	))(cache, defaultLocale, cachedDate, cachedDateId, cachedDateReset);


	// Export
	module.exports = {
		strftime: strftime,

		strftimeUTC: function (format, date, locale) {
			return strftime(format, date, locale, { utc: true });
		},

		strftimeTZ: function (date, format, locale, timezone) {
			if (!(locale instanceof Object)) {
				timezone = locale;
				locale = void 0;
			}

			return strftime(date, format, locale, { timezone: timezone });
		}
	};
})();
