class SimpleRx {
  constructor(fn) {
    const resolve = (...args) => {

    }
    this._funcs = new Set()
  },
  _emit(...args) {
    this._funcs
  }
  on(...fns) {
    this.fns.forEach(fn=>{
      this._funcs.add(fn)
    })
    return this
  },
  off(...fns) {
    if(!fns.length) {
      this._funcs = new Set()
    }
    else {
      fns.forEach(fn=>{
        this._funcs.delete(fn)
      })
    }
  },
  trigger(...args) {
    this._func(...args)
  }
}