const prefix = 'https://api.weixin.qq.com/cgi-bin/';
const fs = require('fs');
const Promise = require('bluebird');
const request = Promise.promisify(require('request'));
const _ = require('lodash');
const api = {
    accessToken: prefix + 'token?grant_type=client_credential',
    temporary: {
        upload: prefix + 'media/upload',
        fetch: prefix + 'media/get'
    },
    permanent: {
        upload: prefix + 'material/add_material',
        uploadNews: prefix + 'material/add_news',
        uploadNewsPic: prefix + 'media/uploadimg',
        fetch: prefix + 'material/get_material',
        del: prefix + 'material/del_material',
        update: prefix + 'material/update_news',
        count: prefix + 'material/get_materialcount',
        batch: prefix + 'material/batchget_material',
    },
    group: {
        create: prefix + 'groups/create',
        fetch: prefix + 'groups/get',
        check: prefix + 'groups/getid',
        update: prefix + 'groups/update',
        move: prefix + 'groups/members/update',
        batchupdate: prefix + 'groups/members/batchupdate',
        del: prefix + 'groups/delete',
    },
    user: {
        remark: prefix + 'user/info/updateremark',//remark只对认证的服务号
        fetch: prefix + 'user/info',
        batchFetch: prefix + 'user/info/batchget',
        list:prefix+'user/get',
    },
    mass:{
        group:prefix+'message/mass/sendall',
        openId:prefix+'message/mass/send',
        del:prefix+'message/mass/delete',
        preview:prefix+'message/mass/preview',
        check:prefix+'message/mass/get',
    },
    menu:{
        create:prefix+'menu/create',
        fetch:prefix+'menu/get',
        del:prefix+'menu/delete',
        current:prefix+'get_current_selfmenu_info'
    }
}
class wechatController {
    constructor(opts) {
        const that = this;
        this.config = opts;
        this.appid = opts.appid;
        this.appSecret = opts.encodingAESKey;
        this.getAccessToken = opts.getAccessToken;
        this.saveAccessToken = opts.saveAccessToken;
    }
    fetchAccessToken() {
        //惰性函数，存储access_token和expires_in，不用在fs读文件
        if (this.access_token && this.expires_in) {
            if (this.isValidAccessToken(this)) {
                return Promise.resolve(this);
            }
        }
        const that = this;
        return this.getAccessToken()
            .then(function(data) {
                try {
                    data = JSON.parse(data);
                } catch (e) {
                    return that.updateAccessToken();
                }
                if (that.isValidAccessToken(data)) {
                    console.log('okkkk');
                    return Promise.resolve(data);
                } else {
                    console.log('errrr');
                    return that.updateAccessToken();
                }
            })
            .then(function(data) {
                console.log('nooooooo');
                console.log(data.access_token);
                console.log(data.expires_in);
                that.access_token = data.access_token;
                that.expires_in = data.expires_in;
                console.log(data);
                that.saveAccessToken(data);
                return Promise.resolve(data);
            })
    }
    //判断access_token是否合法
    isValidAccessToken(data) {

        if (!data || !data.access_token || !data.expires_in) {
            return false;
        }
        const access_token = data.access_token;
        const expires_in = data.expires_in;
        const now = (new Date().getTime());
        console.log('judge', now < expires_in);
        if (now < expires_in) {
            return true;
        } else {
            return false;
        }
    }
    //更新access_token
    updateAccessToken() {
        const appid = this.appid;
        const appSecret = this.appSecret;
        const url = api.accessToken + '&appid=' + appid + '&secret=' + appSecret;
        return new Promise(function(resolve, reject) {
            request({
                url: url,
                json: true
            }).then(function(response) {
                const now = (new Date().getTime());
                const expires_in = now + (response.body.expires_in - 20) * 1000;
                const data = {
                    access_token: response.body.access_token,
                    expires_in: expires_in
                };
                resolve(data);
            });
        });
    }
    //上传临时素材和永久素材
    uploadMaterial(type, material, permanent) {
        const that = this;
        const form = {};
        let uploadUrl = api.temporary.upload;
        if (permanent) {
            uploadUrl = api.permanent.upload;
            _.extend(form, permanent);
        }
        if (type === 'pic') {
            uploadUrl = api.permanent.uploadNewsPic;
            form.media = fs.createReadStream(material);
        } else if (type === 'news') {
            uploadUrl = api.permanent.uploadNews;
        } else {
            form.media = fs.createReadStream(material);
        }
        return new Promise(function(resolve, reject) {
            that
                .fetchAccessToken()
                .then(function(data) {
                    let url = uploadUrl + '?access_token=' + data.access_token;
                    if (!permanent) {
                        url += '&type=' + type;
                    } else {
                        form.access_token = data.access_token;
                    }
                    const options = {
                        method: 'POST',
                        url: url,
                        json: true
                    }
                    if (type === 'news') {
                        options.body = form;
                    } else {
                        options.formData = form;
                    }
                    request(options).then(function(response) {
                            if (response) {
                                resolve(response.body);
                            } else {
                                throw new Error('Upload materical fail');
                            }
                        })
                        .catch(function(error) {
                            reject(error);
                        })
                })
        });
    }
    //获取临时素材和永久素材
    fetchMaterial(mediaId, type, permanent) {
        const that = this;
        let fetchUrl = api.temporary.fetch;
        if (permanent) {
            fetchUrl = api.permanent.fetch;
        }
        return new Promise(function(resolve, reject) {
            that
                .fetchAccessToken()
                .then(function(data) {
                    let url = fetchUrl + '?access_token=' + data.access_token;
                    const options = {
                        method: 'post',
                        url: url,
                        json: true
                    }
                    let form={};
                    if (permanent) {
                        form.media_id = mediaId;
                        form.access_token = data.access_token;
                        options.body = form;
                    } else {
                        url += '&media_id=' + mediaId;
                        if (type === 'video') {
                            url = url.replace('https://', 'http://');
                        }
                    }
                    if (type === 'news' || type === 'video') {
                        request(options).then(function(response) {
                                if (response) {
                                    resolve(response.body);
                                } else {
                                    throw new Error('delete materical fail');
                                }
                            })
                            .catch(function(error) {
                                reject(error);
                            });
                    } else {
                        resolve(url);
                    }
                });
        });
    }
    //删除永久素材
    deleteMaterial(mediaId) {
        var that = this;
        var form = {
            media_id: mediaId
        }
        return new Promise(function(resolve, reject) {
            that
                .fetchAccessToken()
                .then(function(data) {
                    let url = api.permanent.del + '?access_token=' + data.access_token + '&media_id=' + mediaId;
                    request({
                            method: 'post',
                            url: url,
                            body: form,
                            json: true
                        }).then(function(response) {
                            if (response) {
                                resolve(response.body);
                            } else {
                                throw new Error('delete materical fail');
                            }
                        })
                        .catch(function(error) {
                            reject(error);
                        })
                })
        });
    }
    //更新永久素材
    updateMaterial(mediaId, news) {
        var that = this;
        var form = {
            media_id: mediaId
        }
        _.extends(form, news);
        return new Promise(function(resolve, reject) {
            that
                .fetchAccessToken()
                .then(function(data) {
                    let url = api.permanent.update + '?access_token=' + data.access_token;
                    request({
                            method: 'post',
                            url: url,
                            body: form,
                            json: true
                        }).then(function(response) {
                            if (response) {
                                resolve(response.body);
                            } else {
                                throw new Error('update materical fail');
                            }
                        })
                        .catch(function(error) {
                            reject(error);
                        })
                })
        });
    }
    //获取素材总数
    countMaterial() {
        var that = this;
        return new Promise(function(resolve, reject) {
            that
                .fetchAccessToken()
                .then(function(data) {
                    let url = api.permanent.count + '?access_token=' + data.access_token;
                    request({
                            method: 'get',
                            url: url,
                            json: true
                        }).then(function(response) {
                            if (response) {
                                resolve(response.body);
                            } else {
                                throw new Error('count materical fail');
                            }
                        })
                        .catch(function(error) {
                            reject(error);
                        })
                })
        });
    }
    //获取素材总数
    batchMaterial(options) {
        var that = this;
        options.type = options.type || 'image';
        options.offset = options.offset || 0;
        options.count = options.count || 10;
        return new Promise(function(resolve, reject) {
            that
                .fetchAccessToken()
                .then(function(data) {
                    let url = api.permanent.batch + '?access_token=' + data.access_token;
                    request({
                            method: 'post',
                            url: url,
                            body: options,
                            json: true
                        }).then(function(response) {
                            if (response) {
                                resolve(response.body);
                            } else {
                                throw new Error('batch materical fail');
                            }
                        })
                        .catch(function(error) {
                            reject(error);
                        })
                })
        });
    }
    //创建用户分组
    createGroup(name) {
        var that = this;
        return new Promise(function(resolve, reject) {
            that
                .fetchAccessToken()
                .then(function(data) {
                    let url = api.group.create + '?access_token=' + data.access_token;
                    let form = {
                        group: {
                            name: name
                        }
                    }
                    request({
                            method: 'post',
                            url: url,
                            body: form,
                            json: true
                        }).then(function(response) {
                            if (response) {
                                resolve(response.body);
                            } else {
                                throw new Error('create group fail');
                            }
                        })
                        .catch(function(error) {
                            reject(error);
                        })
                })
        });
    }
    //获取用户分组
    fetchGroups() {
        var that = this;
        return new Promise(function(resolve, reject) {
            that
                .fetchAccessToken()
                .then(function(data) {
                    let url = api.group.fetch + '?access_token=' + data.access_token;
                    request({
                            method: 'get',
                            url: url,
                            json: true
                        }).then(function(response) {
                            if (response) {
                                resolve(response.body);
                            } else {
                                throw new Error('fetch group fail');
                            }
                        })
                        .catch(function(error) {
                            reject(error);
                        })
                })
        });
    }
    //查看用户分组
    checkGroup(openId) {
        var that = this;
        return new Promise(function(resolve, reject) {
            that
                .fetchAccessToken()
                .then(function(data) {
                    let url = api.group.check + '?access_token=' + data.access_token;
                    let form = {
                        openid: openId
                    }
                    request({
                            method: 'post',
                            url: url,
                            body: form,
                            json: true
                        }).then(function(response) {
                            if (response) {
                                resolve(response.body);
                            } else {
                                throw new Error('check group fail');
                            }
                        })
                        .catch(function(error) {
                            reject(error);
                        })
                })
        });
    }
    //更新用户分组
    updateGroups(id, name) {
        var that = this;
        return new Promise(function(resolve, reject) {
            that
                .fetchAccessToken()
                .then(function(data) {
                    let url = api.group.update + '?access_token=' + data.access_token;
                    let form = {
                        group: {
                            id: id,
                            name: name
                        }
                    }
                    request({
                            method: 'post',
                            url: url,
                            body: form,
                            json: true
                        }).then(function(response) {
                            if (response) {
                                resolve(response.body);
                            } else {
                                throw new Error('update group fail');
                            }
                        })
                        .catch(function(error) {
                            reject(error);
                        })
                })
        });
    }

