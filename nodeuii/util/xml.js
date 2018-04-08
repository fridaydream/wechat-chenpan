// xml Conversion
const xml2js = require('xml2js')
exports.parseXMLAsync=function(xml){
    return new Promise(function(resolve,reject){
        xml2js.parseString(xml,{trim:true},function(err,content){
            if(err){
                reject(err);
            }else{
                resolve(content);
            }
        })
    })
}

exports.jsonToXml = (obj) => {
    const builder = new xml2js.Builder()
    return builder.buildObject(obj)
}