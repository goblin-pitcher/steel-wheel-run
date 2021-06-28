function mergeSort(ar) {
  const combine = (arr, l, half, r) => {
    const lArr = arr.slice(l, half + 1).concat(Infinity); // 哨兵
    const rArr = arr.slice(half + 1, r + 1).concat(Infinity);
    for (let i = l, lp = 0, rp = 0; i <= r; i++) {
      arr[i] = lArr[lp] <= rArr[rp] ? lArr[lp++] : rArr[rp++];
    }
  };
  const splitCombine = (arr, l, r) => {
    if (l >= r) return;
    const half = Math.floor((l + r) / 2);
    splitCombine(arr, l, half);
    splitCombine(arr, half + 1, r);
    combine(arr, l, half, r);
  };
  splitCombine(ar, 0, ar.length - 1);
  return ar;
}
