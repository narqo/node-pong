var http = require('http'),
    Pong = require('../');

function handler(req, res) {
    if(req.url === '/ping') {
        Pong.pong(function(err, msg) {
            if(err) {
                res.statusCode = 500;
                res.end(err.message);
                return;
            }

            res.end('Pong!\n' + msg);
        });
        return;
    }

    res.end('http://localhost:3001/ping');
}

http.createServer(handler).listen(3001);

console.log('Server listening on port 3001');