    //移动用户分组,opendIds如果是数组就是批量移动，否者只移动一个
    moveGroup(openIds, to) {
        var that = this;
        return new Promise(function(resolve, reject) {
            that
                .fetchAccessToken()
                .then(function(data) {
                    let url, form;
                    form = {
                        to_groupid: to
                    }
                    if (_.isArray(openIds)) {
                        url = api.group.batchupdate + '?access_token=' + data.access_token;
                        form.openid_list = openIds;
                    } else {
                        url = api.group.move + '?access_token=' + data.access_token;
                        form.openid = openIds;
                    }
                    request({
                            method: 'post',
                            url: url,
                            body: form,
                            json: true
                        }).then(function(response) {
                            if (response) {
                                resolve(response.body);
                            } else {
                                throw new Error('move group fail');
                            }
                        })
                        .catch(function(error) {
                            reject(error);
                        })
                })
        });
    }
    //移动用户分组,opendIds如果是数组就是批量移动，否者只移动一个
    deleteGroup(id) {
        var that = this;
        return new Promise(function(resolve, reject) {
            that
                .fetchAccessToken()
                .then(function(data) {
                    let url = api.group.del + '?access_token=' + data.access_token;
                    let form = {
                        group: {
                            id: id
                        }
                    }
                    request({
                            method: 'post',
                            url: url,
                            body: form,
                            json: true
                        }).then(function(response) {
                            if (response) {
                                resolve(response.body);
                            } else {
                                throw new Error('delete group fail');
                            }
                        })
                        .catch(function(error) {
                            reject(error);
                        })
                })
        });
    }
    //用户备注名
    remarkUser(openId, remark) {
        var that = this;
        return new Promise(function(resolve, reject) {
            that
                .fetchAccessToken()
                .then(function(data) {
                    let url = api.user.remark + '?access_token=' + data.access_token;
                    let form = {
                        openid: openId,
                        remark: remark
                    }
                    request({
                            method: 'post',
                            url: url,
                            body: form,
                            json: true
                        }).then(function(response) {
                            if (response) {
                                resolve(response.body);
                            } else {
                                throw new Error('remark username fail');
                            }
                        })
                        .catch(function(error) {
                            reject(error);
                        })
                })
        });
    }
    //获取用户信息(单个和批量，判断openIds是不是数组)
    fetchUsers(openIds, lang) {
        var that = this;
        return new Promise(function(resolve, reject) {
            that
                .fetchAccessToken()
                .then(function(data) {
                    let url, form;
                    let options = {
                        json: true
                    };
                    lang=lang||'zh_CN';
                    if (_.isArray(openIds)) {
                        options.url = api.user.batchFetch + '?access_token=' + data.access_token;
                        options.body = {
                            user_list: openIds
                        }
                        options.method='post';
                    } else {
                        options.method='get';
                        options.url = api.user.fetch + '?access_token=' + data.access_token + '&openid=' + openIds + '&lang=' + lang;
                    }
                    request(options).then(function(response) {
                            if (response) {
                                resolve(response.body);
                            } else {
                                throw new Error('batch fetch user message fail');
                            }
                        })
                        .catch(function(error) {
                            reject(error);
                        })
                })
        });
    }
    //获取用户列表
    listUsers(openId) {
        var that = this;
        return new Promise(function(resolve, reject) {
            that
                .fetchAccessToken()
                .then(function(data) {
                    let url = api.user.list + '?access_token=' + data.access_token;
                    if(openId){
                        url+='&next_openid='+openId;
                    }
                    request({
                            method: 'get',
                            url: url,
                            json: true
                        }).then(function(response) {
                            if (response) {
                                resolve(response.body);
                            } else {
                                throw new Error('get user list fail');
                            }
                        })
                        .catch(function(error) {
                            reject(error);
                        })
                })
        });
    }
    //群发
    sendByGroup(type,message,groupId) {
        var that = this;
        return new Promise(function(resolve, reject) {
            that
                .fetchAccessToken()
                .then(function(data) {
                    let msg={
                        filter:{},
                        msgtype:type
                    }
                    msg[type]=message;
                    if(!groupId){
                        msg.filter.is_to_all=true;
                    }else{
                        msg.filter={
                            is_to_all:false,
                            tag_id:groupId
                        }
                    }
                    let url = api.mass.group + '?access_token=' + data.access_token;
                    request({
                            method: 'post',
                            url: url,
                            json: true,
                            body:msg
                        }).then(function(response) {
                            if (response) {
                                resolve(response.body);
                            } else {
                                throw new Error('send to all fail');
                            }
                        })
                        .catch(function(error) {
                            reject(error);
                        })
                })
        });
    }
    //通过openId发送消息
    sendByOpenId(type,message,openIds) {
        var that = this;
        return new Promise(function(resolve, reject) {
            that
                .fetchAccessToken()
                .then(function(data) {
                    let msg={
                        msgtype:type,
                        touser:openIds
                    }
                    msg[type]=message;
                    let url = api.mass.openId + '?access_token=' + data.access_token;
                    request({
                            method: 'post',
                            url: url,
                            json: true,
                            body:msg
                        }).then(function(response) {
                            if (response) {
                                resolve(response.body);
                            } else {
                                throw new Error('send by  openid fail');
                            }
                        })
                        .catch(function(error) {
                            reject(error);
                        })
                })
        });
    }
    //删除发送的消息
    deleteMass(msgId) {
        var that = this;
        return new Promise(function(resolve, reject) {
            that
                .fetchAccessToken()
                .then(function(data) {
                    let form={
                        msg_id:msgId
                    }
                    let url = api.mass.del + '?access_token=' + data.access_token;
                    request({
                            method: 'post',
                            url: url,
                            json: true,
                            body:form
                        }).then(function(response) {
                            if (response) {
                                resolve(response.body);
                            } else {
                                throw new Error('delete mass fail');
                            }
                        })
                        .catch(function(error) {
                            reject(error);
                        })
                })
        });
    }
    //消息预览
    previewMass(type,message,openId) {
        var that = this;
        return new Promise(function(resolve, reject) {
            that
                .fetchAccessToken()
                .then(function(data) {
                    let msg={
                        msgtype:type,
                        touser:openId
                    }
                    msg[type]=message;
                    let url = api.mass.preview + '?access_token=' + data.access_token;
                    console.log('msg'+msg);
                    request({
                            method: 'post',
                            url: url,
                            json: true,
                            body:msg
                        }).then(function(response) {
                            if (response) {
                                resolve(response.body);
                            } else {
                                throw new Error('preview mass fail');
                            }
                        })
                        .catch(function(error) {
                            reject(error);
                        })
                })
        });
    }
    //查看群发状态
    checkMass(msgId) {
        var that = this;
        return new Promise(function(resolve, reject) {
            that
                .fetchAccessToken()
                .then(function(data) {
                    let form={
                        msg_id:msgId
                    }
                    let url = api.mass.check + '?access_token=' + data.access_token;
                    request({
                            method: 'post',
                            url: url,
                            json: true,
                            body:form
                        }).then(function(response) {
                            if (response) {
                                resolve(response.body);
                            } else {
                                throw new Error('check msg to all fail');
                            }
                        })
                        .catch(function(error) {
                            reject(error);
                        })
                })
        });
    }
    //create menu
    createMenu(menu) {
        var that = this;
        return new Promise(function(resolve, reject) {
            that
                .fetchAccessToken()
                .then(function(data) {
                    let form=menu;
                    let url = api.menu.create + '?access_token=' + data.access_token;
                    console.log(url);
                    request({
                            method: 'post',
                            url: url,
                            json: true,
                            body:form
                        }).then(function(response) {
                            if (response) {
                                resolve(response.body);
                            } else {
                                throw new Error('create menu fail');
                            }
                        })
                        .catch(function(error) {
                            reject(error);
                        })
                })
        });
    }
    //get menu
    getMenu() {
        var that = this;
        return new Promise(function(resolve, reject) {
            that
                .fetchAccessToken()
                .then(function(data) {
                    let url = api.menu.fetch + '?access_token=' + data.access_token;
                    request({
                            method: 'get',
                            url: url,
                            json: true,
                        }).then(function(response) {
                            if (response) {
                                resolve(response.body);
                            } else {
                                throw new Error('get menu fail');
                            }
                        })
                        .catch(function(error) {
                            reject(error);
                        })
                })
        });
    }
    //delete menu
    deleteMenu(menu) {
        var that = this;
        return new Promise(function(resolve, reject) {
            that
                .fetchAccessToken()
                .then(function(data) {
                    let url = api.menu.del + '?access_token=' + data.access_token;
                    console.log(url);
                    request({
                            method: 'get',
                            url: url,
                            json: true,
                        }).then(function(response) {
                            if (response) {
                                resolve(response.body);
                            } else {
                                throw new Error('delete menu fail');
                            }
                        })
                        .catch(function(error) {
                            reject(error);
                        })
                })
        });
    }
    //获取当前配置的菜单
    getCurrentMenu(menu) {
        var that = this;
        return new Promise(function(resolve, reject) {
            that
                .fetchAccessToken()
                .then(function(data) {
                    let url = api.menu.current + '?access_token=' + data.access_token;
                    request({
                            method: 'get',
                            url: url,
                            json: true,
                        }).then(function(response) {
                            if (response) {
                                resolve(response.body);
                            } else {
                                throw new Error('get current menu fail');
                            }
                        })
                        .catch(function(error) {
                            reject(error);
                        })
                })
        });
    }
}
module.exports = wechatController;