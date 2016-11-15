var app = angular.module("mainApp", ['ngRoute']);

app.config(function($routeProvider){
	$routeProvider

	.when('/',{
		templateUrl : 'Pages/login.ejs'
	})

	.when('/signUp',{
		templateUrl : 'Pages/signUp.ejs'
	})

	.when('/sellItem', {
		resolve : {
			"check" : function($rootScope,$location){
				if(!$rootScope.loggedIn){
					$location.path('');
				}
			}
		},
		templateUrl : 'Pages/sellItem.ejs'
	})

	.when('/allProducts',{
		resolve : {
			"check" : function($rootScope,$location){
				if(!$rootScope.loggedIn){
					$location.path('');
				}
			}
		},
		templateUrl : 'Pages/allProducts.ejs'
	})

	.when('/checkoutAddress',{
		resolve : {
			"check" : function($rootScope,$location){
				if(!$rootScope.loggedIn){
					$location.path('');
				}
			}
		},
		templateUrl : 'Pages/checkoutAddress.ejs'
	})

	.when('/payment',{
		resolve : {
			"check" : function($rootScope,$location){
				if(!$rootScope.loggedIn){
					$location.path('');
				}
			}
		},
		templateUrl : 'Pages/payment.ejs'
	})

	.when('/profile',{
		resolve : {
			"check" : function($rootScope,$location){
				if(!$rootScope.loggedIn){
					$location.path('');
				}
			}
		},
		templateUrl : 'Pages/userProfile.ejs'
	})
});

app.controller("mainPageController", function($scope,$http,$location,$rootScope){

	//$scope.loggedIn = !$rootScope.loggedIn;

	init();

	function init(){
		$http({
			method : "POST",
			url : '/checkSession',
			data : {
			}
		}).success(function(data) {
			if (data.statusCode == 401) {
				$rootScope.loggedIn = false;
			}
			else
				{
					$rootScope.loggedIn = true;
				}
		}).error(function(error) {
			$rootScope.loggedIn = false;
		});
	}

	//$rootScope.loggedIn = false;
	$scope.signIn = function(){
		$location.path('');
	}

	$scope.signUp = function(){
		$location.path('/signUp');
	}

	$scope.logout = function(){
		$http({
			method : "POST",
			url : '/logout',
			data : {
			}
		}).success(function(data) {
			if (data.statusCode == 401) {
				$rootScope.loggedIn = true;
			}
			else
				{
					$rootScope.loggedIn = false;
					$location.path('');
				}
		}).error(function(error) {
			$rootScope.loggedIn = true;
		});
	}

	$scope.sellItemFile = function(){
		$location.path('/sellItem');
	}

	$scope.viewProfile = function(){
		$location.path('/profile');
	}

	$scope.viewHomepage = function(){
		$location.path('/allProducts');
	}

});




app.controller("loginController", function($scope,$http,$location,$rootScope){
	
	$scope.error = true;
	$scope.success = true;
	$scope.login = function() {
		$http({
			method : "POST",
			url : '/checklogin',
			data : {
				"username" : $scope.username,
				"password" : $scope.password
			}
		}).success(function(data) {
			//checking the response data for statusCode
			if (data.statusCode == 401) {
				$scope.error = false;
			}
			else
				{
					$scope.success = false;
					$rootScope.lliTime = data.lastLogInTime;
					$rootScope.loggedIn = true;
					alert("Login Successfull!!");
					$location.path('allProducts');
				}
				//Making a get call to the '/redirectToHomepage' API
				//window.location.assign("/homepage"); 
		}).error(function(error) {
			$scope.error = false;
		});
	};

	$scope.signUp = function(){
		$location.path('signUp');
	}
});


app.controller("newAccountController", function($scope,$http,$location){

	$scope.error = true;
	$scope.success = true;
	$scope.createAccount = function() {
		$http({
			method : "POST",
			url : '/newUser',
			data : {
				"username" : $scope.username,
				"password" : $scope.password,
				"firstName" : $scope.firstName,
				"lastName" : $scope.lastName
			}
		}).success(function(data) {
			//checking the response data for statusCode
			if (data.statusCode == 401) {
				$scope.error = false;
			}
			else
				{
					$scope.success = false;
					alert("Account Created. Redirecting you to Login Page");
					$location.path('');
				}
				//Making a get call to the '/redirectToHomepage' API
				//window.location.assign("/homepage"); 
		}).error(function(error) {
			$scope.error = false;
		});
	};
});

