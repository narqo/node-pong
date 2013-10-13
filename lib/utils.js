var concat = Array.prototype.concat,
    slice = Array.prototype.slice;

function debug(ns) {
    if(!process.env.NODE_DEBUG) {
        return function() {};
    }

    var prefix = '[' + ns + ']';
    return function() {
        var args = slice.call(arguments, 0);
        console.log.apply(console, concat.call([prefix], args));
    };
}

exports.debug = debug;
