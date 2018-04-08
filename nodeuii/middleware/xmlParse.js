const xml = require('../util/xml')
const getRawBody=require('raw-body');
module.exports = () => {
    return async (ctx, next) => {
        if (ctx.method == 'POST' && ctx.is('text/xml')) {
            const data=await getRawBody(ctx.req,{
                length:this.length,
                limit:'1mb',
                encoding:this.charset
            });
            const content=await xml.parseXMLAsync(data);
            ctx.req.body = content;
            await next();
        } else {
            await next();
        }
    }
}