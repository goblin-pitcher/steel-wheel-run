const createWsServer = require('./create-ws-server');
const createReloadTemplate = require('./create-reload-temp');
const getHTmlTemplate = require('../../../../config/indexHtmlTemplate');

const getHtmlClientTool = async (port, times) => {
  const {wss, wsPort} = await createWsServer(port, times);
  const reloadScript = createReloadTemplate(`ws://localhost:${wsPort}`);
  const reload = ()=>{
    wss.clients.forEach(client=>{
      client.send(JSON.stringify({type: 'reload'}))
    })
  }
  return {
    script: reloadScript,
    reload
  }
}

const createHtmlTemplateReload = async ({cssHash= '', jsHash = '', port = 3000, times = 10}) => {
  const {script, reload} = await getHtmlClientTool(port, times);
  const htmlTemplate = getHTmlTemplate(cssHash, jsHash, script);
  const defaultPagePlugin = async (ctx, next) => {
    try {
      await next();
      if(!ctx.body && ctx.status === 404) {
        ctx.status = 200;
        ctx.body = htmlTemplate;
      }
    } catch(err) {
      console.log('请求错误::', err)
    }
  }
  // const router = new Router();
  // router.get('/', (ctx, next) => {
  //   ctx.body = htmlTemplate
  //   next()
  // })

  return {
    plugin: defaultPagePlugin,
    reload
  }
}

module.exports = createHtmlTemplateReload;
