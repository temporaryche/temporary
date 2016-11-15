
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , http = require('http')
  , path = require('path');
var login = require('./routes/login');
var product = require('./routes/product');
var checkout = require('./routes/checkout');
var session = require('client-sessions');

var app = express();

// all environments
app.use(session({	  
	cookieName: 'session',    
	secret: 'cmpe273_ebay',    
	duration: 30 * 60 * 1000,
	activeDuration: 5 * 60 * 1000,  }));
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', routes.index);
//app.get('/users', user.list);
app.get('/displayAllProducts', product.displayAllProducts);
app.get('/testing', product.testing);


app.post('/checkLogin',login.checkLogin);
app.post('/newUser', login.newUser);
app.post('/sellItem', product.sellItem);
app.post('/addToCart', product.addToCart);
app.post('/getCart', product.shoppingCart);
app.post('/removeFromCart', product.removeFromCart);
app.post('/checkoutShoppingCart', checkout.checkoutShoppingCart);
app.post('/checkoutAddress', checkout.checkoutAddress);
app.post('/editAddress', checkout.editAddress);
app.post('/payAndPurchase', checkout.payAndPurchase);
app.post('/checkSession', login.checkSession);
app.post('/logout', login.logout);
app.post('/placeBid', product.placeBid);
app.post('/getSoldItems', user.getSoldItems);
app.post('/getPurchasedItems', user.getPurchasedItems);

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
