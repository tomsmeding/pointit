// Takes list of directions in degrees;
// Returns list of [x,y] positions.
function computeLocations(dirs){
	var N=dirs.length;
	if(N==0){
		return [];
	} else if(N==1){
		return [[0,0]];
	}

	var goffset=(dirs[0][1]+dirs[1][0])/2;
	var poses=[[0,0],[1,0]];
	var i;
	for(i=1;i<N;i++){
		poses.push(null);
	}

	var adirs=new Array(N),bdirs=new Array(N);
	for(i=0;i<N;i++){
		adirs[i]=(dirs[0][i]+dirs[i][0])/2;
		bdirs[i]=(dirs[1][i]+dirs[i][1])/2;
	}

	for(i=2;i<N;i++){
		var alpha=adirs[i],beta=bdirs[i];
		var dx=Math.cos(alpha),dy=Math.sin(alpha),
		    ex=Math.cos(beta),ey=Math.sin(beta);
		var dis=-dx*ey+dy*ex;
		if(Math.abs(dis)<0.4){
			throw Error("People too close together!");
		}
		var t=-ey/dis,s=-dy/dis;
		if(Math.abs(t)>Math.abs(s)){
			poses[i]=[t*dx,t*dy];
		} else {
			poses[i]=[1+s*ex,s*ey];
		}
	}

	return poses;
}

module.exports={computeLocations};
