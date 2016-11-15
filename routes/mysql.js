var ejs= require('ejs');
var mysql = require('mysql');
var pool = connectionPool();
var fileLogger = require('winston');

//Put your mysql configuration settings - user, password, database and port
function getConnection(){
	var connection = mysql.createConnection({
	    host     : 'localhost',
	    user     : 'root',
	    password : 'cheese',
	    database : 'ebay',
	    port	 : 3306
	});
	return connection;
}


function getConnectionFromPool(){
	var fetchedConnection;
	if(pool.length > 0)
	{
		fetchedConnection = pool.pop();
		//pool.remove(fetchedConnection);
		console.log("Fetched from ready poolArray" +pool.length);
		//pool.splice(0,1);
		return fetchedConnection;
	}
	else
	{
		for(;;)
		{
			if(pool.length > 0)
			{
				fetchedConnection = pool[0];
				//pool.remove(fetchedConnection);
				console.log("Fetched from queue" +fetchedConnection);
				fileLogger.info("Fetched From pool connection queue");
				pool.splice(0,1);
				return fetchedConnection;
			}
		}
	}

}


function connectionPool(){
	var poolArray = [];
	for(var i=0;i<20;i++)
	{
		var connection = mysql.createConnection({
	    host     : 'localhost',
	    user     : 'root',
	    password : 'cheese',
	    database : 'ebay',
	    port	 : 3306
	});

		poolArray.push(connection);
	}
	return poolArray;
}

function runQuery(callback,sqlQuery){
	
	console.log("\nSQL Query::"+sqlQuery);
	
	var connection=getConnectionFromPool();
	//var connection=getConnection();
	
	connection.query(sqlQuery, function(err, rows, fields) {
		if(err){
			console.log("ERROR: " + err.message);
		}
		else 
		{	// return err or result
			console.log("DB Results:"+rows);
			callback(err, rows);
		}
	});
	console.log("\nConnection closed..");
	//connection.end();
	pool.push(connection);
}	



exports.runQuery=runQuery;