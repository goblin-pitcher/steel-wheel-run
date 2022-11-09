// 实现koa的洋葱模型结构
const flow = (plugins) => {
    const func = (index) => () => {
        if(index>=plugins.length) return;
        const next = plugins[index];
        next(func(index + 1))
    }
    return func(0)
}

class App {
    constructor() {
        this._plugins = []
    }
    use(plugin) {
        this._plugins.push(plugin)
    }
    run() {
        flow(this._plugins)()
    }
}