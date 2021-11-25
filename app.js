const util      = require('./util');
const http      = require('http');
const Koa       = require('koa');
const serve     = require('koa-static');
const Router    = require('koa-router');
const koaBody   = require('koa-body');
const webpush = require('web-push');


const port = process.env.PORT || 8084;
const app = new Koa();
const router = new Router();

router.get('/book', async (ctx, next) => {
    let query = ctx.request.query;
    let {page, count} = query;
    let url = `https://api.apiopen.top/getJoke?page=${page}&count=${count}&type=video`;
    let res = await util.get(url);
    ctx.response.body = res;
});
router.get("/randomMessage", async (ctx, next) => {
    let url = "http://poetry.apiopen.top/sentences";
    let res = await util.get(url);
    ctx.response.body = res;
})

const options = {};

const vapidKeys = {
    publicKey: 'BNzbmU415CQnqE7LKI1NpciuSTY3QVWO1dXteCQCU3qoBI0e9gwFKYXj4mCAJlaYnyylOERy8UbCAYmwjrlJDkA',
    privateKey: '4TvDm8yA8vxN9WCKs01fLvVGY6OOIKnvLuMQMyW3sm8'
};
// 123
// 设置web-push的VAPID值
webpush.setVapidDetails(
    'mailto:852579110@qq.com',
    vapidKeys.publicKey,
    vapidKeys.privateKey
);

router.post('/subscription', koaBody(), async ctx => {
    let body = ctx.request.body;
    await util.saveRecord(body);
    ctx.response.body = {
        status: 0
    };
});
 
router.post('/push', koaBody(), async ctx => {
    let { uniqueid, payload } = ctx.request.body;
    let list = uniqueid ? await util.find({ uniqueid }) : await util.findAll();
    let status = list.length > 0 ? 0 : -1;
console.log(list)
    for (let i = 0; i < list.length; i++) {
        let subscription = list[i].subscription;
        console.log(subscription)
        pushMessage(subscription, JSON.stringify(payload));
    }

    ctx.response.body = {
        status
    };
})

function pushMessage(subscription, data = {}) {
    console.log(subscription)
    console.log(data)
    webpush.sendNotification(subscription, data, options).then(data => {
        console.log('push service的相应数据:', JSON.stringify(data));
        return;
    }).catch(err => {
        if (err.statusCode === 410 || err.statusCode === 404) {
            return util.remove(subscription);
        } else {
            console.log(err);
        }
    })
}

router.get('/sync', async (ctx, next) => {
    var msg = `Hello ${ctx.request.query.name}, I have received your msg`;
    console.log(msg);
    ctx.response.body = {
        status: 0,
        datas: msg
    };
});
 

app.use(router.routes());
app.use(serve(__dirname + '/public'));
app.listen(port, () => {
    console.log(`listen on port: ${port}`);
});