// { ToUserName: [ 'gh_c1a3d83ed545' ],
//  FromUserName: [ 'oOtBW0erciJhGimXOS_Ude__WFrs' ],
//  CreateTime: [ '1522985384' ],
//  MsgType: [ 'text' ],
//  Content: [ '11' ],
//  MsgId: [ '6541172416985825371' ] }
//  将数组格式化掉

module.exports=formatMessage=function(result){
	const message={};
	if(typeof result ==='object'){
		const keys=Object.keys(result);
		for(let i=0;i<keys.length;i++){
			const item=result[keys[i]];
			const key=keys[i];
			if(!(item instanceof Array)||item.length===0){
				continue;
			}
			if(item.length===1){
				const val=item[0];
				if(typeof val==='object'){
					message[key]=formatMessage(val);
				}else{
					message[key]=(val||'').trim();
				}
			}else{
				message[key]=[];
				for(let j=0,k=item.length;j<k;j++){
					message[key].push(formatMessage(item[j]));
				}
			}
		}
	}
	return message;
}