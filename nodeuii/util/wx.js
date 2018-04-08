// some wx fn
const encode = require('../util/encode')
const config = require('../config/config')
const xml = require('./xml')

// 返回 true ／ false
exports.auth = (ctx) => {
    const token = config.wx.token,
          signature = ctx.query.signature,
          timestamp = ctx.query.timestamp,
          nonce = ctx.query.nonce
        console.log(signature);
        console.log(timestamp);
        console.log(nonce);

        // 字典排序
        const arr = [token, timestamp, nonce].sort()
        const result = encode.sha1(arr.join(''))
        console.log(result);
        console.log(signature);
        if (result === signature) {
            return true
        } else {
            return false
        }
}

exports.message = {
	//回复文本
    text (msg, content) {
        return xml.jsonToXml({
            xml: {
                ToUserName: msg.FromUserName,
                FromUserName: msg.ToUserName,
                CreateTime: Date.now(),
                MsgType: 'text',
                Content: content
            }
        })
    },
    //回复图片
    image(msg,content){
    	console.log(content.mediaId);
    	return xml.jsonToXml({
            xml: {
                ToUserName: msg.FromUserName,
                FromUserName: msg.ToUserName,
                CreateTime: Date.now(),
                MsgType: 'image',
                Image: [{MediaId:content.mediaId}]
            }
        })
    },
    //回复语音
    voice(msg,content){
    	return xml.jsonToXml({
            xml: {
                ToUserName: msg.FromUserName,
                FromUserName: msg.ToUserName,
                CreateTime: Date.now(),
                MsgType: 'voice',
                Voice: [{
                	MediaId:content.mediaId
                }]
            }
        })
    },
    //回复视频
    video(msg,content){
    	return xml.jsonToXml({
            xml: {
                ToUserName: msg.FromUserName,
                FromUserName: msg.ToUserName,
                CreateTime: Date.now(),
                MsgType: 'video',
                Video: [{
                	MediaId:content.mediaId,
                	Title:content.title,
                	Description:content.decription
                }]
            }
        })
    },
    //回复音乐
    music(msg,content){
    	return xml.jsonToXml({
            xml: {
                ToUserName: msg.FromUserName,
                FromUserName: msg.ToUserName,
                CreateTime: Date.now(),
                MsgType: 'music',
                Music: [{
                	Title:content.title,
                	Description:content.description,
                	MusicUrl:content.musicUrl,
                	HQMusicUrl:'',
                	ThumbMediaId:content.thumbMediaId
                }]
            }
        })
    },
    //回复图文
    news(msg,content){
    	let replyItem=[];
    	content.forEach(function(item){
    		replyItem.push({
    			Title:item.title,
        		Description:item.description,
        		PicUrl:item.picUrl,
        		Url:item.url,
    		})
    	})
    	return xml.jsonToXml({
            xml: {
                ToUserName: msg.FromUserName,
                FromUserName: msg.ToUserName,
                CreateTime: Date.now(),
                MsgType: 'news',
                ArticleCount: content.length,
                Articles:{
                	item:replyItem
                }
            }
        })
    }
}