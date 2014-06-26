/**
 *  Engine - Node-Worker
 *  ====================
 *
 *  Worker only script for handling distributed computation.
 */

var cluster = require('cluster');

var worker = cluster.worker;

console.log('[READY] - Worker %s:', worker.id )

process.on('message', function (data) {
  console.log('[MESSAGE] - Worker %s: %s', worker.id, data);
  // worker.send(....)
});

process.on('exit', function(){
  console.log('[CLOSE] - ', worker.id);
});
