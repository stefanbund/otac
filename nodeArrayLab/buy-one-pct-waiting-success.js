/**
 * algo 2: 
 * successfully lies in-wait for a target price. This will stay active throughout any period where a price target is sought. 
 * weaknesses (from tests): cannot respond in an agile way to price opportunities, only seeks a disciplined target, 1% gain
 */
var priceIndex = []; //major data source for the app, we'll analyze this for bid/ask
//core vars
var coindesk = require('node-coindesk-api');
var fs = require('fs'); //price history during this run
var askWriter = require('fs'); //will write asks to a file, perhaps better done with JSON objects? 
var newPrice; //latest coin price

//purchase info
var buyPrice; //start null, will set initially once we begin, then hold until we sell, in which case we reset it, hopefully at a smart place
var targetAskPrice; //what we hope to sell at
var sellPrice; //to calc gains
var txID = 1; //transaction id, set when bought, nulled when sold (TXID)

//state management
var states = [];

/**
 * eventually you submit a principal amount, then divide into tranches and assign one event emitter per tranche, or one thread, watching prices, per tranche
 * @returns
 */
function getPricing()
{
	coindesk.getCurrentPrice().then(function (data) 
	{
		if(buyPrice !== null ) //initiate the algo with a buy 
		{
			buyPrice = data.bpi.USD.rate_float;	//set the buyprice, which we will configure at the start of each algo run, set by cron
			targetAskPrice = (buyPrice * .01) + buyPrice ; //then set your target, hopefully a 1% gain before we sell
		}

		newPrice = data.bpi.USD.rate_float; //we'll look at the price each time we run this function, set below with setInterval
		priceIndex.push(newPrice); //for little purpose than keeping a backlog
		console.log(newPrice);
		if(newPrice >= targetAskPrice )
		{
			console.log("SELL!");//TODO: BAD SALES ARE TAKING PLACE! ENSURE GAINS BEFORE YOU SELL!
			sellPrice = newPrice; //should be an ask made to the API
			var sale = new Object();//populate and write to file once sold
			sale.buyPrice = buyPrice; 
			sale.askPrice = sellPrice; 
			sale.txid = txID; 
			txID++; //increment the sale id
			var filename = txID + '.txt';
			var saveString = sale.txid + ', ' + sale.buyPrice + ', ' + sale.askPrice ;
			askWriter.appendFile(filename, saveString, function(err){
				if(err){console.log(err);}
			}); //create a  file for sales prices
		}
	});

	var toAppend = newPrice + ', ';
	fs.appendFile('out.txt',toAppend, function(err){
	    if(err){console.log(err)}
	}); //create a sample file of realistic prices
}

setInterval(getPricing, 10000); //each 10 secs

