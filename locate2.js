function avgAngle(d1,d2){
	if(d1==null||d2==null){
		return NaN;
	}
	var ax=Math.cos(d1),ay=Math.sin(d1);
	var bx=Math.cos(d2),by=Math.sin(d2);
	var rx=(ax+bx)/2,ry=(ay+by)/2;
	return Math.atan2(ry,rx);
}

function wrap(x,l,h){
	return ((x-l)%h+h)%h+l;
}

function computePreliminary(dirs){
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
			poses[i]=[Math.random(),Math.random()-0.5];
			continue;
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

function computeScore(dirs,poses){
	var N=dirs.length;
	var sc=0;
	var i,j;
	var compdir,s;
	for(i=0;i<N;i++){
		for(j=0;j<N;j++){
			if(i==j){
				continue;
			}
			compdir=Math.atan2(poses[j][1]-poses[i][1],poses[j][0]-poses[i][0]);
			s=Math.abs(wrap(dirs[i][j]-compdir+Math.PI,0,2*Math.PI)-Math.PI)/Math.PI;
			sc+=s;
		}
	}
	return sc;
}

var NITERS=10;
var INCREMENT=0.1;
var STEP=0.05;

// Takes list of directions in degrees;
// Returns list of [x,y] positions.
function computeLocations(dirs){
	var N=dirs.length;
	var poses=computePreliminary(dirs);
	var diffs=new Array(N);
	var iter,i,j,diffx,diffy,incr;
	var initScore;
	for(iter=0;iter<NITERS;iter++){
		initScore=computeScore(dirs,poses);
		console.log("initScore="+initScore);
		incr=INCREMENT-iter/NITERS*(INCREMENT/2);
		for(i=0;i<N;i++){
			poses[i][0]+=incr; diffx=computeScore(dirs,poses)-initScore; poses[i][0]-=incr;
			poses[i][1]+=incr; diffy=computeScore(dirs,poses)-initScore; poses[i][1]-=incr;
			diffs[i]=[diffx,diffy];
		}

		i=Math.random()*N|0;
		j=Math.round(Math.random());
		console.log("diffs["+i+"]["+j+"] = "+diffs[i][j]);
		poses[i][j]-=(STEP-iter/NITERS*(STEP/2))*diffs[i][j];
	}

	return poses;
}

module.exports={computeLocations: computeLocations};
