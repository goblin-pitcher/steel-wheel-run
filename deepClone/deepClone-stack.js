const cloneDeep = (obj) => {
  const isReference = (val) => val instanceof Object;
  const cache = new WeakMap();
  const root = { value: obj };
  let checkItems = [{ parent: root, key: "value", value: obj }];
  while (checkItems.length) {
    const { parent, key, value } = checkItems.shift();
    if (cache.has(value)) {
      parent[key] = cache.get(value);
    } else if (!isReference(value)) {
      parent[key] = value;
    } else {
      const cloneItem = new value.constructor();
      parent[key] = cloneItem;
      cache.set(value, cloneItem);
      const keys = Object.getOwnPropertyNames(value);
      checkItems = checkItems.concat(
        keys.map((key) => {
          return {
            parent: cloneItem,
            key,
            value: value[key],
          };
        })
      );
    }
  }
  return root.value;
};
