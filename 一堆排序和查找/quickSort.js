// 对比冒泡和快排可发现，快排是冒泡的优化版本，冒泡是将最大项冒至顶端，
// 快排利用双指针，将数组分割成两块进行分治，冒泡每次查找最大值的复杂度是n，
// 而快排进行分割，则将这部分复杂度从n变为logn，即总复杂度n^2 -> nlogn
function quickSort(ar) {
  // 移动左右指针，使数组成为指针交汇处，左边都小于该值，右边都大于该值
  const binarySplit = (arr, l, r) => {
    let isRight = true;
    const swap = (p1, p2) => {
      [arr[p1], arr[p2]] = [arr[p2], arr[p1]];
    };
    while (l < r) {
      if (arr[l] > arr[r]) {
        swap(l, r);
        isRight = !isRight;
      }
      isRight ? r-- : l++;
    }
    return l;
  };
  const qkSort = (arr, l, r) => {
    if (r <= l) return;
    const center = binarySplit(arr, l, r);
    qkSort(arr, l, center);
    qkSort(arr, center + 1, r);
  };
  qkSort(ar, 0, ar.length - 1);
  return ar;
}
