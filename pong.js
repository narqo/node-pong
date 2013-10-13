var master = require('./lib/master'),
    worker = require('./lib/worker');

exports.setupMaster = master.setupMaster;
exports.pong = worker.pong;
