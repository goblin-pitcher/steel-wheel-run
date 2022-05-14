function cloneDeep(data) {
  const isReference = (val) => val instanceof Object;
  // 防止循环引用，利用weakMap缓存已拷贝的对象
  const cache = new WeakMap();
  const cloneData = (val) => {
    if (!isReference(val)) return val;
    if (cache.has(val)) return cache.get(val);
    // val类型未知，可能是class，因此根据constructor new一个对象
    const ref = new val.constructor();
    // 先将创建的ref放入cache，若先递归再放，会陷入无限递归
    cache.set(val, ref);
    // Object.getOwnPropertyDescriptors获取val所有项，包括enumerable为false，以及原型链上自己定义的对象
    for (const key in Object.getOwnPropertyDescriptors(val)) {
      ref[key] = cloneData(val[key]);
    }
    return ref;
  };
  return cloneData(data);
}