app.controller("sellItem", function($scope,$http,$location){

	$scope.error = true;
	$scope.success = true;
	$scope.postForSell = function() {
		$http({
			method : "POST",
			url : '/sellItem',
			data : {
				"itemName" : $scope.itemName,
				"itemDescription" : $scope.itemDescription,
				"itemPrice" : $scope.itemPrice,
				"quantity" : $scope.quantity,
				"buyNow" : $scope.buyNow,
				"initialBidding" : $scope.initialBidding
			}
		}).success(function(data) {
			//checking the response data for statusCode
			if (data.statusCode == 401) {
				$scope.error = false;
			}
			else
				{
					$scope.success = false;					
					$location.path('allProducts');
				}
				//Making a get call to the '/redirectToHomepage' API
				//window.location.assign("/homepage"); 
		}).error(function(error) {
			$scope.error = false;
		});
	};
});

app.controller("allProducts", function($scope,$http,$location){
	$scope.error = true;
	$scope.success = true;
	$scope.allProductsInStock=[];
	$scope.cartError = true;

	$scope.getCart = function(){
		$http({
			method : "POST",
			url : '/getCart',
			data : {
			}
		}).success(function(data) {
			//checking the response data for statusCode
			if (data.statusCode == 401) {
			}
			else
				{
					$scope.shoppingCart = data.shoppingCartProducts;
				}
				//Making a get call to the '/redirectToHomepage' API
				//window.location.assign("/homepage"); 
		}).error(function(error) {
			$scope.error = false;
		});
	};

	init();

	function init() {
		$http({
			method : "GET",
			url : '/displayAllProducts',
			data : {
			}
		}).success(function(data) {
			//checking the response data for statusCode
			if (data.statusCode == 401) {
				$scope.error = false;
			}
			else
				{	//for(var i=0;i<data.allProducts.length;i++)
					//{
					//	$scope.allProductsInStock.push(data.allProducts[i]);
					//}
					$scope.allProductsInStock=data.allProducts;				
					//$location.path('');
				}
				//Making a get call to the '/redirectToHomepage' API
				//window.location.assign("/homepage"); 
		}).error(function(error) {
		});

		$scope.getCart();
	};


	$scope.addToCart = function(product){
		$scope.success = true;
		$scope.error = true;
		$scope.selectedItem = product.item_id;
		$http({
			method : "POST",
			url : '/addToCart',
			data : {
				"itemId" : $scope.selectedItem
			}
		}).success(function(data) {
			//checking the response data for statusCode
			if (data.statusCode == 401) {
				$scope.error = false;
			}
			else
				{
					$scope.getCart();
					$scope.success = false;	
				}
				//Making a get call to the '/redirectToHomepage' API
				//window.location.assign("/homepage"); 
		}).error(function(error) {
			$scope.error = false;
		});
	};

	$scope.removeFromCart = function(cartId){
		$scope.success = true;
		$scope.error = true;
		$scope.temp = cartId;
		$http({
			method : "POST",
			url : '/removeFromCart',
			data : {
				"cartId" : $scope.temp,
				"temp" : $scope.temp
			}
		}).success(function(data) {
			//checking the response data for statusCode
			if (data.statusCode == 401) {
			}
			else
				{
					$scope.getCart();
				}
				//Making a get call to the '/redirectToHomepage' API
				//window.location.assign("/homepage"); 
		}).error(function(error) {
			$scope.error = false;
		});
	}

	$scope.checkout = function(){
		$location.path('/checkoutAddress');

/**		$http({
			method : "POST",
			url : '/checkoutShoppingCart',
			data : {
			}
		}).success(function(data) {
			//checking the response data for statusCode
			if (data.statusCode == 401) {
				$scope.error = false;
			}
			else if(data,statusCode == 400){
				$scope.notAvailableItems = data.result;
				$scope.cartError = false;
			}
			else
			{
				$scope.success = false;
				$location.path('/checkoutAddress');
			}
				//Making a get call to the '/redirectToHomepage' API
				//window.location.assign("/homepage"); 
		}).error(function(error) {
			$scope.error = false;
		});
	}
*/
	};

	$scope.bidError = true;
	$scope.bidSuccess = true;

	$scope.addMaxBid = function(item,maxBid){
		$scope.bidError = true;
		$scope.bidSuccess = true;
		$scope.tempItemId = item.item_id;
		$scope.maxBid = item.category;
		$http({
			method : "POST",
			url : '/placeBid',
			data : {
				"itemId" : $scope.tempItemId,
				"maxBid" : $scope.maxBid
			}
		}).success(function(data) {
			//checking the response data for statusCode
			if (data.statusCode == 401) {
				$scope.bidError = false;
			}
			else
				{
					$scope.getCart();
					$scope.bidSuccess = false;
				}
				//Making a get call to the '/redirectToHomepage' API
				//window.location.assign("/homepage"); 
		}).error(function(error) {
			$scope.error = false;
		});
	}

});

