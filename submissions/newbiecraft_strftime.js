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
  //// Where to export the API
  var namespace;
  var cachedTemplates = {
    supFunc:{
      pad:pad,
      pad3:pad3,
      _strftime: _strftime,
      hours12: hours12,
      ordinal: ordinal,
      weekSundayNumber: weekSundayNumber,
      weekMondayNumber: weekMondayNumber
    },
    cur:false
  };
  var strategies = {
    // 'Thursday'
            'A':{val:'var A=locale.days[inD.getDay()];'},

            // 'Thu'
            'a':{val:'var a=locale.shortDays[inD.getDay()];'},

            // 'January'
            'B':{val:'var B=locale.months[inD.getMonth()];'},

            // 'Jan'
            'b':{val:'var b=locale.shortMonths[inD.getMonth()];'},

            // '19' 
            'C':{val:'var C=this.supFunc.pad(Math.floor(inD.getFullYear()/100),padding);', padding:true},

            // '01/01/70'
            'D':{val:"var D=this.supFunc._strftime(locale.formats?locale.formats.D:'%m/%d/%y',inD,locale);"},

            // '01'
            'd':{val:'var d=this.supFunc.pad(inD.getDate(),padding);',padding:true},

            // '01'
            'e':{val:'var e=inD.getDate();'},

            // '1970-01-01'
            'F':{val:"var F=this.supFunc._strftime(locale.formats?locale.formats.F:'%Y-%m-%d',inD,locale);"},

            'H':{val:'var H=this.supFunc.pad(inD.getHours(),padding);',padding:true},

            // 'Jan'
            'h':{val:'var h=locale.shortMonths[inD.getMonth()];'},

            // '12'
            'I':{val:'var I=this.supFunc.pad(this.supFunc.hours12(inD),padding);',padding:true},

            'j':{val:'var yz=new Date(inD.getFullYear(),0,1);var dayz=Math.ceil((inD.getTime()-yz.getTime())/(86400000));var j=this.supFunc.pad3(dayz);'},
            // ' 0'
            'k':{val:"var k=this.supFunc.pad(inD.getHours(),padding == null ?' ' :padding);",padding:true},

            // '000'
            'L':{val:'var L=this.supFunc.pad3(Math.floor(timestamp % 1000));'},

            // '12'
            'l':{val:"var l=this.supFunc.pad(this.supFunc.hours12(inD),padding == null?' ':padding);",padding:true},

            // '00'
            'M':{val:'var M=this.supFunc.pad(inD.getMinutes(),padding);',padding:true},

            // '01'
            'm':{val:'var m=this.supFunc.pad(inD.getMonth()+1,padding);',padding:true},

            // '\n'
            'n':{val:"var n='\\n';"},

            // '1st'
            'o':{val:'var o=String(inD.getDate())+this.supFunc.ordinal(inD.getDate());'},

            // 'am'
            'P':{val:'var P=inD.getHours()<12?locale.am:locale.pm;'},

            // 'AM'
            'p':{val:'var p=inD.getHours()<12?locale.AM:locale.PM;'},

            // '00:00'
            'R':{val:"var R=this.supFunc._strftime(locale.formats?locale.formats.R:'%H:%M',inD,locale);"},

            // '12:00:00 AM'
            'r':{val:"var r=this.supFunc._strftime(locale.formats?locale.formats.r:'%I:%M:%S %p',inD,locale);"},

            // '00'
            'S':{val:'var S=this.supFunc.pad(inD.getSeconds(),padding);',padding:true},

            // '0'
            's':{val:'var s=Math.floor(timestamp/1000);'},

            // '00:00:00'
            'T':{val:"var T=this.supFunc._strftime(locale.formats?locale.formats.T:'%H:%M:%S',inD,locale);"},

            // '\t'
            't':{val:"var t='\\t';"},

            // '00'
            'U':{val:'var U=this.supFunc.pad(this.supFunc.weekSundayNumber(inD),padding);',padding:true},

            // '4'
            'u':{val:'var dayzt=inD.getDay();var u=(dayzt==0?7:dayzt);'},
            // 1 - 7, Monday is first day of the week }, // '1-Jan-1970'
            'v':{val:"var v=this.supFunc._strftime(locale.formats?locale.formats.v:'%e-%b-%Y',inD,locale);"},

            // '00'
            'W':{val:'var W=this.supFunc.pad(this.supFunc.weekMondayNumber(inD),padding);',padding:true},

            // '4'
            'w':{val:'var w=inD.getDay();'}, // 0 - 6, Sunday is first day of the week

            // '1970'
            'Y':{val:'var Y=inD.getFullYear();'},

            // '70'
            'y':{val:'var y=inD.getFullYear()%100;'},
            // 'GMT'
            'Z':{val:"if(options&&options.utc){var Z='GMT';}else{var tzString=inD.toString().match(/\((\w+)\)/);var Z=tzString?tzString[1]:'';}"},
            // '+0000'
            'z':{val:"if(options&&options.utc){var z='+0000';}else{var off=typeof(tz)=='number'?tz:-inD.getTimezoneOffset();var z=(off<0?'-':'+')+this.supFunc.pad(Math.abs(off/60))+this.supFunc.pad(off%60);}"}
  };

 // var hashMeaningfullChars = {};
 // for(var p in strategies){
 //  hashMeaningfullChars[p] = true;
 // };
 // console.log(hashMeaningfullChars);
 var hashModChars = {
  '0':true,
  '-':true,
  '_':true
 };
 var paddingModChars = {
  '0':'0',
  '-':'',
  '_':' '
 }
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
// var timestamp;
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
    // if(cached.args = args)
    // options = options || false;

    // d and locale are optional so check if d is really the locale
    if (d && !(d instanceof Date)) {
      locale = d;
      d = new Date();
    }
    d = d || new Date();

    locale = locale || DefaultLocale;
    // locale.formats = locale.formats || {};

    // Hang on to this Unix timestamp because we might mess with it directly below.
    var timestamp = d.getTime();
    if(options){
      // console.log(options);
      var tz = options.timezone;
      var tzType = typeof options.timezone;
      d = new Date(d.getTime() + (d.getTimezoneOffset() ) * 60000);

      if (tz) {
        // ISO 8601 format timezone string, [-+]HHMM
        //
        // Convert to the number of minutes and it'll be applied to the date below.
        
        if(tzType == 'string'){
          var sign = tz[0] == '-' ? -1 : 1;
          var hours = parseInt(tz[1]+tz[2], 10);
          var mins = parseInt(tz[3]+tz[4], 10);
          tz = sign * (60 * hours) + mins;
        }
        d = new Date(d.getTime() + (tz * 60000));
      }
    }
    cachedTemplates.curActive = cachedTemplates[fmt];
    if(cachedTemplates.curActive){
      return cachedTemplates.curActive(d, locale, tz, timestamp, options);
    } else {
      var funcText = '';
      var state = false;
      var mod = '';
      // var string = [];
      var resString = [];
      var staticString = '';
      var char = '0';
      var padding = null;
      for(var i =0; i<fmt.length;++i){
        char = fmt[i];
        if(state=== false){
          if(char == '%'){
            state = true;
            if(staticString!=''){
              resString.push('"'+staticString.replace('"','\\"')+'"');
              staticString='';
            }
          }
          else{
            staticString+=char;
          }
        } else {
          if(strategies[char]){
            if(strategies[char].padding){
              funcText += 'var padding='+(padding===null?'null':'"'+padding+'"')+';';
            }
            funcText += strategies[char].val;
            resString.push(char);
            // resString+=strategies[char](d, locale, tz, timestamp, padding, options);
            state = false;
            mod = '';
            padding = null;
          } else{
            if(mod == '' && hashModChars[char]){
              padding = paddingModChars[char];
              mod = char;
            } else {
              staticString+=mod+char;
              mod = '';
              padding = null;
              state = false;
            }
          }
        }
      }
      if(staticString){
        resString.push('"'+staticString.replace('"','\\"')+'"');
      }
      funcText += 'return ' +resString.join('+')+';';
      // console.log(funcText);
      cachedTemplates[fmt] = new Function('inD', 'locale', 'tz', 'timestamp', 'options', funcText);
      // console.log(funcText);
      return cachedTemplates[fmt](d, locale, tz, timestamp, options);
    }
  }

  // Default padding is '0' and default length is 2, both are optional.
  function pad(n, padding) {
    // pad(n, <length>)

    // Defaults handle pad(n) and pad(n, <padding>)
    if (padding == null) {
      padding = '0';
    }

    // var s = String(n);
    // padding may be an empty string, don't loop forever if it is
    if(padding && n<10){
      return padding+n;
    } else {
      return n;
    }
  }
  function pad3(n, padding) {
    // pad(n, <length>)

    // Defaults handle pad(n) and pad(n, <padding>)
    if (padding == null) {
      padding = '0';
    }
    if(padding && n<100){
      if(n<10){
        return padding+padding+n;
      } else {
        return padding+n;
      }
    } else {
      return n;
    }
  }

  function hours12(d) {
    var hour = d.getHours();
    if (hour == 0) hour = 12;
    else if (hour > 12) hour -= 12;
    return hour;
  }

  // Get the ordinal suffix for a number: st, nd, rd, or th
  function ordinal(n) {
    var i = n % 10;
    if ((n >= 11 && n <= 13) || i === 0 || i >= 4) {
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
  function weekSundayNumber(d) {

    // This works by shifting the weekday back by one day if we
    // are treating Monday as the first day of the week.
    var wday = d.getDay();
    var firstDayOfYear = new Date(d.getFullYear(), 0, 1)
      , yday = (d - firstDayOfYear) / 86400000
      , weekNum = (yday + 7 - wday) / 7
      ;
    return Math.floor(weekNum);
  }
  function weekMondayNumber(d) {

    // This works by shifting the weekday back by one day if we
    // are treating Monday as the first day of the week.
    var wday = d.getDay();
    if (wday == 0) // Sunday
      wday = 6;
    else
      wday--;
    var firstDayOfYear = new Date(d.getFullYear(), 0, 1)
      , yday = (d - firstDayOfYear) / 86400000
      , weekNum = (yday + 7 - wday) / 7
      ;
    return Math.floor(weekNum);
  }

}());
