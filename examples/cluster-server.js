var cluster = require('cluster'),
    path = require('path'),
    Pong = require('../'),
    debug = require('../lib/utils').debug('cluster-server');

function setup() {
    cluster.setupMaster({
        exec: path.resolve(__dirname, 'server.js')
    });

    Pong.setupMaster();
}

function start(max) {
    var w;
    while(max--) {
        w = cluster.fork();
        debug('Forking new worker', w.process.pid);
    }
}

/*
var p = 0,
    laps = 3,
    negotiator = 1;

function ping() {
    if(++p > laps) return;

    debug('[M] ping worker', negotiator);
    cluster.workers[negotiator++].send('ping');

    setTimeout(ping, 2000);

    if(negotiator > Object.keys(cluster.workers).length) {
        negotiator = 1;
    }
}
*/

var MAX_WORKERS = 2;

if(cluster.isMaster) {
    setup();
    start(MAX_WORKERS);
}
