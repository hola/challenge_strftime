/**
 *  Compile
 *  =======
 *
 *  Created a new function from a parts, containing regular strings and tokens.
 */

var engine = require('./engine/');

module.exports = function (parts) {

  var code = 'var $tmp;\nreturn [' + engine(parts).toString() + '].join("");';

  return new Function('d', 'locale', 'options', code );
};
