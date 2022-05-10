const statusEnum = {
  PENDING: "pending",
  FULLFILED: "fulfilled",
  REJECTED: "rejected",
};
/**
 *
 * @param {any} p fn的返回值
 * @param {Promise} p1 .then生成的新Promise
 * @param {Function} resolve
 * @param {Function} reject
 */
const resolvePromise = (promise, value, resolve, reject) => {
  if (promise === value) {
    throw TypeError("报错....");
  } else if (typeof value?.then === "function") {
    // 注意，这里值判断p.then，所有复合promise A+协议的promise实现都是可以互相调用的
    value.then(resolve, reject);
  } else {
    resolve(value);
  }
};
class MyPromise {
  status = statusEnum.PENDING;
  resArr = [];
  rejArr = [];
  value = null;
  reason = null;
  constructor(fn) {
    const resolve = (val) => {
      setTimeout(() => {
        this.value = val;
        this.resArr.forEach((func) => func());
        this.status = statusEnum.FULLFILED;
      });
    };
    const reject = (val) => {
      setTimeout(() => {
        this.reason = val;
        this.rejArr.forEach((func) => func());
        this.status = statusEnum.REJECTED;
      });
    };
    try {
      fn(resolve, reject);
    } catch (err) {
      reject(err);
    }
  }
  then(onResolve, onReject) {
    let promise1;
    promise1 = new MyPromise((resolve, reject) => {
      if (this.status === statusEnum.PENDING) {
        // resolve、reject会在setTimeout后执行，所以肯定能获取到promise1
        this.resArr.push(() => {
          const value = onResolve(this.value);
          resolvePromise(promise1, value, resolve, reject);
        });
        this.rejArr.push(() => {
          const reason = onReject(this.reason);
          resolvePromise(promise1, reason, resolve, reject);
        });
      } else if (this.status === statusEnum.FULLFILED) {
        setTimeout(() => {
          const value = onResolve(this.value);
          resolvePromise(promise1, value, resolve, reject);
        });
      } else {
        // rejected状态同pending
      }
    });
    return promise1;
  }
  catch(onReject) {}
}
