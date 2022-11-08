/**
 * 二分查找大于xxx或小于xxx的值时，为了避免出错，采用将数组分区的方式。
 * 将满足条件的分为left区，不满足条件的分到right区
 * 查找的值不是在left区末尾就是在right区头部
 */

const binarySearchByCondition = (arr, isLeftArea) => {
    if(!arr.length) return 0
    let l = 0;
    let r = arr.length - 1;
    while(l<r-1) {
        const mid = (l + r) >> 1;
        if(isLeftArea(arr[mid])) {
            l = mid
        } else {
            r = mid
        }
    }
    if(isLeftArea(arr[r])) return r
    return l
}

// test
// 查找[1,2,3,4,5,6,7,8,9]大于5的最小index
// 左侧区域判定条件为小于等于5
const leftEnd = binarySearchByCondition([1,2,3,4,5,6,7,8,9], item=>item<=5); // 4
// 找寻右侧区域第一个，而我们已经计算出左侧区域末尾的位置, 其下一个即为满足条件的index
const findIndex = leftEnd + 1; // 5