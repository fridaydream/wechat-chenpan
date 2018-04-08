const Koa = require('koa');
const config = require('./config/config');
const xmlParse = require('./middleware/xmlParse');
const router = require('./router/router');
const log4js =require('log4js');
const app = new Koa();

app
  .use(xmlParse())
  .use(router.routes())
  .use(router.allowedMethods())


log4js.configure({
	appenders: {
		cp: {
			type: 'file',
			filename: './logs/cp.log'
		}
	},
	categories: {
		default: {
			appenders: ['cp'],
			level: 'error'
		}
	}
});
const logger = log4js.getLogger('cp');

app.listen(config.port)
console.log('server start at port:', config.port)