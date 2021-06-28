const PENDING = "pending";
const FULFILLED = "fulfilled";
const REJECTED = "rejected";

const resolvePromise = (promise, x, resolve, reject) => {
  // 1. promise===x reject错误
  // 2. x是Promise函数, 将x的结果放入resolve和reject
  // 3. x是普通值，将x直接resolve
  if (promise === x) {
    reject(TypeError("xxxxxx......"));
    return;
  }
  // 一般会判断x是对象，且x.then是方法，主要是为了应对和其他满足promise规范发Promise混用时的情况，此处简单点判断。。
  // if(x instanceof myPromise){
  if (typeof x?.then === "function") {
    x.then(
      (res) => {
        // 因为then函数return的是promise,因此x的状态需向上一层的promise传递
        resolve(res);
      },
      (rej) => {
        reject(rej);
      }
    );
    return;
  }
  resolve(x);
};
class myPromise {
  static resolve(val) {
    return new myPromise((res) => {
      res(val);
    });
  }
  constructor(fn) {
    this.status = PENDING;
    this.value = null;
    this.reason = null;
    this.resArr = [];
    this.rejArr = [];
    const resolve = (val) => {
      this.value = val;
      this.status = FULFILLED;
      this.resArr.forEach((func) => func());
    };
    const reject = (reason) => {
      this.reason = reason;
      this.status = REJECTED;
      this.rejArr.forEach((func) => func());
    };
    fn(resolve, reject);
  }
  then(onFulfilled, onReject) {
    const promise2 = new myPromise((res, rej) => {
      if (this.status === FULFILLED) {
        setTimeout(() => {
          const x = onFulfilled(this.value);
          resolvePromise(promise2, x, res, rej);
        });
      } else if (this.status === PENDING) {
        this.resArr.push(() => {
          const x = onFulfilled(this.value);
          resolvePromise(promise2, x, res, rej);
        });
        this.rejArr.push(() => {
          onReject(this.reason);
        });
      }
    });
    return promise2;
  }
  catch(fn) {
    this.rejArr.push(fn);
    this.status = REJECTED;
  }
}

const test = () => {
  return new myPromise((res, rej) => {
    setTimeout(() => {
      res("step 1, ok");
    }, 1000);
  })
    .then((val) => {
      console.log(val);
      return new myPromise((res, rej) => {
        setTimeout(() => {
          res("step 2,ok");
        }, 1500);
      });
    })
    .then((val) => {
      console.log(val);
    });
};

const testFunc = async () => {
  const ts = new myPromise((res) => {
    setTimeout(() => {
      res("100");
      console.log("ok");
    }, 2000);
  });
  const res = await ts;
  console.log(res);
};

module.exports = myPromise;
