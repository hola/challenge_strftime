/**
 *  Engine - Browser-Worker
 *  =======================
 *
 *  Worker running the browser context.
 */

console.log('[READY] - Worker %s:', this )

this.onmessage = function (e) {
  console.log('[MESSAGE] - Worker %s: %s', worker.id, data);
  // postmessage(...)
};
