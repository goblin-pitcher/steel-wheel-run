// 前提：arr有序
function binarySearch_recursion(arr, val) {
  const searchArr = (l, r) => {
    if (l > r) return -1;
    const half = Math.floor((l + r) / 2);
    if (arr[half] === val) return half;
    return arr[half] > val ? searchArr(l, half - 1) : searchArr(half + 1, r);
  };
  return searchArr(0, arr.length - 1);
}

function binarySearch(arr, val) {
  let left = 0,
    right = arr.length - 1,
    half;
  while (left <= right) {
    half = Math.floor((left + right) / 2);
    if (arr[half] === val) {
      return half;
    } else if (val < arr[half]) {
      right = half - 1;
    } else {
      left = half + 1;
    }
  }
  return -1;
}
