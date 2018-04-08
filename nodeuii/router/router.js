// index router
const Router = require('koa-router')
const replyController = require('../controller/replyController')
const menuController=require('../controller/menuController');
const router = new Router()

//对外暴露接口对前端使用
router
    .get('/', replyController.getHandle)
    .post('/', replyController.postHandle)
    //单独路由设置menu菜单
    .get('/menu/create', menuController.createMenu)
    .get('/menu/delete', menuController.deleteMenu)

module.exports = router;