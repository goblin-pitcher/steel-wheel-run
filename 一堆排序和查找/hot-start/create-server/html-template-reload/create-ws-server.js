const { WebSocketServer } = require('ws');
const chalk = require('chalk');
const { tapUtilBail } = require('../../utils');

function heartbeat() {
  this.isAlive = true;
}

const createHeartBeat = (wss) => {
    const interval = setInterval(() => {
        wss.clients.forEach((ws) => {
          if (ws.isAlive === false) {return ws.terminate();}
      
          ws.isAlive = false;
          ws.ping();
        });
      }, 30000);
    return ()=>clearInterval(interval)
}

const createValidateWss = async (port, times) => {
  let wss = null;
  const tapFunc = (count) => {
    const p = new Promise(resolve=>{
      wss = new WebSocketServer({port: port + count}, ()=> resolve(true))
      wss.once('error', ()=>resolve(false))
    })
    return p
  }
  const endCount = await tapUtilBail(tapFunc, times);
  if(endCount < 0) {
    console.log(chalk.red.bold(`端口号${port} ~ ${port+times}不可用。`))
    return {}
  }
  return {
    wss,
    wsPort: port + endCount
  }
}

const createWsServer = async (port, times) => {
    const { wss, wsPort } = await createValidateWss(port, times);
    wss.on('connection', (ws) => {
        ws.isAlive = true;
        ws.on('pong', heartbeat);
      });
      const stopHeartBeat = createHeartBeat(wss);
      
      wss.on('close', stopHeartBeat);
    return {wss, wsPort};
}
module.exports = createWsServer;
