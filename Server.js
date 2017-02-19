var express = require("express");
var bodyParser  = require("body-parser");
var md5 = require('MD5');
var rest = require("./REST.js");
var app  = express();
var tp = require('tedious-promises');

function REST(){
    var self = this;
    self.connectToDB();
};


REST.prototype.connectToDB = function(){
  var self = this;
  var Connection = require('tedious').Connection;


  var config = {
    userName: 'sa',
    password: 'digital',
    server: '127.0.0.1',

    // If you're on Windows Azure, you will need this:
    options:
   { database: 'NewRathna',
     textsize: '2147483647',
     connectTimeout: 15000,
     requestTimeout: 15000,
     cancelTimeout: 5000,
     packetSize: 4096,
     tdsVersion: '7_1',
     isolationLevel: 2,
     encrypt: false,
     cryptoCredentialsDetails: {},
     useUTC: true,
     useColumnNames: false,
     connectionIsolationLevel: 2,
     readOnlyIntent: false,
     enableAnsiNullDefault: true,
     port: 1433 }
  };

console.log("Cooecting  " + config);
  var connection = new Connection(config);
console.log("Connected " );
  connection.on('connect', function(err) {
      if(err){
        console.log("Error " + err);
      }else{
        self.configureExpress(connection);
      }

    }
  );

}

REST.prototype.configureExpress = function(connection) {
      var self = this;
      app.use(bodyParser.urlencoded({ extended: true }));
      app.use(bodyParser.json());
      var router = express.Router();
      app.use('/api', router);
      var rest_router = new rest(router,connection,md5);
      self.startServer();
}

REST.prototype.startServer = function() {
      app.listen(3000,function(){
          console.log("All right ! I am alive at Port 3000.");
      });
}

REST.prototype.stop = function(err) {
    console.log("ISSUE WITH DATABASE n" + err);
    process.exit(1);
}

new REST();
