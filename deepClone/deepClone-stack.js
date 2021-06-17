function cloneDeep(data) {
  const isReference = (val) => val && typeof val === "object";
  const cache = new WeakMap();
  let checkArr = [{ parent: null, key: null, value: data }];
  let checkItem = null;
  let rtn = null;
  const setRtn = (obj) => {
    const { parent, key, value } = obj;
    if (!parent && !key) {
      rtn = value;
    } else {
      parent[key] = value;
    }
  };
  while (checkArr.length) {
    let checkItem = checkArr.shift();
    const { value: checkVal } = checkItem;
    if (!isReference(checkVal)) {
      setRtn(checkItem);
    } else {
      if (cache.has(checkVal)) {
        setRtn({ ...checkItem, value: cache.get(checkVal) });
      } else {
        const ref = new checkVal.constructor();
        cache.set(checkVal, ref);
        setRtn({ ...checkItem, value: ref });
        const keys = Object.getOwnPropertyNames(checkVal);
        checkArr = keys
          .map((key) => ({ parent: ref, key, value: checkVal[key] }))
          .concat(checkArr);
      }
    }
  }
  return rtn;
}
