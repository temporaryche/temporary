var mysql = require('./mysql');
var fileLogger = require('winston');



exports.checkoutAddress = function(req,res)
{
	var fetchUserDetails = "SELECT * FROM customer WHERE email='"+req.session.username+"'";

	mysql.runQuery(function(err,results){
		if(!err)
		{
			var tempResult = JSON.stringify(results);
			var finalResult = JSON.parse(tempResult);
			fileLogger.info("Address details fetched for user: "+req.session.username);
			console.log("User Details Fetched");
			json_responses = {"statusCode" : 200, "userDetails" : results};
			console.log(finalResult);
			
			res.send(json_responses);
		}
		else
		{
			json_responses = {"statusCode" : 401};
			res.send(json_responses);
		}
	},fetchUserDetails);
}

exports.editAddress = function(req,res)
{
	var address = req.param("address");
	var city = req.param("city");
	var state = req.param("state");
	var country = req.param("country");
	var zip = req.param("zip");
	var cellNum = req.param("cellNum");
	
	var editAddress = "UPDATE customer SET address='"+address+"', city='"+city+"', state='"+state+"', country='"+country+"', zip='"+zip+"', cellphone_number='"+cellNum+"' WHERE email='"+req.session.username+"'";

	mysql.runQuery(function(err,results){
		if(!err)
		{
			fileLogger.info("Shipping Address changed for user: "+req.session.username);
			console.log("User Details Edited");
			json_responses = {"statusCode" : 200};			
			res.send(json_responses);
		}
		else
		{
			json_responses = {"statusCode" : 401};
			res.send(json_responses);
		}
	},editAddress);
}

exports.checkoutShoppingCart = function(req,res)
{
	var username = req.session.username;
	var cart_response=[];
	var flag = 0;
	var json_responses;
	var shoppingCart=[];
	var getShoppingCart = "SELECT * FROM shopping_cart WHERE email = '"+username+"'";
	mysql.runQuery(function(err,results){
		if(!err)
		{
			//console.log("One Item removed from Cart");
			//var finalResult = JSON.parse(JSON.stringify(results));
			var finalResult = JSON.stringify(results);
			var count;
			//json_responses = {"statusCode" : 200};
			var temp = finalResult[0].length;
			var getCount = "SELECT COUNT(*) AS count FROM shopping_cart WHERE email = '"+username+"'";
			mysql.runQuery(function(err,results){if(!err)count = results[0].count;},getCount);
			//for(var i=0;i<finalResult[0].length;i++)
			var i;
			for(i=0;i<count;i++)
			{
				var checkQuantity = "SELECT quantity, item_name FROM products WHERE item_id='"+finalResult[i].item_id+"'";
				mysql.runQuery(function(err,results){
					if(!err)
					{
						console.log(count);
						//console.log(finalResult[i]);
						console.log(temporary.quantity);
						var q = results[0].quantity;
						console.log(q);


					}
				},checkQuantity);
			}

			if(flag == 0)
			{
				json_responses = {"statusCode" : 200};
				res.send(json_responses);
			}
			else
			{
				json_responses = {"statusCode" : 400, "result" : cart_response};
				res.send(json_responses);
			}

			//res.send(json_responses);
		}
		else
		{
			json_responses = {"statusCode" : 401};
			res.send(json_responses);
		}
	},getShoppingCart);

};


exports.payAndPurchase = function(req,res)
{
	var cardNumber = ""+req.param("cardNumber");
	var regex = new RegExp("^[0-9]{16}$");
	console.log("cardnumber:"+cardNumber);
	var username = req.session.username;
	var json_responses;
	if(!regex.test(cardNumber))
	{
		json_responses = {"statusCode" : 401};
		res.send(json_responses);
	}
	else
	{

	var getShoppingCart = "SELECT * FROM shopping_cart WHERE email = '"+username+"'";

	mysql.runQuery(function(err,results){
		if(!err)
		{
			console.log("Result length:"+results.length);

			var i=0;
			var length = parseInt(results.length);
			for(i=0;i<length;i++)
			{
				console.log("Inside for");
				var oldQuantity;
				var subQ = parseInt(results[i].quantity);
				console.log("Cart Id"+results[i].cart_id);
				//var getProductQuantity = "SELECT quantity FROM products WHERE item_id = '"+results[i].item_id+"'";
				var updateQuantity = "UPDATE products SET quantity = quantity - '"+subQ+"' WHERE item_id = '"+results[i].item_id+"'";
				var sellingInfo = "INSERT INTO selling_info (email, item_id, quantity, price) VALUES ((SELECT seller_id FROM products WHERE item_id = '"+results[i].item_id+"'), '"+results[i].item_id+"', '"+subQ+"', (SELECT item_price FROM products WHERE item_id = '"+results[i].item_id+"'));";
				var purchaseInfo = "INSERT INTO purchase_info (email, item_id, quantity, price, credit_card_number) VALUES ('"+username+"', '"+results[i].item_id+"', '"+subQ+"', (SELECT item_price FROM products WHERE item_id = '"+results[i].item_id+"'), '"+cardNumber+"');";
				var emptyShoppingCart = "DELETE FROM shopping_cart WHERE cart_id='"+results[i].cart_id+"'";
				mysql.runQuery(function(err,result){
					if(!err)
						{
							console.log("Result of query 1:"+result);
							mysql.runQuery(function(err,resultt){
								mysql.runQuery(function(err,resultt){
									mysql.runQuery(function(err,resultt){
										fileLogger.info("User: "+req.session.username+" purchased his cart with credit cart: "+cardNumber);
									},emptyShoppingCart);},purchaseInfo);},sellingInfo);
						}
					else
						{
						console.log("Pochyo");
						}
					},updateQuantity);
				//mysql.runQuery(function(err,resultt){
				//	mysql.runQuery(function(err,resultt){
				//		mysql.runQuery(function(err,resultt){
//
				//		},emptyShoppingCart);},purchaseInfo);},sellingInfo);
				
				
			}
			json_responses = {"statusCode" : 200};
			res.send(json_responses);
		}
		else
		{
			json_responses = {"statusCode" : 401};
			res.send(json_responses);
		}

	},getShoppingCart);

	}
}