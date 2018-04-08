const Wechat=require('./wechatController');
const config=require('../config/config');
const wechatApi=new Wechat(config.wx);
const menu=require('../util/menu');

exports.createMenu=async function(ctx,next){
	let deletedata=await wechatApi.deleteMenu();
	let createdata=await wechatApi.createMenu(menu);
	ctx.body="create menu success";
}
exports.deleteMenu=async function(ctx,next){
	let deletedata=await wechatApi.deleteMenu();
	ctx.body="delete menu success";
}