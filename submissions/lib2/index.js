/**
 *  multi-strftime
 *  ==============
 *
 *
 */

;(function ( context, name, factory ) {
  if (typeof exports === 'object') { // CommonJS
    module.exports = factory();
  } else if (typeof define === 'function' && define.amd) { // AMD
    define(name, [], factory);
  } else {
    context[name] = factory();
  }
})(this, 'strftime', function(){

  var Runtime = require('./Runtime');

  Runtime.prototype.strftime = strftime;

  var DEFAULT_LOCALES = {
    'EN': require('./locales/en_US'),
    'DE': require('./locales/de_DE'),
    'IT': require('./locales/it_IT')
  };

  var DEFAULT_OPTIONS = {
    'tz': null,
    'utc': false
  };


  /**
   *  Initial format - parameter providing
   *
   *  @param  {[type]} fmt     [description]
   *  @param  {[type]} d       [description]
   *  @param  {[type]} local   [description]
   *  @param  {[type]} options [description]
   */
  function strftime (fmt, d, locale, options) {

    if ( d && !(d instanceof Date) ) {
      locale = d;
      d = void 0;
    }

    if ( !d       ) d       = new Date();
    if ( !locale  ) locale  = DEFAULT_LOCALES['EN'];
    if ( !options ) options = DEFAULT_OPTIONS;

    options.dt = d.getTime();

    var tz = options.tz;

    if ( options.utc || tz != void 0 ) {
      d = new Date(d.getTime() + (d.getTimezoneOffset() || 0) * 60000);
    }

    if (tz) {

      if ( typeof tz === 'string' ) {
        var sign  = ( tz[0] === '-' ) ? -1 : 1;
        var hours = parseInt(tz.slice(1, 3), 10);
        var mins  = parseInt(tz.slice(3, 5), 10);
        tz = sign * (60 * hours) + mins;
        options.tz = tz;
      }

      d = new Date(d.getTime() + (tz * 60000));
    }

    var runtime = new Runtime(d, locale, options);

    return runtime.exec(fmt);
  }


  /** public **/

  strftime.strftime = strftime;

  /**
   *  optional: locale parameter (~ swap with timezone parameter)
   *
   *  @param  {[type]} fmt      [description]
   *  @param  {[type]} d        [description]
   *  @param  {[type]} locale   [description]
   *  @param  {[type]} tz       timezone
   *  @return {[type]}          [description]
   */
  strftime.strftimeTZ = function ( fmt, d, locale, tz ) {

    if ((typeof locale == 'number' || typeof locale == 'string') && tz == null ) {
      tz     = locale;
      locale = void 0;
    }

    return strftime(fmt, d, locale, { 'tz': tz });
  };

  /**
   *  [strftimeUTC description]
   *
   *  @param  {[type]} fmt    [description]
   *  @param  {[type]} d      [description]
   *  @param  {[type]} locale [description]
   *  @return {[type]}        [description]
   */
  strftime.strftimeUTC = function ( fmt, d, locale ) {
    return strftime(fmt, d, locale, { 'utc': true });
  };

  /**
   *  [localizedStrftime description]
   *  -> set local...
   *
   *  @param  {[type]} locale [description]
   *  @return {[type]}        [description]
   */
  strftime.localizedStrftime = function ( locale ) {
    return function ( fmt, d, options ) {
      return strftime(fmt, d, locale, options);
    };
  };


  return strftime;

});
