// data flatten 实现一个对象的 flatten 方法
// {
//   'a.b': 1,
//   'a.c': 2,
//   'a.d.e': 5,
//   'b[0]': 1,
//   'b[1]': 3,
//   'b[2].a': 2,
//   'b[2].b': 3
//   'c': 3
// }
const obj = {
    a: {
        b: 1,
        c: 2,
        d: {
            e: 5
        }
     },
     b: [1, 3, {a: 2, b: 3}],
     c: 3
}
// 一眼看去，大概思路就是把数据当成树，到叶子结点时，解析叶子结点值和路径
const dataFlatten = (data) => {
    const rtn = {}
    const visitLeaf = (leafVal, parentPath) => {
        const str = parentPath.reduce((s, p) => {
            if(typeof p === 'string') {
                return (s?`${s}.`:'') + p
            } else if(typeof p === 'number') {
                return `${s}[${p}]`
            }
            return s
        }, '')
        rtn[str] = leafVal
    }
    const path = []
    const traverse = (val) => {
        if(Array.isArray(val)) {
            val.forEach((v, idx)=>{
                path.push(idx)
                traverse(v)
                path.pop()
            })
        } else if(val&& typeof val === 'object') {
            Object.entries(val).forEach(([key, v]) => {
                path.push(key)
                traverse(v)
                path.pop()
            })
        } else {
            visitLeaf(val, [...path])
        }
    }
    traverse(data)
    return rtn
}
dataFlatten(obj) // 结果一致

// ===============================================================================
// 反过来，将下列对象解析成obj
// {
//   'a.b': 1,
//   'a.c': 2,
//   'a.d.e': 5,
//   'b[0]': 1,
//   'b[1]': 3,
//   'b[2].a': 2,
//   'b[2].b': 3
//   'c': 3
// }

const parseObj = (data) => {
    const rtn = {}
    const parsePathKey = (str) => {
        let idx = 0
        const paths = []
        const getIndex = () => {
            let oldIdx = idx;
            while(str[idx] &&str[idx] !== ']') {
                idx++
            }
            const index = Number(str.substring(oldIdx, idx))
            idx++
            return index
        }
        const getKey = () => {
            let oldIdx = idx;
            while(str[idx] && !['[', '.'].includes(str[idx])) {
                idx++
            }
            return str.substring(oldIdx, idx)
        }
        while(idx<str.length) {
            if(str[idx] === '.') {
                idx++
                paths.push(getKey())
            } else if(str[idx] === '[') {
                idx++
                paths.push(getIndex())
            } else {
                paths.push(getKey())
            }
        }
        return paths
    }
    // 这里指处理数组和Object，因此只判断这两种类型
    const isReference = (val) => Array.isArray(val) || (val && typeof val ==='object')
    const setValByPath = (paths, val) => {
        let start = rtn
        const getDefValByPath = (path) => {
            return Number.isFinite(path) ? [] : {}
        }
        paths.forEach((path, idx) => {
            if(!isReference(start[path])) {
                if(idx === paths.length - 1) {
                    start[path] = val
                } else {
                    const nextPath = paths[idx + 1]
                    start[path] = getDefValByPath(nextPath)
                }
            }
            start = start[path]
        })
    }
    Object.entries(data).forEach(([key, val]) => {
        const paths = parsePathKey(key)
        setValByPath(paths, val)
    })
    return rtn;
}

parseObj(o) // 结果一致