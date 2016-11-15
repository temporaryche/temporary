var mysql = require('./mysql');
var schedule = require('node-schedule');
var fileLogger = require('winston');
//var bidLogger = require('tracer').console();


exports.sellItem = function(req,res)
{
	var itemName = req.param("itemName");
	var itemDescription = req.param("itemDescription");
	var itemPrice = req.param("itemPrice");
	var quantity = req.param("quantity");
	var buyNow = req.param("buyNow");
	if(buyNow)
	{
		buyNow=0;
	}
	else
	{
		buyNow=1;
	}
	var initialBidding = req.param("initialBidding");
	var maxBidder = req.session.username;

	var todayDate = new Date();
	var year = todayDate.getFullYear();
	var month = parseInt(todayDate.getMonth())+1;
	var date = todayDate.getDate();
	var hour = todayDate.getHours();
	var minute = todayDate.getMinutes();
	var second = todayDate.getSeconds();
	var milliSecond = todayDate.getMilliseconds();
	var timeOfAdvertisement = year+"-"+month+"-"+date+" "+hour+":"+minute+":"+second;

	var itemId = maxBidder+"_"+date+"_"+hour+"_"+minute+"_"+second+"_"+milliSecond;

	console.log("Item for Sell" +itemName+":"+itemDescription+":"+itemPrice+":"+quantity+":"+buyNow+":"+initialBidding+":"+maxBidder);
	var json_responses={"statusCode": 200};

	//create the query to insert this data and also create a query to create an timely event for 4 days bidding.
	if(buyNow == 0)
	{
		var insertProduct = "INSERT INTO products (item_id, item_name, item_description, seller_id, quantity, buy_now, max_bid, max_bidder, category, timestamp) VALUES ('"+itemId+"', '"+itemName+"', '"+itemDescription+"', '"+maxBidder+"', '"+quantity+"', '"+buyNow+"', '"+initialBidding+"', '"+maxBidder+"', '', '"+timeOfAdvertisement+"')";
	}
	else
	{
		var insertProduct = "INSERT INTO products (item_id, item_name, item_description, seller_id, item_price, quantity, buy_now, timestamp) VALUES ('"+itemId+"', '"+itemName+"', '"+itemDescription+"', '"+maxBidder+"', '"+itemPrice+"', '"+quantity+"', '"+buyNow+"', '"+timeOfAdvertisement+"')";
	}

	mysql.runQuery(function(err,results){
		if(!err)
		{
			fileLogger.info("Advertisement posted for user: "+req.session.username+" with Item ID: "+itemId);
			console.log("Advertisement Posted with itemId:"+itemId);
			if(buyNow == 0)
			{
				var tempMonth = parseInt(month);
				if(tempMonth==1 || tempMonth==3 || tempMonth==5 || tempMonth==7 || tempMonth==8 || tempMonth==10)
				{
					if(parseInt(date)>=28)
					{
						tempMonth++;
						date = (parseInt(date)+4)%31;
					}
					else
					{
						date = parseInt(date)+4;
					}
				}
				else if(tempMonth==12)
				{
					if(parseInt(date)>=28)
					{
						tempMonth=1;
						year = parseInt(year)+1;
						date = (parseInt(date)+4)%31;
					}
					else
					{
						date = parseInt(date)+4;
					}
				}
				else if(tempMonth==2)
				{
					if(parseInt(year)%4==0)
					{
						if(parseInt(year)%100==0)
						{
							if(parseInt(year)%400==0)
							{
								if(parseInt(date)>=25)
								{
									tempMonth++;
									date = (parseInt(date)+4)%29;
								}
								else
								{
									date = parseInt(date)+4;
								}
							}
							else
							{
								if(parseInt(date)>=24)
								{
									tempMonth++;
									date = (parseInt(date)+4)%28;
								}
								else
								{
									date = parseInt(date)+4;
								}
							}
						}
						else
						{
							if(parseInt(date)>=24)
							{
								tempMonth++;
								date = (parseInt(date)+4)%28;
							}
							else
							{
								date = parseInt(date)+4;
							}
						}
					}
					else
					{
						if(parseInt(date)>=24)
						{
							tempMonth++;
							date = (parseInt(date)+4)%28;
						}
						else
						{
							date = parseInt(date)+4;
						}
					}
				}
				else
				{
					if(parseInt(date)>=27)
					{
						tempMonth++;
						date = (parseInt(date)+4)%30;
					}
					else
					{
						date = parseInt(date)+4;
					}
				}

				month = tempMonth;
				var fixedFinaldate = new Date(year,month-1,date,hour,minute,second);
				//var fixedFinaldate = new Date(2016,9,15,16,48,00);
				console.log("Fixedfinaldate:"+fixedFinaldate);
				var tempBindVar = itemId;
				if(buyNow==0)
				{
					fileLogger.info("Created the cron job for 4 day bidding for Item ID: "+itemId+" sold by user: "+req.session.username);
					//log.info("Created the cron job for 4 day bidding for Item ID: "+itemId+" sold by user: "+req.session.username+" for timestamp: "+fixedFinaldate);
					var newCron = schedule.scheduleJob(fixedFinaldate,function(itemId){
						console.log("Cron Job executed for date:"+fixedFinaldate);
						//var item_id=item_id;
						//var quantity = quantity;
						//var itemPrice = itemPrice;
						
						var updateSellingInfo = "INSERT INTO selling_info (email, item_id, quantity, price) VALUES ((SELECT seller_id FROM products WHERE item_id = '"+itemId+"'), '"+itemId+"', (SELECT quantity FROM products WHERE item_id = '"+itemId+"'), (SELECT max_bid FROM products WHERE item_id = '"+itemId+"'))";
						var updatePurchaseInfo = "INSERT INTO purchase_info (email, item_id, quantity, price, credit_card_number) VALUES ((SELECT max_bidder FROM products WHERE item_id = '"+itemId+"'), '"+itemId+"', (SELECT quantity FROM products WHERE item_id = '"+itemId+"'), (SELECT max_bid FROM products WHERE item_id = '"+itemId+"'), '');";
						var delFromProducts = "DELETE FROM products WHERE item_id = '"+itemId+"'";
						mysql.runQuery(function(err,result){
							if(!err)
							{
								mysql.runQuery(function(err,results){
									if(!err)
									{
										mysql.runQuery(function(err,result){
											if(!err)
											{
												log.info("Cron job executed for Item ID: "+itemId+" for timestamp: "+fixedFinaldate);
												console.log("Job Executed!!");
											}
										},delFromProducts);
									}
								},updatePurchaseInfo);
							}
						},updateSellingInfo);
					}.bind(null,tempBindVar));
				}
				//var createEvent = "CREATE EVENT "+maxBidder+"_"+itemId+" ON SCHEDULE AT '"+year+"-"+month+"-"+date+" "+hour+":"+minute+":"+second+"' DO BEGIN  END               ";
				//create logic for event-- pending
				json_responses = {"statusCode" : 200};
				
				res.send(json_responses);
			}
		}
		else
		{
			json_responses = {"statusCode" : 401};
			res.send(json_responses);
		}
	},insertProduct);

	res.send(json_responses);
}


