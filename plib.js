(function(_) {
	var mapx = function(arr,f) {
		var b = arr.length,
			a = new Array(b);
		for (var i = 0; i < b; i++) {
			a[i] = f(arr[i], i);
		}
		return a;
	}
	function pstring(str) {
		str=new String(str);//decrease conversations
		var ptr=0,len=str.length;
		this.toString=function(){
			return str.valueOf();
		}
		this.valueOf=function(){
			return str.valueOf();
		}
		this.length=len;
		this.seekChar=function(ch){
			while(ptr<len && str.charAt(ptr)===ch) ++ptr;//seek char and read the next one
		}
		this.ReadStringTo=function(ch,p){
			var res="";
			if(!p) this.seekChar(ch);
			while(res+=(str.charAt(ptr++)),str.charAt(ptr)!==ch&&ptr<len);
			return res;
		}
		this.terminated=function(){
			return len<=ptr;
		}
		this.seek=function(n){
			ptr+=n;
		}
		this.next=function(){
			++ptr;
		}
		this.readch=function(){
			return str.charAt(ptr);
		}
		this.readbinc=function(){
			return str.charCodeAt(ptr);
		}
		this.readchS=function(){
			return str.charAt(ptr++);
		}
		this.readchS=function(){
			return str.charCodeAt(ptr++);
		}
		this.type="pstring";
	}
	_.pstring=pstring;

	var ignoreNPNode=true;
	_.setIgnoreNPNode=function(a){
		a=!!a;
		ignoreNPNode=a;
		return _;
	}
	function pnode(state){
		var a=[];
		this.subs=a;
		this.type="pnode";
		this.toString=function(){
			return "[object PNode state{"+JSON.stringify(state)+"} subNodeLength{"+a.length+"}]";
		}
		this.valueOf=function(){//convert the state tree into a regular javascript tree-type map
			if(a.length==0){
				return state.subs=[],state;
			}else{
				var su=mapx(a,function(ab){return ab.valueOf()});
				return state.subs=su,state;
			}
		}
		this.push=function(b){
			if(b.type!="pnode") if(ignoreNPNode) return this; else throw "type not match cannot be added. Ignoring using plib.setIgnoreNPNode(true)";
			a.push(b);
			return this;
		}
		this.pushState=function(b){
			var c;
			a.push(c=new pnode(b));
			if(!("partialResult" in this)) this.partialResult=[];
			this.partialResult.push(c);
			return this;
		}
		this.pushStateB=function(b){
			var c;
			a.push(c=new pnode(b));
			return c;
		}
		this.getPushStateResult=function(){
			var c;
			return ("partialResult" in this?(c=this.partialResult,delete this.partialResult,c):undefined);
		}
	}
	_.pnode=pnode;

	//a ultra high level call stack implementation but with few methods, and very very low performance
	function pstack(lls){
		var stack=[];
		this.run=function(){
			var l=stack.length-1;
			var a=stack[l][0](lls,stack[l][1],stack[l][2]);
			switch(a[0]){
				case "run":
				stack.push([a[1],a[2],a[3]]);
				break;
				case "ret":
				stack.pop();
				break;
				case "next":
				default:
				stack.pop();
				stack.push([a[1],a[2],a[3]]);
				break;
			}
			if(lls.terminated()){
				return false;
			}
			return true;
		}
		this.push=function(a,b,c){
			stack.push([a,b,c]);
		}
	}
	_.pstack=pstack;

	function pparser(states,main){
		this.states=states;
		var ma=states[main];
		this.parse=function(str){
			var ps=new pstring(str);
			var s=new pstack(ps);
			var res=new pnode({});
			pstack.push(main,[states,res],[]);
			while(pstack.run());
			return res;
		}
	}
	_.pparser=pparser;
})(window.plib || (window.plib = {}));
