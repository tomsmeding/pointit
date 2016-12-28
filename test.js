function dotest(d){
	console.log("=== DOTEST === "+JSON.stringify(d));
	console.log("");

	var C=require("./locate").computeLocations;
	var f=function (d){return d.map((l)=>l.map((x)=>x/180*Math.PI));};

	console.log(C(f(d)));

	C2=require("./locate2").computeLocations;

	console.log(C2(f(d)));

	console.log("");
}

dotest([[NaN,0,300],[180,NaN,240],[120,60,NaN]]);

dotest([[NaN,90,45,0],[270,NaN,0,-45],[225,160,NaN,270],[180,135,90,NaN]]);
