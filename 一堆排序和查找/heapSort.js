/**
 * 共分为三部：
 * 1. 创建大顶堆
 * 2. 顶部和尾部换位置，缩小heapSize, 重复大顶堆化
 * 3. heapSize缩小至0即全部排序完毕
 * @param {Array} arr 
 * @returns arr
 */
function heapSort(arr) {
  let heapSize = arr.length - 1;
  const swap = (ar, i, j) =>{[ar[i], ar[j]] = [ar[j], ar[i]]};
  const maxHeapify = (ar, i) => {
    const left = 2*i + 1;
    const right = 2*i + 2;
    let largest = i;
    if(left<= heapSize && ar[left]>ar[largest]) {
      largest = left
    }
    if(right<=heapSize && ar[right]>ar[largest]) {
      largest = right
    }
    if(largest!==i) {
      swap(ar, i, largest)
      maxHeapify(ar, largest)
    }
  }
  const buildMaxHeap = (ar)=>{
    for(let i=~~((ar.length-1)/2);i>=0;i--) {
      maxHeapify(ar, i)
    }
  }
  buildMaxHeap(arr);
  while(heapSize>0) {
    swap(arr, 0, heapSize);
    heapSize--
    maxHeapify(arr, 0)
  }
  return arr
}