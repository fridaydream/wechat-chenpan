// base config
const readwritefile=require('../util/readwritefile');
const path=require('path');
 wxconfig={
    port: 8082,
    wx: {
        //token,appid,encodingAESKey
        token: 'chenpanweixin',
        appid: '***',
        encodingAESKey: '**',
        
        getAccessToken:async()=>{
            return await readwritefile.readFileAsync(wxconfig.filePath.accessTokenFile,'utf-8');
        },
        saveAccessToken:async(data)=>{
            data=JSON.stringify(data);
            return await readwritefile.writeFileAsync(wxconfig.filePath.accessTokenFile,data);
        }
    },
    filePath:{
        accessTokenFile:path.join(__dirname,'../assets/access_token.txt'),
        materialPic:path.join(__dirname,'../assets/images/2.jpeg'),
        materialVideo:path.join(__dirname,'../assets/images/6.mp4'),
    }
}
module.exports =wxconfig;