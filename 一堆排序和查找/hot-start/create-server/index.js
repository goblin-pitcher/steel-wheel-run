const Koa = require('koa');
const chalk = require('chalk');
const defPluginsCreater = require('./def-plugins-creater');
const createHtmlTemplateReload = require('./html-template-reload');
const { tapUtilBail } = require('../utils');

// 返回一个函数，函数会持续监听端口，若监听成功，返回Promise<true>，否则返回Promise<false>
const createTapPortFunc = (app, port) => count => {
    const p = new Promise((resolve)=>{
        app.listen(port + count, ()=>resolve(true)).once('error', ()=>resolve(false))
    })
    return p
}
// 创建服务
const createServer = async (options = {}) => {
    const {root = './', port = 3000, times = 10, plugins: cusPlugins = []} = options;
    const app = new Koa();
    const tapFunc = createTapPortFunc(app, port);
    const endCount = await tapUtilBail(tapFunc, times);
    if (endCount < 0) {
        console.log(chalk.red.bold(`端口号${port} ~ ${port+times}不可用。`))
        return null
    }
    const realPort = port + endCount;
    const transOpt = {...options, port: realPort}
    const {plugin: templatePlugin, reload} = await createHtmlTemplateReload(transOpt)
    const { staticProxy, copyPathProxy, requestProxy } = defPluginsCreater(transOpt)
    const defPlugins = [
        staticProxy,
        copyPathProxy,
        templatePlugin,
        requestProxy
    ].filter(Boolean);
    [...defPlugins, ...cusPlugins].forEach(plugin=>{
        app.use(plugin)
    })
    return {
        port: realPort,
        reload
    }
};

module.exports = createServer;
