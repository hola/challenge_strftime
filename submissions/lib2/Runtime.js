/**
*  Runtime
*  =======
*
*  Current context with non static data.
*/

var parse   = require('./parse');
var compile = require('./compile');

var ENUM = require('./config').ENUM;


/**
 *  [Runtime description]
 *  @param {[type]} d       [description]
 *  @param {[type]} locale  [description]
 *  @param {[type]} options [description]
 */
var Runtime = function (d, locale, options) {

  this.d = d;
  this.locale = locale;
  this.options = options; // utc, tz, dt
};

/**
 *  [exec description]
 *
 *  @param  {[type]} fmt [description]
 *  @return {[type]}     [description]
 */
Runtime.prototype.exec = function (fmt) {

  var fn = parse(fmt);

  return fn.apply(this, [ this.d, this.locale, this.options ]);
};


/**
 *  [pad description]
 *
 *  @param  {[type]} ch     [description]
 *  @param  {[type]} pad    [description]
 *  @param  {[type]} length [description]
 *  @return {[type]}        [description]
 */
Runtime.prototype.pad = function (ch, pad, length, check) {
  if ( ch.length == length || pad == ENUM.DASH ) return '' + ch; // omit padding
  var str = ch.toString().split('');
  pad = (pad == ENUM.SPACE) ? ' ' : 0; // BLANK|ZERO
  while ( str.length < length ) str.unshift(pad);
  return str.join('');
};

/**
 *  Serves the times
 *
 *  @param  {[type]} d [description]
 *  @return {[type]}   [description]
 */
Runtime.prototype.format12h = function (d) {
  var hour = d.getHours();
  if ( hour ==  0 ) return 12;
  if ( hour >  12 ) return hour - 12;
  return hour;
};

/**
 *  [formatYearDay description]
 *  @param  {[type]} d [description]
 *  @return {[type]}   [description]
 */
Runtime.prototype.formatYearDay = function (d) {
  var year = new Date(d.getFullYear(), 0, 1);
  var day  = Math.ceil((d.getTime() - year.getTime()) / 86400000);
  return day;
};


/**
 *  Get the oridnal suffix for a date
 *
 *  Source:  https://github.com/jdpedrie/angularjs-ordinal-filter
 *  @param  {[type]} d [description]
 */
Runtime.prototype.formatOrdinal = (function(){

  var suffix = [ 'th', 'st', 'nd', 'rd' ];

  return function (d) {

    var n = d.getDate(), // 1-31
        v = n % 100;

    return n + ( suffix[(v-20)%10] || suffix[v] || suffix[0] );
  };

})();


/**
 *  [formatWeekNumber description]
 *
 *  @param  {[type]} d            [description]
 *  @param  {[type]} firstWeekDay [description]
 */
Runtime.prototype.formatWeekNumber = function (d, firstWeekDay) {

  if ( !firstWeekDay ) firstWeekDay = 'sunday';

  var firstDayOfYear = new Date(d.getFullYear(), 0, 1);
  var yearDay = (d - firstDayOfYear) / 86400000;

  var weekDay = d.getDay();
  if ( firstWeekDay == 'monday' ) {
    if ( weekDay == 0 ) {
      weekDay = 6 // sunday
    } else {
      weekDay--;
    }
  }

  var weekNumber = (yearDay + 7 - weekDay) / 7;
  return weekNumber |0;
};

/**
 *  [formatTimezone description]
 *  @param  {[type]} d [description]
 *  @return {[type]}   [description]
 */
Runtime.prototype.formatTimezone = function (d, options) {

  if ( options.utc ) return 'GMT';

  var tzString = d.toString().match(/\((\w+)\)/);
  return tzString && tzString[1] || '';
};

/**
 *  [formatTimezone description]
 *  @param  {[type]} d [description]
 *  @return {[type]}   [description]
 */
Runtime.prototype.formatTimezoneOffset = function (d, options) {

  if ( options.utc ) return '+0000';

  var tz = options.tz;

  var offset = ( typeof tz == 'number' ) ? tz : -d.getTimezoneOffset();
  var prefix = ( offset < 0 ) ? '-' : '+';

  offset = this.pad(Math.abs(offset/60), 0, 2) + this.pad(Math.abs(offset%60), 0, 2);

  return prefix + offset;
};

module.exports = Runtime;
