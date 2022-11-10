const sleep = (time) => new Promise(resolve=>{setTimeout(resolve, time)});
const randomStr = () => Math.random().toString(36).substring(2)
const createGetCount = (start = 0) => {
    let count = start;
    return () => count++
}
/**
 * times次之内，若探测成功返回探测的次数，否则返回-1
 * @param {(count: number) => Promise<boolean>} tapFunc 
 * @param {number} times 
 * @returns {number} 第count次探测成功
 */
 const tapUtilBail = (tapFunc, times = 20) => {
    let count = 0;
    const loop = async () => {
        if(count>=times) {
            return -1
        }
        const res = await tapFunc(count);
        if (res) {
            return count;
        }
        count += 1;
        return loop()
    }
    return loop()
}

const debounce = (func, time) => {
    let timer = null;
    const clean = () => {
        clearTimeout(timer)
        timer = null;
    }
    return function(...args) {
        if(timer) {
            clean()
        }
        timer = setTimeout(() => {
            func.apply(this, args);
            clean();
        }, time)
    }
}
exports.sleep = sleep;
exports.randomStr = randomStr;
exports.createGetCount = createGetCount;
exports.tapUtilBail = tapUtilBail;
exports.debounce = debounce;
