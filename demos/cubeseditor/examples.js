var examples = [
	"var cx = w/2; // center of animation (x)\nvar cy = h/2; // center of animation (y)\nvar t = w/4; // period\nvar dist = Math.sqrt(Math.pow(x-cx,2)+Math.pow(y-cy,2)) + (Date.now()/300); // distance between center and block\n\nreturn Math.sin(dist % t / (t/2) * Math.PI)*2+2;",
	"var t = x+y;\nreturn x+(h-y)+Math.sin(Date.now()%1000/1000*2*Math.PI+t*Math.PI);",
	"var t = x+y;\nreturn x+(h-y)+Math.sin(Date.now()%1000/1000*2*Math.PI+t);",
	"return Math.sin(Date.now()%1000/1000*Math.PI*2+x*y*Math.PI)*2+2;",
	"return Math.sin(Date.now()%1000/1000*Math.PI*2+x*y*Math.PI*1.5)*2+2;",
	"return (x+y)%2+Math.sin((Date.now()/1000*Math.PI*2+x/2))+1;",
	"var t = Date.now()/1000;\nvar pi2 = Math.PI*2;\nreturn Math.sin(t*pi2+x)-Math.cos(t*pi2-y)+2;"
]