/**
 *  Parser
 *  ======
 *
 *  /= Tokenizer which matches and replaces the symbols.
 *  Instead of replacing (read, match, seek, write), creating a new string with the results.
 *
 *  Compile & parse
 */

var Token = require('./Token');
var compile = require('./compile');

var ENUM  = require('./config').ENUM;

var cacheFormat = Object.create(null),
    cacheTokens = Object.create(null);


/** Load / pre-warm cache entries **/
var fs = require('fs');
var fileName = __dirname  + '/cache/latest.js'

var cacheList = [];

try { cacheList = JSON.parse(fs.readFileSync(fileName)); /* [ list of entries] */ } catch (e) {}

cacheList.forEach(parse);

process.on('exit', function(){
  fs.writeFileSync(fileName, JSON.stringify(cacheList))
});

/**
 *  [exports description]
 *
 *  @param  {[type]} fmt [description]
 *  @return {[type]}     [description]
 */
module.exports = parse

function parse (fmt) {

  if ( cacheFormat[fmt] ) return cacheFormat[fmt];

  // parsing token entries
  var read = fmt.charCodeAt.bind(fmt);

  var length = fmt.length,
      pos    =  0,
      ch     =  0,
      parts  = [];

  var str = ['"'];

  while ( pos < length ) {

    ch = read(pos++);

    // string
    if ( ch != 37 /*%*/ ) {
      str.push(fmt[pos-1]);
      continue;
    }

    // token
    if ( str.length > 1 ) addString(str, parts);

    ch  = read(pos++);
    pad = ENUM.BLANK;

    if ( ch == 45 /*-*/ ) { ch = read(pos++); pad = ENUM.DASH;  }
    if ( ch == 48 /*0*/ ) { ch = read(pos++); pad = ENUM.ZERO;  }
    if ( ch == 95 /*_*/ ) { ch = read(pos++); pad = ENUM.SPACE; }

    if ( !cacheTokens[ch+pad] ) cacheTokens[ch+'-'+pad] = new Token(ch, pad);

    parts.push( cacheTokens[ch+'-'+pad] );
  }

  if ( str.length > 1 ) addString(str, parts);

  if (cacheList.indexOf(fmt) == -1) cacheList.push(fmt);

  cacheFormat[fmt] = compile(parts);

  return cacheFormat[fmt];
};


/**
 *  [addString description]
 *
 *  @param {[type]} str   [description]
 *  @param {[type]} parts [description]
 */
function addString (str, parts) {

  str.push('"')
  parts.push( str.join('') );
  str.length = 0;
  str[0] = '"'
}
