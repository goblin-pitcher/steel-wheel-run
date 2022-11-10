const { ModeEnum } = require('../const');

process.env.NODE_ENV = process.env.NODE_ENV || ModeEnum.dev;
const fs = require('fs-extra');
const URL = require('url');
const esbuild = require('esbuild');
const chalk = require('chalk');
const path = require('path');
const chokidar = require('chokidar');
const paths = require('../../config/paths');
const getConfig = require('../../config/esbuild-config');
const createServer = require('./create-server');
const openBrowser = require('open')
const {debounce} = require('./utils');
require('../inject-env');

const rootDir = process.cwd();
const cacheDir = path.resolve(rootDir, './node_modules/.xcheck-cache');

const clean = ()=> {
  fs.emptyDirSync(cacheDir);
}

const build = async () => {
  const config = {
    ...getConfig(false,),
    outdir: path.join(cacheDir, './js')
  }
  await esbuild.build(config);
}

const startUp = async ()=> {
  clean();
  await build();
  const proxyTarget = process.env.PROXY_URI;
  const {protocol, host, path: basePath} = URL.parse(proxyTarget);
  const { port, reload } = await createServer({
    root: cacheDir,
    proxy: {
      host: URL.format({protocol, host}),
      map: (target) => {
        const prefix = basePath.replace(/\/$/, '');
        return `${prefix}${target}`
      },
      match: /^\/api/
    },
    copydir: paths.appPublic,
    port: 3000,
    times: 10,
    plugins: []
  })
  console.log(chalk.green.bold('Compiled successfully!'));
  return {
    port,
    reload
  }
}

const createDirWatcher = (onChange) => {
    const watcher = chokidar.watch(rootDir, {
        ignored: [/node_modules/, paths.appBuild],
        ignoreInitial: true
    })
    watcher.on('all', (event, filePath)=>{
      onChange(event, filePath)
    })
}


const run = async () => {
  const {port, reload} = await startUp();
  openBrowser(`http://localhost:${port}`)
  const watcherCb = async (event, filePath)=>{
    await build()
    reload()
  };
  createDirWatcher(debounce(watcherCb, 350));
};

run()