app.controller("checkoutAddress",function($scope,$http,$location){
	$scope.success = true;
	init();

	function init(){
		$http({
			method : "POST",
			url : '/checkoutAddress',
			data : {
			}
		}).success(function(data) {
			//checking the response data for statusCode
			if (data.statusCode == 401) {
				$scope.error = false;
			}
			else
				{
					$scope.userAddress = data.userDetails[0];
					$scope.address = $scope.userAddress.address;
					$scope.city = $scope.userAddress.city;
					$scope.state = $scope.userAddress.state;
					$scope.country = $scope.userAddress.country;
					$scope.zip = $scope.userAddress.zip;
					$scope.cellNum = $scope.userAddress.cellphone_number;
				}
				//Making a get call to the '/redirectToHomepage' API
				//window.location.assign("/homepage"); 
		}).error(function(error) {
			$scope.error = false;
		});
	};

	$scope.editAddress = function(){
		$http({
			method : "POST",
			url : '/editAddress',
			data : {
				"address" : $scope.address,
				"city" : $scope.city,
				"state" : $scope.state,
				"country" : $scope.country,
				"zip" : $scope.zip,
				"cellNum" : $scope.cellNum
			}
		}).success(function(data) {
			//checking the response data for statusCode
			if (data.statusCode == 401) {
				$scope.error = false;
			}
			else
				{
					$scope.success = false;	
				}
				//Making a get call to the '/redirectToHomepage' API
				//window.location.assign("/homepage"); 
		}).error(function(error) {
			$scope.error = false;
		});
	};

	$scope.toPayment = function(){

		$location.path('/payment');
	}
});

app.controller("paymentController",function($scope,$http,$location){

	$scope.error = true;
	$scope.finalPage = function(){
		$scope.cardNumber;
		$http({
			method : "POST",
			url : '/payAndPurchase',
			data : {
				"cardNumber" : $scope.cardNumber
			}
		}).success(function(data) {
			//checking the response data for statusCode
			if (data.statusCode == 401) {
				$scope.error = false;
			}
			else
				{
					//$scope.getCart();
					$scope.success = false;	
					$location.path('/profile');
				}
				//Making a get call to the '/redirectToHomepage' API
				//window.location.assign("/homepage"); 
		}).error(function(error) {
			$scope.error = false;
		});
	};
});

app.controller("profileController",function($scope,$http){
	init();
	init1();
	$scope.error = true;

	function init(){
		$http({
			method : "POST",
			url : '/getSoldItems',
			data : {
			}
		}).success(function(data) {
			//checking the response data for statusCode
			if (data.statusCode == 401) {
				//$scope.error = false;
			}
			else
				{
					//$scope.getCart();
					$scope.soldItems = data.itemsData;
					//$scope.success = false;	
					//$location.path('profile');
				}
				//Making a get call to the '/redirectToHomepage' API
				//window.location.assign("/homepage"); 
		}).error(function(error) {
			//$scope.error = false;
		});
	}

	function init1(){

		$http({
			method : "POST",
			url : '/getPurchasedItems',
			data : {
			}
		}).success(function(data) {
			//checking the response data for statusCode
			if (data.statusCode == 401) {
				//$scope.error = false;
			}
			else
				{
					//$scope.getCart();
					$scope.purchaseditems = data.itemsData;
					//$scope.success = false;	
					//$location.path('profile');
				}
				//Making a get call to the '/redirectToHomepage' API
				//window.location.assign("/homepage"); 
		}).error(function(error) {
			//$scope.error = false;
		});
	}


	$scope.success = true;
	init2();

	function init2(){
		$http({
			method : "POST",
			url : '/checkoutAddress',
			data : {
			}
		}).success(function(data) {
			//checking the response data for statusCode
			if (data.statusCode == 401) {
				$scope.error = false;
			}
			else
				{
					$scope.userAddress = data.userDetails[0];
					$scope.address = $scope.userAddress.address;
					$scope.city = $scope.userAddress.city;
					$scope.state = $scope.userAddress.state;
					$scope.country = $scope.userAddress.country;
					$scope.zip = $scope.userAddress.zip;
					$scope.cellNum = $scope.userAddress.cellphone_number;
				}
				//Making a get call to the '/redirectToHomepage' API
				//window.location.assign("/homepage"); 
		}).error(function(error) {
			$scope.error = false;
		});
	};

	$scope.editAddress = function(){
		$http({
			method : "POST",
			url : '/editAddress',
			data : {
				"address" : $scope.address,
				"city" : $scope.city,
				"state" : $scope.state,
				"country" : $scope.country,
				"zip" : $scope.zip,
				"cellNum" : $scope.cellNum
			}
		}).success(function(data) {
			//checking the response data for statusCode
			if (data.statusCode == 401) {
				$scope.error = false;
			}
			else
				{
					$scope.success = false;	
				}
				//Making a get call to the '/redirectToHomepage' API
				//window.location.assign("/homepage"); 
		}).error(function(error) {
			$scope.error = false;
		});
	};



});