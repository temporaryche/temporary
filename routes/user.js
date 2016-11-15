var mysql = require('./mysql');
var fileLogger = require('winston');

exports.getSoldItems = function(req,res)
{
	var username = req.session.username;
	var json_responses;
	var fetchSoldItems = "select item_name, item_description, price, selling_info.quantity as quantity from selling_info, products where selling_info.email = '"+username+"' and products.item_id in (select item_id from selling_info where email = '"+username+"')";

	mysql.runQuery(function(err,results){
		if(!err)
		{
			fileLogger.info("Selling details of user: "+username+" pulled.");
			json_responses = {"statusCode" : 200, "itemsData" : results};
			res.send(json_responses);
		}
		else
		{
			json_responses = {"statusCode" : 401};
			res.send(json_responses);
		}
	},fetchSoldItems);
}


exports.getPurchasedItems = function(req,res)
{
	var username = req.session.username;
	var json_responses;
	var fetchPurchasedItems = "select item_name, item_description, price, purchase_info.quantity as quantity,  purchase_info.credit_card_number as seller_id from purchase_info, products where purchase_info.email = '"+username+"' and products.item_id in (select item_id from purchase_info where email = '"+username+"')";

	mysql.runQuery(function(err,results){
		if(!err)
		{
			fileLogger.info("Purchase details of user: "+username+" pulled.");
			json_responses = {"statusCode" : 200, "itemsData" : results};
			res.send(json_responses);
		}
		else
		{
			json_responses = {"statusCode" : 401};
			res.send(json_responses);
		}
	},fetchPurchasedItems);
}