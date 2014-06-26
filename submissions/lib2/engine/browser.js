/**
 *  Engine - Browser
 *  ================
 *
 *  Browser environment, which uses webworkers
 *  Using WebWorkers and inline Script references (check if conncurreyn supoorted, else just on 1)
 *
 *  TODO: handle sync
 */

module.exports = function(){

  if ( Worker in window && Blob in window ) {

    var inlineScript = require('./worker/browser-worker').toString();

    var cores   = navigator.hardwareConcurrency || 1, // currently only chrome support
        workers = [];

    var blob    = new Blob([ inlineScript ], 'text/javasacript'),
        blobURL = URL.createObjectURL(blob);

    for ( var i = 0; i < cores; i++ ) {
      // TODO: spawn worker for parallel processing
      // workers[i] = new Worker(blobURL);
    }
  }

  return function (parts) {
    return parts;
  };
};
