const genDirTree = () => {
  const createCacheTree = (cache, str, fulStr) => {
    if (!str) return;
    const head = str[0];
    if (!(head in cache)) {
      cache[head] = {
        __value: new Set(),
      };
    }
    cache[head].__value.add(fulStr);
    createCacheTree(cache[head], str.substr(1), fulStr);
  };
  const cache = {};
  return (s) => {
    createCacheTree(cache, s, s);
    return cache;
  };
};

// const addCache = genDirTree()
