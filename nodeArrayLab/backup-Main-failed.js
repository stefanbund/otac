/**
 * 
 * algo 1: locates opportunities in price declines, then issues a buy algorithmically when prices descend
 * weaknesse (from tests)s: can sell lower than a buy point, lacks buy-sell discipline, based on price point, after a price decline
 */
var priceIndex = []; //major data source for the app, we'll analyze this for bid/ask
//core vars
var coindesk = require('node-coindesk-api');
var fs = require('fs');
var buyWriter = require('fs'); //will write bids to a file
var askWriter = require('fs'); //will write asks to a file, perhaps better done with JSON objects? 
var currentPrice; 
var newPrice;
var state = "";//current state
var pctDelta; //% gain or loss in price
var algoStartPrice; //where we start today's trading, or general algo start point, price $

//purchase info
var entryPoint; //where we buy in, per tranche
var startingAmount; 
var tranches = []; //break into 20 tranches, with a tranche id for each (TCHID)
var buyPrice; 
var sellPrice; //to calc gains
var txID = 1; //transaction id, set when bought, nulled when sold (TXID)

//state management
var states = [];

/**
 * eventually you submit a principal amount, then divide into tranches and assign one event emitter per tranche, or one thread, watching prices, per tranche
 * @returns
 */
function getPricing(){
coindesk.getCurrentPrice().then(function (data) 
{
	newPrice = data.bpi.USD.rate_float;
	//NEW! BYY SOMETHING AT INIT
	buyPrice = newPrice; 
	
	currentPrice = priceIndex[priceIndex.length - 1]; //get last available item added
	pctDelta = ((newPrice - currentPrice) / currentPrice) *100; 
	
	if(currentPrice === newPrice) 	//ENTER STATE MACHINE
	{
			state = "HOLDING"; //at 10 second polling intervals, will not fire
			//console.log(state + " .... " + currentPrice + " --> " + newPrice);
			
	}else if(currentPrice > newPrice)
	{
			state = "DROPPING";
			states.push(state);
			console.log("*****" + state + "*****" + " .... $ " + currentPrice + " --> " + newPrice + "............"  +pctDelta + "%");

	}else if(currentPrice < newPrice)
	{
			state = "RISING";
			states.push(state);
			console.log("*****" + state + "*****" + " .... $ " + currentPrice + " --> " + newPrice + "............"  +pctDelta + "%");
	}
	priceIndex.push(newPrice); //must test to ok it

		var l = states.length; 
		var currentState = states[l - 1]; //state last added
		console.log("current state = "  + currentState);
		var lastState = states[l - 2];
		console.log("last state = " + lastState);
		
		for(var lim = 0; lim < states.length; lim++)
		{
			console.log("current states, with indicies are: " + states[lim] + ", " + lim);
		}
			
		//approve a buy or sale
		if(currentState === "RISING" && lastState === "DROPPING")
		{
			console.log("BUY!");
			buyPrice = newPrice; //to be used momentarily when saving whole transaction
			
		}else if(currentState === "DROPPING" && lastState === "RISING")
		{
			//if salesPrice === (buyPrice *.01)+ buyPrice, then SELL! at limit or market? must test the sell type, but do a taker to get it sold? 
			if(sellPrice >= ((buyPrice * .01)+ buyPrice) )
			{
				console.log("SELL!");//TODO: BAD SALES ARE TAKING PLACE! ENSURE GAINS BEFORE YOU SELL!
				sellPrice = newPrice; 
				var sale = new Object();//populate and write to file once sold
				sale.buyPrice = buyPrice; 
				sale.askPrice = sellPrice; 
				sale.txid = txID; 
				txID++; //increment the sale id
				var filename = txID + '.txt';
				var ap = sellPrice + ', ';//for saving to file for balance analysis later
				var saveString = sale.txid + ', ' + sale.buyPrice + ', ' + sale.askPrice ;
				askWriter.appendFile(filename, saveString, function(err){
				    if(err){console.log(err);}
				}); //create a  file for sales prices
			}
			

				
		}	
});
//		if(sellPrice !== null && buyPrice !== null)
//		{	
//			balance += sellPrice - buyPrice; 
//			console.log("balance updated to " + balance);
//		}//never worked

	
	
	var toAppend = newPrice + ', ';
	fs.appendFile('out.txt',toAppend, function(err){
	    if(err){console.log(err)}
	}); //create a sample file of realistic prices
}

setInterval(getPricing, 10000); //each 25 secs

