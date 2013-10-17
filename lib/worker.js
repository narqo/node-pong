var cluster = require('cluster'),
    EE = require('events').EventEmitter,
    cmd = require('./cmd'),
    utils = require('./utils'),
    debug = utils.debug('worker'),
    COMMANDS = cmd.COMMANDS,
    DONE_EVENT = cmd.createCmdName(COMMANDS.DONE);

var pongEmitter = new EE();

function sayPing(pid) {
    debug('going to "PING" master');
    process.send(
        cmd.createCmd(COMMANDS.PING, { pid : pid }));
}

function sayPong(pid) {
    debug('going to "PONG" master');
    process.send(
        cmd.createCmd(COMMANDS.PONG, { pid : pid }));
}

function done(msg) {
    debug('done!');
    pongEmitter.emit(DONE_EVENT, msg);
}

function onMessage(msg) {
    debug('new message from master', msg);

    var cmd_ = msg.cmd;
    if(!cmd_) {
        return;
    }

    cmd_ = cmd.parseCmdName(cmd_);
    debug('cmd parsed', cmd_);

    var pid = process.pid;

    switch(cmd_) {

    case COMMANDS.STAT:
        sayPing(pid);
        return;

    case COMMANDS.PING:
        sayPong(pid);
        return;

    case COMMANDS.DONE:
        done(msg.args);
        return;

    }
}

function setupWorker() {
    process.on('message', onMessage);

    return function(cb) {
        debug('Pinging...');

        pongEmitter.once(DONE_EVENT, function(data) {
            cb.call(null, data.err, data.msg);
        });

        sayPing(process.pid);
    };
}

exports.pong = cluster.isWorker?
    setupWorker() : function(err, cb) { cb.call('Ok!') };
