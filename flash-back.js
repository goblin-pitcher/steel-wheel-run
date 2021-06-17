// 回溯法过程的抽象(无重复项)
function flashBack(arr, cb) {
  const rtn = []
  const path = []
  const tailIndex = arr.length - 1
  let checkArr = Array(arr.length).fill(null).map((item,index)=>index);
  let checkIndex = null
  const getTail = (arr)=>arr.slice(-1)[0]
  const back = ()=>{
    const backVal = path.pop();
    if(backVal === tailIndex) {
      back();
    }
  }
  while(checkArr.length) {
    checkIndex = checkArr.shift();
    path.push(checkIndex)
    const prune = cb(path.map(index=>arr[index]))
    if(prune&&tailIndex>checkIndex) {
      const addArr = Array(tailIndex-checkIndex).fill(null).map((t,i)=>i+checkIndex+1)
      checkArr = addArr.concat(checkArr)
    } else {
        if(prune===null) {
          rtn.push(path.map(index=>arr[index]))
        }
        back()
    }
  }
  return rtn
}
/**
 * @returns 不满足条件，需要折枝：return false, 满足条件并折枝：return null，不满足条件并继续查找：return true
 */
const checkSum = val => arr => {
  const sum = arr.reduce((prev, next)=>prev+next)
  if(val === sum) return null;
  if(sum > val) return false;
  return true;
}

var combinationSum2 = function(candidates, target) {
    candidates = candidates.sort((a,b)=>a-b)
    const testSum = candidates.reduce((a,b)=>a+b);

    if(testSum===target) return [candidates];
    const checkFunc = checkSum(target)
    const rtn = flashBack(candidates, checkFunc)
    const noRepeat = new Set(rtn.map(item=>item.join('&')))
    return [...noRepeat].map(item=>item.split('&').map(val=>+val))
};