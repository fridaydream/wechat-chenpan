const fs=require('fs');

exports.readFileAsync= (fpath,encoding)=>{
	return new Promise(function(resolve,reject){
		fs.readFile(fpath,encoding,function(err,content){
			if(err){
				console.log(err);
				reject(err);
			} else{
				resolve(content);
			} 
		})
	})
}

exports.writeFileAsync=function(fpath,content){
	return new Promise(function(resolve,reject){
		fs.writeFile(fpath,content,function(err){
			if(err) reject(err);
			else resolve('write file success');
		})
	})
}