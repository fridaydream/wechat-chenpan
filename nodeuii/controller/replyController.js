// index controller
const wx = require('../util/wx')
const formatMessage = require('../util/formatMessage');
const menu = require('../util/menu');
const config = require('../config/config');

const Wechat = require('./wechatController');

const wechatApi = new Wechat(config.wx);

const getHandle = async(ctx, next) => {
    const result = wx.auth(ctx)
    if (result) {
        ctx.body = ctx.query.echostr
    } else {
        ctx.body = { code: -1, msg: "You aren't wechat server !" }
    }
}

const postHandle = async(ctx, next) => {
    let msg,
        content,
        result,
        MsgType,
        replyContent,
        mediaData,
        groupList,
        user,
        msgData,
        text;
    msg = ctx.req.body ? ctx.req.body.xml : ''
    if (!msg) {
        ctx.body = 'error request.'
        return;
    }
    msg = formatMessage(msg);
    console.log(msg);
    MsgType = msg.MsgType;
    content = msg.Content;

    if (MsgType === 'event') {
        if (msg.Event === 'subscribe') {
            console.log('subscribe');
            if (msg.EventKey) {
                console.log('扫二维码进来' + msg.EventKey + ' ' + msg.ticket);
            }
            replyContent = '哈哈，订阅了个号\r\n可以回复1到17之间的数字查看特别信息哦';
        } else if (msg.Event === 'unsubscribe') {
            console.log('无情取关');
            replyContent = '';
        } else if (msg.Event === 'LOCATION') {
            replyContent = "您上报的位置是：" + msg.Latitude + '/' + msg.Longitude + '-' + msg.Precision;
        } else if (msg.Event === 'CLICK') {
            replyContent = "您点击了菜单" + msg.EventKey;
        } else if (msg.Event === "SCAN") {
            console.log("关注后扫二维码" + msg.EventKey + ' ' + msg.Ticket);
            replyContent = '看到你扫了一下哦';
        } else if (msg.Event === 'VIEW') {
            replyContent = '您点击了菜单中的链接：' + msg.EventKey;
        } else if (msg.Event === 'scancode_push') {
            console.log(msg.ScanCodeInfo.ScanType);
            console.log(msg.ScanCodeInfo.ScanResult);
            replyContent = '您点击了菜单中的链接：' + msg.EventKey;
        } else if (msg.Event === 'scancode_waitmsg') {
            console.log(msg.ScanCodeInfo.ScanType);
            console.log(msg.ScanCodeInfo.ScanResult);
            replyContent = '您点击了菜单中的链接：' + msg.EventKey;
        } else if (msg.Event === 'pic_sysphoto') {
            console.log(msg.SendPicsInfo.Count);
            console.log(msg.SendPicsInfo.PicList);
            replyContent = '您点击了菜单中的链接：' + msg.PicUrl;
        } else if (msg.Event === 'pic_photo_or_album') {
             console.log(msg.SendPicsInfo.Count);
            console.log(msg.SendPicsInfo.PicList);
            replyContent = '您点击了菜单中的链接：' + msg.EventKey;
        }else if (msg.Event === 'pic_weixin') {
             console.log(msg.SendPicsInfo.Count);
            console.log(msg.SendPicsInfo.PicList);
            replyContent = '您点击了菜单中的链接：' + msg.EventKey;
        }else if (msg.Event === 'location_select') {
             console.log(msg.SendLocationInfo.Location_X);
            console.log(msg.SendLocationInfo.Location_Y);
            replyContent = '您点击了菜单中的链接：' + msg.EventKey;
        }
        result = wx.message.text(msg, replyContent);
    } else if (MsgType === 'text') {
        replyContent = "您说的 " + content + ' 太复杂了';
        result = wx.message.text(msg, replyContent);
        switch (content) {
            case '1':
                replyContent = '天下第一吃大米';
                result = wx.message.text(msg, replyContent)
                break;
            case '2':
                replyContent = '天下第一吃豆腐';
                result = wx.message.text(msg, replyContent)
                break;
            case '3':
                replyContent = '天下第一吃仙丹';
                result = wx.message.text(msg, replyContent)
                break;
            case '4':
                replyContent = [{
                    title: '技术改变世界',
                    description: '只是个描述而已',
                    picUrl: 'https://upload-images.jianshu.io/upload_images/7705786-6b9f43dc721084c3.jpg?imageMogr2/auto-orient/strip%7CimageView2/2/w/500',
                    url: 'https://www.jianshu.com/u/8f8584285223'
                }, {
                    title: 'Node 开发微信',
                    description: '好玩',
                    picUrl: 'https://upload-images.jianshu.io/upload_images/7705786-6b9f43dc721084c3.jpg?imageMogr2/auto-orient/strip%7CimageView2/2/w/500',
                    url: 'http://resume.daxierhao.com'
                }];
                result = wx.message.news(msg, replyContent);
                break;
            case '5':
                //临时图片素材上传得到media_id,在回复过去
                mediaData = await wechatApi.uploadMaterial('image', config.filePath.materialPic);
                replyContent = {
                    type: 'image',
                    mediaId: mediaData.media_id
                }
                result = wx.message.image(msg, replyContent);
                break;
            case '6':
                //临时视频素材上传得到media_id,在回复过去
                mediaData = await wechatApi.uploadMaterial('video', config.filePath.materialVideo);
                replyContent = {
                    type: 'video',
                    title: '回复视频',
                    description: '打个篮球玩玩',
                    mediaId: mediaData.media_id
                }
                result = wx.message.video(msg, replyContent);
                break;
            case '7':
                //临时图片素材上传得到media_id,作为音乐图片背景回复过去(我这里的图片太大没起到作用)
                mediaData = await wechatApi.uploadMaterial('image', config.filePath.materialPic);
                console.log(mediaData);
                replyContent = {
                    type: 'music',
                    title: '回复音乐内容',
                    description: '放松一下',
                    musicUrl: 'https://qn-qn-echo-cp-cdn.app-echo.com/c2/764c966b3fca71f90126f4227008975199ecf0759def6b7b51bc68813d7ba78b8d603473.mp3',
                    thumbMediaId: mediaData.media_id,
                }
                result = wx.message.music(msg, replyContent);
                break;
            case '8':
                //永久图片素材上传得到media_id,在回复过去
                mediaData = await wechatApi.uploadMaterial('image', config.filePath.materialPic, { type: 'image' });
                replyContent = {
                    type: 'image',
                    mediaId: mediaData.media_id
                }
                result = wx.message.image(msg, replyContent);
                break;
            case '9':
                //永久视频素材上传得到media_id,在回复过去
                mediaData = await wechatApi.uploadMaterial('video', config.filePath.materialVideo, { type: 'video', description: '{"title":"Really a nice place","introduction":"Never think to easy"}' });
                replyContent = {
                    type: 'image',
                    mediaId: mediaData.media_id
                }
                result = wx.message.video(msg, replyContent);
                break;
            case '10':
                //上传永久图文消息需要的图片的url(自处有坑，开始用uploadimg,这个接口不行，用上传永久素材图片返回的image)
                let picData = await wechatApi.uploadMaterial('image', config.filePath.materialPic, {});
                let permanentData = {
                    articles: [{
                        title: '上传永久图文消息',
                        thumb_media_id: picData.media_id,
                        author: 'daxierhao.com',
                        digest: 'cp 闯一下',
                        show_cover_pic: 1,
                        content: "上传永久图文消息",
                        content_source_url: 'https://www.jianshu.com/u/8f8584285223'
                    }]
                }
                //上传永久图文消息
                let mediaDataId = await wechatApi.uploadMaterial('news',{},permanentData);
                console.log("mediaDataId=====", mediaDataId);
                //通过media_Id查找图文
                mediaData = await wechatApi.fetchMaterial(mediaDataId.media_id, 'news', {});
                console.log('mediaData======', mediaData);
                let items = mediaData.news_item;
                let news = [];
                items.forEach(function(item) {
                    news.push({
                        title: item.title,
                        description: item.digest,
                        picUrl: picData.url,
                        url: item.url
                    });
                });
                result = wx.message.news(msg, news);
                break;
            case '11':
                //永久视频素材上传得到media_id,在回复过去
                const counts = await wechatApi.countMaterial();
                console.log(JSON.stringify(counts));
                const list1 = await wechatApi.batchMaterial({
                    type: 'image',
                    offset: 0,
                    count: 10
                });
                const list2 = await wechatApi.batchMaterial({
                    type: 'voice',
                    offset: 0,
                    count: 10
                });
                const list3 = await wechatApi.batchMaterial({
                    type: 'video',
                    offset: 0,
                    count: 10
                });
                const list4 = await wechatApi.batchMaterial({
                    type: 'news',
                    offset: 0,
                    count: 10
                });
                console.log('list1====image', JSON.stringify(list1));
                console.log('list2====voice', JSON.stringify(list2));
                console.log('list3====video', JSON.stringify(list3));
                console.log('list4====news', JSON.stringify(list4));
                replyContent = '语言素材数量：' + counts.voice_count + '，视频素材数量：' + counts.video_count + '，图片素材数量：' + counts.image_count + '，图文素材数量：' + counts.news_count + '\n';
                result = wx.message.text(msg, replyContent);
                break;
            case '12':
                //永久图片素材上传得到media_id,在回复过去
                groupList = await wechatApi.fetchGroups();;
                let groupListRepeat = groupList.groups.map(function(item) {
                    return item.name;
                });
                let groupListNoReapeat = [...new Set(groupListRepeat)];
                replyContent = '所有分组列表：' + groupListNoReapeat.join(' ');
                result = wx.message.text(msg, replyContent);
                break;
            case '13':
                //获取用户信息
                user = await wechatApi.fetchUsers(msg.FromUserName);
                console.log(user);
                // let openIds=[{
                //     openid:msg.FromUserName
                // }]
                //批量用户信息
                // user=await wechatApi.fetchUsers(openIds);
                // console.log(user);
                replyContent = '不要介意，您的这些信息，我们不会做任何存储，\n' + JSON.stringify(user);
                result = wx.message.text(msg, replyContent);
                break;
            case '14':
                //获取用户信息列表
                user = await wechatApi.listUsers();
                console.log(user);
                replyContent = '关注咱的用户总数：' + user.total;
                result = wx.message.text(msg, replyContent);
                break;
            case '15':
                //群发消息
                // let mpnews={
                //     media_id:'J6gSlJObeyFTWkF7aWXuZ0lcAZJXqKNXhsCDBlIq1Mw'
                // }
                text = {
                    content: '不好意思，有个顽皮的小子，在发送 15的群发消息'
                }
                msgData = await wechatApi.sendByGroup('text', text);
                console.log(msgData);
                console.log(msgData.errcode);
                if (msgData.errcode && msgData.errcode == 0) {
                    replyContent = '群发消息，过一下每个人都会收到一条消息';
                } else {
                    replyContent = '今天的群发消息已经用光了';
                }
                result = wx.message.text(msg, replyContent);
                break;
            case '16':
                //预览消息
                // let mpnews={
                //     media_id:'J6gSlJObeyFTWkF7aWXuZ0lcAZJXqKNXhsCDBlIq1Mw'
                // }
                text = {
                    content: '预览消息发送成功'
                }
                //对自己预览个消息
                msgData = await wechatApi.previewMass('text', text, msg.FromUserName);
                console.log(msgData);
                replyContent = "回复16，对自己预览个消息"
                result = wx.message.text(msg, replyContent);
                break;
            case '17':
                //查看预览消息状态
                msgData = await wechatApi.checkMass('1000000004');
                console.log(msgData);
                replyContent = "查看预览消息状态：" + msgData.msg_status;
                result = wx.message.text(msg, replyContent);
                break;
            case 'cp_batch_create_group':
                //新增用户分组
                const group_fiends = await wechatApi.createGroup('friends');
                const group_createmates = await wechatApi.createGroup('classmates');
                const group_workmates = await wechatApi.createGroup('workmates');
                // console.log('新分组 friends');
                // console.log(JSON.stringify(group));
                // const groups=await wechatApi.fetchGroups();
                // console.log('加了friend 后的分组列表');
                // console.log(groups);
                // const group2=await wechatApi.checkGroup(msg.FromUserName);
                // console.log('查看自己的分组');
                // console.log(group2);
                // const result=await wechatApi.moveGroup(msg.FromUserName,100);
                // console.log('移动到100');
                // console.log(result);
                // const groups2=await wechatApi.fetchGroups();
                // console.log(groups2);

                // const result2=await wechatApi.moveGroup([msg.FromUserName],101);
                // console.log('批量移动到101');
                // console.log(result2);

                // const groups3=await wechatApi.fetchGroups();
                // console.log(groups3);

                // const result3=await wechatApi.updateGroups(101,'wechat101');
                // console.log('wechat 改名 wechat101');
                // console.log(result3);

                // const groups4=await wechatApi.fetchGroups();
                // console.log('改名后的用户分组',groups4);

                // const result4=await wechatApi.deleteGroup(115);
                // console.log(result4);

                // const groups5=await wechatApi.fetchGroups();
                // console.log('删除115后的分组列表',groups5);

                replyContent = '新增分组成功 friends classmates workmates';
                result = wx.message.text(msg, replyContent);
                break;
            default:
                result = 'success'
        }
        if (content.startsWith('搜')) {
            const movieName = content.replace('搜', '')
            let movieData = await wechatApi.fetchMovieData(encodeURIComponent(movieName), 1);
            console.log(movieData)
            let replyData = movieData.data[0]
            replyContent = [{
                title: replyData.title,
                description: `电影评价${replyData.rate}分，快点击进去看看精彩内容吧!`,
                picUrl: replyData.coverKey || replyData.cover,
                url: `https://movie.daxierhao.com/movie/subject/${replyData.doubanId}`
            }];
            result = wx.message.news(msg, replyContent);
        }
    }else if(msg.PicUrl){
        replyContent='您推送的事件已接收，返回url地址：'+msg.PicUrl;
        result = wx.message.text(msg, replyContent);
    }else{
        replyContent='empty message';
        result = wx.message.text(msg, replyContent);
    }
    ctx.type="application/xml";
    ctx.status=200;
    ctx.body = result;

    console.log('result====', result);
    next();
    // result='<?xml version="1.0" encoding="UTF-8" standalone="yes"?><xml><ToUserName>oOtBW0erciJhGimXOS_Ude__WFrs</ToUserName><FromUserName>gh_c1a3d83ed545</FromUserName><CreateTime>1522999903070</CreateTime><MsgType>image</MsgType><Image><MediaId>ebXeIEeABtpGWViwrmZ8quQ2iwUzAMh2_aPYFFGRCDeTNupZZIKViqQR29GxDGpz</MediaId></Image></xml>';    console.log(result);
    // ctx.res.setHeader('Content-Type', 'application/xml');
    // ctx.res.end(result)
}
const router = {
    getHandle: getHandle,
    postHandle: postHandle
}
module.exports = router;