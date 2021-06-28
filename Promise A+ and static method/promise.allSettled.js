Promise._allSettled = function (arr) {
  const empty = Symbol("empty");
  const resArr = Array(arr.length).fill(empty);
  let resolve = null;
  const p = new Promise((res) => {
    resolve = res;
  });
  const checkArr = () => {
    if (!resArr.some((item) => item === empty)) resolve(resArr);
  };
  arr.forEach((func, index) => {
    // 仿照promise A+规范中的判断，如果用instanceof, 将无法识别自己手写的Promise
    if (typeof func?.then === "function") {
      func
        .then((res) => {
          resArr[index] = { status: "fulfilled", value: res };
        })
        .catch((reason) => {
          resArr[index] = { status: "rejected", reason: reason };
        })
        .finally(() => {
          checkArr();
        });
    } else {
      resArr[index] = { status: "fullfilled", value: func };
      checkArr();
    }
  });
  return p;
};
