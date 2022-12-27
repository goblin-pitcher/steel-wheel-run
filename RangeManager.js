const binaryFindIdx = (arr, isLeftPart) => {
    if (!arr.length) return 0
    let l = 0;
    let r = arr.length - 1;
    while (l < r - 1) {
        const mid = (l + r) >> 1
        if (isLeftPart(arr[mid])) {
            l = mid
        } else {
            r = mid
        }
    }
    if (isLeftPart(arr[r])) return r + 1
    if (isLeftPart(arr[l])) return r
    return l
}

const validateRange = ([start, end]) => start < end
const isIntersection = (range1, range2) => {
    const [rangeA, rangeB] = [range1, range2].sort((a, b) => a[0] - b[0])
    return rangeA[1] >= rangeB[0]
}
const diff = (range1, range2) => {
    const diffRanges = [[range1[0], range2[0]], [range2[1], range1[1]]]
    return diffRanges.filter(validateRange)
}

class RangeManager {
    constructor() {
        this._ranges = []
    }
    add(range) {
        if (!validateRange(range)) return;
        const isLeftPart = ([start, end]) => end < range[0]
        const idx = binaryFindIdx(this._ranges, isLeftPart)
        if (idx >= this._ranges.length) {
            this._ranges.push(range);
            return;
        }
        let combineRange = range;
        let delCount = 0;
        while (idx + delCount < this._ranges.length && isIntersection(range, this._ranges[idx + delCount])) {
            combineRange = [
                Math.min(combineRange[0], this._ranges[idx + delCount][0]),
                Math.max(combineRange[1], this._ranges[idx + delCount][1])
            ]
            delCount++
        }
        this._ranges.splice(idx, delCount, combineRange)
    }
    remove(range) {
        if (!validateRange(range)) return;
        const isLeftPart = ([start, end]) => end <= range[0]
        const idx = binaryFindIdx(this._ranges, isLeftPart)
        let extra = []
        let delCount = 0
        while (idx + delCount < this._ranges.length && isIntersection(range, this._ranges[idx + delCount])) {
            // [8,9] - [6,10] => []
            // [4,7] - [6,10] => [4,6]
            // [9,14] - [6,10] => [10,14]
            extra = extra.concat(diff(this._ranges[idx + delCount], range))
            delCount++
        }
        this._ranges.splice(idx, delCount, ...extra)
    }
}

const rm = new RangeManager()
rm.add([2, 6]) // [2,6)
rm.add([8, 12]) // [2,6) [8,12)
rm.add([14, 18]) // [2,6) [8,12) [14, 18)
rm.remove([4, 15]) // [2,4) [15, 18)