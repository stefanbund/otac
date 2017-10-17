/**
 * 
 * algo 3: combines algos 1 and 2, to wait for a price point, then hold until it reaches 1% on the gain. Respects momentum as pct change/time, and identifies buying opps after drops in momentum
 * weaknesses (from tests): txids must be imoproved to improve the documentation process of buy/sell activity
 * strengths: benefits from an aggressive approach that locates low buy-points, but holds until it gains. Knows where to insert itself and exit. Can reinsert itself
 * other: testnet is large, and graphs up and down in several trends until sales are made
 */
//core vars
//var coindesk = require('node-coindesk-api');
var fs = require('fs');
//tx writing
var txid; 
var pi = [];//tracks all prices as a function of momentum, or % change, can be a negative or positive
var d; //decision, to bid, sell... can be buy, sell, hold as strings
var bp = 0; //buy price with which you bought in

function iterateArrayForNums( ar){//display the test net price array
	
	for(var i = 0; i < ar.length; i++){
		if(!isNaN(ar[i])){
			console.log("price " + i + " = " + ar[i]);		
		}
	}
}

function bid(price, pctGain){							//BUY
	
	console.log("bid at " + price + ", losing %"+ pctGain + "... for txid " + txid);
	console.log("");
//	var w = price + "," + pctGain;
//	var f = "BUY--" + txid + ".txt";
//	fs.writeFile( f, w, function(err) {
//	    if(err) {
//	        return console.log(err);
//	    }
	    //console.log("BUY");
	//}); 
}

function resetTx(){								//ensure each bid/ask session is saved with a unique session id
	
	var t = Date.now();				//reset txid
	var l = Math.random();
	txid = t + l;

}

function ask(buyin, sellout, pctGain, tid)
{													//SELL, resets the txid at close? 
	console.log("TXID " + tid + ", bought at " + buyin + ", sold at " + sellout + " for a %" + pctGain + " gain");
	
//	 var saveString = sale.txid + ', ' + sale.buyPrice + ', ' + sale.askPrice ;
	var filename = buyin + " ---> " + sellout + " %" + pctGain + '.txt';
	var saveString = buyin + ', ' + sellout + ', ' + pctGain +' '; 
			fs.appendFile(filename, saveString, function(err){
				if(err){console.log(err);}
			}); 							//save
			resetTx();
}

function analyzePrice(ar){ 										//defines d, buy/sell, hold decision
	//iterateArrayForNums(ar);
	//var lastDiff = 0 ;
	var sellout = 0 ; //price you sold it for
	var movement = 0; //how much the trend moves down (-) or up, based on pct. accumulating % trend, pos or neg?

	for(var i = 0; i < ar.length; i++)
	{
		if(i > 0 && ar[i].toString  !== "undefined")
		{
			if(ar[i] - ar[i-1] !== 0)
			{ //effort to avoid nan
				var lastDiff =  (((ar[i] - ar[i-1]) / ar[i-1] ) * 100 ) ;	//% transition between last two price polls = active price momentum, when added to an aggregate, over a time period	
														//console.log("INITIAL lastDiff = " + lastDiff );//+ " and cumul = " + parseFloat(cumul));
				movement = movement + Number(lastDiff) ; //momentum as a %, + / -
				if( !movement.isNaN )
				{  
					if(lastDiff !== 0)
					{
						//console.log("lastDiff... "+ ar[i]+ " --> " +  ar[i-1]  + " = %"+  lastDiff + " cumulative = %" + movement );	//ok
						if(movement <= -1.0) 					//in declines of 1%, or -1%, STUDY DECIMAL PRECISION IN JS, MISSING VALID BUY-INS
						{
							movement = 0; //resets movement
							bp = ar[i];//why won't this set? 
							bid(ar[i], lastDiff );

						}else if(movement >= 1.0 && bp > 0)
						{ 										//price has aggregately increased, time to reap profit
							ask(bp, ar[i], movement, txid); //txid as it stands
							movement = 0;
						}
					}
				}
			}
									//console.log(" ");
		}
	}

	
}

function priceGen(){ //grab price histogram from out.txt
	/**
	fs.readFile('out.txt', function (err, data){
		if (err) 
		{
			return console.error(err);
		}
								
		var a = data.toString();
		
		pi = a.split(', ').map(parseFloat);	
		analyzePrice(pi); //submit to algo, decides what to do 
	});**/
	
	//artificial price ladder, up and down
	var ip = 4000.0; //initial price
	for(var i = 0; i < 1000; i++)
	{
		var inc = i * .001;
		ip = ip - inc; 
		pi.push(ip);

		if(i === 999)  
		{
			for(var j = 0; j < 1000; j++)
			{
				var inc2 = j * .001;
				ip = ip + inc2; 
				pi.push(ip);

				if(j === 999) //now 
				{
					for(var k = 0; k < 1000; k++)
					{
						var inc3 = k * .001;
						ip = ip - inc3; 
						pi.push(ip);
						if(k === 999) //now 
						{
							for(var l = 0; l < 1000; l++)
							{
								var inc4 = l * .001;
								ip = ip + inc4; 
								pi.push(ip);
							}
						}
					}
				}
			}
		}	
	}
	analyzePrice(pi);

}




function hold(){
	console.log("holding....");

}



function init(){ //sets our tx id
	txid = Date.now();
	console.log("INIT: txid is " + txid); //hopefully shows a date
	priceGen();

}

function getPricing(){
	

		init(); //sets a tx id
			

}

//setInterval(getPricing, 5000); //each 25 secs
getPricing();
