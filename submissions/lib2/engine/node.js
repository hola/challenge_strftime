/**
 *  Engine - Node
 *  ==================
 *
 *  Node.js environment, Using the cluster module to multi-exec. workers
 *
 *  TODO: yield until all workers are online/ready + handle messaging via generators
 */

module.exports = function(){

  var cluster = require('cluster');
  var os      = require('os');

  cluster.setupMaster({
    'exec': __dirname + '/worker/node-worker.js'
  });

  var cores   = os.cpus().length,
      workers = [];

  for ( var i = 0; i < cores; i++ ) {
    // TODO: spawn worker for parallel processing
    // workers[i] = cluster.fork();
  }

  return function (parts) {
    return parts;
  };
};
