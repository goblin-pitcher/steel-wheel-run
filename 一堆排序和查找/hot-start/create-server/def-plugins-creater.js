const serve = require('koa-static');
const requestProxyServe = require('koa-proxy');

const staticProxy = (opt = {}) => {
    const {root} = opt;
    if(!root) {return null}
    return serve(root)
}

const copyPathProxy = (opt = {}) => {
    const {copydir} = opt;
    if(!copydir) {return null}
    return serve(copydir)
}

const requestProxy = (opt={}) =>{
    const {proxy} = opt;
    if(!(proxy&&Object.keys(proxy).length)) {
        return null
    }
    return requestProxyServe(proxy)
}

const defPluginsCreater = (opt) => {
    const checkObj = {
        staticProxy,
        copyPathProxy,
        requestProxy
    }
    return Object.keys(checkObj).reduce((obj, key)=>{
        obj[key] = checkObj[key](opt)
        return obj
    }, {})
}
module.exports = defPluginsCreater
