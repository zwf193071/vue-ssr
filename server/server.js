const Koa = require('koa');
const Router = require('koa-router');
const server = require('koa-static');
const path = require('path');
const fs = require('fs');
const { createBundleRenderer } = require('vue-server-renderer');
const backendApp = new Koa();
const frontendApp = new Koa();
const backendRouter = new Router();
const frontendRouter = new Router();

// const bundle = fs.readFileSync(path.resolve(__dirname, '../dist/server.bundle.js'), 'utf-8');
// const renderer = require('vue-server-renderer').createBundleRenderer(bundle, {
//     template: fs.readFileSync(path.resolve(__dirname, '../dist/index.ssr.html'), 'utf-8')
// });
const serverBundle = require(path.resolve(__dirname, '../dist/vue-ssr-server-bundle.json'));
const clientManifest = require(path.resolve(__dirname, '../dist/vue-ssr-client-manifest.json'));
const template = fs.readFileSync(path.resolve(__dirname, '../dist/index.ssr.html'), 'utf-8');

const renderer = createBundleRenderer(serverBundle, {
    runInNewContext: false,
    template: template,
    clientManifest: clientManifest
})

backendApp.use(server(path.resolve(__dirname, '../dist')));

backendRouter.get('/index', async (ctx, next) => {
    try {
        let html = await new Promise((resolve, reject) => {
            renderer.renderToString((err, html) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(html);
                }
            });
        });
        ctx.type = 'html';
        ctx.status = 200;
        ctx.body = html;
    } catch (err) {
        console.error(err);
        ctx.status = 500;
        ctx.body = '服务器内部错误';
    }
});

backendApp
    .use(backendRouter.routes())
    .use(backendRouter.allowedMethods());

backendApp.listen(3000, () => {
    console.log('服务端渲染地址：http://localhost:3000');
});

frontendApp.use(server(path.resolve(__dirname, '../dist')));

frontendRouter.get('/index', (ctx, next) => {
    let html = fs.readFileSync(path.resolve(__dirname, '../dist/index.html'), 'utf-8');
    ctx.type = 'html';
    ctx.status = 200;
    ctx.body = html;
});

frontendApp
    .use(frontendRouter.routes())
    .use(frontendRouter.allowedMethods());

frontendApp.listen(3001, () => {
    console.log('浏览器端渲染地址：http://localhost:3001');
})
