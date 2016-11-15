var mysql = require('./mysql');
var crypto = require('crypto'),
	algorithm = 'aes-256-ctr',
	password = 'youcantknowthis';

var fileLogger = require('winston');

fileLogger.add(fileLogger.transports.File, { filename: 'public/EventLog.log' });
fileLogger.remove(fileLogger.transports.Console);


encrypt = function(input)
{
	var cipher = crypto.createCipher(algorithm,password);
	var crypted = cipher.update(input,'utf8','hex');
	crypted = crypted + cipher.final('hex');
	return crypted;
}


exports.checkLogin = function(req, res)
{
	var username = req.param("username");
	var normalPassword = req.param("password");
	var password = encrypt(normalPassword);
	var json_responses;
	var lastLogInTime;
	var checkUser = "select * from customer where email='"+username+"' and password='" +password+ "'";

	mysql.runQuery(function(err,results){
		if(!err)
		{
			if(results.length > 0)
			{

				var getLastLogInTime = "select last_logged_in from customer where email='"+username+"' and password='" +password+ "'";

				mysql.runQuery(function(err, result){
					lastLogInTime = ""+result[0].last_logged_in;

					var todayDate = new Date();
					var year = todayDate.getFullYear();
					var month = parseInt(todayDate.getMonth())+1;
					var date = todayDate.getDate();
					var hour = todayDate.getHours();
					var minute = todayDate.getMinutes();
					var second = todayDate.getSeconds();
					var lastLoggedInTime = year+"-"+month+"-"+date+" "+hour+":"+minute+":"+second;
					console.log("Todays Date:"+todayDate);
					var setLastLoggedInTime = "UPDATE customer SET last_logged_in='"+lastLoggedInTime+"' WHERE email='"+username+"'";
					mysql.runQuery(function(err,results){
					if(!err)
					{
						fileLogger.info("Last Logged In Timestamp stored for User: "+username);
						console.log("Timestamp Stored");
					}
					else
					{
						fileLogger.info("Error in updating Last Logged in Timestamp for User: "+username);
						console.log("Error in updating Timestamp");
					}
				},setLastLoggedInTime);

				req.session.username = username;
				fileLogger.info("Session initialized for user: "+username);
				console.log("Session initialized");
				//fileLogger.info("First Log");
				json_responses = {"statusCode" : 200, "lastLogInTime" : lastLogInTime};
				res.send(json_responses);
				},getLastLogInTime);				
			}
			else
			{
				json_responses = {"statusCode" : 401};
				res.send(json_responses);
			}
		}
		else
		{
			json_responses = {"statusCode" : 401};
			res.send(json_responses);
		}
	},checkUser);
}


exports.newUser = function(req,res)
{
	var username = req.param("username");
	var normalPassword = req.param("password");
	var password = encrypt(normalPassword);
	var firstName = req.param("firstName");
	var lastName = req.param("lastName");

	var newUser = "INSERT INTO customer (email, first_name, last_name, password) VALUES ('"+username+"', '"+firstName+"', '"+lastName+"', '"+password+"')";

	mysql.runQuery(function(err,results){
		if(!err)
		{
			fileLogger.info("New user created with username: "+username);
			console.log("New User Created");
			json_responses = {"statusCode" : 200};
			
			res.send(json_responses);
		}
		else
		{
			json_responses = {"statusCode" : 401};
			res.send(json_responses);
		}
	},newUser);
}

exports.checkSession = function(req,res)
{
	var json_responses;
	if(req.session.username)
	{
		json_responses = {"statusCode" : 200};
		console.log("Session exists");
		res.send(json_responses);
	}
	else
	{
		json_responses = {"statusCode" : 401};
		res.send(json_responses);
	}
}

exports.logout = function(req,res)
{
	var json_responses;
	//req.session.destroy();
	fileLogger.info("Session destroyed for user: "+req.session.username);
	console.log("Session Destroyed"+req.session.username);
	req.session.destroy();
	json_responses = {"statusCode" : 200};
	res.send(json_responses);
}