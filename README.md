node-pong
=========

A tiny library to check Node.js workers are still a live.

## Usage

```javascript

var cluster = require('cluster'),
    http = require('http'),
    Pong = require('node-pong');

if(cluster.isMaster) {

    Pong.setupMaster();

    cluster.fork();
    cluster.fork();

} else {

    http.createServer(function(req, res) {
        if(req.url === '/ping') {
            Pong.pong(function(err, stat) {
                if(err) {
                    stat = err.message;
                    res.statusCode = 500;
                }
                res.end(stat);
            });
            return;
        }

        // ...
    })
    .listen(3014);

}

```

## License

Licensed under the [MIT License](http://creativecommons.org/licenses/MIT/)<br/>
Copyright 2013 Vladimir Varankin &lt;nek.narqo@gmail.com&gt;
