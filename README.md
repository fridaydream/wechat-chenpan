# wechat接口封装及回复

---

运用koa2框架，运用mvc的思想，中间件，路由，promse，async，await，es6，log4日志等技术对与微信后台的接口的对接，同时创建接口暴露给前端调用。借鉴了scott老师的部分思想，同时自己又进行了优化。

**大致思路**：

微信后台给咱们后台发送一个get请求(请求地址‘／’)，一个post请求(请求地址‘／’)，get请求是验证签名，签名通过才能发交易。post是xml文件传输，用xml2js模块进行解析转发，所以咱们要给微信后台留这2个路由。


**封装内容**：

* 全局票据access_token

* 菜单单独通过前端接口，进行动态创建

* 1-3回复文本

* 4回复图文

* 5上传临时图片并返回

* 6上传临时视频素材并返回

* 7回复音乐

* 8永久图片上传

* 9永久视频上传

* 10永久图文上传

* 11素材列表及素材总数

* 12分组列表

* 13用户信息

* 14关注总数

* 15群发(也可以针对分组(需认证服务号))

* 16对自己预览消息

* 17查看预览状态

* 搜+电影名称 返回图文消息(观看电影预告片)

* 添加图灵智能机器人

**重要说明**：

由于本公众号属于个人订阅号，无法认证，部分接口没权限，但在测试公众号里面都跑通过了。


![alt 微信二维码](https://raw.githubusercontent.com/fridaydream/blogpic/master/qrcode_wechat.jpg "微信二维码")

*欢迎互相交流，希望您顺手点个star谢谢您*