exports.displayAllProducts = function(req,res)
{
	var getProducts = "SELECT * FROM products WHERE quantity > 0";

	mysql.runQuery(function(err,results){
		if(!err)
		{
			fileLogger.info("All products Pulled from Database for user: "+req.session.username);
			console.log("All Products Pulled");
			//var finalResult = JSON.parse(JSON.stringify(results));
			var finalResult = JSON.stringify(results);
			json_responses = {"statusCode" : 200, "allProducts" : results};
			
			res.send(json_responses);
		}
		else
		{
			json_responses = {"statusCode" : 401};
			res.send(json_responses);
		}
	},getProducts);
};

exports.addToCart = function(req,res)
{
	var itemId = req.param("itemId");
	var email = req.session.username;
	var quantity = 1;
	var addToCart = "INSERT INTO shopping_cart (email, item_id, quantity) VALUES ('"+email+"', '"+itemId+"', '"+quantity+"');";

	mysql.runQuery(function(err,results){
		if(!err)
		{
			fileLogger.info("Product added to cart for User: "+email+" having Item ID: "+itemId);
			console.log("Product Added to Cart");
			json_responses = {"statusCode" : 200};			
			res.send(json_responses);
		}
		else
		{
			json_responses = {"statusCode" : 401};
			res.send(json_responses);
		}
	},addToCart);
}

