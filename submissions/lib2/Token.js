/**
 *  Token
 *  =====
 *
 *  Isolated code chunk containg logic.
 *
 *  ~ Lexical analyzer
 */

var ENUM = require('./config').ENUM;

var Token = function (ch, pad) {
  this.ch  = ch;
  this.pad = pad;
};

/**
 *  Overriding '.toString' for simpler formating call
 *  during the compile step into a composed function.
 */
Token.prototype.toString = function(){

  var ch  = this.ch,
      pad = this.pad;

  // define re-used sub calls here, avoid further calling
  var seconds = 'this.pad(d.getSeconds(),'+pad+',2)';
  var minutes = 'this.pad(d.getMinutes(),'+pad+',2)';
  var hours12 = 'this.pad(this.format12h(d),'+pad+',2)';
  var hours24 = 'this.pad(d.getHours(),'+pad+',2)';

  var day = 'd.getDay()';
  var month = 'this.pad(d.getMonth()+1,'+pad+',2)';
  var shortMonth = 'locale.shortMonths[d.getMonth()]';

  var fullYear  = 'd.getFullYear()';
  var shortYear = 'd.getFullYear()%100|0';
  var date = 'this.pad(d.getDate(),"'+pad+'",2)';

  var timeLabel = 'd.getHours() < 12 ? locale.AM : locale.PM';


  if ( ch ==  65 /* A */ ) { // - full weekday name   // = 'Thu'
    return 'locale.days['+day+']';
  }

  if ( ch ==  97 /* a */ ) { // - abbreviated weekday // = 'Thursday'
    return 'locale.shortDays['+day+']';
  }

  if ( ch ==  66 /* B */ ) { // - full month name     // = 'January'
    return 'locale.months[d.getMonth()]';// month
  }

  if ( ch ==  98 /* b = h */ ) { // - abbreviated month   // = 'Jan'
    return shortMonth;
  }

  if ( ch ==  67 /* C */ ) { // - century number (2d) // = '19'
    return 'this.pad('+fullYear+'/100|0,'+pad+',2)';  /// ! pad !!
  }

  if ( ch ==  68 /* D */ ) { // - american format     // = '01/01/70'
    return '(locale.formats.D != void 0)\n\
           ? this.strftime(locale.formats.D, d, locale)\n\
           : [' + [ month, '"/"', date, '"/"', shortYear ].toString() + '].join("")';
  }

  if ( ch == 100 /* d */ ) { // - day of month (zero)      // = '01'
    return date;
  }

  if ( ch == 101 /* e */ ) { // - day of month (space)     // = ' 1'
    return 'd.getDate()';
  }

  if ( ch ==  70 /* F */ ) { // - full year (%Y-%m-%d)     // = '1970-01-01'
    return '(locale.formats.F != void 0)\n\
           ? this.strftime(locale.formats.F, d, locale)\n\
           : [' + [ fullYear, '"-"', month, '"-"', date ].toString() + '].join("")';
  }

  if ( ch ==  72 /* H */ ) { // - hour (24h: 00-23)        // = '00'
    return hours24;
  }

  if ( ch == 104 /* h = b */ ) { // - abbreviated month        // = 'Jan'
    return 'locale.shortMonths[d.getMonth()]'; // month
  }

  if ( ch ==  73 /* I */ ) { // - hour (12h: 01-12)        // = '12'
    return hours12;
  }

  if ( ch == 106 /* j */ ) { // - day of the year          // = '000'
    return 'this.pad(this.formatYearDay(d), 0, 3)';
  }

  if ( ch == 107 /* k */ ) { // - hour (24h, space)        // = ' 0'
    return ( pad === ENUM.BLANK )
           ? 'this.pad(d.getHours(),'+ENUM.SPACE+', 2)'
           : 'this.pad(d.getHours(),'+pad+',2)';
  }


  if ( ch ==  76 /* L */ ) { //  ??????
    return 'this.pad(options.dt % 1000 |0, 0, 3)';
  }

  if ( ch == 108 /* l */ ) { // - hour (12h, space)        // = '12'
    return ( pad === ENUM.BLANK )
           ? 'this.pad(this.format12h(d),'+ENUM.SPACE+', 2)'
           : 'this.pad(this.format12h(d),'+pad+',2)';//hours12;
  }

  if ( ch == 77 /* M */ ) { // - minute (00 - 59)         // = '00'
    return minutes;
  }

  if ( ch == 109 /* m */ ) { // - month (01 - 12)          // = '01'
    return month;
  }

  if ( ch == 110 /* n */ ) { // - newline character        // = '\n'
    return '"\\n"';
  }

  if ( ch == 111 /* o */ ) { // - ????? -> getOrdinal of the date
    return 'this.formatOrdinal(d)';
  }

  if ( ch ==  80 /* P */ ) { // - timeshift (lowercase)    // = 'am'
    return '(d.getHours() < 12 ) ? locale.am : locale.pm';
  }

  if ( ch == 112 /* p */ ) { // - timeshift (uppercase)    // = 'AM'
    return timeLabel;
  }

  if ( ch ==  82 /* R */ ) { // - 24h notation (%H:%M)      // = '00:00'
    return '(locale.formats.R != void 0)\n\
           ? this.strftime(locale.formats.R, d, locale)\n\
           : [' + [ hours24, '":"', minutes ].toString() + '].join("")';
  }

  if ( ch == 114 /* r */ ) { // - 12h notation (%I:%M:%S %p)// = '12:00:00 AM'
    return '(locale.formats.r != void 0)\n\
           ? this.strftime(locale.formats.r, d, locale)\n\
           : [' + [ hours12, '":"', minutes, '":"', seconds, '" "', timeLabel ].toString() + '].join("")';
  }

  if ( ch ==  83 /* S */ ) { // - second (00 - 59)         // = '00'
    return seconds;
  }

  if ( ch == 115 /* s */ ) { // - seconds since epoch      // =  '0'
    return 'options.dt/1000|0';
  }

  if ( ch ==  84 /* T */ ) { // - 24h notation (%H:%M:%S)  // = '00:00:00'
    return '(locale.formats.T != void 0)\n\
           ? this.strftime(locale.formats.T, d, locale)\n\
           : [' + [ hours24, '":"', minutes, '":"', seconds ].toString() + '].join("")';
  }

  if ( ch == 116 /* t */ ) { // - tab character            // = '\t'
    return '"\\t"';
  }

  if ( ch ==  85 /* U */ ) { // - week number (00 - 53)    // = '00'
    return 'this.formatWeekNumber(d,"sunday")';
  }

  if ( ch == 117 /* u */ ) { // - day number (1 - 7)       // =  '4'
    return '($tmp = d.getDay(), ($tmp == 0) ? 7 : $tmp)';
  }

  if ( ch == 118 /* v */ ) {  // - ???????  || '%e-%b-%Y' |||         // '1-Jan-1970'
    return '(locale.formats.v != void 0)\n\
           ? this.strftime(locale.formats.v, d, locale)\n\
           : [' + [ 'd.getDate()', '"-"', shortMonth, '"-"', fullYear ].toString() + '].join("")';
  }

  if ( ch ==  87 /* W */ ) { // - week number (00 - 53)     // = '00'
    return 'this.formatWeekNumber(d, "monday")';
  }

  if ( ch == 119 /* w */ ) { // - day number (0 - 6)        // =  '4'
    return 'd.getDay()';
  }

  if ( ch ==  89 /* Y */ ) { // - year (century)            // = '1970'
    return fullYear;
  }

  if ( ch ==  121 /* y */ ) { // - year (without century)    // =   '70'
    return shortYear; // shortYear
  }

  if ( ch ==  90 /* Z */ ) { // - timezone abbreviaton      // = 'GMT'
    return 'this.formatTimezone(d,options)';
  }

  if ( ch == 122 /* z */ ) { // - numer timezone offset     // = '+0000'
    return 'this.formatTimezoneOffset(d,options)';
  }

  return 'String.fromCharCode('+ch+')';
};

module.exports = Token;
