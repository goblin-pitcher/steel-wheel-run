// 堆排序即是将数组看作堆，堆为二叉树结构，即利用树结构降低复杂度，通过每个树节点和左右子节点进行对比，
// 将最大值交换至根节点，再将最大值和最右节点交换，依次循环。。。
// 同其他利用树结构的算法一样，其时间复杂度为 O(nlogn), 基本上是内部交换，空间复杂度为O(1)
function heapSort(arr) {
  const getLeftIndex = (index) => 2 * index + 1;
  const getRightIndex = (index) => 2 * index + 2;
  const getValBase = (isLeft) => (i, len) => {
    const endIndex = len - 1;
    const index = isLeft ? getLeftIndex(i) : getRightIndex(i);
    if (index > endIndex) return -Infinity;
    return arr[index];
  };
  const getLeft = getValBase(true);
  const getRight = getValBase();
  const getLeafStartIndex = (len) => {
    const depth = Math.ceil(Math.log2(len + 1));
    return Math.pow(2, depth - 1) - 1;
  };
  const getMaxNodeIndex = (index, len) => {
    const leftVal = getLeft(index, len);
    const rightVal = getRight(index, len);
    let maxIndex = index;
    if (leftVal > arr[maxIndex]) {
      maxIndex = getLeftIndex(index);
    }
    if (rightVal > arr[maxIndex]) {
      maxIndex = getRightIndex(index);
    }
    return maxIndex;
  };
  const swap = (p1, p2) => ([arr[p1], arr[p2]] = [arr[p2], arr[p1]]);
  const heapCompare = (isFromBottom) => (len) => {
    const endIndex = getLeafStartIndex(len) - 1;
    for (let i = 0; i <= endIndex; i++) {
      const calcIndex = isFromBottom ? endIndex - i : i;
      swap(calcIndex, getMaxNodeIndex(calcIndex, len));
    }
    swap(0, len - 1);
  };
  const compareFromBottom = heapCompare(true);
  // 堆排序主要过程
  let len = arr.length;
  while (len) {
    compareFromBottom(len--);
  }
  return arr;
}
