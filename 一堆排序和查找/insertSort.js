function insertSort_origin(arr) {
  const rtn = [-Infinity, Infinity]; // 哨兵
  const len = arr.length;
  let checkItem = null;
  for (let i = 0; i < len; i++) {
    checkItem = arr[i];
    rtn.splice(
      rtn.findIndex((item) => item >= checkItem),
      0,
      checkItem
    );
  }
  return rtn.slice(1, rtn.length - 1);
}

// 将数字插入有序rtn数组的过程，可以采用二分查找
function insertSort_binary(arr) {
  const binaryFindIndex = (arr, val) => {
    let left = 0,
      right = arr.length - 1,
      half;
    while (left < right) {
      half = Math.floor((left + right) / 2);
      if (arr[half] === val) {
        return half;
      } else if (val < arr[half]) {
        right = half - 1;
      } else {
        left = half + 1;
      }
    }
    if (arr[left] < val) return left + 1;
    return left;
  };
  const rtn = [-Infinity, Infinity]; // 哨兵
  const len = arr.length;
  let checkItem = null;
  for (let i = 0; i < len; i++) {
    checkItem = arr[i];
    rtn.splice(binaryFindIndex(rtn, checkItem), 0, checkItem);
  }
  return rtn.slice(1, rtn.length - 1);
}
