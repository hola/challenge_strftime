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
// optimization Ефремов Алексей <lexich121@gmail.com>
;(function() {

  //// Where to export the API
  var namespace;  

  // CommonJS / Node module
  if (typeof module !== "undefined") {
    namespace = module.exports = _strftime;
  }

  // Browsers and other environments
  else {
    // Get the global object. Works in ES3, ES5, and ES5 strict mode.
    namespace = (function(){ return this || (1,eval)("this"); }());
  }

  function words(s) { return (s || "").split(" "); }

  var DefaultLocale = {
    days: words("Sunday Monday Tuesday Wednesday Thursday Friday Saturday"), 
    shortDays: words("Sun Mon Tue Wed Thu Fri Sat"), 
    months: words("January February March April May June July August September October November December"), 
    shortMonths: words("Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec"), 
    AM: "AM", 
    PM: "PM", 
    am: "am", 
    pm: "pm",
    formats:{}
  };

  

  function pad2(sBuf, padding){
    return sBuf = "" + sBuf,(2 - sBuf.length == 1) ? (padding == null ? "0" : padding) + sBuf : sBuf;
  }
  function pad3(sBuf, padding){
    return padding = (padding == null ? "0" : padding), sBuf = "" + sBuf,(3 - sBuf.length == 2) ? padding + padding + sBuf : 3 - sBuf.length == 1 ? padding + sBuf: sBuf;
  }
  
  var mutation_body = function(){
    var func = mutation(_strftime, pad2, pad3);
    return func;
  };

  function mutation(strftime, pad2, pad3){
    var body = strftime.toString();
    var pad2_body = pad2.toString();
    var pad3_body = pad3.toString();

    var pad2_state = pad2_body.replace(/(\n|  )/gi," ").match("{[ ]*return (.+);[ ]*}")[1];
    var pad3_state = pad3_body.replace(/(\n|  )/gi," ").match("{[ ]*return (.+);[ ]*}")[1];

    var rx = /case[ ]*[\'\"]{1}([a-zA-Z]{1})[\'\"]{1}[ ]*:[ \n]*(result)[ \n]*\+?\=[ \n]*\([ \n]*function[ \n]*\((.*)\)[ \n]*\{[ \n]*return[ \n]*([^;]+)[ \n]*[\;]?[ \n]*\}[ ]*\)[ \n]*\([ \n]*\)/g;
    var match = body.match(rx);    

    var tab = "        ";
    var func2_replace = function(orig, sBuf,padding){
      return "(sBuf = " + sBuf + ",padding = " + padding + "," + pad2_state + ")";
    };
    var func3_replace = function(orig, sBuf,padding){
      return "(sBuf = " + sBuf + ",padding = " + padding + "," + pad3_state + ")";
    };

    var res = body.replace(rx, function(token, letter, result, params, state){      
      var new_state = state.replace(/\n/g," ").replace(
        /pad2[ ]*\(([^,]+),([^\)]+)\)/g,func2_replace
      ).replace(
        /pad3[ ]*\(([^,]+),([^\)]+)\)/g,func3_replace
      ).replace(/\s{2,}/g, ' ');

      var c_new_state = new_state.replace(/,padding = padding,/g, ",padding = \"' + (padding == null ? \"0\" : padding) + '\",");
      return       "case \"" + letter + "\":\n" +
           tab + "  " + result + " += (" + new_state + ");\n" +
           tab + "  " +  "if(defaultLocale){ CF[CF.length] = \'" + c_new_state + "\';}";
    });
    return res;
  }

  // d, locale, and options are optional, but you can"t leave
  // holes in the argument list. If you pass options you have to pass
  // in all the preceding args as well.
  //
  // options:
  //   - locale   [object] an object with the same structure as DefaultLocale
  //   - timezone [number] timezone offset in minutes from GMT 
  var Cache = {},
      Cache__func,
      Cache__timestamp,
      Cache__tz,
      Cache__result,
      Cache__key;
  function _strftime(fmt, d, locale, options) {   
    var defaultLocale = locale == null;
    // d and locale are optional so check if d is really the locale
    if (d instanceof Date) {
    } else if(!d){
      d = new Date;
    } else {
      locale = d;
      d = new Date();
    }
    
    if(locale){
      locale.formats = locale.formats || {};
    } else {
      locale = DefaultLocale;
    }

    // Hang on to this Unix timestamp because we might mess with it directly below.
    var timestamp = d.getTime();
    var tz, tzType, options_utc;
    if(options){
      tz = options.timezone;
      tzType = typeof tz;
      options_utc = options.utc;  
    }
    
    var fmt_back = (options_utc ? "utc " : "") + fmt;

    if (options_utc || tzType == "number" || tzType == "string") {
      var msDelta = (d.getTimezoneOffset() || 0) * 60000;
      d = new Date(d.getTime() + msDelta);
    }

    if (tz) {
      // ISO 8601 format timezone string, [-+]HHMM
      //
      // Convert to the number of minutes and it"ll be applied to the date below.
      if (tzType == "string") {
        var sign = tz[0] == "-" ? -1 : 1;
        var hours = parseInt(tz.slice(1, 3), 10);
        var mins = parseInt(tz.slice(3, 5), 10);
        tz = sign * (60 * hours) + mins;
      }

      if (tzType) {
        d = new Date(d.getTime() + (tz * 60000));
      }
    }

    
    if(defaultLocale){
      if(Cache__key == fmt_back){
        return Cache__timestamp == timestamp && Cache__tz == tz ? Cache__result : Cache__func(d, locale, options, options_utc,timestamp,tz, tzType);
      } else {
        var __f = Cache[fmt_back];
        if( __f != (void 0)){
          return (
            __f["timestamp"]==timestamp && __f["tz"] == tz
          ) ? __f["val"] : __f.func(d, locale, options, options_utc,timestamp,tz, tzType);
        }  
      }
    }
    // Most of the specifiers supported by C"s strftime, and some from Ruby.
    // Some other syntax extensions from Ruby are supported: %-, %_, and %0
    // to pad with nothing, space, or zero (respectively).
    var len = fmt.length;
    var result = "",
        
        i = 0,
        mod = null,
          c = null,
          ch = null;

    var padding;
    var CF = [];
    
    var sBuf;

    for(i = 0;i < len; i++){
      ch = fmt.charAt(i);
      c = null;
      if(ch !== "%"){
        result += ch;
        if(defaultLocale){
          CF[CF.length] = "'" + ch + "'";  
        }
        
        continue;
      } else {
        i++;
        if(i >= len){ 
          result += ch;
          break;
        }
        mod = fmt.charAt(i);
      }
      switch(mod){
        case "-":
          padding = "";
          break;
        case "_":
          padding = " ";
          break;
        case "0":
          padding = "0";
          break;
        default:  
          padding = null;        
          c = mod;
          break;
      }
      if(c === null){
        i++;
        if(i >= len){ 
          result += ch + mod;
          break;
        }
        c = fmt.charAt(i);
      }      
      switch (c) {

        // Examples for new Date(0) in GMT

        // "Thursday"
        case "A":
          result += (function(){ 
            return locale.days[d.getDay()];
          })();
          break;

        // "Thu"
        case "a": 
          result +=(function(){ 
            return locale.shortDays[d.getDay()]; 
          })();
          break;

        // "January"
        case "B": 
          result += (function(){ 
            return locale.months[d.getMonth()]; 
          })();
          break;

        // "Jan"
        case "b":
          result += (function(){ 
            return locale.shortMonths[d.getMonth()]; 
          })();
          break;

        // "19"
        case "C":
          result += (function(value){ 
            return  value =  "" + Math.floor(d.getFullYear() / 100),
                    pad2(value, padding);
          })();
          break;

        // "01/01/70"
        case "D": 
          var to = i + 1;
          var delta = (mod == c) ? 1 : 2;
          var from = i - delta;
          var _newformat = locale.formats.D || "%m/%d/%y";
          fmt = _newformat + fmt.slice(to,len);
          len = fmt.length;
          i = -1;
          break;

        // "01"
        case "d":
          result += (function(){ 
            return pad2("" + d.getDate(), padding);
          })();
          break;

        // "01"
        case "e":
          result += (function(){ 
            return d.getDate(); 
          })();
          break;
         

        // "1970-01-01"
        case "F":           
          var to = i + 1;
          var delta = (mod == c) ? 1 : 2;
          var from = i - delta;
          var _newformat = locale.formats.F || "%Y-%m-%d";
          fmt =  _newformat + fmt.slice(to,len);
          len = fmt.length;
          i = -1;
          result += "";
          break;

        // "00"
        case "H":
          result += (function(){
            return pad2("" + d.getHours(), padding);
          })();          
          break;

        // "Jan"
        case "h":
          result += (function(){
            return locale.shortMonths[d.getMonth()];
          })();
          break;

        // "12"
        case "I":
          result += (function(_hours12, _hours){
            return _hours12 = (((_hours = d.getHours()) == 0) ? 12 : (_hours > 12 ? _hours - 12 : _hours)),
                    pad2(_hours12,padding);
          })();          
          break;

        // "000"
        case "j":
          result += (function(value,_startyear){
            return value = (
              _startyear = new Date(d.getFullYear(), 0, 1),
              Math.ceil((d.getTime() - _startyear.getTime()) / (86400000))
            ), pad3(value,padding);
          })();          
          break;

        // " 0"
        case "k":
          result += (function(){
            return pad2(d.getHours(),(padding == null ? " " : padding));
          })();
          break;

        // "000"
        case "L":
          result += (function(){
            return pad3(Math.floor(timestamp % 1000), padding);
          })();          
          break;

        // "12"
        case "l": 
          result += (function(value,_hours){
            return  value = (_hours = d.getHours()) == 0 ? 12 : (_hours > 12 ? _hours - 12 : _hours),
                    padding = (padding == null ? " " : padding),
                    pad2( value, padding);
          })();          
          break;

        // "00"
        case "M":
          result += (function(){
            return pad2(d.getMinutes(), padding);
          })();          
          break;

        // "01"
        case "m":
          result += (function(){
            return pad2(d.getMonth() + 1, padding);
          })();          
          break;

        // "\n"
        case "n": 
          result += "\n";
          if(defaultLocale){
            CF[CF.length] = "'\\n'";
          }
          break;

        // "1st"
        // Get the ordinal suffix for a number: st, nd, rd, or th          
        case "o": 
          result += (function(i, ii, ord,_date){
            return (
              _date = d.getDate(), 
              i = _date % 10, 
              ii = _date % 100,
              ord = ((ii >= 11 && ii <= 13) || i === 0 || i >= 4) ? "th" : (
                i == 1 ? "st" : (
                  i == 2 ? "nd" : (
                    i == 3 ? "rd" : ""
                  )
                )
              ), 
              String(_date) + ord
            );
          })();
          break;

        // "am"
        case "P":          
          result += (function(){
            return (d.getHours() < 12 ? locale.am : locale.pm);
          })();
          break;

        // "AM"
        case "p":
          result += (function(){
            return ( d.getHours() < 12 ? locale.AM : locale.PM);
          })();
          break;

        // "00:00"
        case "R":
          var to = i + 1;
          var delta = (mod == c) ? 1 : 2;
          var from = i - delta;
          var _newformat = locale.formats.R || "%H:%M";
          fmt =  _newformat + fmt.slice(to,len);
          len = fmt.length;          
          i = -1;          
          break;

        // "12:00:00 AM"
        case "r": 
          var to = i + 1;
          var delta = (mod == c) ? 1 : 2;
          var from = i - delta;
          var _newformat = locale.formats.r || "%I:%M:%S %p";
          fmt = _newformat + fmt.slice(to,len);
          len = fmt.length;
          i = -1;          
          break;

        // "00"
        case "S": 
          result += (function(){
            return pad2(d.getSeconds(), padding );
          })();          
          break;

        // "0"
        case "s": 
          result += (function(){
            return (Math.floor(timestamp / 1000));
          })(); 
          break;

        // "00:00:00"
        case "T":
          var to = i + 1;
          var delta = (mod == c) ? 1 : 2;
          var from = i - delta;
          var _newformat = locale.formats.T || "%H:%M:%S";
          fmt = _newformat + fmt.slice(to,len);
          len = fmt.length;
          i = -1;
          break;

        // "\t"
        case "t": 
          result += (function(){
            return "\t";
          })();
          continue;

        // "00"
        case "U": 
          result += (function(param, wday, yday,value,_day,_startyear){            
            return  value = (param = (_day = d.getDay()),
                    (
                      wday = ("sunday" == "monday") ? ( _day == 0 ? 6 : _day - 1) : _day
                    ),
                    (
                      yday = (
                      (
                        _startyear = new Date(d.getFullYear(), 0, 1)
                      ),(
                        (d.getTime() - _startyear.getTime()) /  86400000
                      ))
                    ), Math.floor((yday + 7 - wday) / 7)),
                    pad2(value, padding);
          })();
          
          break;

        // "4"
        // 1 - 7, Monday is first day of the week
        case "u":
          result += (function(){
            return (_day = d.getDay()), _day == 0 ? 7 : _day; 
          })();
          break;

        // "1-Jan-1970"
        case "v":
          var to = i + 1;
          var delta = (mod == c) ? 1 : 2;
          var from = i - delta;
          var _newformat = locale.formats.v || "%e-%b-%Y";
          fmt = _newformat + fmt.slice(to,len);
          len = fmt.length;
          i = -1;
          break;

        // "00"
        case "W":
          result += (function(param, wday, yday,value,_startyear){            
            return  value = (param = (_day = d.getDay()),
                    (
                      wday = ("monday" == "monday") ? ( _day == 0 ? 6 : _day - 1) : _day
                    ),
                    (
                      yday = (
                      (
                        _startyear = new Date(d.getFullYear(), 0, 1)
                      ),(
                        (d.getTime() - _startyear.getTime()) /  86400000
                      ))
                    ), Math.floor((yday + 7 - wday) / 7)),
                    pad2(value, padding);
          })();
          break;

        // "4"
        // 0 - 6, Sunday is first day of the week
        case "w":
          result += (function(){ 
            return d.getDay(); 
          })();
          break;

        // "1970"
        case "Y":
          result += (function(){
            return d.getFullYear();
          })();
          break;

        // "70"
        case "y":
          result += (function(y){
            return  y = String(d.getFullYear()),
                    y.slice(y.length - 2);
          })(); 
          break;

        // "GMT"
        case "Z":
          result += (function(tzString){
            return options_utc ? "GMT" : (              
              tzString = d.toString().match(/\((\w+)\)/),
              tzString && tzString[1] || "");
          })();
          break;

        // "+0000"
        case "z":
          result += (function(off,abs_off){
            return options_utc ? "+0000" : (
              (off = (typeof tz == "number") ? tz : -d.getTimezoneOffset()),
              (abs_off = Math.abs(off / 60)),
              (
                (off < 0 ? "-" : "+") + pad2(abs_off,padding) + pad2(off % 60,padding)
              )
            );
          })();
          break;

        default: 
          result += c;
          if(defaultLocale){
            CF[CF.length] = "'" + ch + "'";
          }
          break;
      }
    }
    if(defaultLocale){
      var __content_body = CF.join(")+(");
      var __vars = "var padding;\n";
      var __func_body = __vars + (!!__content_body ? "return (" + __content_body + ");" : "return " + __content_body + ";");

      Cache__func = new Function("d, locale, options, options_utc, timestamp, tz, tzType",__func_body);
      Cache__timestamp = timestamp;
      Cache__tz = tz;
      Cache__result = result;
      Cache__key = fmt_back;
      Cache[Cache__key] = {
        func:Cache__func,
        timestamp:Cache__timestamp,
        tz:Cache__tz,
        val: Cache__result
      };
    }
    return result;    
  }  
  //start mutation function
  eval(mutation_body());
  //namespace.strftime = new Function("fmt", "d", "locale", "options", );
  namespace.strftime = strftime = _strftime;

  // locale is optional
  namespace.strftimeTZ = strftime.strftimeTZ = strftimeTZ;
  function strftimeTZ(fmt, d, locale, timezone) {
    if ((typeof locale == "number" || typeof locale == "string") && timezone == null) {
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

}());
