function avgAngle(d1,d2){
	if(d1==null||d2==null){
		return NaN;
	}
	var ax=Math.cos(d1),ay=Math.sin(d1);
	var bx=Math.cos(d2),by=Math.sin(d2);
	var rx=(ax+bx)/2,ry=(ay+by)/2;
	return Math.atan2(ry,rx);
}

// Takes list of directions in degrees;
// Returns list of [x,y] positions.
function computeLocations(dirs){
	var N=dirs.length;
	if(N==0){
		return [];
	} else if(N==1){
		return [[0,0]];
	}

	var goffset=avgAngle(dirs[0][1],dirs[1][0]+Math.PI);
	console.log("goffset="+goffset);
	var poses=new Array(N);
	poses[0]=[0,0];
	poses[1]=[1,0];
	var i;

	var adirs=new Array(N),bdirs=new Array(N);
	for(i=0;i<N;i++){
		adirs[i]=avgAngle(dirs[0][i],dirs[i][0]+Math.PI)-goffset;
		bdirs[i]=avgAngle(dirs[1][i],dirs[i][1]+Math.PI)-goffset;
		console.log("{adirs,bdirs}["+i+"] = {"+adirs[i]+","+bdirs[i]+"}");
	}

	for(i=2;i<N;i++){
		var alpha=adirs[i],beta=bdirs[i];
		var dx=Math.cos(alpha),dy=Math.sin(alpha),
		    ex=Math.cos(beta),ey=Math.sin(beta);
		var dis=-dx*ey+dy*ex;
		console.log("i="+i+" dis="+dis);
		if(Math.abs(dis)<0.4){
			throw Error("People too close together!");
		}
		var t=-ey/dis,s=-dy/dis;
		console.log("i="+i+" t="+t+" s="+s);
		if(Math.abs(t)>Math.abs(s)){
			poses[i]=[t*dx,t*dy];
		} else {
			poses[i]=[1+s*ex,s*ey];
		}
	}

	var rx,ry;
	for(i=1;i<N;i++){
		rx=Math.cos(goffset)*poses[i][0]-Math.sin(goffset)*poses[i][1];
		ry=Math.sin(goffset)*poses[i][0]+Math.cos(goffset)*poses[i][1];
		poses[i]=[rx,ry];
	}

	return poses;
}

module.exports={computeLocations: computeLocations};
