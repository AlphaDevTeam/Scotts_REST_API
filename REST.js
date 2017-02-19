var sql = require("tedious");

var tp = require('tedious-promises');
var dbConfig = {
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

var TYPES = require('tedious').TYPES;
tp.setConnectionConfig(dbConfig); // global scope

var tmpObject = {};
var tmpObjectList = [];
function REST_ROUTER(router,connection,md5) {
    var self = this;
    self.handleRoutes(router,connection,md5);
}

REST_ROUTER.prototype.handleRoutes= function(router,connection,md5) {
    // router.get("/",function(req,res){
    //     //res.json({"Message" : "Hello World !"});
    //     var Request = require('tedious').Request;
    //
    //     request = new Request("select TOP 1 * from Users", function(err, rowCount) {
    //       if(err) {
    //           res.json({"Error" : true, "Message" : "Error executing MySQL query"});
    //       } else {
    //
    //       }
    //
    //     });
    //
    //     connection.execSql(request);
    //
    //     request.on('row', function(columns) {
    //       columns.forEach(function(column) {
    //         tmpObject[column] = column.value;
    //         tmpObjectList.push(column.value);
    //         //console.log("column Added:(" + column + " - value " + column.value);
    //         //console.log("column Retrived :(" + JSON.stringify(tmpObject) + " )");
    //       });
    //       console.log(JSON.stringify(tmpObject));
    //       res.json({"Error" : false, "Message" : "Success", "Users" : JSON.stringify(tmpObjectList) });
    //     });
    //
    //
    //
    //
    //     function executeStatement() {
    //
    //     }
    //
    //
    // })
    router.post("/users",function(req,res){
        var query = "INSERT INTO ??(??,??) VALUES (?,?)";
        var table = ["user_login","user_email","user_password",req.body.email,md5(req.body.password)];
        query = mysql.format(query,table);
        connection.query(query,function(err,rows){
            if(err) {
                res.json({"Error" : true, "Message" : "Error executing MySQL query"});
            } else {
                res.json({"Error" : false, "Message" : "User Added !"});
            }
        });
    });

    router.get("/getTP",function(req,res){
      tp.sql("select TOP 1 * from Users").execute()
      .then(function(results) {
        res.json({"Error" : false, "Message" : "Success", results });
      }).fail(function(err) {
        res.json({"Error" : true, "Message" : "Error executing MySQL query"});
      });
    });

    router.get("/*",function(req,res){
      console.log("Get Genaric");
      var url = req.originalUrl;
      //console.log(req);
      console.log("URL : " + url);
      console.log(req.query);
      var searchURL = JSON.parse(JSON.stringify(req._parsedUrl.search))
      console.log("Search " + searchURL);
      url = url.replace(searchURL,'');
      var urlParts = url.split('/');
      var tableName = urlParts[2];
      var reqID = 0;
      if(urlParts.length > 3){
        reqID = urlParts[3];
      }
      //var tableName = url.replace("/api/", "");
      //var answer = parts[parts.length - 1];

      console.log(urlParts);
      if(reqID ==0){
        //getTopXData(50,tableName)
        getXDataWithParam(tableName,req.query)
        .then(function(results) {
          res.json({"Error" : false, "Message" : "Success", results , "Meta" : "No"});
        }).fail(function(err) {
          res.json({"Error" : true, "Message" : "Error executing MySQL query" + err});
        });
      }else{
        getData(reqID, tableName)
        .then(function(results) {
          res.json({"Error" : false, "Message" : "Success", results , "Meta" : "No"});
        }).fail(function(err) {
          res.json({"Error" : true, "Message" : "Error executing MySQL query" + err});
        });
      }


    });

}

function getData(id, tableName) {
  return tp.sql("SELECT * FROM " + tableName + " WHERE ID = @id")
    .parameter('id', TYPES.Int, id)
    .execute();
}
function getAllData(tableName) {
  return tp.sql("SELECT * FROM " + tableName).execute();
}
function getTopXData( topX, tableName) {
  return tp.sql("SELECT TOP " + topX + " * FROM " + tableName).execute();
}

function getXDataWithParam(tableName,parameters) {
  var paramQuery ="";
  for (var key in parameters) {
    if (parameters.hasOwnProperty(key)) {
      paramQuery = paramQuery + key + " = " + parameters[key];
    }
  }
  var sqlQ = "SELECT * FROM " + tableName + " WHERE " + paramQuery + " ORDER BY 1 ";
  console.log(sqlQ);
  return tp.sql(sqlQ).execute();
}

function getDataWithParam(tableName,parameters) {
  var paramQuery ="";
  for (var key in parameters) {
    if (parameters.hasOwnProperty(key)) {
      paramQuery = paramQuery + key + " = " + parameters[key];
    }
  }
  console.log("Params Debug : " + "SELECT * FROM " + tableName + " WHERE " + paramQuery);
  return tp.sql("SELECT * FROM " + tableName + " WHERE " + paramQuery ).execute();
}

module.exports = REST_ROUTER;
