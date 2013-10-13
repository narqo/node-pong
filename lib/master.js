const cluster = require('cluster'),
    utils = require('./utils'),
    cmd = require('./cmd'),
    debug = utils.debug('master'),
    PONG_STAT_TIMEOUT = 300;

var negotiator,
    stats,
    statTimer = null;

function eachWorker(fn, ctx) {
    Object.keys(cluster.workers).forEach(function(id) {
        fn.call(ctx || null, cluster.workers[id]);
    });
}

function someWorkers(fn, ctx) {
    return Object.keys(cluster.workers).some(function(id) {
        return fn.call(ctx || null, cluster.workers[id]);
    });
}

function broadcast(pid, cmd) {
    if(statTimer !== null) {
        debug('Can\'t send another broadcast');
    }

    stats = [];
    negotiator = pid;
    debug('negotiator', negotiator);

    eachWorker(function(worker) {
        /** @type String */
        var wpid = worker.process.pid + '';

        // NOTE: Skip negotiator worker from broadcasting.
        // We already know that he is a live.
        if(wpid === pid) {
            debug('skiping negotiator');
            return;
        }

        worker.send(cmd);
        stats.push(wpid);
    });

    statTimer = setTimeout(function() {
        debug('Broadcast timeout');

        dropBroadcastTimer();
        pingFailed();
    }, PONG_STAT_TIMEOUT);
}

function dropBroadcastTimer() {
    clearTimeout(statTimer);
    statTimer = null;
}

function ping(pid) {
    var stat = cmd.createCmd(cmd.COMMANDS.PING);
    broadcast(pid, stat);
}

function pong(pid) {
    var pidIx = stats.indexOf(pid);
    if(pidIx === -1) {
        debug('Wrong pid', pid, stats);

        dropBroadcastTimer();
        pingFailed();
    }

    stats.splice(pidIx, 1);

    if(!stats.length) {
        dropBroadcastTimer();
        pingSuccess();
    }
}

function done(err, msg) {
    if(!negotiator) {
        debug('don\'t know to which worker send result');
    }

    var doneCmd = cmd.createCmd(cmd.COMMANDS.DONE, { err : err, msg : msg }),
        status;

    status = someWorkers(function(worker) {
        if(worker.process.pid == negotiator) {
            worker.send(doneCmd);
            return true;
        }
    });

    if(!status) {
        debug('something went wrong during "done" processing');
    }
}

function pingSuccess() {
    done(null, 'Ok!');
}

function pingFailed() {
    done(new Error('Something went wrong ' + stats.join(',')));
}

function onWorkerMessage(msg) {
    debug('new message from worker', msg);

    var cmd_ = msg.cmd;
    if(!cmd_) {
        return;
    }

    cmd_ = cmd.parseCmdName(cmd_);
    debug('cmd parsed', cmd_);

    var pid = msg.args.pid + '';

    switch(cmd_) {

    case cmd.COMMANDS.PING:
        ping(pid);
        return;

    case cmd.COMMANDS.PONG:
        pong(pid);
        return;

    default:
        debug('Unknown cmd', cmd_);
        return;

    }
}

function setupMaster() {
    if(cluster.isMaster) {
        cluster.on('listening', function(worker) {
            worker.on('message', onWorkerMessage);
        });
    }
}

exports.setupMaster = setupMaster;
