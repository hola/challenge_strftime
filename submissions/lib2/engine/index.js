/**
 *  Engine
 *  ======
 *
 *  Check the support for generators
 */

var browser = require('./browser');
var node    = require('./node');

// feature detection, just checking 'yield' is not reliable
var supportGenerators = (function(){
  try {
    eval('(function *(){})()');
    return true;
  } catch (err) {
    return false;
  }
})();

/** default **/
var env = function (parts) {
  return parts;
};

if ( supportGenerators ) env = (typeof window !== 'undefined') ? browser() : node();

module.exports = env;
