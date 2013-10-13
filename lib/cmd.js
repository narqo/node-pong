const PONG_CMD_PREFIX = 'cmd_pong_',
    cmdPrefixLen = PONG_CMD_PREFIX.length,
    COMMANDS = {
        STAT : 'stat',
        PING : 'ping',
        PONG : 'pong',
        DONE : 'done'
    };

function createCmdName(name) {
    return PONG_CMD_PREFIX + name;
}

function parseCmdName(cmd) {
    return cmd.indexOf(PONG_CMD_PREFIX) !== 0?
        false : cmd.substr(cmdPrefixLen);
}

function createCmd(name, args) {
    var msg = {
        cmd : createCmdName(name)
    };

    if(typeof args !== 'undefined') {
        msg.args = args;
    }

    return msg;
}

module.exports = {
    PONG_CMD_PREFIX : PONG_CMD_PREFIX,
    COMMANDS : COMMANDS,
    createCmdName : createCmdName,
    parseCmdName : parseCmdName,
    createCmd : createCmd
};