exports.shoppingCart = function(req,res)
{
	var getCart = "SELECT cart_id, item_name, item_price, shopping_cart.quantity AS quantity FROM shopping_cart, products WHERE shopping_cart.item_id=products.item_id AND email = '"+req.session.username+"'";

	mysql.runQuery(function(err,results){
		if(!err)
		{
			console.log("User Shopping Cart Pulled");
			//var finalResult = JSON.parse(JSON.stringify(results));
			var finalResult = JSON.stringify(results);
			json_responses = {"statusCode" : 200, "shoppingCartProducts" : results};
			
			res.send(json_responses);
		}
		else
		{
			json_responses = {"statusCode" : 401};
			res.send(json_responses);
		}
	},getCart);
}

exports.removeFromCart = function(req,res)
{
	var reqCartId = req.param("temp");
	var removeItemFromCart = "DELETE FROM shopping_cart WHERE cart_id='"+reqCartId+"'";

	mysql.runQuery(function(err,results){
		if(!err)
		{
			fileLogger.info("Item removed from Shopping cart for user: "+req.session.username+" having the Cart ID: "+reqCartId);
			console.log("One Item removed from Cart");
			//var finalResult = JSON.parse(JSON.stringify(results));
			//var finalResult = JSON.stringify(results);
			json_responses = {"statusCode" : 200};
			
			res.send(json_responses);
		}
		else
		{
			json_responses = {"statusCode" : 401};
			res.send(json_responses);
		}
	},removeItemFromCart);
}

exports.placeBid = function(req,res)
{
	var tempItemId = req.param("itemId");
	var maxBid = req.param("maxBid");
	var json_responses;
	var bidQuery = "UPDATE products SET max_bid='"+maxBid+"', max_bidder='"+req.session.username+"' WHERE item_id='"+tempItemId+"'";
	var oldBid = "SELECT max_bid FROM products WHERE item_id='"+tempItemId+"'";

	fileLogger.info("User: "+req.session.username+" placed a Bid of: "+maxBid+" on Item with ID: "+tempItemId);

	mysql.runQuery(function(err,results){
		if(!err)
		{
			//console.log("Bid Placed for item: "+tempItemId);
			//json_responses = {"statusCode" : 200};
			//res.send(json_responses);

			if(maxBid > parseInt(results[0].max_bid))
			{
				mysql.runQuery(function(err,result){
					console.log("Bid Placed for item: "+tempItemId);
					json_responses = {"statusCode" : 200};
					res.send(json_responses);
				},bidQuery);
			}
			else
			{
				json_responses = {"statusCode" : 200};
				res.send(json_responses);
			}
		}
		else
		{
			json_responses = {"statusCode" : 401};
			res.send(json_responses);
		}
	},oldBid);
}


exports.testing = function(req,res){
	var query = "SELECT * from products";
	var a,b,c,d,e,f,json_responses;

	mysql.runQuery(function(err,result){f=result; json_responses = {"f":f};},query);

	//var json_responses = {"a":a, "b":b, "c":c, "d":d, "e":e, "f":f};

res.send(json_responses);
}