var express = require('Express');
var bodyParser = require('body-parser');
var app = express();

var api = require('./api.js');

app.use('/api', api);

var mysql_api = require('./mysql_api.js');

app.use('/api2', mysql_api);
// app.use('/api', function(req, res, next){
//     console.log("A request for things received at " + Date.now());
//     next();
//  });

 app.get('/', function(req, res) {
    res.send('Hello! The API is at http://localhost:' + port + '/api');
});

 var port = process.env.PORT || 8080; // used to create, sign, and verify tokens
 app.listen(port);