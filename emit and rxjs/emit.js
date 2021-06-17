const isDef = (item) => item && item !== 0;

const typeOf = (val) =>
  Object.prototype.toString.call(val).match(/\[\S+?\s(\w+)\]/)[1];

const typeEnum = Object.freeze({
  Undefined: typeOf(),
  Null: typeOf(null),
  Boolean: typeOf(true),
  String: typeOf(""),
  Number: typeOf(0),
  Function: typeOf(nullFunc),
  Symbol: typeOf(Symbol()),
  Object: typeOf({}),
  Array: typeOf([]),
});

const checkRegister = (name, listener) => {
  if (!name || typeOf(listener) !== typeEnum.Function)
    throw new Error("name or listener type illegal");
};

const ONCE = Symbol("once");

export default class Emit {
  constructor() {
    this._watchs = null;
    this.off();
  }

  on(name, listener) {
    checkRegister(name, listener);
    if (!this._watchs.has(name)) {
      this._watchs.set(name, new Set());
    }
    this._watchs.get(name).add(listener);
  }

  once(name, listener) {
    checkRegister(name, listener);
    listener[ONCE] = true;
    this.on(name, listener);
  }

  emit(name, ...args) {
    if (!name || !this._watchs.has(name)) return;
    this._watchs.get(name).forEach((func, f, self) => {
      try {
        func(...args);
      } catch(err){
        console.log(err)
      } finally {
        if (func[ONCE]) {
          self.delete(func);
        }
      }
    });
  }

  off(name, listener) {
    if (!isDef(name)) this._watchs = new Map();
    if (typeOf !== typeEnum.Function) this._watchs.delete(name);
    this._watchs.delete(listener);
  }
  has(name, listener) {
    if (!isDef(name)) return false
    const funcSet = this._watchs.get(name)
    if(!listener) return funcSet&&funcSet.size>0
    return funcSet&&funcSet.has(listener)
  }
}
