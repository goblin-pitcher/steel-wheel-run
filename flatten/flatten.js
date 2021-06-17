function flat_recursion(arr){
  return [].concat(...arr.map(item=>
    Array.isArray(item)? flat_recursion(item): item))
}

function flat_iterator(arr) {
  const flat = function*(ar){
    for(const item of ar) {
      if(Array.isArray(item)) {
        yield * flat(item)
      } else {
        yield item
      }
    }
  }
  return [...flat(arr)]
}

function flat_stack(arr) {
  let stack = arr.slice()
  const rtn = []
  while(stack.length){
      const item = stack.shift()
      // 性能较Array.isArray更好
      if(item.constructor === Array){
          stack = item.concat(stack)
      }else{
          rtn.push(item)
      }
  }
  return rtn
}

function flat_grade(arr, grade = 1) {
  let hasArr = false
  const rtn = arr.reduce((ar, item)=>{
    if(Array.isArray(item)) {
      hasArr = true
    }
    return ar.concat(item)
  }, [])
  grade--
  if(!hasArr||grade<=0) return rtn
  return flat_grade(rtn, grade)
}